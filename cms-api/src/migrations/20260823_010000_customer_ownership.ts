import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const normalizedDomainSQL = sql`
  lower(
    regexp_replace(
      split_part(
        regexp_replace(trim("domain"), '^[a-z][a-z0-9+.-]*://', '', 'i'),
        '/',
        1
      ),
      '\\.$',
      ''
    )
  )
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_customers_status" AS ENUM('active', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "customers" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "status" "enum_customers_status" DEFAULT 'active' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "customers_slug_idx" ON "customers" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "customers_created_at_idx" ON "customers" USING btree ("created_at");

    INSERT INTO "customers" ("name", "slug", "status", "updated_at", "created_at")
    VALUES ('X24Sport', 'x24sport', 'active', now(), now())
    ON CONFLICT ("slug") DO UPDATE
      SET "name" = EXCLUDED."name",
          "status" = EXCLUDED."status",
          "updated_at" = now();

    ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "customer_id" integer;

    UPDATE "tenants"
      SET "customer_id" = (SELECT "id" FROM "customers" WHERE "slug" = 'x24sport')
      WHERE "customer_id" IS NULL;

    ALTER TABLE "tenants" ALTER COLUMN "customer_id" SET NOT NULL;

    DO $$ BEGIN
      ALTER TABLE "tenants"
        ADD CONSTRAINT "tenants_customer_id_customers_id_fk"
        FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
        ON DELETE restrict ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "tenants_customer_idx" ON "tenants" USING btree ("customer_id");

    ALTER TABLE "tenants_domains" ADD COLUMN IF NOT EXISTS "domain_key" varchar;
  `)

  await db.execute(sql`
    UPDATE "tenants_domains"
      SET "domain" = ${normalizedDomainSQL},
          "domain_key" = ${normalizedDomainSQL}
      WHERE "domain" IS NOT NULL;
  `)

  await db.execute(sql`
    DO $$
    DECLARE duplicate_domain varchar;
    BEGIN
      SELECT "domain_key"
        INTO duplicate_domain
        FROM "tenants_domains"
        WHERE "domain_key" IS NOT NULL AND "domain_key" <> ''
        GROUP BY "domain_key"
        HAVING count(*) > 1
        LIMIT 1;

      IF duplicate_domain IS NOT NULL THEN
        RAISE EXCEPTION 'Duplicate tenant domain after normalization: %', duplicate_domain;
      END IF;
    END $$;

    ALTER TABLE "tenants_domains" ALTER COLUMN "domain_key" SET NOT NULL;
    CREATE INDEX IF NOT EXISTS "tenants_domains_domain_idx" ON "tenants_domains" USING btree ("domain");
    CREATE UNIQUE INDEX IF NOT EXISTS "tenants_domains_domain_key_idx" ON "tenants_domains" USING btree ("domain_key");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "customers_id" integer;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_customers_fk"
        FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_customers_id_idx"
      ON "payload_locked_documents_rels" USING btree ("customers_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_customers_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_customers_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "customers_id";

    DROP INDEX IF EXISTS "tenants_domains_domain_key_idx";
    DROP INDEX IF EXISTS "tenants_domains_domain_idx";
    ALTER TABLE "tenants_domains" DROP COLUMN IF EXISTS "domain_key";

    DROP INDEX IF EXISTS "tenants_customer_idx";
    ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "tenants_customer_id_customers_id_fk";
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "customer_id";

    DROP TABLE IF EXISTS "customers" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_customers_status";
  `)
}
