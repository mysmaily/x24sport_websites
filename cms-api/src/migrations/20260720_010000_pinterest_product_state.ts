import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenant_pinterest_connections"
      ADD COLUMN IF NOT EXISTS "sandbox_default_board_id" varchar,
      ADD COLUMN IF NOT EXISTS "sandbox_default_board_name" varchar,
      ADD COLUMN IF NOT EXISTS "sandbox_scope" varchar,
      ADD COLUMN IF NOT EXISTS "sandbox_access_token" varchar,
      ADD COLUMN IF NOT EXISTS "sandbox_refresh_token" varchar,
      ADD COLUMN IF NOT EXISTS "sandbox_token_expires_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "sandbox_refresh_token_expires_at" timestamp(3) with time zone;

    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "pinterest_pin_id" varchar,
      ADD COLUMN IF NOT EXISTS "pinterest_pin_url" varchar,
      ADD COLUMN IF NOT EXISTS "pinterest_board_id" varchar,
      ADD COLUMN IF NOT EXISTS "pinterest_board_name" varchar,
      ADD COLUMN IF NOT EXISTS "pinterest_publish_environment" varchar,
      ADD COLUMN IF NOT EXISTS "pinterest_published_at" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenant_pinterest_connections"
      DROP COLUMN IF EXISTS "sandbox_default_board_id",
      DROP COLUMN IF EXISTS "sandbox_default_board_name",
      DROP COLUMN IF EXISTS "sandbox_scope",
      DROP COLUMN IF EXISTS "sandbox_access_token",
      DROP COLUMN IF EXISTS "sandbox_refresh_token",
      DROP COLUMN IF EXISTS "sandbox_token_expires_at",
      DROP COLUMN IF EXISTS "sandbox_refresh_token_expires_at";

    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "pinterest_pin_id",
      DROP COLUMN IF EXISTS "pinterest_pin_url",
      DROP COLUMN IF EXISTS "pinterest_board_id",
      DROP COLUMN IF EXISTS "pinterest_board_name",
      DROP COLUMN IF EXISTS "pinterest_publish_environment",
      DROP COLUMN IF EXISTS "pinterest_published_at";
  `)
}
