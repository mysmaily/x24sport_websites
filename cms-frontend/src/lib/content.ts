import {
  categories as previewCategories,
  categoryDesigns,
  products as previewProducts,
  type ProductPreview,
  type SportCategory,
} from './catalog'
import { getTenantSlug } from './tenant'

type ApiList<T> = { docs: T[]; totalDocs: number; totalPages: number; page: number }
export type CmsCategory = {
  id: number | string; name: string; slug: string; description?: string; order?: number
  legacyPath?: string; group?: 'sport' | 'type' | 'color'
  parent?: number | string | CmsCategory
  productCount?: number
  showInNavigation?: boolean
  status?: 'active' | 'hidden' | 'retired'
}
export type CmsMedia = { id?: number | string; url?: string; alt?: string; width?: number; height?: number }
type SearchTag = { value?: string }
export type CmsWebContent = {
  id: number | string; title: string; slug: string; kind: 'page' | 'post'; legacyPath: string
  contentHtml?: string; excerpt?: string; sourceModifiedAt?: string; updatedAt?: string
}
export type CmsProduct = {
  id: number | string; name: string; slug: string; sku?: string
  sport: 'football' | 'badminton' | 'volleyball' | 'basketball' | 'pickleball' | 'running' | 'other'
  productType?: string; price?: number | null; compareAtPrice?: number | null
  regularPrice?: number | null; salePrice?: number | null; currency?: string
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder'; isPurchasable?: boolean
  shortDescription?: string; contentHtml?: string; legacyPath?: string
  seoTitle?: string; metaDescription?: string
  sourceModifiedAt?: string
  categories?: Array<number | string | CmsCategory>
  gallery?: Array<number | string | (CmsMedia & { searchTags?: SearchTag[] })>
  searchTags?: SearchTag[]
  legacyImages?: Array<{ url: string; alt?: string; width?: number; height?: number }>
}
export type StoreSettings = {
  id: number | string
  telegramChatId?: string | null
}
export type CatalogPage = { products: ProductPreview[]; totalDocs: number; totalPages: number; page: number }
export type ContentPage = { docs: CmsWebContent[]; totalDocs: number; totalPages: number; page: number }
export type CategoryNavigationItem = SportCategory & { children: SportCategory[] }

const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
const usePreviewFallback = process.env.SITE_ENV === 'preview'
const categoryDesign = Object.fromEntries(categoryDesigns.map((item) => [item.slug, item]))
const sportToSlug: Partial<Record<CmsProduct['sport'], string>> = {
  football: 'bong-da', badminton: 'cau-long', volleyball: 'bong-chuyen',
  basketball: 'bong-ro', pickleball: 'pickleball', running: 'chay-bo',
}
const SEARCH_FIELDS = [
  'name',
  'gallery.searchTags.value',
  'searchTags.value',
] as const
const STOP_SEARCH_TOKENS = new Set(['ao', 'áo', 'mau', 'màu', 'bo', 'bộ', 'dong', 'đồng', 'phuc', 'phục'])
const SEARCH_SYNONYMS: Record<string, string[]> = {
  'bi a': ['bi-a', 'billiard', 'billiards'],
  'bi-a': ['bi a', 'billiard', 'billiards'],
  billiard: ['bi-a', 'bi a', 'billiards'],
  billiards: ['bi-a', 'bi a', 'billiard'],
  'mau do': ['màu đỏ', 'đỏ'],
  do: ['đỏ'],
  den: ['đen'],
  trang: ['trắng'],
  vang: ['vàng'],
  hong: ['hồng'],
  tim: ['tím'],
  xam: ['xám'],
  nau: ['nâu'],
}

async function fetchList<T>(collection: string, params: URLSearchParams): Promise<ApiList<T>> {
  const response = await fetch(`${apiUrl}/api/${collection}?${params.toString()}`, { next: { revalidate: 60 } })
  if (!response.ok) throw new Error(`Payload ${collection} returned ${response.status}`)
  return response.json() as Promise<ApiList<T>>
}

