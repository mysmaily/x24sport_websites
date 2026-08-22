import assert from 'node:assert/strict'

import {
  adminsOnly,
  distributionRead,
  publishedOrAuthenticatedRead,
  superAdminsOnly,
} from '../src/access/roles'
import { CatalogTaxonomies } from '../src/collections/CatalogTaxonomies'
import { CatalogViews } from '../src/collections/CatalogViews'
import { CategoryDistributions } from '../src/collections/CategoryDistributions'
import { NavigationItems } from '../src/collections/NavigationItems'
import { NavigationMenus } from '../src/collections/NavigationMenus'
import { buildCatalogViewProductWhere } from '../src/util/catalogViewQuery'
import {
  buildTenantCompositeIdentity,
  isAllowedNavigationURL,
  isInternalCatalogPath,
  isStableKey,
} from '../src/util/navigationIdentity'

assert.deepEqual(
  [CatalogTaxonomies, CatalogViews, NavigationMenus, NavigationItems, CategoryDistributions].map(
    (collection) => collection.slug,
  ),
  [
    'catalog-taxonomies',
    'catalog-views',
    'navigation-menus',
    'navigation-items',
    'category-distributions',
  ],
)

assert.equal(CatalogViews.versions && typeof CatalogViews.versions === 'object' && CatalogViews.versions.drafts, true)
assert.equal(NavigationMenus.versions && typeof NavigationMenus.versions === 'object' && NavigationMenus.versions.drafts, true)
assert.equal(NavigationItems.versions && typeof NavigationItems.versions === 'object' && NavigationItems.versions.drafts, true)

assert.equal(isStableKey('color.red'), true)
assert.equal(isStableKey('Màu đỏ'), false)
assert.equal(isInternalCatalogPath('/ao-bong-da-mau-do/'), true)
assert.equal(isInternalCatalogPath('https://example.com/ao-do/'), false)
assert.equal(isAllowedNavigationURL('/lien-he/'), true)
assert.equal(isAllowedNavigationURL('https://x24sport.vn/'), true)
assert.equal(isAllowedNavigationURL('javascript:alert(1)'), false)
assert.equal(isAllowedNavigationURL('//evil.example/path'), false)

assert.deepEqual(
  buildTenantCompositeIdentity({
    data: { tenant: 12, key: 'primary', location: 'header' },
    outputField: 'tenantMenuKey',
    parts: ['key', 'location'],
  }),
  { tenantMenuKey: '12:primary:header' },
)

const exactAllQuery = buildCatalogViewProductWhere({
  filters: {
    categoryKeys: [{ key: 'category.jersey' }],
    colorKeys: [{ key: 'color.red' }],
    sportKey: 'sport.football',
  },
  matchMode: 'all',
})
assert.deepEqual(exactAllQuery, {
  and: [
    { 'categories.taxonomy.key': { equals: 'category.jersey' } },
    { 'searchTags.key': { equals: 'color.red' } },
    { 'searchTags.key': { equals: 'sport.football' } },
  ],
})
assert.equal(JSON.stringify(exactAllQuery).includes('contains'), false)

const exactAnyQuery = buildCatalogViewProductWhere({
  filters: { searchTagKeys: [{ key: 'color.red' }, { key: 'color.blue' }] },
  matchMode: 'any',
})
assert.deepEqual(exactAnyQuery, {
  or: [{ 'searchTags.key': { in: ['color.red', 'color.blue'] } }],
})

assert.equal(
  await adminsOnly({ req: { user: { role: 'tenant_admin', tenants: [{ tenant: 7 }] } } } as never),
  true,
)
assert.equal(await adminsOnly({ req: { user: { role: 'editor', tenants: [{ tenant: 7 }] } } } as never), false)
assert.equal(await superAdminsOnly({ req: { user: { role: 'tenant_admin' } } } as never), false)
assert.deepEqual(await distributionRead({ req: { user: { role: 'tenant_admin', tenants: [{ tenant: 7 }] } } } as never), {
  or: [{ sourceTenant: { in: [7] } }, { targetTenant: { in: [7] } }],
})
assert.deepEqual(await publishedOrAuthenticatedRead({ req: { user: null } } as never), {
  _status: { equals: 'published' },
})
assert.equal(
  await publishedOrAuthenticatedRead({ req: { user: { role: 'tenant_admin', tenants: [{ tenant: 7 }] } } } as never),
  true,
)

console.log('navigation schema contract: ok')
