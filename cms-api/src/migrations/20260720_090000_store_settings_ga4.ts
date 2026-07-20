import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      ADD COLUMN IF NOT EXISTS "analytics_ga4_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "analytics_ga_measurement_id" varchar,
      ADD COLUMN IF NOT EXISTS "analytics_ga_property_id" varchar,
      ADD COLUMN IF NOT EXISTS "analytics_daily_telegram_report_enabled" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      DROP COLUMN IF EXISTS "analytics_daily_telegram_report_enabled",
      DROP COLUMN IF EXISTS "analytics_ga_property_id",
      DROP COLUMN IF EXISTS "analytics_ga_measurement_id",
      DROP COLUMN IF EXISTS "analytics_ga4_enabled";
  `)
}