async function fetchAllDocs<T>(collection: string, params: URLSearchParams): Promise<T[]> {
  const docs: T[] = []
  let page = 1
  let totalPages = 1
  do {
    params.set('page', String(page))
    const result = await fetchList<T>(collection, params)
    docs.push(...(result.docs || []))
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

function uniqueSearchTerms(values: string[]) {
  const seen = new Set<string>()
  return values
    .map((value) => value.trim().replace(/\s+/g, ' '))
    .filter((value) => {
      const key = value.toLocaleLowerCase('vi')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function buildProductSearchTerms(query: string) {
  const normalized = query.trim().replace(/\s+/g, ' ')
  if (!normalized) return []

  const lower = normalized.toLocaleLowerCase('vi')
  const hyphenated = lower.includes(' ') ? lower.replace(/\s+/g, '-') : ''
  const spaced = lower.includes('-') ? lower.replace(/-/g, ' ') : ''
  const tokens = lower
    .split(/[\s-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_SEARCH_TOKENS.has(token))
  const pairs = tokens.slice(0, -1).map((token, index) => `${token} ${tokens[index + 1]}`)
  const terms = uniqueSearchTerms([normalized, lower, hyphenated, spaced, ...pairs, ...tokens])

  return uniqueSearchTerms([
    ...terms,
    ...terms.flatMap((term) => SEARCH_SYNONYMS[term.toLocaleLowerCase('vi')] || []),
  ]).slice(0, 10)
}

function applyProductSearchParams(params: URLSearchParams, query: string) {
  const terms = buildProductSearchTerms(query)
  terms.forEach((term, termIndex) => {
    SEARCH_FIELDS.forEach((field, fieldIndex) => {
      params.set(`where[or][${termIndex * SEARCH_FIELDS.length + fieldIndex}][${field}][contains]`, term)
    })
  })
}

function mapCategory(category: CmsCategory, index: number): SportCategory {
  const design = categoryDesign[category.slug]
  return {
    slug: category.slug, index: String(index + 1).padStart(2, '0'), name: category.name,
    eyebrow: design?.eyebrow || 'Trang phục thể thao',
    description: category.description || design?.description || '',
    tone: design?.tone || '#ed642d', image: design?.image || '/images/football.jpg',
    promoImage: design?.promoImage,
    parentSlug: design?.parentSlug,
    legacyPath: category.legacyPath,
  }
}

const relationCategory = (value: number | string | CmsCategory) => typeof value === 'object' ? value : undefined
const relationMedia = (value: number | string | CmsMedia) => typeof value === 'object' ? value : undefined

export function productImages(product: CmsProduct) {
  const uploaded = (product.gallery || []).map(relationMedia).filter((item): item is CmsMedia => Boolean(item?.url))
  if (uploaded.length) return uploaded.map((item) => ({
    url: item.url!, alt: item.alt || product.name, width: item.width, height: item.height,
  }))
  return (product.legacyImages || []).filter((item) => Boolean(item.url))
}

export function prepareContentHtml(contentHtml?: string | null) {
  return contentHtml
    ?.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"')
    .replace(/src="(https:\/\/cdn\.x24sport\.vn\/[^\"]+)"/gi, (_match, url: string) => {
      const encoded = encodeURIComponent(url)
      return `src="${url}" srcset="/_next/image/?url=${encoded}&amp;w=384&amp;q=75 384w, /_next/image/?url=${encoded}&amp;w=750&amp;q=75 750w" sizes="(max-width: 800px) 100vw, 750px"`
    })
}

function mapProduct(product: CmsProduct, categories: SportCategory[]): ProductPreview {
  const related = (product.categories || []).map(relationCategory).filter((item): item is CmsCategory => Boolean(item))
  const primarySlug = sportToSlug[product.sport] || related[0]?.slug || 'san-pham'
  const category = categories.find((item) => item.slug === primarySlug)
  return {
    id: product.id, sku: product.sku, slug: product.slug, name: product.name,
    category: category?.name || related[0]?.name || 'X24Sport', categorySlug: primarySlug,
    categorySlugs: related.map((item) => item.slug),
    type: product.shortDescription || 'Trang phục thể thao',
    image: productImages(product)[0]?.url || categoryDesign[primarySlug]?.image || '/images/football.jpg',
    price: product.price, compareAtPrice: product.compareAtPrice,
    currency: product.currency || 'VND', stockStatus: product.stockStatus,
  }
}

export async function getCategories(): Promise<SportCategory[]> {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug, 'where[group][equals]': 'sport',
      depth: '0', limit: '100', sort: 'order',
    })
    const docs = await fetchAllDocs<CmsCategory>('product-categories', params)
    const topLevel = docs.filter((item) => !item.parent)
    if (tenantSlug === 'x24sport') {
      const designed = topLevel.filter((item) => Boolean(categoryDesign[item.slug]))
      if (designed.length) return designed.map(mapCategory)
    }
    if (topLevel.length) return topLevel.map(mapCategory)
  } catch (error) { console.error('Unable to load X24Sport categories.', error) }
  return usePreviewFallback && tenantSlug === 'x24sport' ? previewCategories : []
}

function categoryParentId(category: CmsCategory) {
  if (!category.parent) return undefined
  return typeof category.parent === 'object' ? category.parent.id : category.parent
}

export async function getCategoryNavigation(): Promise<CategoryNavigationItem[]> {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      depth: '1', limit: '300', sort: 'order',
    })
    const docs = await fetchAllDocs<CmsCategory>('product-categories', params)
    const isVisible = (item: CmsCategory) => item.status !== 'hidden' && item.status !== 'retired' && item.showInNavigation !== false
    const topLevel = docs.filter((item) => isVisible(item) && item.group === 'sport' && !item.parent)
    const childrenByParent = new Map<number | string, CmsCategory[]>()

    docs.filter(isVisible).forEach((item) => {
      const parentId = categoryParentId(item)
      if (!parentId) return
      const items = childrenByParent.get(parentId) || []
      items.push(item)
      childrenByParent.set(parentId, items)
    })

    return topLevel.map((category, index) => ({
      ...mapCategory(category, index),
      children: (childrenByParent.get(category.id) || []).map((child, childIndex) => mapCategory(child, childIndex)),
    }))
  } catch (error) { console.error('Unable to load X24Sport category navigation.', error) }
  return (await getCategories()).map((category) => ({ ...category, children: [] }))
}

