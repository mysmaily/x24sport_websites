import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean;
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'enable_api_key'
      ) THEN
        UPDATE "users" SET "enable_a_p_i_key" = "enable_api_key";
        ALTER TABLE "users" DROP COLUMN "enable_api_key";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enable_api_key" boolean;
    UPDATE "users" SET "enable_api_key" = "enable_a_p_i_key";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "enable_a_p_i_key";
  `)
}
