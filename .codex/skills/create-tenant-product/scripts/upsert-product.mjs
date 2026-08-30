#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const args = new Map()
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--') && arg.includes('=')) {
    const [key, ...rest] = arg.slice(2).split('=')
    args.set(key, rest.join('='))
  } else if (arg.startsWith('--')) {
    args.set(arg.slice(2), true)
  }
}

const inputPath = args.get('input')
const apply = Boolean(args.get('apply'))
const dryRun = Boolean(args.get('dry-run')) || !apply
const CMS_API_URL = (process.env.CMS_API_URL || 'https://cms.x24sport.vn').replace(/\/$/, '')
const PAYLOAD_API_KEY = process.env.PAYLOAD_API_KEY

if (!inputPath) throw new Error('Missing --input=/absolute/path/product-input.json')
if (!PAYLOAD_API_KEY) {
  throw new Error('PAYLOAD_API_KEY is required for CMS-aware dry-run and apply; source the target tenant env with set -a before running this helper')
}

const input = JSON.parse(await readFile(inputPath, 'utf8'))
const TENANT_SLUG = input.tenantSlug || process.env.TENANT_SLUG
const SOURCE_SYSTEM = input.sourceSystem || 'manual-product-upload'
const workflowStartedAt = performance.now()
const timingsMs = {}

if (!TENANT_SLUG) throw new Error('tenantSlug is required in input JSON or TENANT_SLUG env')
if (!input.product?.name) throw new Error('product.name is required')
if (!input.product?.slug) input.product.slug = slugify(input.product.name)

function validateContextualMedia(mediaItems = []) {
  const missing = mediaItems
    .map((item, index) => ({ item, index }))
    .slice(1)
    .filter(({ item }) => !item?.alt?.trim())
    .map(({ index }) => index + 1)

  if (missing.length) {
    throw new Error(`media[${missing.join(', ')}] need buyer-natural alt/caption text because gallery images after the hero are rendered below the product description`)
  }
}

validateContextualMedia(input.media || [])

async function measure(name, operation) {
  const startedAt = performance.now()
  try {
    return await operation()
  } finally {
    timingsMs[name] = Math.round((performance.now() - startedAt) * 10) / 10
  }
}

const authHeaders = () => ({ Authorization: `users API-Key ${PAYLOAD_API_KEY}` })
const jsonHeaders = () => ({ ...authHeaders(), 'Content-Type': 'application/json' })
const unwrapDoc = (data) => data?.doc || data
const docs = (data) => data?.docs || []
const rows = (values) => [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))].map((value) => ({ value }))
const relationRows = (items) => (items || []).map((item) => ({
  ...item,
  values: rows(item.values).map((row) => ({ value: row.value })),
}))
const badgeRows = (values) => [...new Set((values || []).filter(Boolean).map(String))].map((label) => ({ label }))

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function lexicalParagraphs(paragraphs) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: (paragraphs || []).filter(Boolean).map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [{ type: 'text', text: String(text), version: 1 }],
      })),
    },
  }
}

function mimeType(filePath) {
  if (/\.webp$/i.test(filePath)) return 'image/webp'
  if (/\.jpe?g$/i.test(filePath)) return 'image/jpeg'
  if (/\.png$/i.test(filePath)) return 'image/png'
  return 'application/octet-stream'
}

async function loadSharp() {
  try {
    return (await import('sharp')).default
  } catch (error) {
    const repoRoot = path.resolve(__dirname, '../../../..')
    try {
      return require(path.join(repoRoot, 'cms-api/node_modules/sharp'))
    } catch {
      throw new Error(`sharp is required to convert uploads to WebP before media upload: ${error.message}`)
    }
  }
}

let sharpModule

function webpQuality(item = {}) {
  const configured = item.webpQuality ?? input.webpQuality ?? process.env.WEBP_QUALITY ?? 100
  const quality = Number(configured)
  if (!Number.isFinite(quality) || quality < 1 || quality > 100) {
    throw new Error(`webpQuality must be a number from 1 to 100, got ${configured}`)
  }
  return Math.round(quality)
}

function uploadFormat(item = {}) {
  const configured = item.uploadFormat ?? input.uploadFormat ?? 'webp'
  const format = String(configured).toLowerCase()
  if (format !== 'webp') {
    throw new Error(`uploadFormat must be "webp"; PNG uploads are not supported, got ${configured}`)
  }
  return format
}