export async function getSitemapCategories(): Promise<SportCategory[]> {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      depth: '0', limit: '100', sort: 'order',
    })
    if (tenantSlug !== 'pndsport' && tenantSlug !== 'dongphucx24') {
      params.set('where[group][equals]', 'sport')
    }
    const docs = await fetchAllDocs<CmsCategory>('product-categories', params)
    if (tenantSlug === 'x24sport') {
      const docsBySlug = Object.fromEntries(docs.map((item) => [item.slug, item]))
      return categoryDesigns.map((category, index) => docsBySlug[category.slug] ? mapCategory(docsBySlug[category.slug], index) : category)
    }
    if (tenantSlug === 'pndsport' || tenantSlug === 'dongphucx24') {
      return docs
        .filter((item) => item.status !== 'hidden' && item.status !== 'retired' && item.showInNavigation !== false)
        .filter((item) => tenantSlug !== 'dongphucx24' || Number(item.productCount || 0) > 0)
        .map(mapCategory)
    }
    return docs.filter((item) => !item.parent).map(mapCategory)
  } catch (error) { console.error('Unable to load X24Sport sitemap categories.', error) }
  return tenantSlug === 'x24sport' ? categoryDesigns : []
}

export async function getProductsPage(options: {
  page?: number; limit?: number; categorySlug?: string; categorySlugs?: string[]
  excludeCategorySlugs?: string[]; query?: string; sort?: string
} = {}): Promise<CatalogPage> {
  const tenantSlug = await getTenantSlug()
  const categories = await getCategories()
  const page = Math.max(1, options.page || 1)
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      'where[publicationStatus][equals]': 'publish',
      page: String(page), limit: String(options.limit || 20), depth: '2',
      sort: options.sort || '-createdAt',
    })
    const categorySlugs = options.categorySlugs?.filter(Boolean)
    if (categorySlugs?.length) params.set('where[categories.slug][in]', categorySlugs.join(','))
    else if (options.categorySlug) params.set('where[categories.slug][equals]', options.categorySlug)
    const excludeCategorySlugs = options.excludeCategorySlugs?.filter(Boolean)
    if (excludeCategorySlugs?.length) {
      const excludedParams = new URLSearchParams({
        'where[tenant.slug][equals]': tenantSlug,
        'where[publicationStatus][equals]': 'publish',
        'where[categories.slug][in]': excludeCategorySlugs.join(','),
        depth: '0',
        limit: '500',
      })
      const excludedProducts = await fetchAllDocs<Pick<CmsProduct, 'id'>>('products', excludedParams)
      if (excludedProducts.length) {
        params.set('where[id][not_in]', excludedProducts.map((product) => product.id).join(','))
      }
    }
    if (options.query?.trim()) {
      applyProductSearchParams(params, options.query)
    }
    const result = await fetchList<CmsProduct>('products', params)
    return {
      products: result.docs.map((product) => mapProduct(product, categories)),
      totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page,
    }
  } catch (error) {
    console.error('Unable to load X24Sport products.', error)
    const fallback = usePreviewFallback && tenantSlug === 'x24sport'
      ? previewProducts.filter((product) => !options.categorySlug || product.categorySlug === options.categorySlug || product.categorySlugs?.includes(options.categorySlug))
      : []
    return { products: fallback, totalDocs: fallback.length, totalPages: 1, page: 1 }
  }
}

