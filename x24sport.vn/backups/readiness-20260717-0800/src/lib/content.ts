import { categories as previewCategories, products as previewProducts, type ProductPreview, type SportCategory } from './catalog'

type ApiList<T> = { docs: T[]; totalDocs: number; totalPages: number; page: number }
export type CmsCategory = {
  id: number | string; name: string; slug: string; description?: string; order?: number
  legacyPath?: string; group?: 'sport' | 'type' | 'color'
  parent?: number | string | CmsCategory
}
export type CmsMedia = { id?: number | string; url?: string; alt?: string; width?: number; height?: number }
export type CmsProduct = {
  id: number | string; name: string; slug: string; sku?: string
  sport: 'football' | 'badminton' | 'volleyball' | 'basketball' | 'pickleball' | 'running' | 'other'
  productType?: string; price?: number | null; compareAtPrice?: number | null
  regularPrice?: number | null; salePrice?: number | null; currency?: string
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder'; isPurchasable?: boolean
  shortDescription?: string; contentHtml?: string; legacyPath?: string
  seoTitle?: string; metaDescription?: string
  categories?: Array<number | string | CmsCategory>
  gallery?: Array<number | string | CmsMedia>
  legacyImages?: Array<{ url: string; alt?: string; width?: number; height?: number }>
}
export type CatalogPage = { products: ProductPreview[]; totalDocs: number; totalPages: number; page: number }

const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
const tenantSlug = process.env.TENANT_SLUG || 'x24sport'
const usePreviewFallback = process.env.SITE_ENV === 'preview'
const categoryDesign = Object.fromEntries(previewCategories.map((item) => [item.slug, item]))
const sportToSlug: Partial<Record<CmsProduct['sport'], string>> = {
  football: 'bong-da', badminton: 'cau-long', volleyball: 'bong-chuyen',
  basketball: 'bong-ro', pickleball: 'pickleball', running: 'chay-bo',
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

function mapCategory(category: CmsCategory, index: number): SportCategory {
  const design = categoryDesign[category.slug]
  return {
    slug: category.slug, index: String(index + 1).padStart(2, '0'), name: category.name,
    eyebrow: design?.eyebrow || 'Trang phục thể thao',
    description: category.description || design?.description || '',
    tone: design?.tone || '#ed642d', image: design?.image || '/images/football.jpg',
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

function mapProduct(product: CmsProduct, categories: SportCategory[]): ProductPreview {
  const related = (product.categories || []).map(relationCategory).filter((item): item is CmsCategory => Boolean(item))
  const primarySlug = sportToSlug[product.sport] || related[0]?.slug || 'san-pham'
  const category = categories.find((item) => item.slug === primarySlug)
  return {
    id: product.id, slug: product.slug, name: product.name,
    category: category?.name || related[0]?.name || 'X24Sport', categorySlug: primarySlug,
    categorySlugs: related.map((item) => item.slug),
    type: product.shortDescription || 'Trang phục thể thao',
    image: productImages(product)[0]?.url || categoryDesign[primarySlug]?.image || '/images/football.jpg',
    price: product.price, compareAtPrice: product.compareAtPrice,
    currency: product.currency || 'VND', stockStatus: product.stockStatus,
  }
}

export async function getCategories(): Promise<SportCategory[]> {
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug, 'where[group][equals]': 'sport',
      depth: '0', limit: '100', sort: 'order',
    })
    const docs = await fetchAllDocs<CmsCategory>('product-categories', params)
    const designed = docs.filter((item) => Boolean(categoryDesign[item.slug]))
    if (designed.length) return designed.map(mapCategory)
  } catch (error) { console.error('Unable to load X24Sport categories.', error) }
  return usePreviewFallback ? previewCategories : []
}

export async function getProductsPage(options: {
  page?: number; limit?: number; categorySlug?: string; query?: string; sort?: string
} = {}): Promise<CatalogPage> {
  const categories = await getCategories()
  const page = Math.max(1, options.page || 1)
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      'where[publicationStatus][equals]': 'publish',
      page: String(page), limit: String(options.limit || 20), depth: '2',
      sort: options.sort || '-createdAt',
    })
    if (options.categorySlug) params.set('where[categories.slug][equals]', options.categorySlug)
    if (options.query) params.set('where[name][like]', options.query)
    const result = await fetchList<CmsProduct>('products', params)
    return {
      products: result.docs.map((product) => mapProduct(product, categories)),
      totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page,
    }
  } catch (error) {
    console.error('Unable to load X24Sport products.', error)
    const fallback = usePreviewFallback ? previewProducts : []
    return { products: fallback, totalDocs: fallback.length, totalPages: 1, page: 1 }
  }
}

export async function getProducts(categories?: SportCategory[]): Promise<ProductPreview[]> {
  const resolved = categories || await getCategories()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug, 'where[publicationStatus][equals]': 'publish',
      depth: '2', limit: '100', sort: '-createdAt',
    })
    return (await fetchAllDocs<CmsProduct>('products', params)).map((product) => mapProduct(product, resolved))
  } catch (error) {
    console.error('Unable to load X24Sport products.', error)
    return usePreviewFallback ? previewProducts : []
  }
}

export async function getProductBySlug(slug: string): Promise<CmsProduct | undefined> {
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug, 'where[slug][equals]': slug,
    'where[publicationStatus][equals]': 'publish', limit: '1', depth: '2',
  })
  return (await fetchList<CmsProduct>('products', params)).docs[0]
}

export async function getCategoryByLegacyPath(path: string): Promise<CmsCategory | undefined> {
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug, 'where[legacyPath][equals]': path,
    limit: '1', depth: '1',
  })
  return (await fetchList<CmsCategory>('product-categories', params)).docs[0]
}

export async function getRelatedProducts(product: CmsProduct): Promise<ProductPreview[]> {
  const category = (product.categories || []).map(relationCategory).find(Boolean)
  const result = await getProductsPage({ categorySlug: category?.slug, limit: 5 })
  return result.products.filter((item) => item.slug !== product.slug).slice(0, 4)
}

export async function getCatalogData() {
  const categories = await getCategories()
  return { categories, products: (await getProductsPage({ limit: 100 })).products }
}
export async function getCategory(slug: string) {
  return (await getCategories()).find((category) => category.slug === slug)
}
export async function getAllProductPaths() {
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug, 'where[publicationStatus][equals]': 'publish',
    depth: '0', limit: '100',
  })
  return fetchAllDocs<Pick<CmsProduct, 'slug' | 'legacyPath'>>('products', params)
}
