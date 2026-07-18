import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_migration_runs_mode" AS ENUM('snapshot', 'dry-run', 'import', 'delta');
  CREATE TYPE "public"."enum_migration_runs_status" AS ENUM('running', 'completed', 'failed', 'rolled-back');
  CREATE TYPE "public"."enum_products_product_type" AS ENUM('simple', 'variable', 'grouped', 'external');
  CREATE TYPE "public"."enum_products_stock_status" AS ENUM('instock', 'outofstock', 'onbackorder');
  ALTER TYPE "public"."enum_products_sport" ADD VALUE 'other';
  CREATE TABLE "migration_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"run_id" varchar NOT NULL,
  	"tenant_run_key" varchar,
  	"mode" "enum_migration_runs_mode" NOT NULL,
  	"status" "enum_migration_runs_status" NOT NULL,
  	"source_url" varchar NOT NULL,
  	"snapshot_checksum" varchar,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"finished_at" timestamp(3) with time zone,
  	"counts" jsonb,
  	"errors" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_source_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL
  );
  
  CREATE TABLE "products_attributes_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "products_attributes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  ALTER TABLE "media" ADD COLUMN "source_system" varchar;
  ALTER TABLE "media" ADD COLUMN "source_id" varchar;
  ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "media" ADD COLUMN "source_checksum" varchar;
  ALTER TABLE "media" ADD COLUMN "tenant_source_key" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "product_categories" ADD COLUMN "legacy_path" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "tenant_legacy_path_key" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "source_system" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "source_id" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "tenant_source_key" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "source_checksum" varchar;
  ALTER TABLE "product_categories" ADD COLUMN "product_count" numeric DEFAULT 0;
  ALTER TABLE "products" ADD COLUMN "product_type" "enum_products_product_type" DEFAULT 'simple';
  ALTER TABLE "products" ADD COLUMN "regular_price" numeric;
  ALTER TABLE "products" ADD COLUMN "sale_price" numeric;
  ALTER TABLE "products" ADD COLUMN "currency" varchar DEFAULT 'VND';
  ALTER TABLE "products" ADD COLUMN "stock_status" "enum_products_stock_status" DEFAULT 'instock';
  ALTER TABLE "products" ADD COLUMN "is_purchasable" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "is_on_backorder" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "source_created_at" timestamp(3) with time zone;
  ALTER TABLE "products" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "products" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "products" ADD COLUMN "canonical_override" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "migration_runs_id" integer;
  ALTER TABLE "migration_runs" ADD CONSTRAINT "migration_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_source_tags" ADD CONSTRAINT "products_source_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes_values" ADD CONSTRAINT "products_attributes_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_attributes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_attributes" ADD CONSTRAINT "products_attributes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "migration_runs_tenant_idx" ON "migration_runs" USING btree ("tenant_id");
  CREATE UNIQUE INDEX "migration_runs_tenant_run_key_idx" ON "migration_runs" USING btree ("tenant_run_key");
  CREATE INDEX "migration_runs_updated_at_idx" ON "migration_runs" USING btree ("updated_at");
  CREATE INDEX "migration_runs_created_at_idx" ON "migration_runs" USING btree ("created_at");
  CREATE INDEX "products_source_tags_order_idx" ON "products_source_tags" USING btree ("_order");
  CREATE INDEX "products_source_tags_parent_id_idx" ON "products_source_tags" USING btree ("_parent_id");
  CREATE INDEX "products_attributes_values_order_idx" ON "products_attributes_values" USING btree ("_order");
  CREATE INDEX "products_attributes_values_parent_id_idx" ON "products_attributes_values" USING btree ("_parent_id");
  CREATE INDEX "products_attributes_order_idx" ON "products_attributes" USING btree ("_order");
  CREATE INDEX "products_attributes_parent_id_idx" ON "products_attributes" USING btree ("_parent_id");
  ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_migration_runs_fk" FOREIGN KEY ("migration_runs_id") REFERENCES "public"."migration_runs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_source_id_idx" ON "media" USING btree ("source_id");
  CREATE UNIQUE INDEX "media_tenant_source_key_idx" ON "media" USING btree ("tenant_source_key");
  CREATE INDEX "product_categories_parent_idx" ON "product_categories" USING btree ("parent_id");
  CREATE INDEX "product_categories_legacy_path_idx" ON "product_categories" USING btree ("legacy_path");
  CREATE UNIQUE INDEX "product_categories_tenant_legacy_path_key_idx" ON "product_categories" USING btree ("tenant_legacy_path_key");
  CREATE INDEX "product_categories_source_id_idx" ON "product_categories" USING btree ("source_id");
  CREATE UNIQUE INDEX "product_categories_tenant_source_key_idx" ON "product_categories" USING btree ("tenant_source_key");
  CREATE INDEX "payload_locked_documents_rels_migration_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("migration_runs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "migration_runs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_source_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_attributes_values" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_attributes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "migration_runs" CASCADE;
  DROP TABLE "products_source_tags" CASCADE;
  DROP TABLE "products_attributes_values" CASCADE;
  DROP TABLE "products_attributes" CASCADE;
  ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_parent_id_product_categories_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_migration_runs_fk";
  
  ALTER TABLE "products" ALTER COLUMN "sport" SET DATA TYPE text;
  DROP TYPE "public"."enum_products_sport";
  CREATE TYPE "public"."enum_products_sport" AS ENUM('badminton', 'volleyball', 'football', 'basketball', 'running', 'pickleball');
  ALTER TABLE "products" ALTER COLUMN "sport" SET DATA TYPE "public"."enum_products_sport" USING "sport"::"public"."enum_products_sport";
  DROP INDEX "media_source_id_idx";
  DROP INDEX "media_tenant_source_key_idx";
  DROP INDEX "product_categories_parent_idx";
  DROP INDEX "product_categories_legacy_path_idx";
  DROP INDEX "product_categories_tenant_legacy_path_key_idx";
  DROP INDEX "product_categories_source_id_idx";
  DROP INDEX "product_categories_tenant_source_key_idx";
  DROP INDEX "payload_locked_documents_rels_migration_runs_id_idx";
  ALTER TABLE "media" DROP COLUMN "source_system";
  ALTER TABLE "media" DROP COLUMN "source_id";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "media" DROP COLUMN "source_checksum";
  ALTER TABLE "media" DROP COLUMN "tenant_source_key";
  ALTER TABLE "product_categories" DROP COLUMN "parent_id";
  ALTER TABLE "product_categories" DROP COLUMN "legacy_path";
  ALTER TABLE "product_categories" DROP COLUMN "tenant_legacy_path_key";
  ALTER TABLE "product_categories" DROP COLUMN "source_system";
  ALTER TABLE "product_categories" DROP COLUMN "source_id";
  ALTER TABLE "product_categories" DROP COLUMN "tenant_source_key";
  ALTER TABLE "product_categories" DROP COLUMN "source_checksum";
  ALTER TABLE "product_categories" DROP COLUMN "product_count";
  ALTER TABLE "products" DROP COLUMN "product_type";
  ALTER TABLE "products" DROP COLUMN "regular_price";
  ALTER TABLE "products" DROP COLUMN "sale_price";
  ALTER TABLE "products" DROP COLUMN "currency";
  ALTER TABLE "products" DROP COLUMN "stock_status";
  ALTER TABLE "products" DROP COLUMN "is_purchasable";
  ALTER TABLE "products" DROP COLUMN "is_on_backorder";
  ALTER TABLE "products" DROP COLUMN "source_created_at";
  ALTER TABLE "products" DROP COLUMN "seo_title";
  ALTER TABLE "products" DROP COLUMN "meta_description";
  ALTER TABLE "products" DROP COLUMN "canonical_override";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "migration_runs_id";
  DROP TYPE "public"."enum_migration_runs_mode";
  DROP TYPE "public"."enum_migration_runs_status";
  DROP TYPE "public"."enum_products_product_type";
  DROP TYPE "public"."enum_products_stock_status";`)
}
