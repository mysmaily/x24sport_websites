import { createHmac } from 'node:crypto'

import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

const productViewTimezone = 'Asia/Ho_Chi_Minh'

type ProductViewStatsRow = {
  product_id: number | string
  name: string
  sku: string | null
  slug: string
  unique_views: number | string
  views: number | string
}

function hashIdentifier(value: string) {
  const secret = process.env.PRODUCT_VIEW_HASH_SECRET || process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PRODUCT_VIEW_HASH_SECRET or PAYLOAD_SECRET is required.')
  return createHmac('sha256', secret).update(value).digest('hex')
}

export async function recordProductView({
  path,
  payload,
  productId,
  sessionId,
  tenantId,
  visitorId,
}: {
  path?: string
  payload: Payload
  productId: number | string
  sessionId: string
  tenantId: number | string
  visitorId: string
}) {
  const sessionHash = hashIdentifier(sessionId)
  const visitorHash = hashIdentifier(visitorId)

  const result = await payload.db.drizzle.execute(sql`
    WITH inserted_event AS (
      INSERT INTO "product_view_events" (
        "tenant_id",
        "product_id",
        "session_hash",
        "visitor_hash",
        "view_path",
        "view_date"
      )
      VALUES (
        ${tenantId},
        ${productId},
        ${sessionHash},
        ${visitorHash},
        ${path || null},
        (now() AT TIME ZONE ${productViewTimezone})::date
      )
      ON CONFLICT ("tenant_id", "product_id", "session_hash") DO NOTHING
      RETURNING "tenant_id", "product_id", "visitor_hash", "view_date"
    ), inserted_visitor AS (
      INSERT INTO "product_view_daily_visitors" (
        "tenant_id",
        "product_id",
        "view_date",
        "visitor_hash"
      )
      SELECT "tenant_id", "product_id", "view_date", "visitor_hash"
      FROM inserted_event
      ON CONFLICT ("tenant_id", "product_id", "view_date", "visitor_hash") DO NOTHING
      RETURNING "tenant_id", "product_id", "view_date"
    ), updated_daily AS (
      INSERT INTO "product_view_daily" (
        "tenant_id",
        "product_id",
        "view_date",
        "views",
        "unique_views"
      )
      SELECT
        event."tenant_id",
        event."product_id",
        event."view_date",
        1,
        CASE WHEN visitor."product_id" IS NULL THEN 0 ELSE 1 END
      FROM inserted_event event
      LEFT JOIN inserted_visitor visitor
        ON visitor."tenant_id" = event."tenant_id"
        AND visitor."product_id" = event."product_id"
        AND visitor."view_date" = event."view_date"
      ON CONFLICT ("tenant_id", "product_id", "view_date") DO UPDATE SET
        "views" = "product_view_daily"."views" + 1,
        "unique_views" = "product_view_daily"."unique_views" + EXCLUDED."unique_views",
        "updated_at" = now()
      RETURNING "product_id"
    ), updated_product AS (
      UPDATE "products" product
      SET "view_count" = COALESCE(product."view_count", 0) + 1
      FROM inserted_event event
      WHERE product."id" = event."product_id"
      RETURNING product."id"
    )
    SELECT EXISTS(SELECT 1 FROM inserted_event) AS "recorded";
  `)

  const rows = (result as unknown as { rows?: Array<{ recorded?: boolean }> }).rows
  return Boolean(rows?.[0]?.recorded)
}

export async function getProductViewStats({
  days,
  limit,
  payload,
  tenantId,
}: {
  days: number
  limit: number
  payload: Payload
  tenantId: number | string
}) {
  const result = await payload.db.drizzle.execute(sql`
    SELECT
      daily."product_id",
      product."name",
      product."slug",
      product."sku",
      SUM(daily."views")::bigint AS "views",
      SUM(daily."unique_views")::bigint AS "unique_views"
    FROM "product_view_daily" daily
    INNER JOIN "products" product ON product."id" = daily."product_id"
    WHERE daily."tenant_id" = ${tenantId}
      AND daily."view_date" >= (now() AT TIME ZONE ${productViewTimezone})::date - (${days}::integer - 1)
    GROUP BY daily."product_id", product."name", product."slug", product."sku"
    ORDER BY SUM(daily."views") DESC, product."name" ASC
    LIMIT ${limit};
  `)

  const rows = ((result as unknown as { rows?: ProductViewStatsRow[] }).rows || [])
  return rows.map((row) => ({
    name: row.name,
    productId: row.product_id,
    sku: row.sku,
    slug: row.slug,
    uniqueViews: Number.parseInt(String(row.unique_views), 10) || 0,
    views: Number.parseInt(String(row.views), 10) || 0,
  }))
}

export async function cleanupProductViewDetails({
  payload,
  retentionDays = 90,
}: {
  payload: Payload
  retentionDays?: number
}) {
  const safeRetentionDays = Math.min(365, Math.max(30, Math.trunc(retentionDays)))
  await payload.db.drizzle.execute(sql`
    DELETE FROM "product_view_events"
    WHERE "viewed_at" < now() - (${safeRetentionDays} * INTERVAL '1 day');

    DELETE FROM "product_view_daily_visitors"
    WHERE "created_at" < now() - (${safeRetentionDays} * INTERVAL '1 day');
  `)
}
