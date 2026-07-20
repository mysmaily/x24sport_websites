import { headers } from 'next/headers'
import { catalogFilters, type CatalogFilter } from './catalog-filters'

export { catalogColorFilters, catalogFilters, catalogTypeFilters, getCatalogFilterBySlug } from './catalog-filters'
export type { CatalogFilter } from './catalog-filters'

export const PRODUCTS_PER_PAGE = 30

type ApiList<T> = { docs: T[] }

type ApiPaginated<T> = {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}

export type PaginatedProducts = {
  products: Product[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type SearchTag = { value?: string }

export type Tenant = {
  id: string
  name: string
  slug: string
  brand?: {
    headline?: string
    subheadline?: string
    accentColor?: string
  }
}

export type Product = {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  compareAtPrice?: number
  shortDescription: string
  badges?: Array<{ label: string }>
  gallery?: ProductMedia[]
  colors?: Array<string | { label?: string; name?: string; color?: string; hex?: string }>
  tags?: Array<string | { label?: string; name?: string; title?: string; color?: string; hex?: string }>
  productTags?: Array<string | { label?: string; name?: string; title?: string; color?: string; hex?: string }>
}

type RichTextNode = {
  text?: string
  children?: RichTextNode[]
}

type ProductMedia = {
  id: number
  url?: string
  alt?: string
  width?: number
  height?: number
  searchTags?: SearchTag[]
}

export type ProductDetail = Product & {
  description?: {
    root?: RichTextNode
  }
  gallery?: ProductMedia[]
  sport?: string
  searchTags?: SearchTag[]
}

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
}

export type StoreSettings = {
  id: string
  siteName: string
  contactPhone?: string
  zaloUrl?: string
  analytics?: {
    ga4Enabled?: boolean
    gaMeasurementId?: string
    gaPropertyId?: string
    dailyTelegramReportEnabled?: boolean
  }
}

const fallbackTenant: Tenant = {
  id: 'fallback-mayaopickleball',
  name: 'MayaoPickleball',
  slug: 'mayaopickleball',
  brand: {
    headline: 'Áo pickleball đặt may cho CLB & đội nhóm',
    subheadline: 'Form nhẹ, màu sắc sắc nét, in tên số và logo cho câu lạc bộ pickleball.',
    accentColor: '#2e7d32',
  },
}

const fallbackProducts: Product[] = [
  { id: '1', name: 'Áo pickleball Paddle Court xanh lá trắng', slug: 'paddle-court-jersey', sku: 'MP-PADDLE-01', price: 189000, compareAtPrice: 239000, shortDescription: 'Áo pickleball cổ tròn, vải nhẹ, phối màu mạnh cho đội thi đấu.', badges: [{ label: 'Đặt may' }] },
  { id: '2', name: 'Polo pickleball Dink Pro xanh navy', slug: 'dink-pro-polo', sku: 'MP-DINK-02', price: 229000, compareAtPrice: 279000, shortDescription: 'Polo thi đấu mặt chim, cổ đứng, phù hợp in tên số và logo CLB.', badges: [{ label: 'Polo' }] },
  { id: '3', name: 'Set đồng phục pickleball Kitchen Team', slug: 'kitchen-team-set', sku: 'MP-KITCHEN-03', price: 249000, compareAtPrice: 299000, shortDescription: 'Bộ đồng phục pickleball nam nữ cho giải phong trào và câu lạc bộ.', badges: [{ label: 'Team set' }] },
]

const fallbackPosts: Post[] = [
  { id: '1', title: 'Cách chọn vải áo pickleball', slug: 'vai-ao-pickleball', excerpt: 'Gợi ý chất vải thoáng, nhẹ và giữ form khi thi đấu liên tục trên sân pickleball.' },
  { id: '2', title: 'Checklist đặt áo cho CLB pickleball', slug: 'checklist-dat-ao-pickleball', excerpt: 'Cần chốt size, logo, màu chủ đạo và deadline trước khi lên mẫu cho đội pickleball.' },
]

const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

async function fetchDocs<T>(path: string): Promise<T[]> {
  const response = await fetch(`${apiUrl}${path}`, { next: { revalidate: 60 } })
  if (!response.ok) return []
  const data = (await response.json()) as ApiList<T>
  return data.docs || []
}

export async function getAnalyticsSettings() {
  try {
    const slug = await getTenantSlug()
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const settings = await fetchDocs<StoreSettings>(`/api/store-settings?${tenantFilter}&limit=1`)
    return settings[0]?.analytics
  } catch {
    return undefined
  }
}

async function fetchDocsPaginated<T>(path: string): Promise<ApiPaginated<T> | null> {
  const response = await fetch(`${apiUrl}${path}`, { next: { revalidate: 60 } })
  if (!response.ok) return null
  return (await response.json()) as ApiPaginated<T>
}

export async function getTenantSlug() {
  const headerStore = await headers()
  const host = headerStore.get('host')?.replace(/^www\./, '')
  if (host?.includes('mayaopickleball.vn')) return 'mayaopickleball'
  return process.env.TENANT_SLUG || 'mayaopickleball'
}

export async function getHomeData() {
  const slug = await getTenantSlug()

  try {
    const [tenant] = await fetchDocs<Tenant>(`/api/tenants?where[slug][equals]=${slug}&limit=1`)
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const [featuredProducts, allProducts, posts] = await Promise.all([
      fetchDocs<Product>(`/api/products?${tenantFilter}&where[featured][equals]=true&depth=1&limit=8`),
      fetchDocs<Product>(`/api/products?${tenantFilter}&depth=1&limit=24`),
      fetchDocs<Post>(`/api/posts?${tenantFilter}&sort=-publishedAt&limit=3`),
    ])
    const products = featuredProducts.length ? featuredProducts : allProducts

    return {
      tenant: tenant || fallbackTenant,
      products: products.length ? products : fallbackProducts,
      posts: posts.length ? posts : fallbackPosts,
    }
  } catch {
    return { tenant: fallbackTenant, products: fallbackProducts, posts: fallbackPosts }
  }
}

export async function getAllProducts(page = 1, perPage = PRODUCTS_PER_PAGE): Promise<PaginatedProducts> {
  const tenantSlug = await getTenantSlug()

  const emptyResult: PaginatedProducts = {
    products: [],
    totalDocs: 0,
    totalPages: 0,
    page,
    hasNextPage: false,
    hasPrevPage: false,
  }

  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      depth: '1',
      limit: String(perPage),
      page: String(page),
      sort: '-createdAt',
    })
    const data = await fetchDocsPaginated<Product>(`/api/products?${params.toString()}`)
    if (!data) return emptyResult

    return {
      products: data.docs.length ? data.docs : fallbackProducts.slice(0, perPage),
      totalDocs: data.totalDocs,
      totalPages: data.totalPages,
      page: data.page,
      hasNextPage: data.hasNextPage,
      hasPrevPage: data.hasPrevPage,
    }
  } catch {
    return {
      ...emptyResult,
      products: fallbackProducts.slice(0, perPage),
      totalDocs: fallbackProducts.length,
      totalPages: 1,
    }
  }
}

