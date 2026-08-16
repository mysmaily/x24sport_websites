import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const apply = process.argv.includes('--apply')
const apiBase = `${(process.env.CMS_API_URL || 'https://cms.x24sport.vn').replace(/\/$/, '')}/api`
const tenantSlug = process.env.TENANT_SLUG || 'mayaodongphuc'
const apiKey = process.env.PAYLOAD_API_KEY
const sourceSystem = 'mayaodongphuc-v2-launch'
const workspace = process.cwd()

if (!apiKey) throw new Error('PAYLOAD_API_KEY is required.')
if (tenantSlug !== 'mayaodongphuc') throw new Error(`Unexpected TENANT_SLUG: ${tenantSlug}`)

const headers = { Authorization: `users API-Key ${apiKey}` }
const categories = [
  { sourceId: 'category:business', name: 'Đồng phục doanh nghiệp', slug: 'dong-phuc-doanh-nghiep', description: 'Polo, sơ mi và áo khoác được cấu hình theo môi trường làm việc và nhận diện doanh nghiệp.', order: 10 },
  { sourceId: 'category:fnb', name: 'Đồng phục F&B', slug: 'dong-phuc-fnb', description: 'Trang phục theo vai trò cho quán cà phê, nhà hàng, bếp và dịch vụ lưu trú.', order: 20 },
  { sourceId: 'category:school', name: 'Đồng phục trường học', slug: 'dong-phuc-truong-hoc', description: 'Giải pháp đồng bộ cho học sinh, giáo viên, câu lạc bộ và hoạt động tập thể.', order: 30 },
  { sourceId: 'category:workwear', name: 'Đồng phục bảo hộ', slug: 'dong-phuc-bao-ho', description: 'Phom thực dụng cho kỹ thuật, vận hành và môi trường làm việc cần độ bền.', order: 40 },
  { sourceId: 'category:service', name: 'Y tế & dịch vụ', slug: 'dong-phuc-y-te-dich-vu', description: 'Form gọn, dễ vận động cho phòng khám, spa và đội ngũ dịch vụ.', order: 50 },
  { sourceId: 'category:event', name: 'Sự kiện & đội nhóm', slug: 'dong-phuc-su-kien-doi-nhom', description: 'Áo nhận diện cho chiến dịch, chương trình, cộng đồng và hoạt động nội bộ.', order: 60 },
]

const products = [
  { sourceId: 'product:polo-atelier-01', slug: 'polo-doanh-nghiep-atelier-01', name: 'Polo doanh nghiệp Atelier 01', sku: 'MDP-PL-001', category: 'category:business', image: 'polo-navy.webp', material: 'Polo dệt mắt nhỏ', short: 'Mẫu polo khởi đầu cho đội ngũ doanh nghiệp cần hình ảnh gọn gàng và nhận diện tiết chế.', badge: 'Mẫu chủ đạo' },
  { sourceId: 'product:fnb-clay-02', slug: 'set-dong-phuc-fnb-clay-02', name: 'Set đồng phục F&B Clay 02', sku: 'MDP-FB-002', category: 'category:fnb', image: 'fnb-apron.webp', material: 'Cotton phối canvas', short: 'Set áo và tạp dề để cấu hình theo vai trò phục vụ, quầy bar hoặc khu vực bếp.', badge: 'Phối theo vai trò' },
  { sourceId: 'product:field-03', slug: 'ao-bao-ho-field-03', name: 'Áo bảo hộ Field 03', sku: 'MDP-BH-003', category: 'category:workwear', image: 'workwear-olive.webp', material: 'Ripstop bền mặt', short: 'Mẫu áo vận hành có cấu trúc rõ, phù hợp phát triển hệ túi và đường phối nhận diện.' },
  { sourceId: 'product:line-04', slug: 'so-mi-cong-so-line-04', name: 'Sơ mi công sở Line 04', sku: 'MDP-SM-004', category: 'category:business', image: 'office-shirt.webp', material: 'Poplin bề mặt mịn', short: 'Sơ mi công sở tối giản để điều chỉnh màu, cổ áo và vị trí logo theo thương hiệu.' },
  { sourceId: 'product:sage-05', slug: 'ao-dich-vu-sage-05', name: 'Áo dịch vụ Sage 05', sku: 'MDP-DV-005', category: 'category:service', image: 'healthcare-tunic.webp', material: 'Vải co giãn nhẹ', short: 'Mẫu áo dịch vụ có phom gọn và khoảng vận động phù hợp với công việc thường xuyên di chuyển.', badge: 'Form mới' },
  { sourceId: 'product:signal-06', slug: 'ao-su-kien-signal-06', name: 'Áo sự kiện Signal 06', sku: 'MDP-SK-006', category: 'category:event', image: 'event-tee.webp', material: 'Cotton jersey', short: 'Áo sự kiện làm nền cho màu chiến dịch, logo và thông điệp nhận diện của đội nhóm.' },
]

