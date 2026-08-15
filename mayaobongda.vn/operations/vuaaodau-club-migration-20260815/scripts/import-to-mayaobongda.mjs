import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const operationDir = path.resolve(__dirname, '..')
const manifestPath = path.join(operationDir, 'source-products.json')

const apply = process.argv.includes('--apply')
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity

const CMS_API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const TENANT_SLUG = process.env.TENANT_SLUG || 'mayaobongda'
const PAYLOAD_API_KEY = process.env.PAYLOAD_API_KEY
const SOURCE_SYSTEM = 'vuaaodau-club-products-20260815'

if (!PAYLOAD_API_KEY && apply) {
  throw new Error('PAYLOAD_API_KEY is required for --apply')
}

const authHeaders = () => ({
  Authorization: `users API-Key ${PAYLOAD_API_KEY}`,
})

const jsonHeaders = () => ({
  ...authHeaders(),
  'Content-Type': 'application/json',
})

const rows = (values) => [...new Set(values.filter(Boolean))].map((value) => ({ value }))

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const lexicalParagraphs = (paragraphs) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [{ type: 'text', text, version: 1 }],
    })),
  },
})

const fetchJson = async (pathAndQuery, options = {}) => {
  const response = await fetch(`${CMS_API_URL}${pathAndQuery}`, options)
  const text = await response.text()
  let data
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

const getDocs = (data) => data?.docs || []
const unwrapDoc = (data) => data?.doc || data

const query = (params) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value))
  }
  return search.toString()
}

const findOne = async (collection, params) => {
  if (!PAYLOAD_API_KEY) return null
  const data = await fetchJson(`/api/${collection}?${query({ ...params, limit: 1, depth: 0 })}`, {
    headers: authHeaders(),
  })
  return getDocs(data)[0] || null
}

const createJson = async (collection, data) =>
  unwrapDoc(
    await fetchJson(`/api/${collection}`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    }),
  )

