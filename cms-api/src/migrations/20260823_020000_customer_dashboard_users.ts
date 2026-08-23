import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_users_tenant_access_mode" AS ENUM('assigned_tenants', 'customer_tenants'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    INSERT INTO "customers" ("name", "slug", "status", "updated_at", "created_at")
    VALUES ('X24Sport', 'x24sport', 'active', now(), now())
    ON CONFLICT ("slug") DO NOTHING;

    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "customer_id" integer;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tenant_access_mode" "enum_users_tenant_access_mode" DEFAULT 'assigned_tenants' NOT NULL;

    UPDATE "users"
      SET "tenant_access_mode" = 'assigned_tenants'
      WHERE "tenant_access_mode" IS NULL;

    UPDATE "users"
      SET "customer_id" = (SELECT "id" FROM "customers" WHERE "slug" = 'x24sport')
      WHERE "customer_id" IS NULL
        AND "role" <> 'super_admin';

    DO $$ BEGIN
      ALTER TABLE "users"
        ADD CONSTRAINT "users_customer_id_customers_id_fk"
        FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "users_customer_idx" ON "users" USING btree ("customer_id");
    CREATE INDEX IF NOT EXISTS "users_tenant_access_mode_idx" ON "users" USING btree ("tenant_access_mode");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_tenant_access_mode_idx";
    DROP INDEX IF EXISTS "users_customer_idx";
    ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_customer_id_customers_id_fk";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "tenant_access_mode";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "customer_id";
    DROP TYPE IF EXISTS "public"."enum_users_tenant_access_mode";
  `)
}