async function getProductsBySearchTag(
  tag: string,
  field: 'gallery.searchTags.value' | 'searchTags.value',
  page = 1,
  perPage = PRODUCTS_PER_PAGE,
): Promise<ApiPaginated<ProductDetail> | null> {
  const tenantSlug = await getTenantSlug()
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug,
    [`where[${field}][contains]`]: tag,
    depth: '2',
    limit: String(perPage),
    page: String(page),
    sort: '-createdAt',
  })

  return fetchDocsPaginated<ProductDetail>(`/api/products?${params.toString()}`)
}

export async function getProductsByCatalogFilter(
  filter: CatalogFilter,
  page = 1,
  perPage = PRODUCTS_PER_PAGE,
): Promise<PaginatedProducts> {
  const emptyResult: PaginatedProducts = {
    products: [],
    totalDocs: 0,
    totalPages: 0,
    page,
    hasNextPage: false,
    hasPrevPage: false,
  }

  try {
    const mediaData = await getProductsBySearchTag(filter.tag, 'gallery.searchTags.value', page, perPage)
    if (mediaData && mediaData.docs.length) {
      return {
        products: mediaData.docs,
        totalDocs: mediaData.totalDocs,
        totalPages: mediaData.totalPages,
        page: mediaData.page,
        hasNextPage: mediaData.hasNextPage,
        hasPrevPage: mediaData.hasPrevPage,
      }
    }

    const productData = await getProductsBySearchTag(filter.tag, 'searchTags.value', page, perPage)
    if (productData && productData.docs.length) {
      return {
        products: productData.docs,
        totalDocs: productData.totalDocs,
        totalPages: productData.totalPages,
        page: productData.page,
        hasNextPage: productData.hasNextPage,
        hasPrevPage: productData.hasPrevPage,
      }
    }

    return {
      ...emptyResult,
      products: fallbackProducts.slice(0, perPage),
      totalDocs: fallbackProducts.length,
      totalPages: 1,
    }
  } catch {
    return {
      ...emptyResult,
      products: fallbackProducts.slice(0, perPage),
      totalDocs: fallbackProducts.length,
      totalPages: 1,
    }
  }
}