function query(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => search.set(key, String(value)))
  return search.toString()
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${apiBase}${endpoint}`, { ...options, headers: { ...headers, ...(options.headers || {}) } })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${endpoint} returned ${response.status}: ${JSON.stringify(payload)}`)
  return payload.doc || payload
}

async function findOne(collection, extra) {
  const params = {
    'where[tenant.slug][equals]': tenantSlug,
    limit: 1,
    depth: 0,
    ...extra,
  }
  const result = await request(`/${collection}?${query(params)}`)
  return result.docs?.[0]
}

async function upsert(collection, identity, data) {
  const existing = await findOne(collection, identity)
  if (!apply) return { id: existing?.id, action: existing ? 'update' : 'create' }
  const method = existing ? 'PATCH' : 'POST'
  const endpoint = existing ? `/${collection}/${existing.id}` : `/${collection}`
  const doc = await request(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  return { id: doc.id, action: existing ? 'updated' : 'created' }
}

async function uploadMedia(tenantId, item) {
  const identity = {
    'where[sourceSystem][equals]': sourceSystem,
    'where[sourceId][equals]': `media:${item.sourceId}`,
  }
  const existing = await findOne('media', identity)
  if (existing) return { id: existing.id, action: 'reuse', url: existing.url }
  if (!apply) return { action: 'create' }

  const filePath = path.join(workspace, 'cms-frontend/public/images/mayaodongphuc', item.image)
  const bytes = await readFile(filePath)
  const checksum = createHash('sha256').update(bytes).digest('hex')
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'image/webp' }), item.image)
  form.append('_payload', JSON.stringify({
    tenant: tenantId,
    alt: `${item.name} — mẫu đồng phục để cấu hình theo nhận diện`,
    sourceSystem,
    sourceId: `media:${item.sourceId}`,
    sourceChecksum: checksum,
    searchTags: [{ value: 'đồng phục' }, { value: item.material.toLowerCase() }],
  }))
  const doc = await request('/media', { method: 'POST', body: form })
  return { id: doc.id, action: 'created', url: doc.url }
}

