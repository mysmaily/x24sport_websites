import { cache } from 'react'

const API_URL = process.env.PAYLOAD_API_URL || 'http://10.10.0.28:3001'
const TENANT_SLUG = process.env.TENANT_SLUG || 'mayaobongda'

export type MediaImage = {
  id?: number
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
  searchTags?: Array<{ value?: string | null }> | null
}

type RichTextNode = {
  text?: string
  type?: string
  html?: string
  children?: RichTextNode[]
}

export type ProductDescriptionBlock =
  | { type: 'html'; html: string }
  | { type: 'text'; text: string }

export type ProductCategory = {
  id: number
  name: string
  slug: string
  legacyPath?: string | null
  description?: string | null
  group?: 'sport' | 'type' | 'collection' | 'audience' | 'color' | 'tag' | null
  productCount?: number | null
}

export type Product = {
  id: number
  name: string
  slug: string
  viewCount?: number | null
  price?: number | null
  compareAtPrice?: number | null
  regularPrice?: number | null
  salePrice?: number | null
  sku?: string | null
  stockStatus?: string | null
  isPurchasable?: boolean | null
  legacyPath?: string | null
  shortDescription?: string | null
  description?: {
    root?: {
      children?: RichTextNode[]
    }
  } | null
  contentHtml?: string | null
  legacyImages?: MediaImage[] | null
  gallery?: Array<MediaImage | number> | null
  categories?: Array<ProductCategory | number> | null
  seoTitle?: string | null
  metaDescription?: string | null
  searchTags?: Array<{ value?: string | null }> | null
  sourceModifiedAt?: string | null
}

export type WebContent = {
  id: number
  title: string
  slug: string
  legacyPath: string
  kind: 'page' | 'post'
  contentHtml?: string | null
  excerpt?: string | null
  sourceModifiedAt?: string | null
}

export type StoreSettings = {
  id: number
  telegramChatId?: string | null
  analytics?: {
    ga4Enabled?: boolean | null
    gaMeasurementId?: string | null
    gaPropertyId?: string | null
    dailyTelegramReportEnabled?: boolean | null
  } | null
}

type Paginated<T> = {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
}

const STORE_REVALIDATE_SECONDS = 180

async function api<T>(path: string, revalidate = STORE_REVALIDATE_SECONDS): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`CMS request failed: ${response.status} ${path}`)
  return response.json() as Promise<T>
}

export const getTenant = cache(async () => {
  const params = new URLSearchParams({
    'where[slug][equals]': TENANT_SLUG,
    limit: '1',
    depth: '0',
  })
  const result = await api<Paginated<{ id: number; slug: string }>>(`/api/tenants?${params}`)
  if (result.docs.length !== 1) throw new Error(`Tenant ${TENANT_SLUG} was not found`)
  return result.docs[0]
})

export async function getAnalyticsSettings() {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[tenant][equals]': String(tenant.id),
    limit: '1',
    depth: '0',
  })
  const result = await api<Paginated<StoreSettings>>(`/api/store-settings?${params}`, 60)
  return result.docs[0]?.analytics ?? null
}

export async function hasProductInterestForm() {
  try {
    const tenant = await getTenant()
    const params = new URLSearchParams({
      'where[tenant][equals]': String(tenant.id),
      limit: '1',
      depth: '0',
    })
    const result = await api<Paginated<StoreSettings>>(`/api/store-settings?${params}`, 60)
    return Boolean(result.docs[0]?.telegramChatId?.trim())
  } catch {
    return false
  }
}

export async function getProducts({
  page = 1,
  limit = 24,
  search,
  categorySlug,
  sort,
}: {
  page?: number
  limit?: number
  search?: string
  categorySlug?: string
  sort?: 'latest' | 'popular'
} = {}) {
  const tenant = await getTenant()
  const category = categorySlug ? await getProductCategory(categorySlug) : null
  if (categorySlug && !category) {
    return { docs: [], totalDocs: 0, totalPages: 0, page, hasNextPage: false }
  }
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    'where[and][1][publicationStatus][equals]': 'publish',
    limit: String(limit),
    page: String(page),
    depth: '1',
    sort: sort === 'popular' ? '-viewCount' : '-sourceModifiedAt',
  })
  let index = 2
  if (category) params.set(`where[and][${index++}][categories][equals]`, String(category.id))
  if (search?.trim()) {
    const query = search.trim()
    params.set(`where[and][${index}][or][0][name][contains]`, query)
    params.set(`where[and][${index}][or][1][gallery.searchTags.value][contains]`, query)
    params.set(`where[and][${index}][or][2][searchTags.value][contains]`, query)
  }
  return api<Paginated<Product>>(`/api/products?${params}`)
}