export async function getProducts(categories?: SportCategory[]): Promise<ProductPreview[]> {
  const tenantSlug = await getTenantSlug()
  const resolved = categories || await getCategories()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug, 'where[publicationStatus][equals]': 'publish',
      depth: '2', limit: '100', sort: '-createdAt',
    })
    return (await fetchAllDocs<CmsProduct>('products', params)).map((product) => mapProduct(product, resolved))
  } catch (error) {
    console.error('Unable to load X24Sport products.', error)
    return usePreviewFallback && tenantSlug === 'x24sport' ? previewProducts : []
  }
}

export async function getProductBySlug(slug: string): Promise<CmsProduct | undefined> {
  const tenantSlug = await getTenantSlug()
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug, 'where[slug][equals]': slug,
    'where[publicationStatus][equals]': 'publish', limit: '1', depth: '2',
  })
  return (await fetchList<CmsProduct>('products', params)).docs[0]
}

export async function hasProductInterestForm() {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      limit: '1',
      depth: '0',
    })
    const settings = (await fetchList<StoreSettings>('store-settings', params)).docs[0]
    return Boolean(settings?.telegramChatId?.trim())
  } catch (error) {
    console.error(`Unable to load ${tenantSlug} product interest settings.`, error)
    return false
  }
}

export async function getCategoryByLegacyPath(path: string): Promise<CmsCategory | undefined> {
  const tenantSlug = await getTenantSlug()
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug, 'where[legacyPath][equals]': path,
    limit: '1', depth: '1',
  })
  return (await fetchList<CmsCategory>('product-categories', params)).docs[0]
}

export async function getWebContentByLegacyPath(path: string): Promise<CmsWebContent | undefined> {
  const tenantSlug = await getTenantSlug()
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug, 'where[legacyPath][equals]': path,
    'where[publicationStatus][equals]': 'publish', limit: '1', depth: '0',
  })
  return (await fetchList<CmsWebContent>('web-content', params)).docs[0]
}

export async function getWebContentBySlug(slug: string): Promise<CmsWebContent | undefined> {
  const tenantSlug = await getTenantSlug()
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug,
    'where[slug][equals]': slug,
    'where[publicationStatus][equals]': 'publish',
    limit: '1',
    depth: '0',
  })
  return (await fetchList<CmsWebContent>('web-content', params)).docs[0]
}

export async function getPostsPage(page = 1, limit = 12): Promise<ContentPage> {
  const tenantSlug = await getTenantSlug()
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug, 'where[kind][equals]': 'post',
    'where[publicationStatus][equals]': 'publish', page: String(Math.max(1, page)),
    limit: String(limit), depth: '0', sort: '-sourceModifiedAt',
  })
  const result = await fetchList<CmsWebContent>('web-content', params)
  return { docs: result.docs, totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page }
}

export async function getAllWebContentPaths() {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug, 'where[publicationStatus][equals]': 'publish',
      depth: '0', limit: '100',
    })
    return await fetchAllDocs<Pick<CmsWebContent, 'legacyPath' | 'sourceModifiedAt'>>('web-content', params)
  } catch (error) {
    console.error(`Unable to load ${tenantSlug} content paths.`, error)
    return []
  }
}

export async function getRelatedProducts(product: CmsProduct): Promise<ProductPreview[]> {
  const category = (product.categories || []).map(relationCategory).find(Boolean)
  const result = await getProductsPage({ categorySlug: category?.slug, limit: 5 })
  return result.products.filter((item) => item.slug !== product.slug).slice(0, 4)
}

export async function getCatalogData() {
  const categories = await getCategories()
  const shelves = await Promise.all(categories.map(async (category) => ({
    category,
    products: (await getProductsPage({ categorySlug: category.slug, limit: 8 })).products,
  })))
  return { categories, shelves }
}
export async function getCategory(slug: string) {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug, 'where[slug][equals]': slug,
      limit: '1', depth: '0',
    })
    const doc = (await fetchList<CmsCategory>('product-categories', params)).docs[0]
    if (doc) return mapCategory(doc, categoryDesigns.findIndex((item) => item.slug === slug))
  } catch (error) { console.error(`Unable to load X24Sport category ${slug}.`, error) }
  return tenantSlug === 'x24sport' ? categoryDesigns.find((category) => category.slug === slug) : undefined
}
export async function getAllProductPaths() {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug, 'where[publicationStatus][equals]': 'publish',
      'where[stockStatus][not_equals]': 'outofstock',
      depth: '0', limit: '100',
    })
    return await fetchAllDocs<Pick<CmsProduct, 'slug' | 'legacyPath' | 'sourceModifiedAt'>>('products', params)
  } catch (error) {
    console.error(`Unable to load ${tenantSlug} product paths.`, error)
    return []
  }
}
