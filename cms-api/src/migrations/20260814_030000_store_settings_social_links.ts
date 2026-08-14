import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      ADD COLUMN IF NOT EXISTS "tiktok_url" varchar,
      ADD COLUMN IF NOT EXISTS "instagram_url" varchar,
      ADD COLUMN IF NOT EXISTS "pinterest_url" varchar,
      ADD COLUMN IF NOT EXISTS "threads_url" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      DROP COLUMN IF EXISTS "threads_url",
      DROP COLUMN IF EXISTS "pinterest_url",
      DROP COLUMN IF EXISTS "instagram_url",
      DROP COLUMN IF EXISTS "tiktok_url";
  `)
}
