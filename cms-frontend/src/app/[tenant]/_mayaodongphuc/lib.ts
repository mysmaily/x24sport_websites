import type { ProductMediaGalleryImage } from '../../_components/product-media-gallery'
import { buildProductSearchTerms } from '../../../lib/content'

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
const TENANT_SLUG = 'mayaodongphuc'
const REVALIDATE = 180
const SEARCH_FIELDS = [
  'name',
  'sku',
  'shortDescription',
  'metaDescription',
  'gallery.alt',
  'gallery.searchTags.value',
  'searchTags.value',
]

type ApiList<T> = { docs: T[]; totalDocs: number; totalPages: number; page: number }
type SearchTag = { value?: string | null }
export type UniformCategory = {
  id: number | string
  name: string
  slug: string
  description?: string
  order?: number
  productCount?: number
}
type UniformMedia = ProductMediaGalleryImage & { url?: string; searchTags?: SearchTag[] | null }
type UniformAttribute = { name?: string; values?: Array<{ value?: string }> }
type UniformBadge = { label?: string }
type RichTextNode = { text?: string; children?: RichTextNode[] }
export type UniformProduct = {
  id: number | string
  name: string
  slug: string
  sku?: string
  shortDescription?: string
  description?: { root?: { children?: RichTextNode[] } }
  contentHtml?: string
  seoTitle?: string
  metaDescription?: string
  sourceModifiedAt?: string
  categories?: Array<number | string | UniformCategory>
  gallery?: Array<number | string | UniformMedia>
  searchTags?: SearchTag[] | null
  attributes?: UniformAttribute[]
  badges?: UniformBadge[]
}
export type UniformColorFilter = { count: number; href: string; indexable: boolean; label: string; slug: string }

export const INDEXABLE_UNIFORM_COLOR_SLUGS = new Set([
  'mau-trang',
  'mau-den',
  'mau-do',
  'mau-vang',
  'mau-cam',
  'mau-hong',
  'mau-tim',
  'mau-xanh',
  'mau-xanh-bich',
  'mau-xanh-duong',
  'mau-xanh-la',
  'mau-xanh-ngoc',
  'mau-xanh-than',
  'mau-kem',
])

