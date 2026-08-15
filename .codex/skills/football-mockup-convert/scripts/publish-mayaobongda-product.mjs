#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apply = process.argv.includes('--apply')
const inputArg = process.argv.find((arg) => arg.startsWith('--input='))
const inputPath = inputArg ? inputArg.split('=').slice(1).join('=') : process.argv[process.argv.indexOf('--input') + 1]

const CMS_API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const TENANT_SLUG = process.env.TENANT_SLUG || 'mayaobongda'
const PAYLOAD_API_KEY = process.env.PAYLOAD_API_KEY
const DEFAULT_SOURCE_SYSTEM = 'football-mockup-convert'
const DEFAULT_PRICE = 125000

if (!inputPath) throw new Error('Usage: publish-mayaobongda-product.mjs --input product.json [--apply]')
if (apply && !PAYLOAD_API_KEY) throw new Error('PAYLOAD_API_KEY is required for --apply')

const authHeaders = () => ({ Authorization: `users API-Key ${PAYLOAD_API_KEY}` })
const jsonHeaders = () => ({ ...authHeaders(), 'Content-Type': 'application/json' })
const unwrapDoc = (data) => data?.doc || data
const getDocs = (data) => data?.docs || []

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const rows = (values) => [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
  .map((value) => ({ value }))

const query = (params) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value))
  }
  return search.toString()
}

const fetchJson = async (pathAndQuery, options = {}) => {
  const response = await fetch(`${CMS_API_URL}${pathAndQuery}`, options)
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${pathAndQuery} failed ${response.status}: ${text.slice(0, 500)}`)
  return data
}

const findOne = async (collection, params) => {
  if (!PAYLOAD_API_KEY && apply) throw new Error('PAYLOAD_API_KEY is required')
  if (!apply && !PAYLOAD_API_KEY) return null
  const data = await fetchJson(`/api/${collection}?${query({ ...params, limit: 1, depth: 0 })}`, {
    headers: authHeaders(),
  })
  return getDocs(data)[0] || null
}

const createJson = async (collection, data) =>
  unwrapDoc(await fetchJson(`/api/${collection}`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  }))

const patchJson = async (collection, id, data) =>
  unwrapDoc(await fetchJson(`/api/${collection}/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  }))

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

const kitTypeLabel = (kitType) => {
  if (kitType === 'home') return 'sân nhà'
  if (kitType === 'away') return 'sân khách'
  if (kitType === 'third') return 'mẫu thứ ba'
  return 'thi đấu'
}

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
    sourceSystem: category.sourceSystem || DEFAULT_SOURCE_SYSTEM,
    sourceId: category.sourceId || category.slug,
  })
}

const seoDescription = (spec) => {
  const colorText = spec.colors?.length ? ` màu ${spec.colors.join(' phối ')}` : ''
  return `${spec.productName}${colorText} giá từ 125.000đ, phù hợp đặt may áo bóng đá câu lạc bộ, in tên số, logo đội và phối size cho đội bóng.`
}

const content = (spec) => {
  const clubName = spec.clubName || 'câu lạc bộ'
  const season = spec.season || 'mới'
  const kitText = kitTypeLabel(spec.kitType)
  const colorText = spec.colors?.length ? ` Tông màu chính: ${spec.colors.join(', ')}.` : ''
  return lexicalParagraphs([
    `${spec.productName} là mẫu áo bóng đá câu lạc bộ dành cho đội phong trào, fan club, lớp học, công ty và giải đấu cần một bộ trang phục nổi bật, đồng bộ và dễ đặt may.`,
    `Thiết kế lấy cảm hứng từ ${clubName}, phiên bản ${kitText} mùa ${season}.${colorText} Bố cục hình ảnh được trình bày lại theo phong cách thương mại riêng của mayaobongda.vn.`,
    'Shop hỗ trợ tùy chỉnh logo đội, tên đội, sponsor, tên cầu thủ, số áo, màu chi tiết, quần và tất đi kèm. Trước khi sản xuất, đội có thể gửi yêu cầu để được tư vấn và chốt demo.',
    'Chất liệu tư vấn gồm vải mè thể thao, thun lạnh hoặc dòng vải phù hợp nhu cầu thi đấu và tập luyện. Form áo thoáng nhẹ, hỗ trợ size S-5XL và phối size theo danh sách thành viên.',
    'Công nghệ in chuyển nhiệt hoặc decal được chọn theo thiết kế thực tế để logo, họa tiết và số áo lên màu rõ, bền và đồng bộ khi may số lượng đội.',
    'Giá tham khảo từ 125.000đ tùy số lượng, chất vải, yêu cầu in ấn và phụ kiện đi kèm. Đơn đội bóng số lượng lớn sẽ được tư vấn để tối ưu chi phí.',
    'Cách đặt hàng: gửi mẫu áo mong muốn, logo đội, danh sách tên số và size qua hotline 0989 353 247. Shop sẽ tư vấn chất liệu, báo giá, lên demo và xác nhận trước khi may.',
    `Câu hỏi thường gặp: mẫu ${clubName} có đổi màu được không? Có, đội có thể đổi màu, thêm logo riêng, thêm sponsor và điều chỉnh chi tiết để tránh trùng mẫu. Có hỗ trợ in tên số không? Shop hỗ trợ theo chương trình và số lượng thực tế khi tư vấn.`,
  ])
}

