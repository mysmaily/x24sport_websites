import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "store_settings"
      ADD COLUMN IF NOT EXISTS "facebook_url" varchar;

    CREATE TABLE IF NOT EXISTS "store_settings_map_locations" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "address" varchar NOT NULL,
      "google_map_url" varchar NOT NULL
    );

    DO $$
    BEGIN
      ALTER TABLE "store_settings_map_locations"
        ADD CONSTRAINT "store_settings_map_locations_parent_id_fk"
        FOREIGN KEY ("_parent_id")
        REFERENCES "public"."store_settings"("id")
        ON DELETE cascade
        ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "store_settings_map_locations_order_idx"
      ON "store_settings_map_locations" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "store_settings_map_locations_parent_id_idx"
      ON "store_settings_map_locations" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "store_settings_map_locations";
    ALTER TABLE "store_settings"
      DROP COLUMN IF EXISTS "facebook_url";
  `)
}
