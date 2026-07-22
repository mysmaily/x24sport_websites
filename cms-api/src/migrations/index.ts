import * as migration_20260716_051147_mayaobongro_tenant_content from './20260716_051147_mayaobongro_tenant_content';
import * as migration_20260716_172821_x24_catalog_fields from './20260716_172821_x24_catalog_fields';
import * as migration_20260717_001500_product_categories_tenant_identity from './20260717_001500_product_categories_tenant_identity';
import * as migration_20260717_173000_users_api_keys from './20260717_173000_users_api_keys';
import * as migration_20260717_173500_fix_users_api_key_column from './20260717_173500_fix_users_api_key_column';
import * as migration_20260719_152500_product_categories_tag_group from './20260719_152500_product_categories_tag_group';
import * as migration_20260719_230000_tenant_pinterest_connections from './20260719_230000_tenant_pinterest_connections';
import * as migration_20260720_010000_pinterest_product_state from './20260720_010000_pinterest_product_state';
import * as migration_20260720_090000_store_settings_ga4 from './20260720_090000_store_settings_ga4';
import * as migration_20260720_120000_media_shared_tenants from './20260720_120000_media_shared_tenants';
import * as migration_20260722_120000_product_views from './20260722_120000_product_views';
import * as migration_20260722_150000_product_view_count from './20260722_150000_product_view_count';
import * as migration_20260722_180000_store_settings_meta_pixel from './20260722_180000_store_settings_meta_pixel';

export const migrations = [
  {
    up: migration_20260716_051147_mayaobongro_tenant_content.up,
    down: migration_20260716_051147_mayaobongro_tenant_content.down,
    name: '20260716_051147_mayaobongro_tenant_content',
  },
  {
    up: migration_20260716_172821_x24_catalog_fields.up,
    down: migration_20260716_172821_x24_catalog_fields.down,
    name: '20260716_172821_x24_catalog_fields',
  },
  {
    up: migration_20260717_001500_product_categories_tenant_identity.up,
    down: migration_20260717_001500_product_categories_tenant_identity.down,
    name: '20260717_001500_product_categories_tenant_identity'
  },
  {
    up: migration_20260717_173000_users_api_keys.up,
    down: migration_20260717_173000_users_api_keys.down,
    name: '20260717_173000_users_api_keys'
  },
  {
    up: migration_20260717_173500_fix_users_api_key_column.up,
    down: migration_20260717_173500_fix_users_api_key_column.down,
    name: '20260717_173500_fix_users_api_key_column'
  },
  {
    up: migration_20260719_152500_product_categories_tag_group.up,
    down: migration_20260719_152500_product_categories_tag_group.down,
    name: '20260719_152500_product_categories_tag_group'
  },
  {
    up: migration_20260719_230000_tenant_pinterest_connections.up,
    down: migration_20260719_230000_tenant_pinterest_connections.down,
    name: '20260719_230000_tenant_pinterest_connections'
  },
  {
    up: migration_20260720_010000_pinterest_product_state.up,
    down: migration_20260720_010000_pinterest_product_state.down,
    name: '20260720_010000_pinterest_product_state'
  },
  {
    up: migration_20260720_090000_store_settings_ga4.up,
    down: migration_20260720_090000_store_settings_ga4.down,
    name: '20260720_090000_store_settings_ga4'
  },
  {
    up: migration_20260720_120000_media_shared_tenants.up,
    down: migration_20260720_120000_media_shared_tenants.down,
    name: '20260720_120000_media_shared_tenants'
  },
  {
    up: migration_20260722_120000_product_views.up,
    down: migration_20260722_120000_product_views.down,
    name: '20260722_120000_product_views'
  },
  {
    up: migration_20260722_150000_product_view_count.up,
    down: migration_20260722_150000_product_view_count.down,
    name: '20260722_150000_product_view_count'
  },
  {
    up: migration_20260722_180000_store_settings_meta_pixel.up,
    down: migration_20260722_180000_store_settings_meta_pixel.down,
    name: '20260722_180000_store_settings_meta_pixel'
  },
];
