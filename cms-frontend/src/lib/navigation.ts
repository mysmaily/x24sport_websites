import { createHash } from 'node:crypto'

import { getTenantSlug } from './tenant'

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

type ApiList<T> = { docs?: T[]; totalDocs?: number }
type Relation<T> = number | string | T | null | undefined
type TenantRelation = { id?: number | string; slug?: string }

type CategoryTarget = {
  id?: number | string
  legacyPath?: string | null
  name?: string | null
  navigationLabel?: string | null
  slug?: string | null
  tenant?: Relation<TenantRelation>
}

type CatalogViewTarget = {
  id?: number | string
  path?: string | null
  title?: string | null
  tenant?: Relation<TenantRelation>
}

type PageTarget = {
  id?: number | string
  slug?: string | null
  title?: string | null
  tenant?: Relation<TenantRelation>
}

type NavigationMenuDocument = {
  _status?: 'draft' | 'published'
  id: number | string
  key?: string | null
  location?: string | null
  manifestHash?: string | null
  revision?: number | null
  status?: 'draft' | 'ready' | 'published' | 'archived'
  tenant?: Relation<TenantRelation>
}

type NavigationItemDocument = {
  _status?: 'draft' | 'published'
  catalogViewQuery?: {
    indexPolicy?: 'indexable' | 'noindex' | null
    limit?: number | null
    sort?: 'title_asc' | 'updated_desc' | null
  } | null
  categoryQuery?: {
    group?: 'sport' | 'type' | 'collection' | 'audience' | 'color' | 'tag' | null
    limit?: number | null
    minimumProductCount?: number | null
    sort?: 'navigation_order' | 'name_asc' | 'year_desc' | 'product_count_desc' | null
  } | null
  childrenSource?: 'static' | 'category_query' | 'catalog_view_query'
  customUrl?: string | null
  description?: string | null
  enabled?: boolean | null
  featured?: boolean | null
  iconKey?: string | null
  id: number | string
  key?: string | null
  label?: string | null
  menu?: Relation<{ id?: number | string }>
  order?: number | null
  parent?: Relation<{ id?: number | string }>
  targetCatalogView?: Relation<CatalogViewTarget>
  targetCategory?: Relation<CategoryTarget>
  targetPage?: Relation<PageTarget>
  targetType?: NavigationNode['kind']
  tenant?: Relation<TenantRelation>
}

type CategoryQueryDocument = CategoryTarget & {
  group?: string | null
  navigationOrder?: number | null
  order?: number | null
  productCount?: number | null
  status?: string | null
}

type CatalogViewQueryDocument = CatalogViewTarget & {
  indexPolicy?: 'indexable' | 'noindex' | null
  key?: string | null
  updatedAt?: string | null
}

export type NavigationNode = {
  activePatterns: string[]
  children: NavigationNode[]
  description?: string
  featured?: boolean
  href?: string
  iconKey?: string
  key: string
  kind: 'category' | 'catalogView' | 'page' | 'customUrl' | 'group'
  label: string
}

export type NavigationState = {
  cmsManifestHash?: string
  cmsNodes: NavigationNode[]
  menuKey?: string
  mode: 'legacy' | 'cms'
  ready: boolean
  revision?: number
  tenantSlug: string
}

export type NavigationManifestEntry = {
  depth: number
  href: string
  key: string
  kind: NavigationNode['kind']
  label: string
  order: number
  parentKey: string
}

function relationID(value: unknown): number | string | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' || typeof id === 'string' ? id : undefined
  }
  return undefined
}

function relationSlug(value: unknown) {
  return value && typeof value === 'object' && 'slug' in value && typeof (value as TenantRelation).slug === 'string'
    ? (value as TenantRelation).slug
    : ''
}

function populated<T>(value: Relation<T>): T | undefined {
  return value && typeof value === 'object' ? value as T : undefined
}

function cleanText(value: unknown, maxLength = 500) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : ''
}

function safeHref(value: unknown) {
  const href = cleanText(value, 1000)
  if (!href) return ''
  if (href.startsWith('/') && !href.startsWith('//')) return href
  if (href.startsWith('#')) return href
  try {
    const url = new URL(href)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? href : ''
  } catch {
    return ''
  }
}

function withTrailingSlash(path: string) {
  if (!path.startsWith('/') || path.includes('?') || path.includes('#')) return path
  return path.endsWith('/') ? path : `${path}/`
}

function targetHref(item: NavigationItemDocument) {
  if (item.targetType === 'category') {
    const category = populated(item.targetCategory)
    const legacyPath = safeHref(category?.legacyPath)
    const slug = cleanText(category?.slug, 160)
    return legacyPath || (slug ? `/danh-muc/${slug}/` : '')
  }
  if (item.targetType === 'catalogView') return safeHref(populated(item.targetCatalogView)?.path)
  if (item.targetType === 'page') {
    const slug = cleanText(populated(item.targetPage)?.slug, 160)
    return slug ? withTrailingSlash(`/${slug}`) : ''
  }
  if (item.targetType === 'customUrl') return safeHref(item.customUrl)
  return ''
}

