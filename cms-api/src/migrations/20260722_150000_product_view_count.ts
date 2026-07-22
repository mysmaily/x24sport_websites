import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "view_count" numeric NOT NULL DEFAULT 0;

    UPDATE "products" product
    SET "view_count" = totals."views"
    FROM (
      SELECT "product_id", SUM("views") AS "views"
      FROM "product_view_daily"
      GROUP BY "product_id"
    ) totals
    WHERE product."id" = totals."product_id";

    CREATE INDEX IF NOT EXISTS "products_view_count_idx"
      ON "products" ("view_count" DESC);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "products_view_count_idx";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "view_count";
  `)
}
