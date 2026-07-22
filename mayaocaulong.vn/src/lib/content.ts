import { headers } from 'next/headers'
import { catalogFilters, type CatalogFilter } from './catalog-filters'

export { catalogColorFilters, catalogFilters, catalogTypeFilters, getCatalogFilterBySlug } from './catalog-filters'
export type { CatalogFilter } from './catalog-filters'

type ApiList<T> = {
  docs: T[]
  totalDocs?: number
  totalPages?: number
  page?: number
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
  publicationStatus?: 'publish' | 'draft' | 'private' | 'pending' | null
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
    metaPixelEnabled?: boolean
    metaPixelId?: string
  }
}

const fallbackTenant: Tenant = {
  id: 'fallback-mayaocaulong',
  name: 'MayaoCauLong',
  slug: 'mayaocaulong',
  brand: {
    headline: 'Áo cầu lông đặt may cho đội hình thi đấu',
    subheadline: 'Form nhẹ, màu sắc sắc nét, in tên số và logo cho câu lạc bộ.',
    accentColor: '#df3f32',
  },
}

const fallbackProducts: Product[] = [
  { id: '1', name: 'Áo cầu lông Falcon Court đỏ trắng', slug: 'falcon-court-jersey', sku: 'MCL-FALCON-01', price: 189000, compareAtPrice: 239000, shortDescription: 'Áo cầu lông cổ tròn, vải nhẹ, phối màu mạnh cho đội thi đấu.', badges: [{ label: 'Đặt may' }] },
  { id: '2', name: 'Polo cầu lông Smash Pro xanh navy', slug: 'smash-pro-polo', sku: 'MCL-SMASH-02', price: 229000, compareAtPrice: 279000, shortDescription: 'Polo thi đấu mặt chim, cổ đứng, phù hợp in tên số và logo CLB.', badges: [{ label: 'Polo' }] },
  { id: '3', name: 'Set đồng phục cầu lông Feather Team', slug: 'feather-team-set', sku: 'MCL-FEATHER-03', price: 249000, compareAtPrice: 299000, shortDescription: 'Bộ đồng phục cầu lông nam nữ cho giải phong trào và câu lạc bộ.', badges: [{ label: 'Team set' }] },
]

const fallbackPosts: Post[] = [
  { id: '1', title: 'Cách chọn vải áo cầu lông', slug: 'vai-ao-cau-long', excerpt: 'Gợi ý chất vải thoáng, nhẹ và giữ form khi thi đấu liên tục.' },
  { id: '2', title: 'Checklist đặt áo cho CLB', slug: 'checklist-dat-ao', excerpt: 'Cần chốt size, logo, màu chủ đạo và deadline trước khi lên mẫu.' },
]

const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
const catalogProductLimit = '500'
const catalogFetchBatchSize = 100
export const catalogPageSize = 32

async function fetchCollection<T>(path: string): Promise<ApiList<T> | null> {
  const response = await fetch(`${apiUrl}${path}`, { next: { revalidate: 60 } })
  if (!response.ok) return null
  return (await response.json()) as ApiList<T>
}