function targetBelongsToTenant(item: NavigationItemDocument, tenantSlug: string) {
  const target = item.targetType === 'category'
    ? populated(item.targetCategory)
    : item.targetType === 'catalogView'
      ? populated(item.targetCatalogView)
      : item.targetType === 'page'
        ? populated(item.targetPage)
        : undefined
  if (!target) return true
  const slug = relationSlug(target.tenant)
  return !slug || slug === tenantSlug
}

async function fetchList<T>(collection: string, params: URLSearchParams) {
  const response = await fetch(`${API_URL}/api/${collection}?${params.toString()}`, {
    next: { revalidate: 60, tags: ['tenant-navigation'] },
  })
  if (!response.ok) throw new Error(`${collection} returned ${response.status}`)
  return (await response.json()) as ApiList<T>
}

async function getNavigationMode(tenantSlug: string): Promise<'legacy' | 'cms'> {
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug,
    depth: '0',
    limit: '1',
  })
  const result = await fetchList<{ navigationMode?: unknown }>('store-settings', params)
  return result.docs?.[0]?.navigationMode === 'cms' ? 'cms' : 'legacy'
}

function categoryNode(category: CategoryQueryDocument): NavigationNode | null {
  const slug = cleanText(category.slug, 160)
  const href = safeHref(category.legacyPath) || (slug ? `/danh-muc/${slug}/` : '')
  const label = cleanText(category.navigationLabel || category.name, 160)
  if (!href || !label || !relationID(category.id)) return null
  return {
    activePatterns: [href],
    children: [],
    href,
    key: `category.${relationID(category.id)}`,
    kind: 'category',
    label,
  }
}

function catalogViewNode(view: CatalogViewQueryDocument): NavigationNode | null {
  const href = safeHref(view.path)
  const label = cleanText(view.title, 160)
  if (!href || !label || !relationID(view.id)) return null
  return {
    activePatterns: [href],
    children: [],
    href,
    key: cleanText(view.key, 160) || `catalog-view.${relationID(view.id)}`,
    kind: 'catalogView',
    label,
  }
}

async function dynamicChildren(item: NavigationItemDocument, tenantSlug: string) {
  if (item.childrenSource === 'category_query') {
    const query = item.categoryQuery || {}
    const minimumProductCount = Math.max(0, Number(query.minimumProductCount) || 0)
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      'where[status][equals]': 'active',
      'where[showInNavigation][equals]': 'true',
      'where[productCount][greater_than_equal]': String(minimumProductCount),
      depth: '1',
      limit: String(Math.min(100, Math.max(1, Number(query.limit) || 30))),
    })
    if (query.group) params.set('where[group][equals]', query.group)
    const result = await fetchList<CategoryQueryDocument>('product-categories', params)
    const categories = [...(result.docs || [])]
    const sort = query.sort || 'navigation_order'
    categories.sort((left, right) => {
      if (sort === 'name_asc') return cleanText(left.name).localeCompare(cleanText(right.name), 'vi')
      if (sort === 'product_count_desc') return Number(right.productCount || 0) - Number(left.productCount || 0)
      if (sort === 'year_desc') {
        const year = (value: unknown) => Number(cleanText(value).match(/20\d{2}/)?.[0] || 0)
        return year(right.slug) - year(left.slug)
      }
      return Number(left.navigationOrder ?? left.order ?? 0) - Number(right.navigationOrder ?? right.order ?? 0)
    })
    return categories.map(categoryNode).filter((node): node is NavigationNode => Boolean(node))
  }

  if (item.childrenSource === 'catalog_view_query') {
    const query = item.catalogViewQuery || {}
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      'where[enabled][equals]': 'true',
      depth: '1',
      limit: String(Math.min(100, Math.max(1, Number(query.limit) || 30))),
      sort: query.sort === 'updated_desc' ? '-updatedAt' : 'title',
    })
    if (query.indexPolicy) params.set('where[indexPolicy][equals]', query.indexPolicy)
    const result = await fetchList<CatalogViewQueryDocument>('catalog-views', params)
    return (result.docs || []).map(catalogViewNode).filter((node): node is NavigationNode => Boolean(node))
  }

  return []
}

function flattenManifest(nodes: NavigationNode[]) {
  const result: NavigationManifestEntry[] = []
  const walk = (items: NavigationNode[], depth: number, parentKey: string) => {
    items.forEach((item, order) => {
      result.push({
        depth,
        href: item.href || '',
        key: item.key,
        kind: item.kind,
        label: item.label,
        order,
        parentKey,
      })
      walk(item.children, depth + 1, item.key)
    })
  }
  walk(nodes, 0, '')
  return result
}