const uploadMedia = async ({ tenantId, spec, imagePath, checksum }) => {
  if (!/\.webp$/i.test(imagePath)) throw new Error(`Image must be WebP before upload: ${imagePath}`)
  if (!existsSync(`${imagePath}.approved`)) throw new Error(`Missing approval marker: ${imagePath}.approved`)

  const checksumShort = checksum.slice(0, 12)
  const sourceSystem = spec.sourceSystem || DEFAULT_SOURCE_SYSTEM
  const mediaSourceId = `${spec.sourceId}-webp-${checksumShort}`
  const existing = await findOne('media', {
    'where[tenant.slug][equals]': TENANT_SLUG,
    'where[sourceSystem][equals]': sourceSystem,
    'where[sourceId][equals]': mediaSourceId,
  })
  if (existing) return existing
  if (!apply) return { id: `dry-media-${checksumShort}`, url: imagePath, mimeType: 'image/webp' }

  const buffer = await readFile(imagePath)
  const form = new FormData()
  form.append(
    'file',
    new Blob([buffer], { type: 'image/webp' }),
    `${slugify(spec.productName)}-${checksumShort}.webp`,
  )
  form.append(
    '_payload',
    JSON.stringify({
      tenant: tenantId,
      alt: spec.alt,
      searchTags: rows(['áo bóng đá', 'áo câu lạc bộ', spec.clubName, spec.season, spec.kitType, ...(spec.colors || [])]),
      sourceSystem,
      sourceId: mediaSourceId,
      sourceUrl: spec.sourceUrl,
      sourceChecksum: checksum,
    }),
  )

  return unwrapDoc(await fetchJson('/api/media', {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  }))
}

const updateCategoryCount = async (categoryId) => {
  if (!apply || !Number.isFinite(Number(categoryId))) return null
  const data = await fetchJson(`/api/products?${query({
    'where[tenant.slug][equals]': TENANT_SLUG,
    'where[categories][contains]': categoryId,
    'where[publicationStatus][equals]': 'publish',
    limit: 1,
    depth: 0,
  })}`, { headers: authHeaders() })
  const productCount = Number(data?.totalDocs || 0)
  await patchJson('product-categories', categoryId, { productCount })
  return { categoryId, productCount }
}

