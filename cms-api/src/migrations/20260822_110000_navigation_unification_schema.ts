import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN CREATE TYPE "public"."enum_category_distributions_source_kind" AS ENUM('category', 'catalog_view'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_category_distributions_status" AS ENUM('ready', 'draft_created', 'published', 'needs_review', 'blocked', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_category_distributions_copy_mode" AS ENUM('auto', 'manual_locked'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_catalog_taxonomies_kind" AS ENUM('sport', 'category', 'product_type', 'audience', 'color', 'collection', 'material', 'fit', 'tag'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_catalog_taxonomies_status" AS ENUM('active', 'retired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_catalog_views_match_mode" AS ENUM('all', 'any'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_catalog_views_index_policy" AS ENUM('indexable', 'noindex'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_catalog_views_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__catalog_views_v_version_match_mode" AS ENUM('all', 'any'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__catalog_views_v_version_index_policy" AS ENUM('indexable', 'noindex'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__catalog_views_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_menus_location" AS ENUM('header', 'mobile', 'footer', 'contextual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."menu_lifecycle_status" AS ENUM('draft', 'ready', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_menus_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_menus_v_version_location" AS ENUM('header', 'mobile', 'footer', 'contextual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_menus_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_items_target_type" AS ENUM('group', 'category', 'catalogView', 'page', 'customUrl'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_items_children_source" AS ENUM('static', 'category_query', 'catalog_view_query'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_items_category_query_group" AS ENUM('sport', 'type', 'collection', 'audience', 'color', 'tag'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_items_category_query_sort" AS ENUM('navigation_order', 'name_asc', 'year_desc', 'product_count_desc'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."view_index_policy" AS ENUM('indexable', 'noindex'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_items_catalog_view_query_sort" AS ENUM('title_asc', 'updated_desc'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_navigation_items_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_items_v_version_target_type" AS ENUM('group', 'category', 'catalogView', 'page', 'customUrl'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_items_v_version_children_source" AS ENUM('static', 'category_query', 'catalog_view_query'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_items_v_version_category_query_group" AS ENUM('sport', 'type', 'collection', 'audience', 'color', 'tag'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_items_v_version_category_query_sort" AS ENUM('navigation_order', 'name_asc', 'year_desc', 'product_count_desc'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_items_v_version_catalog_view_query_sort" AS ENUM('title_asc', 'updated_desc'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum__navigation_items_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_product_categories_status" AS ENUM('active', 'hidden', 'retired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN CREATE TYPE "public"."enum_store_settings_navigation_mode" AS ENUM('legacy', 'cms'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS "category_distributions" (
      "id" serial PRIMARY KEY NOT NULL,
      "distribution_key" varchar NOT NULL,
      "source_tenant_id" integer NOT NULL,
      "target_tenant_id" integer NOT NULL,
      "source_tenant_label" varchar,
      "target_tenant_label" varchar,
      "source_kind" "enum_category_distributions_source_kind" NOT NULL,
      "source_category_id" integer,
      "source_catalog_view_id" integer,
      "target_category_id" integer,
      "target_catalog_view_id" integer,
      "status" "enum_category_distributions_status" DEFAULT 'ready' NOT NULL,
      "copy_mode" "enum_category_distributions_copy_mode" DEFAULT 'auto' NOT NULL,
      "source_fact_fingerprint" varchar,
      "target_copy_fingerprint" varchar,
      "synced_at" timestamp(3) with time zone,
      "last_error" varchar,
      "review_note" varchar,
      "proposed_copy_name" varchar,
      "proposed_copy_navigation_label" varchar,
      "proposed_copy_path" varchar,
      "proposed_copy_navigation_order" numeric,
      "proposed_copy_description" varchar,
      "proposed_copy_seo_title" varchar,
      "proposed_copy_meta_description" varchar,
      "proposed_copy_model" varchar,
      "proposed_copy_prompt_version" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "catalog_taxonomies" (
      "id" serial PRIMARY KEY NOT NULL,
      "key" varchar NOT NULL,
      "name" varchar NOT NULL,
      "kind" "enum_catalog_taxonomies_kind" NOT NULL,
      "parent_id" integer,
      "status" "enum_catalog_taxonomies_status" DEFAULT 'active' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "catalog_taxonomies_aliases" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "value" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "catalog_views" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "key" varchar,
      "tenant_view_key" varchar,
      "path" varchar,
      "title" varchar,
      "heading" varchar,
      "description" varchar,
      "filters_sport_key" varchar,
      "match_mode" "enum_catalog_views_match_mode" DEFAULT 'all',
      "index_policy" "enum_catalog_views_index_policy" DEFAULT 'noindex',
      "canonical_path" varchar,
      "include_in_sitemap" boolean DEFAULT false,
      "enabled" boolean DEFAULT false,
      "distribution_navigation_label_override" varchar,
      "distribution_navigation_order_override" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_catalog_views_status" DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "catalog_views_filters_category_keys" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "key" varchar
    );
    CREATE TABLE IF NOT EXISTS "catalog_views_filters_search_tag_keys" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "key" varchar
    );
    CREATE TABLE IF NOT EXISTS "catalog_views_filters_product_type_keys" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "key" varchar
    );
    CREATE TABLE IF NOT EXISTS "catalog_views_filters_audience_keys" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "key" varchar
    );
    CREATE TABLE IF NOT EXISTS "catalog_views_filters_color_keys" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "key" varchar
    );
    CREATE TABLE IF NOT EXISTS "catalog_views_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "catalog_taxonomies_id" integer,
      "tenants_id" integer
    );

    CREATE TABLE IF NOT EXISTS "_catalog_views_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_tenant_id" integer,
      "version_key" varchar,
      "version_tenant_view_key" varchar,
      "version_path" varchar,
      "version_title" varchar,
      "version_heading" varchar,
      "version_description" varchar,
      "version_filters_sport_key" varchar,
      "version_match_mode" "enum__catalog_views_v_version_match_mode" DEFAULT 'all',
      "version_index_policy" "enum__catalog_views_v_version_index_policy" DEFAULT 'noindex',
      "version_canonical_path" varchar,
      "version_include_in_sitemap" boolean DEFAULT false,
      "version_enabled" boolean DEFAULT false,
      "version_distribution_navigation_label_override" varchar,
      "version_distribution_navigation_order_override" numeric,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__catalog_views_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );
    CREATE TABLE IF NOT EXISTS "_catalog_views_v_version_filters_category_keys" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" serial PRIMARY KEY NOT NULL, "key" varchar, "_uuid" varchar
    );
    CREATE TABLE IF NOT EXISTS "_catalog_views_v_version_filters_search_tag_keys" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" serial PRIMARY KEY NOT NULL, "key" varchar, "_uuid" varchar
    );
    CREATE TABLE IF NOT EXISTS "_catalog_views_v_version_filters_product_type_keys" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" serial PRIMARY KEY NOT NULL, "key" varchar, "_uuid" varchar
    );
    CREATE TABLE IF NOT EXISTS "_catalog_views_v_version_filters_audience_keys" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" serial PRIMARY KEY NOT NULL, "key" varchar, "_uuid" varchar
    );
    CREATE TABLE IF NOT EXISTS "_catalog_views_v_version_filters_color_keys" (
      "_order" integer NOT NULL, "_parent_id" integer NOT NULL, "id" serial PRIMARY KEY NOT NULL, "key" varchar, "_uuid" varchar
    );
    CREATE TABLE IF NOT EXISTS "_catalog_views_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "catalog_taxonomies_id" integer,
      "tenants_id" integer
    );

    CREATE TABLE IF NOT EXISTS "navigation_menus" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "key" varchar,
      "location" "enum_navigation_menus_location",
      "tenant_menu_key" varchar,
      "status" "menu_lifecycle_status" DEFAULT 'draft',
      "revision" numeric DEFAULT 1,
      "manifest_hash" varchar,
      "last_validated_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_navigation_menus_status" DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS "_navigation_menus_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_tenant_id" integer,
      "version_key" varchar,
      "version_location" "enum__navigation_menus_v_version_location",
      "version_tenant_menu_key" varchar,
      "version_status" "menu_lifecycle_status" DEFAULT 'draft',
      "version_revision" numeric DEFAULT 1,
      "version_manifest_hash" varchar,
      "version_last_validated_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__navigation_menus_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    CREATE TABLE IF NOT EXISTS "navigation_items" (
      "id" serial PRIMARY KEY NOT NULL,
      "tenant_id" integer,
      "menu_id" integer,
      "key" varchar,
      "tenant_menu_item_key" varchar,
      "parent_id" integer,
      "order" numeric DEFAULT 0,
      "enabled" boolean DEFAULT true,
      "label" varchar,
      "description" varchar,
      "icon_key" varchar,
      "featured" boolean DEFAULT false,
      "target_type" "enum_navigation_items_target_type" DEFAULT 'group',
      "target_category_id" integer,
      "target_catalog_view_id" integer,
      "target_page_id" integer,
      "custom_url" varchar,
      "children_source" "enum_navigation_items_children_source" DEFAULT 'static',
      "category_query_group" "enum_navigation_items_category_query_group",
      "category_query_taxonomy_root_id" integer,
      "category_query_minimum_product_count" numeric DEFAULT 1,
      "category_query_sort" "enum_navigation_items_category_query_sort" DEFAULT 'navigation_order',
      "category_query_limit" numeric DEFAULT 30,
      "catalog_view_query_taxonomy_root_id" integer,
      "catalog_view_query_index_policy" "view_index_policy",
      "catalog_view_query_sort" "enum_navigation_items_catalog_view_query_sort" DEFAULT 'title_asc',
      "catalog_view_query_limit" numeric DEFAULT 30,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "enum_navigation_items_status" DEFAULT 'draft'
    );
    CREATE TABLE IF NOT EXISTS "_navigation_items_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_tenant_id" integer,
      "version_menu_id" integer,
      "version_key" varchar,
      "version_tenant_menu_item_key" varchar,
      "version_parent_id" integer,
      "version_order" numeric DEFAULT 0,
      "version_enabled" boolean DEFAULT true,
      "version_label" varchar,
      "version_description" varchar,
      "version_icon_key" varchar,
      "version_featured" boolean DEFAULT false,
      "version_target_type" "enum__navigation_items_v_version_target_type" DEFAULT 'group',
      "version_target_category_id" integer,
      "version_target_catalog_view_id" integer,
      "version_target_page_id" integer,
      "version_custom_url" varchar,
      "version_children_source" "enum__navigation_items_v_version_children_source" DEFAULT 'static',
      "version_category_query_group" "enum__navigation_items_v_version_category_query_group",
      "version_category_query_taxonomy_root_id" integer,
      "version_category_query_minimum_product_count" numeric DEFAULT 1,
      "version_category_query_sort" "enum__navigation_items_v_version_category_query_sort" DEFAULT 'navigation_order',
      "version_category_query_limit" numeric DEFAULT 30,
      "version_catalog_view_query_taxonomy_root_id" integer,
      "version_catalog_view_query_index_policy" "view_index_policy",
      "version_catalog_view_query_sort" "enum__navigation_items_v_version_catalog_view_query_sort" DEFAULT 'title_asc',
      "version_catalog_view_query_limit" numeric DEFAULT 30,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "enum__navigation_items_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean
    );

    ALTER TABLE "media_search_tags" ADD COLUMN IF NOT EXISTS "key" varchar;
    ALTER TABLE "products_search_tags" ADD COLUMN IF NOT EXISTS "key" varchar;
    ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "taxonomy_id" integer;
    ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "navigation_label" varchar;
    ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "show_in_navigation" boolean DEFAULT false;
    ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "navigation_order" numeric DEFAULT 0;
    ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "status" "enum_product_categories_status" DEFAULT 'active';
    ALTER TABLE "store_settings" ADD COLUMN IF NOT EXISTS "navigation_mode" "enum_store_settings_navigation_mode" DEFAULT 'legacy';

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "category_distributions_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "catalog_taxonomies_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "catalog_views_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "navigation_menus_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "navigation_items_id" integer;

    DO $$ BEGIN ALTER TABLE "category_distributions" ADD CONSTRAINT "category_distributions_source_tenant_id_tenants_id_fk" FOREIGN KEY ("source_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "category_distributions" ADD CONSTRAINT "category_distributions_target_tenant_id_tenants_id_fk" FOREIGN KEY ("target_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "category_distributions" ADD CONSTRAINT "category_distributions_source_category_id_product_categories_id_fk" FOREIGN KEY ("source_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "category_distributions" ADD CONSTRAINT "category_distributions_source_catalog_view_id_catalog_views_id_fk" FOREIGN KEY ("source_catalog_view_id") REFERENCES "public"."catalog_views"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "category_distributions" ADD CONSTRAINT "category_distributions_target_category_id_product_categories_id_fk" FOREIGN KEY ("target_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "category_distributions" ADD CONSTRAINT "category_distributions_target_catalog_view_id_catalog_views_id_fk" FOREIGN KEY ("target_catalog_view_id") REFERENCES "public"."catalog_views"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_taxonomies" ADD CONSTRAINT "catalog_taxonomies_parent_id_catalog_taxonomies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_taxonomies_aliases" ADD CONSTRAINT "catalog_taxonomies_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views" ADD CONSTRAINT "catalog_views_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_filters_category_keys" ADD CONSTRAINT "catalog_views_filters_category_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_views"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_filters_search_tag_keys" ADD CONSTRAINT "catalog_views_filters_search_tag_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_views"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_filters_product_type_keys" ADD CONSTRAINT "catalog_views_filters_product_type_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_views"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_filters_audience_keys" ADD CONSTRAINT "catalog_views_filters_audience_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_views"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_filters_color_keys" ADD CONSTRAINT "catalog_views_filters_color_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_views"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_rels" ADD CONSTRAINT "catalog_views_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_views"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_rels" ADD CONSTRAINT "catalog_views_rels_catalog_taxonomies_fk" FOREIGN KEY ("catalog_taxonomies_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "catalog_views_rels" ADD CONSTRAINT "catalog_views_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v" ADD CONSTRAINT "_catalog_views_v_parent_id_catalog_views_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_views"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v" ADD CONSTRAINT "_catalog_views_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_version_filters_category_keys" ADD CONSTRAINT "_catalog_views_v_version_filters_category_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_catalog_views_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_version_filters_search_tag_keys" ADD CONSTRAINT "_catalog_views_v_version_filters_search_tag_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_catalog_views_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_version_filters_product_type_keys" ADD CONSTRAINT "_catalog_views_v_version_filters_product_type_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_catalog_views_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_version_filters_audience_keys" ADD CONSTRAINT "_catalog_views_v_version_filters_audience_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_catalog_views_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_version_filters_color_keys" ADD CONSTRAINT "_catalog_views_v_version_filters_color_keys_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_catalog_views_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_rels" ADD CONSTRAINT "_catalog_views_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_catalog_views_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_rels" ADD CONSTRAINT "_catalog_views_v_rels_catalog_taxonomies_fk" FOREIGN KEY ("catalog_taxonomies_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_catalog_views_v_rels" ADD CONSTRAINT "_catalog_views_v_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_menus" ADD CONSTRAINT "navigation_menus_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_menus_v" ADD CONSTRAINT "_navigation_menus_v_parent_id_navigation_menus_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_menus"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_menus_v" ADD CONSTRAINT "_navigation_menus_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_menu_id_navigation_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."navigation_menus"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_navigation_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_target_category_id_product_categories_id_fk" FOREIGN KEY ("target_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_target_catalog_view_id_catalog_views_id_fk" FOREIGN KEY ("target_catalog_view_id") REFERENCES "public"."catalog_views"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_target_page_id_pages_id_fk" FOREIGN KEY ("target_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_category_query_taxonomy_root_id_catalog_taxonomies_id_fk" FOREIGN KEY ("category_query_taxonomy_root_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_catalog_view_query_taxonomy_root_id_catalog_taxonomies_id_fk" FOREIGN KEY ("catalog_view_query_taxonomy_root_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_parent_id_navigation_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_menu_id_navigation_menus_id_fk" FOREIGN KEY ("version_menu_id") REFERENCES "public"."navigation_menus"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_parent_id_navigation_items_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_target_category_id_product_categories_id_fk" FOREIGN KEY ("version_target_category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_target_catalog_view_id_catalog_views_id_fk" FOREIGN KEY ("version_target_catalog_view_id") REFERENCES "public"."catalog_views"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_target_page_id_pages_id_fk" FOREIGN KEY ("version_target_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_category_query_taxonomy_root_id_catalog_taxonomies_id_fk" FOREIGN KEY ("version_category_query_taxonomy_root_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "_navigation_items_v" ADD CONSTRAINT "_navigation_items_v_version_catalog_view_query_taxonomy_root_id_catalog_taxonomies_id_fk" FOREIGN KEY ("version_catalog_view_query_taxonomy_root_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_taxonomy_id_catalog_taxonomies_id_fk" FOREIGN KEY ("taxonomy_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_category_distributions_fk" FOREIGN KEY ("category_distributions_id") REFERENCES "public"."category_distributions"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalog_taxonomies_fk" FOREIGN KEY ("catalog_taxonomies_id") REFERENCES "public"."catalog_taxonomies"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalog_views_fk" FOREIGN KEY ("catalog_views_id") REFERENCES "public"."catalog_views"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_menus_fk" FOREIGN KEY ("navigation_menus_id") REFERENCES "public"."navigation_menus"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_items_fk" FOREIGN KEY ("navigation_items_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "category_distributions_distribution_key_idx" ON "category_distributions" USING btree ("distribution_key");
    CREATE INDEX IF NOT EXISTS "category_distributions_source_tenant_idx" ON "category_distributions" USING btree ("source_tenant_id");
    CREATE INDEX IF NOT EXISTS "category_distributions_target_tenant_idx" ON "category_distributions" USING btree ("target_tenant_id");
    CREATE INDEX IF NOT EXISTS "category_distributions_source_category_idx" ON "category_distributions" USING btree ("source_category_id");
    CREATE INDEX IF NOT EXISTS "category_distributions_source_catalog_view_idx" ON "category_distributions" USING btree ("source_catalog_view_id");
    CREATE INDEX IF NOT EXISTS "category_distributions_target_category_idx" ON "category_distributions" USING btree ("target_category_id");
    CREATE INDEX IF NOT EXISTS "category_distributions_target_catalog_view_idx" ON "category_distributions" USING btree ("target_catalog_view_id");
    CREATE INDEX IF NOT EXISTS "category_distributions_updated_at_idx" ON "category_distributions" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "category_distributions_created_at_idx" ON "category_distributions" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "catalog_taxonomies_aliases_order_idx" ON "catalog_taxonomies_aliases" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "catalog_taxonomies_aliases_parent_id_idx" ON "catalog_taxonomies_aliases" USING btree ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "catalog_taxonomies_key_idx" ON "catalog_taxonomies" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "catalog_taxonomies_parent_idx" ON "catalog_taxonomies" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "catalog_taxonomies_updated_at_idx" ON "catalog_taxonomies" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "catalog_taxonomies_created_at_idx" ON "catalog_taxonomies" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "catalog_views_filters_category_keys_order_idx" ON "catalog_views_filters_category_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_category_keys_parent_id_idx" ON "catalog_views_filters_category_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_category_keys_key_idx" ON "catalog_views_filters_category_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_search_tag_keys_order_idx" ON "catalog_views_filters_search_tag_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_search_tag_keys_parent_id_idx" ON "catalog_views_filters_search_tag_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_search_tag_keys_key_idx" ON "catalog_views_filters_search_tag_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_product_type_keys_order_idx" ON "catalog_views_filters_product_type_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_product_type_keys_parent_id_idx" ON "catalog_views_filters_product_type_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_product_type_keys_key_idx" ON "catalog_views_filters_product_type_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_audience_keys_order_idx" ON "catalog_views_filters_audience_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_audience_keys_parent_id_idx" ON "catalog_views_filters_audience_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_audience_keys_key_idx" ON "catalog_views_filters_audience_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_color_keys_order_idx" ON "catalog_views_filters_color_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_color_keys_parent_id_idx" ON "catalog_views_filters_color_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_color_keys_key_idx" ON "catalog_views_filters_color_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "catalog_views_tenant_idx" ON "catalog_views" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_key_idx" ON "catalog_views" USING btree ("key");
    CREATE UNIQUE INDEX IF NOT EXISTS "catalog_views_tenant_view_key_idx" ON "catalog_views" USING btree ("tenant_view_key");
    CREATE INDEX IF NOT EXISTS "catalog_views_path_idx" ON "catalog_views" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "catalog_views_filters_filters_sport_key_idx" ON "catalog_views" USING btree ("filters_sport_key");
    CREATE INDEX IF NOT EXISTS "catalog_views_updated_at_idx" ON "catalog_views" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "catalog_views_created_at_idx" ON "catalog_views" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "catalog_views__status_idx" ON "catalog_views" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "catalog_views_rels_order_idx" ON "catalog_views_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "catalog_views_rels_parent_idx" ON "catalog_views_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_rels_path_idx" ON "catalog_views_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "catalog_views_rels_catalog_taxonomies_id_idx" ON "catalog_views_rels" USING btree ("catalog_taxonomies_id");
    CREATE INDEX IF NOT EXISTS "catalog_views_rels_tenants_id_idx" ON "catalog_views_rels" USING btree ("tenants_id");

    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_category_keys_order_idx" ON "_catalog_views_v_version_filters_category_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_category_keys_parent_id_idx" ON "_catalog_views_v_version_filters_category_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_category_keys_key_idx" ON "_catalog_views_v_version_filters_category_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_search_tag_keys_order_idx" ON "_catalog_views_v_version_filters_search_tag_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_search_tag_keys_parent_id_idx" ON "_catalog_views_v_version_filters_search_tag_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_search_tag_keys_key_idx" ON "_catalog_views_v_version_filters_search_tag_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_product_type_keys_order_idx" ON "_catalog_views_v_version_filters_product_type_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_product_type_keys_parent_id_idx" ON "_catalog_views_v_version_filters_product_type_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_product_type_keys_key_idx" ON "_catalog_views_v_version_filters_product_type_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_audience_keys_order_idx" ON "_catalog_views_v_version_filters_audience_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_audience_keys_parent_id_idx" ON "_catalog_views_v_version_filters_audience_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_audience_keys_key_idx" ON "_catalog_views_v_version_filters_audience_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_color_keys_order_idx" ON "_catalog_views_v_version_filters_color_keys" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_color_keys_parent_id_idx" ON "_catalog_views_v_version_filters_color_keys" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_color_keys_key_idx" ON "_catalog_views_v_version_filters_color_keys" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_parent_idx" ON "_catalog_views_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_version_tenant_idx" ON "_catalog_views_v" USING btree ("version_tenant_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_version_key_idx" ON "_catalog_views_v" USING btree ("version_key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_version_tenant_view_key_idx" ON "_catalog_views_v" USING btree ("version_tenant_view_key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_version_path_idx" ON "_catalog_views_v" USING btree ("version_path");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_filters_version_filters_sport_k_idx" ON "_catalog_views_v" USING btree ("version_filters_sport_key");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_version_updated_at_idx" ON "_catalog_views_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_version_created_at_idx" ON "_catalog_views_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_version_version__status_idx" ON "_catalog_views_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_created_at_idx" ON "_catalog_views_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_updated_at_idx" ON "_catalog_views_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_latest_idx" ON "_catalog_views_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_rels_order_idx" ON "_catalog_views_v_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_rels_parent_idx" ON "_catalog_views_v_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_rels_path_idx" ON "_catalog_views_v_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_rels_catalog_taxonomies_id_idx" ON "_catalog_views_v_rels" USING btree ("catalog_taxonomies_id");
    CREATE INDEX IF NOT EXISTS "_catalog_views_v_rels_tenants_id_idx" ON "_catalog_views_v_rels" USING btree ("tenants_id");

    CREATE INDEX IF NOT EXISTS "navigation_menus_tenant_idx" ON "navigation_menus" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "navigation_menus_key_idx" ON "navigation_menus" USING btree ("key");
    CREATE UNIQUE INDEX IF NOT EXISTS "navigation_menus_tenant_menu_key_idx" ON "navigation_menus" USING btree ("tenant_menu_key");
    CREATE INDEX IF NOT EXISTS "navigation_menus_manifest_hash_idx" ON "navigation_menus" USING btree ("manifest_hash");
    CREATE INDEX IF NOT EXISTS "navigation_menus_updated_at_idx" ON "navigation_menus" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "navigation_menus_created_at_idx" ON "navigation_menus" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "navigation_menus__status_idx" ON "navigation_menus" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_parent_idx" ON "_navigation_menus_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_version_version_tenant_idx" ON "_navigation_menus_v" USING btree ("version_tenant_id");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_version_version_key_idx" ON "_navigation_menus_v" USING btree ("version_key");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_version_version_tenant_menu_key_idx" ON "_navigation_menus_v" USING btree ("version_tenant_menu_key");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_version_version_manifest_hash_idx" ON "_navigation_menus_v" USING btree ("version_manifest_hash");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_version_version_updated_at_idx" ON "_navigation_menus_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_version_version_created_at_idx" ON "_navigation_menus_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_version_version__status_idx" ON "_navigation_menus_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_created_at_idx" ON "_navigation_menus_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_updated_at_idx" ON "_navigation_menus_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_navigation_menus_v_latest_idx" ON "_navigation_menus_v" USING btree ("latest");

    CREATE INDEX IF NOT EXISTS "navigation_items_tenant_idx" ON "navigation_items" USING btree ("tenant_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_menu_idx" ON "navigation_items" USING btree ("menu_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_key_idx" ON "navigation_items" USING btree ("key");
    CREATE UNIQUE INDEX IF NOT EXISTS "navigation_items_tenant_menu_item_key_idx" ON "navigation_items" USING btree ("tenant_menu_item_key");
    CREATE INDEX IF NOT EXISTS "navigation_items_parent_idx" ON "navigation_items" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_order_idx" ON "navigation_items" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "navigation_items_target_category_idx" ON "navigation_items" USING btree ("target_category_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_target_catalog_view_idx" ON "navigation_items" USING btree ("target_catalog_view_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_target_page_idx" ON "navigation_items" USING btree ("target_page_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_category_query_category_query_taxonomy__idx" ON "navigation_items" USING btree ("category_query_taxonomy_root_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_catalog_view_query_catalog_view_query_t_idx" ON "navigation_items" USING btree ("catalog_view_query_taxonomy_root_id");
    CREATE INDEX IF NOT EXISTS "navigation_items_updated_at_idx" ON "navigation_items" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "navigation_items_created_at_idx" ON "navigation_items" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "navigation_items__status_idx" ON "navigation_items" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_parent_idx" ON "_navigation_items_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_tenant_idx" ON "_navigation_items_v" USING btree ("version_tenant_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_menu_idx" ON "_navigation_items_v" USING btree ("version_menu_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_key_idx" ON "_navigation_items_v" USING btree ("version_key");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_tenant_menu_item_key_idx" ON "_navigation_items_v" USING btree ("version_tenant_menu_item_key");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_parent_idx" ON "_navigation_items_v" USING btree ("version_parent_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_order_idx" ON "_navigation_items_v" USING btree ("version_order");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_target_category_idx" ON "_navigation_items_v" USING btree ("version_target_category_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_target_catalog_view_idx" ON "_navigation_items_v" USING btree ("version_target_catalog_view_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_target_page_idx" ON "_navigation_items_v" USING btree ("version_target_page_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_category_query_version_categ_idx" ON "_navigation_items_v" USING btree ("version_category_query_taxonomy_root_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_catalog_view_query_version_c_idx" ON "_navigation_items_v" USING btree ("version_catalog_view_query_taxonomy_root_id");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_updated_at_idx" ON "_navigation_items_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version_created_at_idx" ON "_navigation_items_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_version_version__status_idx" ON "_navigation_items_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_created_at_idx" ON "_navigation_items_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_updated_at_idx" ON "_navigation_items_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_navigation_items_v_latest_idx" ON "_navigation_items_v" USING btree ("latest");

    CREATE INDEX IF NOT EXISTS "media_search_tags_key_idx" ON "media_search_tags" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "products_search_tags_key_idx" ON "products_search_tags" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "product_categories_taxonomy_idx" ON "product_categories" USING btree ("taxonomy_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_category_distributions_id_idx" ON "payload_locked_documents_rels" USING btree ("category_distributions_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_catalog_taxonomies_id_idx" ON "payload_locked_documents_rels" USING btree ("catalog_taxonomies_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_catalog_views_id_idx" ON "payload_locked_documents_rels" USING btree ("catalog_views_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_navigation_menus_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_menus_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_navigation_items_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_items_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_category_distributions_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_catalog_taxonomies_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_catalog_views_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_navigation_menus_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_navigation_items_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "category_distributions_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "catalog_taxonomies_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "catalog_views_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "navigation_menus_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "navigation_items_id";

    ALTER TABLE "product_categories" DROP CONSTRAINT IF EXISTS "product_categories_taxonomy_id_catalog_taxonomies_id_fk";
    DROP INDEX IF EXISTS "media_search_tags_key_idx";
    DROP INDEX IF EXISTS "products_search_tags_key_idx";
    DROP INDEX IF EXISTS "product_categories_taxonomy_idx";
    ALTER TABLE "media_search_tags" DROP COLUMN IF EXISTS "key";
    ALTER TABLE "products_search_tags" DROP COLUMN IF EXISTS "key";
    ALTER TABLE "product_categories" DROP COLUMN IF EXISTS "taxonomy_id";
    ALTER TABLE "product_categories" DROP COLUMN IF EXISTS "navigation_label";
    ALTER TABLE "product_categories" DROP COLUMN IF EXISTS "show_in_navigation";
    ALTER TABLE "product_categories" DROP COLUMN IF EXISTS "navigation_order";
    ALTER TABLE "product_categories" DROP COLUMN IF EXISTS "status";
    ALTER TABLE "store_settings" DROP COLUMN IF EXISTS "navigation_mode";

    DROP TABLE IF EXISTS "category_distributions" CASCADE;
    DROP TABLE IF EXISTS "_navigation_items_v" CASCADE;
    DROP TABLE IF EXISTS "navigation_items" CASCADE;
    DROP TABLE IF EXISTS "_navigation_menus_v" CASCADE;
    DROP TABLE IF EXISTS "navigation_menus" CASCADE;
    DROP TABLE IF EXISTS "_catalog_views_v_rels" CASCADE;
    DROP TABLE IF EXISTS "_catalog_views_v_version_filters_category_keys" CASCADE;
    DROP TABLE IF EXISTS "_catalog_views_v_version_filters_search_tag_keys" CASCADE;
    DROP TABLE IF EXISTS "_catalog_views_v_version_filters_product_type_keys" CASCADE;
    DROP TABLE IF EXISTS "_catalog_views_v_version_filters_audience_keys" CASCADE;
    DROP TABLE IF EXISTS "_catalog_views_v_version_filters_color_keys" CASCADE;
    DROP TABLE IF EXISTS "_catalog_views_v" CASCADE;
    DROP TABLE IF EXISTS "catalog_views_rels" CASCADE;
    DROP TABLE IF EXISTS "catalog_views_filters_category_keys" CASCADE;
    DROP TABLE IF EXISTS "catalog_views_filters_search_tag_keys" CASCADE;
    DROP TABLE IF EXISTS "catalog_views_filters_product_type_keys" CASCADE;
    DROP TABLE IF EXISTS "catalog_views_filters_audience_keys" CASCADE;
    DROP TABLE IF EXISTS "catalog_views_filters_color_keys" CASCADE;
    DROP TABLE IF EXISTS "catalog_views" CASCADE;
    DROP TABLE IF EXISTS "catalog_taxonomies_aliases" CASCADE;
    DROP TABLE IF EXISTS "catalog_taxonomies" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_category_distributions_source_kind";
    DROP TYPE IF EXISTS "public"."enum_category_distributions_status";
    DROP TYPE IF EXISTS "public"."enum_category_distributions_copy_mode";
    DROP TYPE IF EXISTS "public"."enum_catalog_taxonomies_kind";
    DROP TYPE IF EXISTS "public"."enum_catalog_taxonomies_status";
    DROP TYPE IF EXISTS "public"."enum_catalog_views_match_mode";
    DROP TYPE IF EXISTS "public"."enum_catalog_views_index_policy";
    DROP TYPE IF EXISTS "public"."enum_catalog_views_status";
    DROP TYPE IF EXISTS "public"."enum__catalog_views_v_version_match_mode";
    DROP TYPE IF EXISTS "public"."enum__catalog_views_v_version_index_policy";
    DROP TYPE IF EXISTS "public"."enum__catalog_views_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_navigation_menus_location";
    DROP TYPE IF EXISTS "public"."menu_lifecycle_status";
    DROP TYPE IF EXISTS "public"."enum_navigation_menus_status";
    DROP TYPE IF EXISTS "public"."enum__navigation_menus_v_version_location";
    DROP TYPE IF EXISTS "public"."enum__navigation_menus_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_navigation_items_target_type";
    DROP TYPE IF EXISTS "public"."enum_navigation_items_children_source";
    DROP TYPE IF EXISTS "public"."enum_navigation_items_category_query_group";
    DROP TYPE IF EXISTS "public"."enum_navigation_items_category_query_sort";
    DROP TYPE IF EXISTS "public"."view_index_policy";
    DROP TYPE IF EXISTS "public"."enum_navigation_items_catalog_view_query_sort";
    DROP TYPE IF EXISTS "public"."enum_navigation_items_status";
    DROP TYPE IF EXISTS "public"."enum__navigation_items_v_version_target_type";
    DROP TYPE IF EXISTS "public"."enum__navigation_items_v_version_children_source";
    DROP TYPE IF EXISTS "public"."enum__navigation_items_v_version_category_query_group";
    DROP TYPE IF EXISTS "public"."enum__navigation_items_v_version_category_query_sort";
    DROP TYPE IF EXISTS "public"."enum__navigation_items_v_version_catalog_view_query_sort";
    DROP TYPE IF EXISTS "public"."enum__navigation_items_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_product_categories_status";
    DROP TYPE IF EXISTS "public"."enum_store_settings_navigation_mode";
  `)
}
