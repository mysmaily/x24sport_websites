import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      ADD COLUMN IF NOT EXISTS "analytics_meta_pixel_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "analytics_meta_pixel_id" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      DROP COLUMN IF EXISTS "analytics_meta_pixel_id",
      DROP COLUMN IF EXISTS "analytics_meta_pixel_enabled";
  `)
}