async function fetchDocs<T>(path: string): Promise<T[]> {
  const data = await fetchCollection<T>(path)
  return data?.docs || []
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

export async function getTenantSlug() {
  const headerStore = await headers()
  const host = headerStore.get('host')?.replace(/^www\./, '')
  if (host?.includes('mayaocaulong.vn')) return 'mayaocaulong'
  return process.env.TENANT_SLUG || 'mayaocaulong'
}

function hasGalleryImage(product: Product) {
  return Boolean(product.gallery?.some((media) => media?.url))
}

function isPlaceholderProduct(product: Product) {
  const sku = product.sku?.toLowerCase() || ''
  const slug = product.slug?.toLowerCase() || ''
  return product.name.startsWith('[Đang tạo]') || slug.startsWith('dang-tao-') || sku.startsWith('x24-cl-transfer')
}

function isVisibleCatalogProduct(product: Product) {
  return product.publicationStatus === 'publish' && hasGalleryImage(product) && !isPlaceholderProduct(product)
}

export async function getHomeData() {
  const slug = await getTenantSlug()

  try {
    const [tenant] = await fetchDocs<Tenant>(`/api/tenants?where[slug][equals]=${slug}&limit=1`)
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const [featuredProducts, allProducts, posts] = await Promise.all([
      fetchDocs<Product>(`/api/products?${tenantFilter}&where[publicationStatus][equals]=publish&where[featured][equals]=true&depth=1&limit=24`),
      fetchDocs<Product>(`/api/products?${tenantFilter}&where[publicationStatus][equals]=publish&depth=1&limit=60&sort=-createdAt`),
      fetchDocs<Post>(`/api/posts?${tenantFilter}&sort=-publishedAt&limit=3`),
    ])
    const visibleFeaturedProducts = featuredProducts.filter(isVisibleCatalogProduct).slice(0, 8)
    const visibleProducts = allProducts.filter(isVisibleCatalogProduct)
    const products = visibleFeaturedProducts.length ? visibleFeaturedProducts : visibleProducts

    return {
      tenant: tenant || fallbackTenant,
      products: products.length ? products : fallbackProducts,
      posts: posts.length ? posts : fallbackPosts,
    }
  } catch {
    return { tenant: fallbackTenant, products: fallbackProducts, posts: fallbackPosts }
  }
}

export async function getProductsPage(requestedPage: number) {
  const tenantSlug = await getTenantSlug()

  try {
    const getBatch = (page: number) => {
      const params = new URLSearchParams({
        'where[tenant.slug][equals]': tenantSlug,
        'where[publicationStatus][equals]': 'publish',
        depth: '1',
        limit: String(catalogFetchBatchSize),
        page: String(page),
        sort: '-createdAt',
      })
      return fetchCollection<Product>(`/api/products?${params.toString()}`)
    }

    const firstBatch = await getBatch(1)

    if (!firstBatch) {
      return {
        page: 1,
        products: fallbackProducts,
        totalPages: 1,
        totalProducts: fallbackProducts.length,
      }
    }

    const apiPageCount = Math.max(1, firstBatch.totalPages || 1)
    const remainingBatches = await Promise.all(
      Array.from({ length: apiPageCount - 1 }, (_, index) => getBatch(index + 2)),
    )
    const visibleProducts = [firstBatch, ...remainingBatches]
      .flatMap((batch) => batch?.docs || [])
      .filter(isVisibleCatalogProduct)

    if (!visibleProducts.length) {
      return {
        page: 1,
        products: fallbackProducts,
        totalPages: 1,
        totalProducts: fallbackProducts.length,
      }
    }

    const totalProducts = visibleProducts.length
    const totalPages = Math.max(1, Math.ceil(totalProducts / catalogPageSize))
    const pageStart = (requestedPage - 1) * catalogPageSize
    const products = visibleProducts.slice(pageStart, pageStart + catalogPageSize)

    return {
      page: requestedPage,
      products,
      totalPages,
      totalProducts,
    }
  } catch {
    return {
      page: 1,
      products: fallbackProducts,
      totalPages: 1,
      totalProducts: fallbackProducts.length,
    }
  }
}

async function getProductsBySearchTag(tag: string, field: 'gallery.searchTags.value' | 'searchTags.value') {
  const tenantSlug = await getTenantSlug()
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenantSlug,
    'where[publicationStatus][equals]': 'publish',
    [`where[${field}][contains]`]: tag,
    depth: '2',
    limit: catalogProductLimit,
    sort: '-createdAt',
  })

  return fetchDocs<ProductDetail>(`/api/products?${params.toString()}`)
}

export async function getProductsByCatalogFilter(filter: CatalogFilter) {
  try {
    const mediaTaggedProducts = await getProductsBySearchTag(filter.tag, 'gallery.searchTags.value')
    const visibleMediaTaggedProducts = mediaTaggedProducts.filter(isVisibleCatalogProduct)
    if (visibleMediaTaggedProducts.length) return visibleMediaTaggedProducts

    const productTaggedProducts = await getProductsBySearchTag(filter.tag, 'searchTags.value')
    const visibleProductTaggedProducts = productTaggedProducts.filter(isVisibleCatalogProduct)
    return visibleProductTaggedProducts.length ? visibleProductTaggedProducts : fallbackProducts
  } catch {
    return fallbackProducts
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
    .map((child) => flattenRichText(child).join(' ').trim())
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
      'where[publicationStatus][equals]': 'publish',
      depth: '2',
      limit: '1',
    })
    const [product] = await fetchDocs<ProductDetail>(`/api/products?${params.toString()}`)
    return product && isVisibleCatalogProduct(product) ? product : fallbackProduct || null
  } catch {
    return fallbackProduct || null
  }
}
