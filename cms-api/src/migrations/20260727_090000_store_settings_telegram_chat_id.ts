import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      ADD COLUMN IF NOT EXISTS "telegram_chat_id" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      DROP COLUMN IF EXISTS "telegram_chat_id";
  `)
}
