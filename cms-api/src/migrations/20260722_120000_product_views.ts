import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "product_view_events" (
      "id" bigserial PRIMARY KEY,
      "tenant_id" integer NOT NULL,
      "product_id" integer NOT NULL,
      "session_hash" varchar(64) NOT NULL,
      "visitor_hash" varchar(64) NOT NULL,
      "view_path" varchar(1024),
      "view_date" date NOT NULL,
      "viewed_at" timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT "product_view_events_tenant_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
      CONSTRAINT "product_view_events_product_fk"
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
      CONSTRAINT "product_view_events_session_unique"
        UNIQUE ("tenant_id", "product_id", "session_hash")
    );

    CREATE INDEX IF NOT EXISTS "product_view_events_product_date_idx"
      ON "product_view_events" ("tenant_id", "product_id", "view_date");
    CREATE INDEX IF NOT EXISTS "product_view_events_viewed_at_idx"
      ON "product_view_events" ("viewed_at");

    CREATE TABLE IF NOT EXISTS "product_view_daily_visitors" (
      "tenant_id" integer NOT NULL,
      "product_id" integer NOT NULL,
      "view_date" date NOT NULL,
      "visitor_hash" varchar(64) NOT NULL,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT "product_view_daily_visitors_tenant_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
      CONSTRAINT "product_view_daily_visitors_product_fk"
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
      CONSTRAINT "product_view_daily_visitors_unique"
        PRIMARY KEY ("tenant_id", "product_id", "view_date", "visitor_hash")
    );

    CREATE INDEX IF NOT EXISTS "product_view_daily_visitors_created_at_idx"
      ON "product_view_daily_visitors" ("created_at");

    CREATE TABLE IF NOT EXISTS "product_view_daily" (
      "tenant_id" integer NOT NULL,
      "product_id" integer NOT NULL,
      "view_date" date NOT NULL,
      "views" integer NOT NULL DEFAULT 0 CHECK ("views" >= 0),
      "unique_views" integer NOT NULL DEFAULT 0 CHECK ("unique_views" >= 0),
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
      CONSTRAINT "product_view_daily_tenant_fk"
        FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
      CONSTRAINT "product_view_daily_product_fk"
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
      CONSTRAINT "product_view_daily_unique"
        PRIMARY KEY ("tenant_id", "product_id", "view_date")
    );

    CREATE INDEX IF NOT EXISTS "product_view_daily_tenant_date_idx"
      ON "product_view_daily" ("tenant_id", "view_date" DESC);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "product_view_daily";
    DROP TABLE IF EXISTS "product_view_daily_visitors";
    DROP TABLE IF EXISTS "product_view_events";
  `)
}