const main = async () => {
  const specPath = path.resolve(process.cwd(), inputPath)
  const spec = JSON.parse(await readFile(specPath, 'utf8'))
  if (!spec.sourceId) throw new Error('product.json requires sourceId')
  if (!spec.productName) throw new Error('product.json requires productName')
  if (!spec.imagePath) throw new Error('product.json requires imagePath')
  if (!spec.alt) throw new Error('product.json requires alt')

  const imagePath = path.resolve(path.dirname(specPath), spec.imagePath)
  if (!existsSync(imagePath)) throw new Error(`Image not found: ${imagePath}`)
  if (!/\.webp$/i.test(imagePath)) throw new Error(`Image must be .webp: ${imagePath}`)
  if (!existsSync(`${imagePath}.approved`)) throw new Error(`Missing approval marker: ${imagePath}.approved`)

  const imageBuffer = await readFile(imagePath)
  const checksum = createHash('sha256').update(imageBuffer).digest('hex')
  const sourceSystem = spec.sourceSystem || DEFAULT_SOURCE_SYSTEM
  const slug = spec.slug || slugify(spec.productName)
  const tenant = await findOne('tenants', { 'where[slug][equals]': TENANT_SLUG })
  if (!tenant && apply) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantId = tenant?.id || 'dry-tenant'

  const parent = await ensureCategory(tenantId, {
    name: 'Câu Lạc Bộ',
    slug: 'cau-lac-bo',
    group: 'type',
    description: 'Áo bóng đá câu lạc bộ',
    legacyPath: '/cau-lac-bo/',
    order: 10,
  })

  let seasonCategory = null
  if (spec.season) {
    const seasonSlug = `ao-clb-${slugify(spec.season)}`
    seasonCategory = await ensureCategory(tenantId, {
      name: `Áo câu lạc bộ ${spec.season}`,
      slug: seasonSlug,
      group: 'tag',
      description: `Áo bóng đá câu lạc bộ mùa ${spec.season}`,
      legacyPath: `/cau-lac-bo/${seasonSlug}/`,
      parent: parent.id,
      order: 20,
      sourceId: seasonSlug,
    })
  }

  const media = await uploadMedia({ tenantId, spec: { ...spec, sourceSystem }, imagePath, checksum })
  const categories = [parent.id, seasonCategory?.id].filter((id) => Number.isFinite(Number(id)))
  const productData = {
    tenant: tenantId,
    name: spec.productName,
    slug,
    sku: spec.sku || `MBĐ-${slug.slice(0, 36).toUpperCase()}`,
    sport: 'football',
    productType: 'simple',
    publicationStatus: 'publish',
    featured: Boolean(spec.featured),
    categories,
    price: spec.price || DEFAULT_PRICE,
    regularPrice: spec.regularPrice || 139000,
    salePrice: spec.price || DEFAULT_PRICE,
    compareAtPrice: spec.compareAtPrice || 139000,
    currency: 'VND',
    stockStatus: 'instock',
    isPurchasable: false,
    isOnBackorder: false,
    shortDescription: spec.shortDescription || seoDescription(spec),
    description: spec.description || content(spec),
    attributes: [
      { name: 'Dòng áo', values: [{ value: 'Áo bóng đá câu lạc bộ' }] },
      ...(spec.clubName ? [{ name: 'Câu lạc bộ', values: [{ value: spec.clubName }] }] : []),
      ...(spec.season ? [{ name: 'Mùa giải', values: [{ value: spec.season }] }] : []),
      ...(spec.kitType ? [{ name: 'Phiên bản', values: [{ value: spec.kitType }] }] : []),
      ...(spec.colors?.length ? [{ name: 'Màu sắc', values: spec.colors.map((value) => ({ value })) }] : []),
    ],
    badges: [{ label: 'Đặt may' }, { label: 'In tên số' }],
    searchTags: rows(['áo bóng đá', 'áo câu lạc bộ', 'đặt may áo bóng đá', spec.clubName, spec.season, spec.kitType, ...(spec.colors || [])]),
    seoTitle: spec.seoTitle || `${spec.productName} | MayAoBongDa.vn`,
    metaDescription: (spec.metaDescription || seoDescription(spec)).slice(0, 158),
    legacyPath: `/san-pham/${slug}/`,
    gallery: [media.id],
    sourceSystem,
    sourceId: spec.sourceId,
    sourceUrl: spec.sourceUrl,
    sourceChecksum: checksum,
  }

  const existingProduct = await findOne('products', {
    'where[tenant.slug][equals]': TENANT_SLUG,
    'where[sourceSystem][equals]': sourceSystem,
    'where[sourceId][equals]': spec.sourceId,
  })

  let product
  if (!apply) {
    product = { id: 'dry-product', slug, action: existingProduct ? 'would-update' : 'would-create' }
  } else if (existingProduct) {
    product = await patchJson('products', existingProduct.id, productData)
    product.action = 'updated'
  } else {
    product = await createJson('products', productData)
    product.action = 'created'
  }

  const categoryCounts = []
  for (const categoryId of categories) {
    const count = await updateCategoryCount(categoryId)
    if (count) categoryCounts.push(count)
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: TENANT_SLUG,
    product: {
      id: product.id,
      slug: product.slug || slug,
      action: product.action,
      publicUrl: `https://mayaobongda.vn/san-pham/${product.slug || slug}/`,
    },
    media: {
      id: media.id,
      url: media.url,
      mimeType: media.mimeType || 'image/webp',
      checksum,
    },
    categories,
    categoryCounts,
  }

  const specDir = path.dirname(specPath)
  const summaryDir = existsSync(specDir) && !specDir.startsWith('/dev/fd') ? specDir : process.cwd()
  const summaryPath = path.join(summaryDir, `${slug}.publish-summary.json`)
  await writeFile(summaryPath, JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
