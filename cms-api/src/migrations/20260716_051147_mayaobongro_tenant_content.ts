import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_products_publication_status"
      AS ENUM('publish', 'draft', 'private', 'pending');
    CREATE TYPE "public"."enum_web_content_kind" AS ENUM('page', 'post');
    CREATE TYPE "public"."enum_web_content_publication_status"
      AS ENUM('publish', 'draft', 'private', 'pending');

    CREATE TABLE "products_legacy_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "url" varchar NOT NULL,
      "alt" varchar,
      "width" numeric,
      "height" numeric
    );

    ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL;
    ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL;
    ALTER TABLE "products" ALTER COLUMN "short_description" DROP NOT NULL;
    ALTER TABLE "products" ADD COLUMN "tenant_slug_key" varchar;
    ALTER TABLE "products" ADD COLUMN "content_html" varchar;
    ALTER TABLE "products" ADD COLUMN "legacy_path" varchar;
    ALTER TABLE "products" ADD COLUMN "tenant_legacy_path_key" varchar;
    ALTER TABLE "products" ADD COLUMN "publication_status"
      "enum_products_publication_status" DEFAULT 'publish';
    ALTER TABLE "products" ADD COLUMN "source_system" varchar;
    ALTER TABLE "products" ADD COLUMN "source_id" varchar;
    ALTER TABLE "products" ADD COLUMN "tenant_source_key" varchar;
    ALTER TABLE "products" ADD COLUMN "source_modified_at" timestamp(3) with time zone;
    ALTER TABLE "products" ADD COLUMN "source_checksum" varchar;

    ALTER TABLE "products_legacy_images"
      ADD CONSTRAINT "products_legacy_images_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id")
      ON DELETE cascade ON UPDATE no action;

    DROP INDEX "products_slug_idx";
    CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
    CREATE UNIQUE INDEX "products_tenant_slug_key_idx"
      ON "products" USING btree ("tenant_slug_key");
    CREATE INDEX "products_sku_idx" ON "products" USING btree ("sku");
    CREATE INDEX "products_legacy_path_idx" ON "products" USING btree ("legacy_path");
    CREATE UNIQUE INDEX "products_tenant_legacy_path_key_idx"
      ON "products" USING btree ("tenant_legacy_path_key");
    CREATE INDEX "products_source_id_idx" ON "products" USING btree ("source_id");
    CREATE UNIQUE INDEX "products_tenant_source_key_idx"
      ON "products" USING btree ("tenant_source_key");
    CREATE INDEX "products_legacy_images_order_idx"
      ON "products_legacy_images" USING btree ("_order");
    CREATE INDEX "products_legacy_images_parent_id_idx"
      ON "products_legacy_images" USING btree ("_parent_id");

    CREATE TABLE "web_content" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "tenant_slug_key" varchar,
      "kind" "enum_web_content_kind" NOT NULL,
      "legacy_path" varchar NOT NULL,
      "tenant_legacy_path_key" varchar,
      "content_html" varchar,
      "excerpt" varchar,
      "publication_status" "enum_web_content_publication_status" DEFAULT 'publish',
      "source_system" varchar,
      "source_id" varchar,
      "tenant_source_key" varchar,
      "source_modified_at" timestamp(3) with time zone,
      "source_checksum" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "web_content"
      ADD CONSTRAINT "web_content_tenant_id_tenants_id_fk"
      FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id")
      ON DELETE set null ON UPDATE no action;
    CREATE INDEX "web_content_tenant_idx" ON "web_content" USING btree ("tenant_id");
    CREATE INDEX "web_content_slug_idx" ON "web_content" USING btree ("slug");
    CREATE UNIQUE INDEX "web_content_tenant_slug_key_idx"
      ON "web_content" USING btree ("tenant_slug_key");
    CREATE INDEX "web_content_legacy_path_idx"
      ON "web_content" USING btree ("legacy_path");
    CREATE UNIQUE INDEX "web_content_tenant_legacy_path_key_idx"
      ON "web_content" USING btree ("tenant_legacy_path_key");
    CREATE INDEX "web_content_source_id_idx" ON "web_content" USING btree ("source_id");
    CREATE UNIQUE INDEX "web_content_tenant_source_key_idx"
      ON "web_content" USING btree ("tenant_source_key");
    CREATE INDEX "web_content_updated_at_idx" ON "web_content" USING btree ("updated_at");
    CREATE INDEX "web_content_created_at_idx" ON "web_content" USING btree ("created_at");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "web_content_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_web_content_fk"
      FOREIGN KEY ("web_content_id") REFERENCES "public"."web_content"("id")
      ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_web_content_id_idx"
      ON "payload_locked_documents_rels" USING btree ("web_content_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_web_content_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_web_content_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "web_content_id";

    DROP TABLE "web_content" CASCADE;
    DROP TYPE "public"."enum_web_content_kind";
    DROP TYPE "public"."enum_web_content_publication_status";

    DROP TABLE "products_legacy_images" CASCADE;
    DROP INDEX "products_tenant_slug_key_idx";
    DROP INDEX "products_sku_idx";
    DROP INDEX "products_legacy_path_idx";
    DROP INDEX "products_tenant_legacy_path_key_idx";
    DROP INDEX "products_source_id_idx";
    DROP INDEX "products_tenant_source_key_idx";
    DROP INDEX "products_slug_idx";
    CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");

    ALTER TABLE "products" DROP COLUMN "tenant_slug_key";
    ALTER TABLE "products" DROP COLUMN "content_html";
    ALTER TABLE "products" DROP COLUMN "legacy_path";
    ALTER TABLE "products" DROP COLUMN "tenant_legacy_path_key";
    ALTER TABLE "products" DROP COLUMN "publication_status";
    ALTER TABLE "products" DROP COLUMN "source_system";
    ALTER TABLE "products" DROP COLUMN "source_id";
    ALTER TABLE "products" DROP COLUMN "tenant_source_key";
    ALTER TABLE "products" DROP COLUMN "source_modified_at";
    ALTER TABLE "products" DROP COLUMN "source_checksum";
    ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL;
    ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;
    ALTER TABLE "products" ALTER COLUMN "short_description" SET NOT NULL;
    DROP TYPE "public"."enum_products_publication_status";
  `)
}