export function serializeNavigationManifest(nodes: NavigationNode[]) {
  return JSON.stringify(flattenManifest(nodes))
}

export function navigationManifestHash(nodes: NavigationNode[]) {
  return createHash('sha256').update(serializeNavigationManifest(nodes)).digest('hex')
}

export function diffNavigationManifests(legacy: NavigationNode[], cms: NavigationNode[]) {
  const left = flattenManifest(legacy)
  const right = flattenManifest(cms)
  const length = Math.max(left.length, right.length)
  const differences: Array<{ index: number; legacy?: NavigationManifestEntry; cms?: NavigationManifestEntry }> = []
  for (let index = 0; index < length; index += 1) {
    if (JSON.stringify(left[index]) !== JSON.stringify(right[index])) {
      differences.push({ index, legacy: left[index], cms: right[index] })
    }
  }
  return differences
}

export async function getTenantNavigationState(): Promise<NavigationState> {
  const tenantSlug = await getTenantSlug()
  try {
    const shadowTenants = new Set(
      process.env.SITE_ENV === 'preview'
        ? (process.env.NAVIGATION_SHADOW_TENANTS || '').split(',').map((item) => item.trim()).filter(Boolean)
        : [],
    )
    const shadowPreview = shadowTenants.has(tenantSlug)
    const mode = shadowPreview ? 'cms' : await getNavigationMode(tenantSlug)
    const lifecycleStatus = shadowPreview ? 'ready' : 'published'
    const menuParams = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      'where[location][equals]': 'header',
      'where[status][equals]': lifecycleStatus,
      depth: '1',
      limit: '2',
      sort: '-updatedAt',
    })
    const menus = await fetchList<NavigationMenuDocument>('navigation-menus', menuParams)
    const menu = menus.docs?.[0]
    if (!menu || menu.status !== lifecycleStatus || menu._status !== 'published' || menus.docs?.length !== 1) {
      return { cmsNodes: [], mode, ready: false, tenantSlug }
    }

    const itemParams = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      'where[menu][equals]': String(menu.id),
      'where[enabled][equals]': 'true',
      depth: '2',
      limit: '100',
      sort: 'order',
    })
    const itemResult = await fetchList<NavigationItemDocument>('navigation-items', itemParams)
    const menuTenantID = relationID(menu.tenant)
    const items = (itemResult.docs || []).filter((item) => {
      const sameMenu = String(relationID(item.menu)) === String(menu.id)
      const sameTenant = menuTenantID === undefined || String(relationID(item.tenant)) === String(menuTenantID)
      return sameMenu && sameTenant && item._status === 'published' && targetBelongsToTenant(item, tenantSlug)
    })
    const nodesByID = new Map<string, NavigationNode>()
    for (const item of items) {
      const key = cleanText(item.key, 180)
      const label = cleanText(item.label, 180)
      const kind = item.targetType || 'group'
      const href = targetHref(item)
      if (!key || !label || (kind !== 'group' && !href)) continue
      nodesByID.set(String(item.id), {
        activePatterns: href ? [href] : [],
        children: await dynamicChildren(item, tenantSlug),
        description: cleanText(item.description, 500) || undefined,
        featured: Boolean(item.featured),
        href: href || undefined,
        iconKey: cleanText(item.iconKey, 120) || undefined,
        key,
        kind,
        label,
      })
    }
    const roots: NavigationNode[] = []
    for (const item of items) {
      const node = nodesByID.get(String(item.id))
      if (!node) continue
      const parentID = relationID(item.parent)
      const parent = parentID === undefined ? undefined : nodesByID.get(String(parentID))
      if (parent) parent.children.push(node)
      else roots.push(node)
    }
    const calculatedHash = navigationManifestHash(roots)
    const recordedHash = cleanText(menu.manifestHash, 128)
    if (recordedHash && recordedHash !== calculatedHash) {
      console.error(`Navigation manifest hash mismatch for ${tenantSlug}.`)
      return { cmsNodes: roots, cmsManifestHash: calculatedHash, menuKey: cleanText(menu.key), mode, ready: false, revision: Number(menu.revision) || 1, tenantSlug }
    }
    return {
      cmsManifestHash: calculatedHash,
      cmsNodes: roots,
      menuKey: cleanText(menu.key),
      mode,
      ready: roots.length > 0,
      revision: Number(menu.revision) || 1,
      tenantSlug,
    }
  } catch (error) {
    console.error(`Unable to load CMS navigation for ${tenantSlug}.`, error)
    return { cmsNodes: [], mode: 'legacy', ready: false, tenantSlug }
  }
}
