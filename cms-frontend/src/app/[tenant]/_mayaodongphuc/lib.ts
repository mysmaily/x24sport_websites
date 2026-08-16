import type { ProductMediaGalleryImage } from '../../_components/product-media-gallery'

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
const TENANT_SLUG = 'mayaodongphuc'
const REVALIDATE = 180

type ApiList<T> = { docs: T[]; totalDocs: number; totalPages: number; page: number }
export type UniformCategory = {
  id: number | string
  name: string
  slug: string
  description?: string
  order?: number
  productCount?: number
}
type UniformMedia = ProductMediaGalleryImage & { url?: string }
type UniformAttribute = { name?: string; values?: Array<{ value?: string }> }
type UniformBadge = { label?: string }
export type UniformProduct = {
  id: number | string
  name: string
  slug: string
  sku?: string
  shortDescription?: string
  contentHtml?: string
  seoTitle?: string
  metaDescription?: string
  sourceModifiedAt?: string
  categories?: Array<number | string | UniformCategory>
  gallery?: Array<number | string | UniformMedia>
  attributes?: UniformAttribute[]
  badges?: UniformBadge[]
}

async function fetchList<T>(collection: string, params: URLSearchParams): Promise<ApiList<T>> {
  const response = await fetch(`${API_URL}/api/${collection}?${params.toString()}`, { next: { revalidate: REVALIDATE } })
  if (!response.ok) throw new Error(`Payload ${collection} returned ${response.status}`)
  return response.json() as Promise<ApiList<T>>
}

function baseParams(depth = 0) {
  return new URLSearchParams({ 'where[tenant.slug][equals]': TENANT_SLUG, depth: String(depth) })
}

export async function getUniformCategories() {
  const params = baseParams(0)
  params.set('where[group][equals]', 'audience')
  params.set('limit', '100')
  params.set('sort', 'order')
  try { return (await fetchList<UniformCategory>('product-categories', params)).docs }
  catch (error) { console.error('Unable to load May Áo Đồng Phục categories.', error); return [] }
}

export async function getUniformCategory(slug: string) {
  const params = baseParams(0)
  params.set('where[slug][equals]', slug)
  params.set('where[group][equals]', 'audience')
  params.set('limit', '1')
  return (await fetchList<UniformCategory>('product-categories', params)).docs[0]
}

export async function getUniformProducts(options: { categorySlug?: string; limit?: number; page?: number; sort?: string } = {}) {
  const params = baseParams(2)
  params.set('where[publicationStatus][equals]', 'publish')
  if (options.categorySlug) params.set('where[categories.slug][equals]', options.categorySlug)
  params.set('limit', String(options.limit || 24))
  params.set('page', String(Math.max(1, options.page || 1)))
  params.set('sort', options.sort || '-featured,-createdAt')
  try { return await fetchList<UniformProduct>('products', params) }
  catch (error) { console.error('Unable to load May Áo Đồng Phục products.', error); return { docs: [], totalDocs: 0, totalPages: 0, page: 1 } }
}

export async function getUniformProduct(slug: string) {
  const params = baseParams(2)
  params.set('where[slug][equals]', slug)
  params.set('where[publicationStatus][equals]', 'publish')
  params.set('limit', '1')
  return (await fetchList<UniformProduct>('products', params)).docs[0]
}

export async function getRelatedUniformProducts(product: UniformProduct, limit = 4) {
  const category = productCategory(product)
  const result = await getUniformProducts({ categorySlug: category?.slug, limit: limit + 1 })
  return result.docs.filter((item) => String(item.id) !== String(product.id)).slice(0, limit)
}

export function productCategory(product: UniformProduct) {
  return product.categories?.find((item): item is UniformCategory => typeof item === 'object')
}

export function productImages(product: UniformProduct): ProductMediaGalleryImage[] {
  return (product.gallery || [])
    .filter((item): item is UniformMedia => typeof item === 'object' && Boolean(item.url))
    .map((item) => ({ id: item.id, url: item.url, alt: item.alt || product.name, width: item.width, height: item.height }))
}

export function productMaterial(product: UniformProduct) {
  const material = product.attributes?.find((attribute) => attribute.name?.toLocaleLowerCase('vi').includes('chất liệu'))
  return material?.values?.map((item) => item.value).filter(Boolean).join(', ') || 'Tư vấn theo bối cảnh sử dụng'
}

export function productBadge(product: UniformProduct) {
  return product.badges?.find((badge) => badge.label)?.label
}

export function productColors(product: UniformProduct) {
  const palettes: Record<string, string[]> = {
    'MDP-PL-001': ['#122239', '#eee4ce', '#a16207'],
    'MDP-FB-002': ['#eee6d6', '#b94f2d', '#2b2a28'],
    'MDP-BH-003': ['#585640', '#172033', '#a16207'],
    'MDP-SM-004': ['#f4f0e6', '#172239', '#a16207'],
    'MDP-DV-005': ['#aeb5a2', '#f0eadc'],
    'MDP-SK-006': ['#f1eadb', '#1955a6', '#a9573b'],
  }
  return palettes[product.sku || ''] || ['#1c1917', '#a16207', '#f0eeeb']
}

export function cleanContentHtml(value?: string) {
  return value?.replace(/<script[\s\S]*?<\/script>/gi, '') || ''
}
