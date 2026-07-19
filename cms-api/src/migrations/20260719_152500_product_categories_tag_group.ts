import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_product_categories_group" ADD VALUE IF NOT EXISTS 'tag';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "product_categories" SET "group" = 'type' WHERE "group" = 'tag';

    ALTER TYPE "public"."enum_product_categories_group" RENAME TO "enum_product_categories_group_old";
    CREATE TYPE "public"."enum_product_categories_group" AS ENUM('type', 'color', 'sport');
    ALTER TABLE "product_categories"
      ALTER COLUMN "group" TYPE "public"."enum_product_categories_group"
      USING "group"::text::"public"."enum_product_categories_group";
    DROP TYPE "public"."enum_product_categories_group_old";
  `)
}
