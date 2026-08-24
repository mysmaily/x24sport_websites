import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "r2_storage_enabled" boolean DEFAULT false;
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "r2_storage_bucket" varchar;
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "r2_storage_endpoint" varchar;
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "r2_storage_public_base_url" varchar;
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "r2_storage_access_key_id" varchar;
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "r2_storage_secret_access_key" varchar;

    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "storage_customer_id" integer;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "r2_storage_bucket" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "r2_storage_endpoint" varchar;
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "r2_storage_public_base_url" varchar;

    DO $$ BEGIN
      ALTER TABLE "media"
        ADD CONSTRAINT "media_storage_customer_id_customers_id_fk"
        FOREIGN KEY ("storage_customer_id") REFERENCES "public"."customers"("id")
        ON DELETE restrict ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "media_storage_customer_idx" ON "media" USING btree ("storage_customer_id");
  `)

  const endpoint =
    process.env.CLOUDFLARE_R2_ENDPOINT ||
    (process.env.CLOUDFLARE_ACCOUNT_ID
      ? `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : null)
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || null
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://static.x24sport.vn'
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || null
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || null
  const enabled = Boolean(bucket && endpoint && accessKeyId && secretAccessKey)

  if (enabled) {
    await db.execute(sql`
      UPDATE "customers"
        SET "r2_storage_enabled" = true,
            "r2_storage_bucket" = ${bucket},
            "r2_storage_endpoint" = ${endpoint},
            "r2_storage_public_base_url" = ${publicBaseUrl},
            "r2_storage_access_key_id" = ${accessKeyId},
            "r2_storage_secret_access_key" = ${secretAccessKey},
            "updated_at" = now()
        WHERE "slug" = 'x24sport';
    `)
  }

  await db.execute(sql`
    UPDATE "media"
      SET "storage_customer_id" = "tenants"."customer_id",
          "r2_storage_bucket" = "customers"."r2_storage_bucket",
          "r2_storage_endpoint" = "customers"."r2_storage_endpoint",
          "r2_storage_public_base_url" = "customers"."r2_storage_public_base_url"
      FROM "tenants"
      INNER JOIN "customers" ON "customers"."id" = "tenants"."customer_id"
      WHERE "media"."tenant_id" = "tenants"."id"
        AND "customers"."r2_storage_enabled" = true
        AND "media"."storage_customer_id" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_storage_customer_idx";
    ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_storage_customer_id_customers_id_fk";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "r2_storage_public_base_url";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "r2_storage_endpoint";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "r2_storage_bucket";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "storage_customer_id";

    ALTER TABLE "customers" DROP COLUMN IF EXISTS "r2_storage_secret_access_key";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "r2_storage_access_key_id";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "r2_storage_public_base_url";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "r2_storage_endpoint";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "r2_storage_bucket";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "r2_storage_enabled";
  `)
}