export async function getCategories(group?: ProductCategory['group']) {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    limit: '100',
    depth: '0',
    sort: 'order',
  })
  if (group) params.set('where[and][1][group][equals]', group)
  return api<Paginated<ProductCategory>>(`/api/product-categories?${params}`)
}

export const getProductCategory = cache(async (slug: string) => {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    'where[and][1][slug][equals]': slug,
    limit: '1',
    depth: '0',
  })
  const result = await api<Paginated<ProductCategory>>(`/api/product-categories?${params}`)
  return result.docs[0] ?? null
})

export const resolveCategoryPath = cache(async (legacyPath: string) => {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    'where[and][1][legacyPath][equals]': legacyPath,
    limit: '1',
    depth: '0',
  })
  const result = await api<Paginated<ProductCategory>>(`/api/product-categories?${params}`)
  return result.docs[0] ?? null
})

export const resolveProductPath = cache(async (legacyPath: string) => {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    'where[and][1][legacyPath][equals]': legacyPath,
    'where[and][2][publicationStatus][equals]': 'publish',
    limit: '1',
    depth: '1',
  })
  const result = await api<Paginated<Product>>(`/api/products?${params}`)
  return result.docs[0] ?? null
})

export const resolveProductSlug = cache(async (slug: string) => {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    'where[and][1][slug][equals]': slug,
    'where[and][2][publicationStatus][equals]': 'publish',
    limit: '1',
    depth: '1',
  })
  const result = await api<Paginated<Product>>(`/api/products?${params}`)
  return result.docs[0] ?? null
})

export const resolveContentPath = cache(async (legacyPath: string) => {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    'where[and][1][legacyPath][equals]': legacyPath,
    'where[and][2][publicationStatus][equals]': 'publish',
    limit: '1',
    depth: '0',
  })
  const result = await api<Paginated<WebContent>>(`/api/web-content?${params}`)
  return result.docs[0] ?? null
})

export async function getLatestPosts(limit = 12, page = 1) {
  const tenant = await getTenant()
  const params = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenant.id),
    'where[and][1][kind][equals]': 'post',
    'where[and][2][publicationStatus][equals]': 'publish',
    limit: String(limit),
    page: String(page),
    depth: '0',
    sort: '-sourceModifiedAt',
  })
  return api<Paginated<WebContent>>(`/api/web-content?${params}`)
}

export function productImages(product: Product): MediaImage[] {
  const migrated = (product.gallery || []).filter(
    (item): item is MediaImage => typeof item === 'object' && Boolean(item?.url),
  )
  return migrated.length
    ? migrated
    : (product.legacyImages || []).filter((item) => Boolean(item.url))
}

function flattenRichText(node?: RichTextNode): string[] {
  if (!node) return []
  if (node.text?.trim()) return [node.text.trim()]
  return (node.children || []).flatMap(flattenRichText)
}

export function getProductDescriptionBlocks(product: Product): ProductDescriptionBlock[] {
  const rootChildren = product.description?.root?.children || []

  return rootChildren
    .map((child) => {
      if (child.type === 'html' && child.html?.trim()) {
        return { type: 'html', html: child.html.trim() } satisfies ProductDescriptionBlock
      }

      const text = flattenRichText(child).join(' ').trim()
      return text ? ({ type: 'text', text } satisfies ProductDescriptionBlock) : null
    })
    .filter((block): block is ProductDescriptionBlock => Boolean(block))
}

export async function getAllCanonicalRoutes() {
  const tenant = await getTenant()
  const load = async <T>(collection: 'products' | 'web-content' | 'product-categories') => {
    const records: T[] = []
    let page = 1
    while (true) {
      const params = new URLSearchParams({
        'where[tenant][equals]': String(tenant.id),
        limit: '100',
        page: String(page),
        depth: '0',
      })
      if (collection !== 'product-categories') {
        params.set('where[publicationStatus][equals]', 'publish')
      }
      const result = await api<Paginated<T>>(`/api/${collection}?${params}`)
      records.push(...result.docs)
      if (!result.hasNextPage) return records
      page += 1
    }
  }
  const [products, content, categories] = await Promise.all([
    load<Product>('products'),
    load<WebContent>('web-content'),
    load<ProductCategory>('product-categories'),
  ])
  return { products, content, categories }
}

export function productPath(product: Pick<Product, 'slug'>) {
  return `/san-pham/${product.slug}/`
}
