import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_catalog_distributions_status"
        AS ENUM('ready', 'draft_created', 'published', 'needs_review', 'blocked', 'archived');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_catalog_distributions_copy_mode"
        AS ENUM('auto', 'manual_locked');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS "catalog_distributions" (
      "id" serial PRIMARY KEY NOT NULL,
      "distribution_key" varchar NOT NULL,
      "source_tenant_id" integer NOT NULL,
      "target_tenant_id" integer NOT NULL,
      "source_product_id" integer NOT NULL,
      "target_product_id" integer,
      "status" "enum_catalog_distributions_status" NOT NULL DEFAULT 'ready',
      "copy_mode" "enum_catalog_distributions_copy_mode" NOT NULL DEFAULT 'auto',
      "source_fact_fingerprint" varchar,
      "target_copy_fingerprint" varchar,
      "synced_at" timestamp(3) with time zone,
      "last_error" varchar,
      "review_note" varchar,
      "proposed_copy_name" varchar,
      "proposed_copy_short_description" varchar,
      "proposed_copy_description" varchar,
      "proposed_copy_seo_title" varchar,
      "proposed_copy_meta_description" varchar,
      "proposed_copy_model" varchar,
      "proposed_copy_prompt_version" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "catalog_distributions"
        ADD CONSTRAINT "catalog_distributions_source_tenant_id_tenants_id_fk"
        FOREIGN KEY ("source_tenant_id") REFERENCES "public"."tenants"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "catalog_distributions"
        ADD CONSTRAINT "catalog_distributions_target_tenant_id_tenants_id_fk"
        FOREIGN KEY ("target_tenant_id") REFERENCES "public"."tenants"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "catalog_distributions"
        ADD CONSTRAINT "catalog_distributions_source_product_id_products_id_fk"
        FOREIGN KEY ("source_product_id") REFERENCES "public"."products"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "catalog_distributions"
        ADD CONSTRAINT "catalog_distributions_target_product_id_products_id_fk"
        FOREIGN KEY ("target_product_id") REFERENCES "public"."products"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "catalog_distributions_distribution_key_idx"
      ON "catalog_distributions" USING btree ("distribution_key");
    CREATE INDEX IF NOT EXISTS "catalog_distributions_source_product_idx"
      ON "catalog_distributions" USING btree ("source_product_id");
    CREATE INDEX IF NOT EXISTS "catalog_distributions_target_product_idx"
      ON "catalog_distributions" USING btree ("target_product_id");
    CREATE INDEX IF NOT EXISTS "catalog_distributions_status_idx"
      ON "catalog_distributions" USING btree ("status");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "catalog_distributions_id" integer;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_catalog_distributions_id_catalog_distributions_id_fk"
        FOREIGN KEY ("catalog_distributions_id") REFERENCES "public"."catalog_distributions"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_catalog_distributions_id_idx"
      ON "payload_locked_documents_rels" USING btree ("catalog_distributions_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_catalog_distributions_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_catalog_distributions_id_catalog_distributions_id_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "catalog_distributions_id";
    DROP TABLE IF EXISTS "catalog_distributions" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_catalog_distributions_copy_mode";
    DROP TYPE IF EXISTS "public"."enum_catalog_distributions_status";
  `)
}
