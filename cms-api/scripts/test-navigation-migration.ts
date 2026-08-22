import assert from 'node:assert/strict'

import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres'
import { sql } from '@payloadcms/db-postgres'

import { down, up } from '../src/migrations/20260822_110000_navigation_unification_schema'

const connectionString = process.env.NAVIGATION_MIGRATION_TEST_DATABASE_URL
if (!connectionString || !connectionString.includes('/codex_nav_phase1_test_')) {
  throw new Error('NAVIGATION_MIGRATION_TEST_DATABASE_URL phải trỏ tới database test codex_nav_phase1_test_* riêng biệt.')
}

const db = drizzle(connectionString)

try {
  await db.execute(sql`
    CREATE TABLE tenants (id serial PRIMARY KEY);
    CREATE TABLE product_categories (id serial PRIMARY KEY);
    CREATE TABLE pages (id serial PRIMARY KEY);
    CREATE TABLE media_search_tags (id varchar PRIMARY KEY);
    CREATE TABLE products_search_tags (id varchar PRIMARY KEY);
    CREATE TABLE store_settings (id serial PRIMARY KEY, baseline_marker boolean DEFAULT true);
    CREATE TABLE payload_locked_documents_rels (id serial PRIMARY KEY);
  `)

  await up({ db } as unknown as Parameters<typeof up>[0])
  await up({ db } as unknown as Parameters<typeof up>[0])

  const schemaCheck = await db.execute(sql`
    SELECT
      to_regclass('public.catalog_taxonomies') IS NOT NULL AS has_taxonomies,
      to_regclass('public.catalog_views') IS NOT NULL AS has_views,
      to_regclass('public.navigation_menus') IS NOT NULL AS has_menus,
      to_regclass('public.navigation_items') IS NOT NULL AS has_items,
      to_regclass('public.category_distributions') IS NOT NULL AS has_distributions,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'navigation_mode'
      ) AS has_navigation_mode,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'products_search_tags' AND column_name = 'key'
      ) AS has_product_tag_key,
      EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'category_distributions_distribution_key_idx'
      ) AS has_distribution_unique_index
  `)
  const schema = schemaCheck.rows[0] as Record<string, boolean>
  assert.equal(Object.values(schema).every(Boolean), true)

  await down({ db } as unknown as Parameters<typeof down>[0])

  const rollbackCheck = await db.execute(sql`
    SELECT
      to_regclass('public.catalog_taxonomies') IS NULL AS removed_taxonomies,
      to_regclass('public.catalog_views') IS NULL AS removed_views,
      to_regclass('public.navigation_menus') IS NULL AS removed_menus,
      to_regclass('public.navigation_items') IS NULL AS removed_items,
      to_regclass('public.category_distributions') IS NULL AS removed_distributions,
      to_regclass('public.store_settings') IS NOT NULL AS kept_store_settings,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'store_settings' AND column_name = 'baseline_marker'
      ) AS kept_baseline_column
  `)
  const rollback = rollbackCheck.rows[0] as Record<string, boolean>
  assert.equal(Object.values(rollback).every(Boolean), true)

  console.log('navigation migration up/up/down: ok')
} finally {
  await db.$client.end()
}
