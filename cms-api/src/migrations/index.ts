import * as migration_20260716_051147_mayaobongro_tenant_content from './20260716_051147_mayaobongro_tenant_content';
import * as migration_20260716_172821_x24_catalog_fields from './20260716_172821_x24_catalog_fields';
import * as migration_20260717_001500_product_categories_tenant_identity from './20260717_001500_product_categories_tenant_identity';
import * as migration_20260717_173000_users_api_keys from './20260717_173000_users_api_keys';
import * as migration_20260717_173500_fix_users_api_key_column from './20260717_173500_fix_users_api_key_column';
import * as migration_20260719_152500_product_categories_tag_group from './20260719_152500_product_categories_tag_group';

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
];