const patchJson = async (collection, id, data) =>
  unwrapDoc(
    await fetchJson(`/api/${collection}/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    }),
  )

const ensureCategory = async (tenantId, category) => {
  const existing = await findOne('product-categories', {
    'where[tenant.slug][equals]': TENANT_SLUG,
    'where[slug][equals]': category.slug,
  })
  if (existing) return existing
  if (!apply) return { ...category, id: `dry-${category.slug}` }

  return createJson('product-categories', {
    ...category,
    tenant: tenantId,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: category.slug,
  })
}

const clubNameFromTitle = (title) => {
  const cleaned = title
    .replace(/^Áo\s+(đấu|bóng đá)\s+/i, '')
    .replace(/^Áo\s+CLB\s+/i, '')
    .replace(/\b(Home|Away|Third)\s+Kit\b.*$/i, '')
    .replace(/\bsân\s+(nhà|khách).*$/i, '')
    .replace(/\b202[0-9]\s*-\s*202[0-9].*$/i, '')
    .replace(/\bmàu\b.*$/i, '')
    .replace(/\s+-\s+.*$/i, '')
    .trim()
  return cleaned || 'Câu lạc bộ'
}

const productDisplayName = (item) => {
  const withoutPrefix = item.title
    .replace(/^Áo\s+(đấu|bóng đá)\s+/i, '')
    .replace(/^Áo\s+CLB\s+/i, '')
    .replace(/\b(Home|Away|Third)\s+Kit\b\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  return `Áo CLB ${withoutPrefix}`
    .replace(/\s+-\s+-\s+/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim()
}

const productSummary = (item) =>
  `${item.title} được làm mới thành mockup thương mại cho đặt may áo bóng đá câu lạc bộ, hỗ trợ in tên số, logo đội và phối size theo yêu cầu.`

const productDescription = (item) =>
  lexicalParagraphs([
    `Mẫu ${item.title} phù hợp cho đội bóng phong trào, fan club, trường học và doanh nghiệp muốn đặt áo câu lạc bộ theo phong cách thi đấu hiện đại.`,
    'Sản phẩm hỗ trợ chỉnh tên đội, logo, sponsor, tên cầu thủ và số áo. Shop tư vấn chất vải, form áo, size và phối quần tất theo nhu cầu thực tế của đội.',
    'Giá hiển thị là giá tham khảo từ 119.000đ. Liên hệ hotline 0989 353 247 để nhận báo giá theo số lượng, chất liệu và yêu cầu in ấn cụ thể.',
  ])

const uploadMedia = async (tenantId, item, mockupPath, checksum) => {
  const existing = await findOne('media', {
    'where[tenant.slug][equals]': TENANT_SLUG,
    'where[sourceSystem][equals]': SOURCE_SYSTEM,
    'where[sourceId][equals]': `${item.sourceId}-mockup`,
  })
  if (existing) return existing

  const buffer = await readFile(mockupPath)
  const form = new FormData()
  form.append(
    'file',
    new Blob([buffer], { type: 'image/png' }),
    path.basename(mockupPath),
  )
  form.append(
    '_payload',
    JSON.stringify({
      tenant: tenantId,
      alt: `${item.title} - mockup áo bóng đá câu lạc bộ`,
      searchTags: rows(['áo bóng đá', 'áo câu lạc bộ', item.season, item.kitType]),
      sourceSystem: SOURCE_SYSTEM,
      sourceId: `${item.sourceId}-mockup`,
      sourceUrl: item.sourceUrl,
      sourceChecksum: checksum,
    }),
  )

  return unwrapDoc(
    await fetchJson('/api/media', {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    }),
  )
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const tenant = await findOne('tenants', { 'where[slug][equals]': TENANT_SLUG })
  if (!tenant && apply) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantId = tenant?.id || 'dry-tenant'

  const parentCategory = await ensureCategory(tenantId, {
    name: 'Câu Lạc Bộ',
    slug: 'cau-lac-bo',
    group: 'type',
    description: 'Áo bóng đá câu lạc bộ',
    legacyPath: '/cau-lac-bo/',
    order: 10,
  })

  const seasonCategories = new Map()
  const processed = []
  const skipped = []
  const affectedCategoryIds = new Set()

  for (const item of manifest.items.slice(0, Number.isFinite(limit) ? limit : undefined)) {
    const mockupPath = path.join(operationDir, item.mockupPath)
    if (!existsSync(mockupPath)) {
      skipped.push({ sourceId: item.sourceId, title: item.title, reason: 'missing mockup', expected: item.mockupPath })
      continue
    }

    const existingProduct = await findOne('products', {
      'where[tenant.slug][equals]': TENANT_SLUG,
      'where[sourceSystem][equals]': SOURCE_SYSTEM,
      'where[sourceId][equals]': item.sourceId,
    })
    if (existingProduct) {
      for (const id of existingProduct.categories || []) {
        if (Number.isFinite(Number(id))) affectedCategoryIds.add(id)
      }
      skipped.push({ sourceId: item.sourceId, title: item.title, reason: 'already imported', id: existingProduct.id })
      continue
    }

    let seasonCategory = null
    if (item.season) {
      const seasonSlug = `ao-clb-${slugify(item.season)}`
      if (!seasonCategories.has(seasonSlug)) {
        seasonCategories.set(
          seasonSlug,
          await ensureCategory(tenantId, {
            name: `Áo CLB ${item.season.replace('-', ' - ')}`,
            slug: seasonSlug,
            group: 'tag',
            description: `Áo bóng đá câu lạc bộ mùa ${item.season.replace('-', ' - ')}`,
            legacyPath: `/cau-lac-bo/${seasonSlug}/`,
            parent: parentCategory.id,
            order: 20,
          }),
        )
      }
      seasonCategory = seasonCategories.get(seasonSlug)
    }

    const imageBuffer = await readFile(mockupPath)
    const checksum = createHash('sha256').update(imageBuffer).digest('hex')
    const categoryIds = [parentCategory.id, seasonCategory?.id].filter((id) => Number.isFinite(Number(id)))
    categoryIds.forEach((id) => affectedCategoryIds.add(id))
    const clubName = clubNameFromTitle(item.title)
    const productName = productDisplayName(item)
    const slug = slugify(productName)

    const productData = {
      tenant: tenantId,
      name: productName,
      slug,
      sku: `MBĐ-CLB-${String(item.wordpressId).padStart(5, '0')}`,
      sport: 'football',
      productType: 'simple',
      publicationStatus: 'publish',
      featured: false,
      categories: categoryIds,
      price: 119000,
      regularPrice: 139000,
      salePrice: 119000,
      compareAtPrice: 139000,
      currency: 'VND',
      stockStatus: 'instock',
      isPurchasable: false,
      isOnBackorder: false,
      shortDescription: productSummary(item),
      description: productDescription(item),
      attributes: [
        { name: 'Dòng áo', values: [{ value: 'Áo bóng đá câu lạc bộ' }] },
        { name: 'Câu lạc bộ', values: [{ value: clubName }] },
        ...(item.season ? [{ name: 'Mùa giải', values: [{ value: item.season.replace('-', ' - ') }] }] : []),
        ...(item.kitType ? [{ name: 'Phiên bản', values: [{ value: item.kitType }] }] : []),
      ],
      badges: [{ label: 'Đặt may' }, { label: 'In tên số' }],
      searchTags: rows(['áo bóng đá', 'áo câu lạc bộ', 'đặt may áo bóng đá', clubName, item.season, item.kitType]),
      seoTitle: `${productName} | MayAoBongDa.vn`,
      metaDescription: productSummary(item).slice(0, 158),
      legacyPath: `/san-pham/${slug}/`,
      legacyImages: [{ url: item.sourceImageUrl, alt: item.title }],
      sourceSystem: SOURCE_SYSTEM,
      sourceId: item.sourceId,
      sourceChecksum: checksum,
    }

    if (!apply) {
      processed.push({ sourceId: item.sourceId, title: productName, slug, categories: categoryIds, mockup: item.mockupPath })
      continue
    }

    const media = await uploadMedia(tenantId, item, mockupPath, checksum)
    const product = await createJson('products', { ...productData, gallery: [media.id] })
    processed.push({ sourceId: item.sourceId, productId: product.id, mediaId: media.id, slug: product.slug })
  }

  const categoryCounts = []
  if (apply) {
    for (const categoryId of affectedCategoryIds) {
      const data = await fetchJson(
        `/api/products?${query({
          'where[tenant.slug][equals]': TENANT_SLUG,
          'where[categories][contains]': categoryId,
          'where[publicationStatus][equals]': 'publish',
          limit: 1,
          depth: 0,
        })}`,
        { headers: authHeaders() },
      )
      const total = Number(data?.totalDocs || 0)
      await patchJson('product-categories', categoryId, { productCount: total })
      categoryCounts.push({ categoryId, productCount: total })
    }
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: TENANT_SLUG,
    sourceSystem: SOURCE_SYSTEM,
    manifestTotal: manifest.total,
    processedCount: processed.length,
    skippedCount: skipped.length,
    processed,
    skipped,
    categoryCounts,
  }

  await writeFile(
    path.join(operationDir, apply ? 'import-apply-summary.json' : 'import-dry-run.json'),
    JSON.stringify(summary, null, 2),
  )
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
