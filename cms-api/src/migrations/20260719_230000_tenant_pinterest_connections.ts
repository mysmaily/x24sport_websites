import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "tenant_pinterest_connections" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_connection_key" varchar,
      "pinterest_account_id" varchar,
      "pinterest_username" varchar,
      "default_board_id" varchar,
      "default_board_name" varchar,
      "scope" varchar,
      "access_token" varchar,
      "refresh_token" varchar,
      "token_expires_at" timestamp(3) with time zone,
      "refresh_token_expires_at" timestamp(3) with time zone,
      "last_published_pin_id" varchar,
      "last_published_product_id" varchar,
      "last_published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "tenant_pinterest_connections_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "tenants_id" integer
    );

    DO $$
    BEGIN
      ALTER TABLE "tenant_pinterest_connections_rels"
        ADD CONSTRAINT "tenant_pinterest_connections_rels_parent_fk"
        FOREIGN KEY ("parent_id")
        REFERENCES "public"."tenant_pinterest_connections"("id")
        ON DELETE cascade
        ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    DO $$
    BEGIN
      ALTER TABLE "tenant_pinterest_connections_rels"
        ADD CONSTRAINT "tenant_pinterest_connections_rels_tenants_fk"
        FOREIGN KEY ("tenants_id")
        REFERENCES "public"."tenants"("id")
        ON DELETE set null
        ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "tenant_pinterest_connections_tenant_connection_key_idx"
      ON "tenant_pinterest_connections" USING btree ("tenant_connection_key");
    CREATE UNIQUE INDEX IF NOT EXISTS "tenant_pinterest_connections_tenant_connection_key_unique"
      ON "tenant_pinterest_connections" USING btree ("tenant_connection_key");
    CREATE INDEX IF NOT EXISTS "tenant_pinterest_connections_updated_at_idx"
      ON "tenant_pinterest_connections" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "tenant_pinterest_connections_created_at_idx"
      ON "tenant_pinterest_connections" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "tenant_pinterest_connections_rels_order_idx"
      ON "tenant_pinterest_connections_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "tenant_pinterest_connections_rels_parent_idx"
      ON "tenant_pinterest_connections_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "tenant_pinterest_connections_rels_path_idx"
      ON "tenant_pinterest_connections_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "tenant_pinterest_connections_rels_tenants_id_idx"
      ON "tenant_pinterest_connections_rels" USING btree ("tenants_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "tenant_pinterest_connections_rels";
    DROP TABLE IF EXISTS "tenant_pinterest_connections";
  `)
}