async function main() {
  const tenantResult = await request(`/tenants?${query({ 'where[slug][equals]': tenantSlug, limit: 1, depth: 0 })}`)
  const tenant = tenantResult.docs?.[0]
  if (!tenant) throw new Error(`Tenant ${tenantSlug} was not found.`)

  const categoryResults = []
  const categoryIds = new Map()
  for (const category of categories) {
    const result = await upsert('product-categories', {
      'where[sourceSystem][equals]': sourceSystem,
      'where[sourceId][equals]': category.sourceId,
    }, {
      tenant: tenant.id,
      name: category.name,
      slug: category.slug,
      group: 'audience',
      description: category.description,
      legacyPath: `/danh-muc/${category.slug}/`,
      sourceSystem,
      sourceId: category.sourceId,
      order: category.order,
      productCount: 0,
    })
    categoryResults.push({ slug: category.slug, action: result.action })
    if (result.id) categoryIds.set(category.sourceId, result.id)
  }

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', tenant: tenantSlug, categories: categoryResults, products: products.map((product) => ({ slug: product.slug, action: 'inspect-on-apply', media: product.image })) }, null, 2))
    return
  }

  const productResults = []
  for (const product of products) {
    const categoryId = categoryIds.get(product.category)
    if (!categoryId) throw new Error(`Missing category ID for ${product.category}`)
    const media = await uploadMedia(tenant.id, product)
    if (!media.id) throw new Error(`Media was not created for ${product.slug}`)
    const contentHtml = `<p>${product.short}</p><h2>Cấu hình theo nhu cầu thực tế</h2><p>Màu sắc, vị trí logo, hệ size và các chi tiết nhận diện được xác nhận theo bối cảnh sử dụng và số lượng của từng tổ chức.</p><h2>Thông tin cần chuẩn bị</h2><ul><li>Số lượng và nhóm người mặc.</li><li>Màu nhận diện hoặc logo hiện có.</li><li>Vai trò, môi trường và tần suất sử dụng.</li><li>Mốc thời gian dự kiến.</li></ul>`
    const result = await upsert('products', {
      'where[sourceSystem][equals]': sourceSystem,
      'where[sourceId][equals]': product.sourceId,
    }, {
      tenant: tenant.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      sport: 'other',
      productType: 'simple',
      publicationStatus: 'publish',
      featured: product.sourceId === 'product:polo-atelier-01',
      categories: [categoryId],
      price: null,
      currency: 'VND',
      stockStatus: 'instock',
      isPurchasable: false,
      shortDescription: product.short,
      attributes: [
        { name: 'Chất liệu gợi ý', values: [{ value: product.material }] },
        { name: 'Hình thức', values: [{ value: 'Cấu hình theo yêu cầu' }] },
      ],
      badges: product.badge ? [{ label: product.badge }] : [],
      searchTags: [{ value: 'đồng phục' }, { value: product.material.toLowerCase() }],
      gallery: [media.id],
      seoTitle: `${product.name} | May Áo Đồng Phục`,
      metaDescription: `${product.short} Xem hình ảnh và gửi yêu cầu cấu hình theo nhận diện tổ chức.`,
      legacyPath: `/san-pham/${product.slug}/`,
      contentHtml,
      sourceSystem,
      sourceId: product.sourceId,
    })
    productResults.push({ slug: product.slug, action: result.action, media: media.action })
  }

  for (const category of categories) {
    const categoryId = categoryIds.get(category.sourceId)
    const countResult = await request(`/products?${query({
      'where[tenant.slug][equals]': tenantSlug,
      'where[publicationStatus][equals]': 'publish',
      'where[categories][contains]': categoryId,
      limit: 0,
      depth: 0,
    })}`)
    await request(`/product-categories/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productCount: countResult.totalDocs || 0 }),
    })
  }

  const [categoryCheck, productCheck, mediaCheck] = await Promise.all([
    request(`/product-categories?${query({ 'where[tenant.slug][equals]': tenantSlug, 'where[sourceSystem][equals]': sourceSystem, limit: 100, depth: 0 })}`),
    request(`/products?${query({ 'where[tenant.slug][equals]': tenantSlug, 'where[sourceSystem][equals]': sourceSystem, limit: 100, depth: 1 })}`),
    request(`/media?${query({ 'where[tenant.slug][equals]': tenantSlug, 'where[sourceSystem][equals]': sourceSystem, limit: 100, depth: 0 })}`),
  ])
  console.log(JSON.stringify({
    mode: 'apply',
    tenant: tenantSlug,
    categories: categoryCheck.totalDocs,
    products: productCheck.totalDocs,
    media: mediaCheck.totalDocs,
    productResults,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