function flattenRichText(node?: RichTextNode): string[] {
  if (!node) return []
  if (node.text?.trim()) return [node.text.trim()]
  return (node.children || []).flatMap(flattenRichText)
}

export function getProductDescriptionParagraphs(product: ProductDetail) {
  const rootChildren = product.description?.root?.children || []
  return rootChildren
    .map((child) => {
      // Handle Lexical html nodes (embedded <figure><img> from WordPress)
      if ((child as any).type === 'html' && (child as any).html) {
        return (child as any).html as string
      }
      return flattenRichText(child).join(' ').trim()
    })
    .filter(Boolean)
}

const knownColorLabels = [
  'trắng',
  'đỏ',
  'hồng',
  'xanh navy',
  'xanh ngọc',
  'xanh đậm',
  'xanh da trời',
  'xanh',
  'vàng',
  'cam',
  'đen',
  'tím',
  'xám',
] as const

function normalizeTagLabel(tag: unknown) {
  if (typeof tag === 'string') return tag.trim()
  if (!tag || typeof tag !== 'object') return ''
  const record = tag as { label?: unknown; name?: unknown; title?: unknown }
  const value = record.label || record.name || record.title
  return typeof value === 'string' ? value.trim() : ''
}

function textMatchesTag(value: string | undefined, tag: string) {
  return (value || '').toLocaleLowerCase('vi-VN').includes(tag.toLocaleLowerCase('vi-VN'))
}

function mediaMatchesSearchTag(media: ProductMedia | undefined, tag: string) {
  return Boolean(media?.searchTags?.some((searchTag) => textMatchesTag(searchTag.value, tag)))
}

export function getProductImageForFilter(product: Product, filter?: CatalogFilter | null) {
  if (!filter) return product.gallery?.[0]

  return product.gallery?.find((image) => mediaMatchesSearchTag(image, filter.tag)) || product.gallery?.[0]
}

function normalizeTagColor(tag: unknown) {
  if (!tag || typeof tag !== 'object') return undefined
  const record = tag as { color?: unknown; hex?: unknown }
  const value = record.color || record.hex
  return typeof value === 'string' ? value : undefined
}

export function getProductColorTags(product: ProductDetail) {
  const rawTags = [
    ...(product.colors || []),
    ...(product.tags || []),
    ...(product.productTags || []),
    ...(product.badges || []),
  ]

  const explicitTags = rawTags
    .map((tag) => ({
      label: normalizeTagLabel(tag),
      color: normalizeTagColor(tag),
    }))
    .filter((tag) => tag.label)
    .filter((tag) => {
      const label = tag.label.toLowerCase()
      return knownColorLabels.some((color) => label.includes(color)) || label.includes('gradient')
    })

  const text = `${product.name} ${product.shortDescription}`.toLowerCase()
  const inferredTags = knownColorLabels
    .filter((color) => `${product.name} ${product.shortDescription}`.toLowerCase().includes(color))
    .filter((color) => color !== 'xanh' || !['xanh navy', 'xanh ngọc', 'xanh đậm', 'xanh da trời'].some((specific) => text.includes(specific)))
    .map((color) => ({ label: color[0].toUpperCase() + color.slice(1), color: undefined }))

  const deduped = [...explicitTags, ...inferredTags].filter(
    (tag, index, tags) =>
      tags.findIndex((candidate) => candidate.label.toLowerCase() === tag.label.toLowerCase()) === index,
  )

  return deduped
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export async function getProductBySlug(slug: string) {
  const tenantSlug = await getTenantSlug()
  const fallbackProduct = fallbackProducts.find((product) => product.slug === slug) as ProductDetail | undefined

  try {
    const params = new URLSearchParams({
      'where[slug][equals]': slug,
      'where[tenant.slug][equals]': tenantSlug,
      depth: '2',
      limit: '1',
    })
    const [product] = await fetchDocs<ProductDetail>(`/api/products?${params.toString()}`)
    return product || fallbackProduct || null
  } catch {
    return fallbackProduct || null
  }
}
