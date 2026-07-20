import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "media_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "tenants_id" integer
    );

    DO $$ BEGIN
      ALTER TABLE "media_rels"
        ADD CONSTRAINT "media_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "media_rels"
        ADD CONSTRAINT "media_rels_tenants_fk"
        FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "media_rels_order_idx" ON "media_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "media_rels_path_idx" ON "media_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "media_rels_tenants_id_idx" ON "media_rels" USING btree ("tenants_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "media_rels" CASCADE;`)
}