function uploadFilenameBase(item, index) {
  const explicit = item.filenameBase || item.uploadFilenameBase
  const fallback = index === 0 ? `${input.product.slug}-anh-chinh` : `${input.product.slug}-anh-${index + 1}`
  return slugify(explicit || fallback) || 'media'
}

async function uploadAsset(item, index) {
  const filePath = item.path
  const sourceBuffer = await readFile(filePath)
  const format = uploadFormat(item)
  sharpModule ||= await loadSharp()
  const pipeline = sharpModule(sourceBuffer).rotate()
  const buffer = await pipeline.webp({
    quality: webpQuality(item),
    lossless: Boolean(item.webpLossless ?? input.webpLossless),
    nearLossless: Boolean(item.webpNearLossless ?? input.webpNearLossless),
  }).toBuffer()
  const checksum = createHash('sha256').update(buffer).digest('hex')
  const basename = uploadFilenameBase(item, index)
  return {
    buffer,
    checksum,
    filename: `${basename}-${checksum.slice(0, 12)}.webp`,
    mimeType: 'image/webp',
  }
}

async function fetchJson(pathAndQuery, options = {}) {
  const response = await fetch(`${CMS_API_URL}${pathAndQuery}`, options)
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${pathAndQuery} failed ${response.status}: ${text.slice(0, 500)}`)
  }
  return data
}

function query(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  return search.toString()
}

async function findOne(collection, params) {
  const data = await fetchJson(`/api/${collection}?${query({ ...params, limit: 1, depth: 0 })}`, {
    headers: authHeaders(),
  })
  return docs(data)[0] || null
}

async function createJson(collection, data) {
  if (dryRun) return { id: `dry-${collection}`, ...data }
  return unwrapDoc(await fetchJson(`/api/${collection}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  }))
}