const UNIFORM_COLOR_LABELS: Record<string, string> = {
  'mau-cam': 'màu cam',
  'mau-den': 'màu đen',
  'mau-do': 'màu đỏ',
  'mau-hong': 'màu hồng',
  'mau-kem': 'màu kem',
  'mau-tim': 'màu tím',
  'mau-trang': 'màu trắng',
  'mau-vang': 'màu vàng',
  'mau-xanh': 'màu xanh',
  'mau-xanh-bich': 'màu xanh bích',
  'mau-xanh-duong': 'màu xanh dương',
  'mau-xanh-la': 'màu xanh lá',
  'mau-xanh-ngoc': 'màu xanh ngọc',
  'mau-xanh-than': 'màu xanh than',
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

export async function getUniformProducts(options: { categorySlug?: string; colorSlug?: string; limit?: number; page?: number; query?: string; sort?: string } = {}) {
  if (options.colorSlug) return getUniformProductsByColor({ ...options, colorSlug: options.colorSlug })
  const params = baseParams(2)
  params.set('where[publicationStatus][equals]', 'publish')
  if (options.categorySlug) params.set('where[categories.slug][equals]', options.categorySlug)
  if (options.query?.trim()) applyUniformSearchParams(params, options.query)
  params.set('limit', String(options.limit || 24))
  params.set('page', String(Math.max(1, options.page || 1)))
  params.set('sort', options.sort || '-featured,-createdAt')
  try { return await fetchList<UniformProduct>('products', params) }
  catch (error) { console.error('Unable to load May Áo Đồng Phục products.', error); return { docs: [], totalDocs: 0, totalPages: 0, page: 1 } }
}

async function getUniformProductsByColor(options: { categorySlug?: string; colorSlug: string; limit?: number; page?: number; query?: string; sort?: string }) {
  const page = Math.max(1, options.page || 1)
  const limit = options.limit || 24
  const products = await getAllUniformProductsForColorCounts(options.categorySlug, options.sort)
  const docs = products.filter((product) => productColorSlugs(product).includes(options.colorSlug) && productMatchesQuery(product, options.query))
  const totalPages = Math.ceil(docs.length / limit)
  const start = (page - 1) * limit
  return { docs: docs.slice(start, start + limit), totalDocs: docs.length, totalPages, page }
}

function applyUniformSearchParams(params: URLSearchParams, query: string) {
  buildProductSearchTerms(query).forEach((term, termIndex) => {
    SEARCH_FIELDS.forEach((field, fieldIndex) => {
      params.set(`where[or][${termIndex * SEARCH_FIELDS.length + fieldIndex}][${field}][contains]`, term)
    })
  })
}

async function getAllUniformProductsForColorCounts(categorySlug?: string, sort = '-featured,-createdAt') {
  const params = baseParams(2)
  params.set('where[publicationStatus][equals]', 'publish')
  if (categorySlug) params.set('where[categories.slug][equals]', categorySlug)
  params.set('limit', '300')
  params.set('page', '1')
  params.set('sort', sort)
  try { return (await fetchList<UniformProduct>('products', params)).docs }
  catch (error) { console.error('Unable to load May Áo Đồng Phục color products.', error); return [] }
}

export async function getUniformColorFilters({ basePath, categorySlug, sort }: { basePath: string; categorySlug?: string; sort?: string }) {
  const products = await getAllUniformProductsForColorCounts(categorySlug, sort)
  const counts = new Map<string, { label: string; productIds: Set<string> }>()
  for (const product of products) {
    for (const color of productColorsFromSearchTags(product)) {
      const current = counts.get(color.slug) || { label: color.label, productIds: new Set<string>() }
      current.productIds.add(String(product.id))
      counts.set(color.slug, current)
    }
  }
  return [...counts.entries()]
    .map(([slug, value]) => ({
      count: value.productIds.size,
      href: uniformColorHref(basePath, slug),
      indexable: INDEXABLE_UNIFORM_COLOR_SLUGS.has(slug),
      label: value.label,
      slug,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || Number(b.indexable) - Number(a.indexable) || a.label.localeCompare(b.label, 'vi'))
}

export function isIndexableUniformColorSlug(slug?: string) {
  return Boolean(slug && INDEXABLE_UNIFORM_COLOR_SLUGS.has(slug))
}

export function uniformColorHref(basePath: string, slug: string) {
  if (INDEXABLE_UNIFORM_COLOR_SLUGS.has(slug)) return `${basePath}${slug}/`
  const params = new URLSearchParams({ mau: slug })
  return `${basePath}?${params}`
}

export function uniformColorLabelFromSlug(slug?: string) {
  if (!slug) return undefined
  if (UNIFORM_COLOR_LABELS[slug]) return UNIFORM_COLOR_LABELS[slug]
  return slug.replace(/^mau-/, 'màu ').replace(/-/g, ' ')
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

function productColorsFromSearchTags(product: UniformProduct) {
  const tags = [
    ...(product.searchTags || []),
    ...(product.gallery || [])
      .filter((item): item is UniformMedia => typeof item === 'object')
      .flatMap((item) => item.searchTags || []),
  ]
  const colors = new Map<string, { label: string; slug: string }>()
  for (const tag of tags) {
    const color = normalizeColorTag(tag.value)
    if (color) colors.set(color.slug, color)
  }
  return [...colors.values()]
}

function productColorSlugs(product: UniformProduct) {
  return productColorsFromSearchTags(product).map((color) => color.slug)
}

function productMatchesQuery(product: UniformProduct, query?: string) {
  const terms = buildProductSearchTerms(query || '')
  if (!terms.length) return true
  const haystack = [
    product.name,
    product.sku,
    product.shortDescription,
    product.metaDescription,
    ...(product.searchTags || []).map((tag) => tag.value),
    ...(product.gallery || [])
      .filter((item): item is UniformMedia => typeof item === 'object')
      .flatMap((item) => [item.alt, ...(item.searchTags || []).map((tag) => tag.value)]),
  ].filter(Boolean).join(' ').toLocaleLowerCase('vi')
  return terms.some((term) => haystack.includes(term.toLocaleLowerCase('vi')))
}

function normalizeColorTag(value?: string | null) {
  const raw = value?.trim()
  if (!raw) return null
  const readable = raw.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN')
  const withPrefix = /^(màu|mau)\s+/.test(readable) ? readable : ''
  if (!withPrefix) return null
  const label = withPrefix.replace(/^mau\s+/, 'màu ')
  const slug = slugifyVietnamese(label)
  return slug.startsWith('mau-') ? { label, slug } : null
}

function slugifyVietnamese(value: string) {
  return value
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function cleanContentHtml(value?: string) {
  return value?.replace(/<script[\s\S]*?<\/script>/gi, '') || ''
}

function flattenRichText(node?: RichTextNode): string[] {
  if (!node) return []
  if (node.text?.trim()) return [node.text.trim()]
  return (node.children || []).flatMap(flattenRichText)
}

export function productDescriptionParagraphs(product: UniformProduct) {
  return (product.description?.root?.children || [])
    .map((child) => flattenRichText(child).join(' ').trim())
    .filter(Boolean)
}
