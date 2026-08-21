import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "catalog_distributions"
      ADD COLUMN IF NOT EXISTS "source_tenant_label" varchar,
      ADD COLUMN IF NOT EXISTS "target_tenant_label" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "catalog_distributions"
      DROP COLUMN IF EXISTS "target_tenant_label",
      DROP COLUMN IF EXISTS "source_tenant_label";
  `)
}
