import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_product_categories_group" ADD VALUE IF NOT EXISTS 'sport';
    ALTER TABLE "product_categories" ADD COLUMN "tenant_slug_key" varchar;
    UPDATE "product_categories"
      SET "tenant_slug_key" = "tenant_id"::text || ':' || "slug"
      WHERE "tenant_id" IS NOT NULL;
    DROP INDEX "product_categories_slug_idx";
    CREATE INDEX "product_categories_slug_idx"
      ON "product_categories" USING btree ("slug");
    CREATE UNIQUE INDEX "product_categories_tenant_slug_key_idx"
      ON "product_categories" USING btree ("tenant_slug_key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "product_categories" SET "group" = 'type' WHERE "group" = 'sport';
    DROP INDEX "product_categories_tenant_slug_key_idx";
    DROP INDEX "product_categories_slug_idx";
    CREATE UNIQUE INDEX "product_categories_slug_idx"
      ON "product_categories" USING btree ("slug");
    ALTER TABLE "product_categories" DROP COLUMN "tenant_slug_key";

    ALTER TYPE "public"."enum_product_categories_group" RENAME TO "enum_product_categories_group_old";
    CREATE TYPE "public"."enum_product_categories_group" AS ENUM('type', 'color');
    ALTER TABLE "product_categories"
      ALTER COLUMN "group" TYPE "public"."enum_product_categories_group"
      USING "group"::text::"public"."enum_product_categories_group";
    DROP TYPE "public"."enum_product_categories_group_old";
  `)
}