async function patchJson(collection, id, data) {
  if (dryRun) return { id, ...data }
  return unwrapDoc(await fetchJson(`/api/${collection}/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  }))
}

async function resolveTenant() {
  const tenant = await findOne('tenants', { 'where[slug][equals]': TENANT_SLUG })
  if (!tenant) throw new Error(`Tenant not found: ${TENANT_SLUG}`)
  return tenant
}

async function resolveCategories() {
  const categorySlugs = input.categorySlugs || []
  return Promise.all(categorySlugs.map(async (slug) => {
    const category = await findOne('product-categories', {
      'where[tenant.slug][equals]': TENANT_SLUG,
      'where[slug][equals]': slug,
    })
    if (!category) throw new Error(`Category not found for ${TENANT_SLUG}: ${slug}`)
    return category
  }))
}

function oneIdentityMatch(label, matches) {
  const found = matches.filter(Boolean)
  const ids = [...new Set(found.map((item) => String(item.id)))]
  if (ids.length > 1) {
    throw new Error(`${label} identity conflict: stable keys resolved to different records (${ids.join(', ')})`)
  }
  return found[0] || null
}

async function findExistingProduct(product) {
  const [bySource, bySku, bySlug] = await Promise.all([
    input.sourceId ? findOne('products', {
      'where[tenant.slug][equals]': TENANT_SLUG,
      'where[sourceSystem][equals]': SOURCE_SYSTEM,
      'where[sourceId][equals]': input.sourceId,
    }) : null,
    product.sku ? findOne('products', {
      'where[tenant.slug][equals]': TENANT_SLUG,
      'where[sku][equals]': product.sku,
    }) : null,
    findOne('products', {
      'where[tenant.slug][equals]': TENANT_SLUG,
      'where[slug][equals]': product.slug,
    }),
  ])

  return oneIdentityMatch('Product', [bySource, bySku, bySlug])
}

async function uploadMedia(tenantId, item, index) {
  if (!item.path || !existsSync(item.path)) throw new Error(`Media file not found: ${item.path}`)
  const upload = await uploadAsset(item, index)
  const checksum = upload.checksum
  const sourceId = item.sourceId || `${input.sourceId || input.product.slug}-image-${index + 1}-${checksum.slice(0, 12)}`
  const forceUploadForFilename = Boolean(item.forceUploadForFilename)

  if (!forceUploadForFilename) {
    const [existingBySource, existingByChecksum] = await Promise.all([
      findOne('media', {
        'where[tenant.slug][equals]': TENANT_SLUG,
        'where[sourceSystem][equals]': SOURCE_SYSTEM,
        'where[sourceId][equals]': sourceId,
      }),
      findOne('media', {
        'where[tenant.slug][equals]': TENANT_SLUG,
        'where[sourceChecksum][equals]': checksum,
      }),
    ])
    const existingMedia = oneIdentityMatch(`Media ${index + 1}`, [existingBySource, existingByChecksum])
    if (existingMedia) return existingMedia
  }

  if (dryRun) {
    return { id: `dry-media-${index + 1}`, alt: item.alt, sourceId, sourceChecksum: checksum, url: item.path, uploadFilename: upload.filename, uploadMimeType: upload.mimeType }
  }

  const form = new FormData()
  form.append('file', new Blob([upload.buffer], { type: upload.mimeType }), upload.filename)
  form.append('_payload', JSON.stringify({
    tenant: tenantId,
    alt: item.alt || input.product.name,
    searchTags: rows(item.searchTags),
    sourceSystem: SOURCE_SYSTEM,
    sourceId,
    sourceUrl: item.sourceUrl,
    sourceChecksum: checksum,
  }))

  return unwrapDoc(await fetchJson('/api/media', {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  }))
}

async function updateCategoryCounts(categoryIds) {
  const updates = await Promise.all(categoryIds.map(async (categoryId) => {
    const data = await fetchJson(`/api/products?${query({
      'where[tenant.slug][equals]': TENANT_SLUG,
      'where[categories][contains]': categoryId,
      'where[publicationStatus][equals]': 'publish',
      limit: 1,
      depth: 0,
    })}`, { headers: authHeaders() })
    const total = Number(data?.totalDocs || 0)
    await patchJson('product-categories', categoryId, { productCount: total })
    return { categoryId, productCount: total }
  }))
  return updates
}

const [tenant, categories] = await measure('resolveContext', () => Promise.all([
  resolveTenant(),
  resolveCategories(),
]))
const mediaRecords = await measure('prepareAndResolveMedia', async () => {
  const records = []
  for (const [index, mediaItem] of (input.media || []).entries()) {
    records.push(await uploadMedia(tenant.id, mediaItem, index))
  }
  return records
})

const existingProduct = await measure('resolveProductIdentity', () => findExistingProduct(input.product))
const categoryIds = categories.map((category) => category.id)
const productData = {
  ...input.product,
  tenant: tenant.id,
  categories: categoryIds,
  gallery: mediaRecords.map((media) => media.id),
  description: input.product.description || lexicalParagraphs(input.product.descriptionParagraphs),
  attributes: relationRows(input.product.attributes),
  badges: badgeRows(input.product.badges),
  searchTags: rows(input.product.searchTags),
  sourceSystem: SOURCE_SYSTEM,
  sourceId: input.sourceId,
}
delete productData.descriptionParagraphs

const product = await measure('writeProduct', () => existingProduct
  ? patchJson('products', existingProduct.id, productData)
  : createJson('products', productData))

const categoryCounts = apply
  ? await measure('updateCategoryCounts', () => updateCategoryCounts(categoryIds))
  : []
timingsMs.total = Math.round((performance.now() - workflowStartedAt) * 10) / 10

console.log(JSON.stringify({
  mode: dryRun ? 'dry-run' : 'apply',
  action: existingProduct ? 'updated' : 'created',
  tenant: { id: tenant.id, slug: TENANT_SLUG },
  product: { id: product.id, name: product.name, slug: product.slug, sku: product.sku, publicationStatus: product.publicationStatus },
  categories: categories.map((category) => ({ id: category.id, slug: category.slug })),
  media: mediaRecords.map((media) => ({
    id: media.id,
    alt: media.alt,
    url: media.url,
    sourceChecksum: media.sourceChecksum,
    uploadFilename: media.uploadFilename,
    uploadMimeType: media.uploadMimeType,
  })),
  contextualMedia: mediaRecords.slice(1).map((media, index) => ({
    galleryIndex: index + 2,
    id: media.id,
    alt: media.alt,
    url: media.url,
  })),
  categoryCounts,
  timingsMs,
}, null, 2))
