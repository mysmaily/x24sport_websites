import 'dotenv/config'

import { createHash } from 'crypto'
import fs from 'fs'
import sharp from 'sharp'

const CMS_API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const TENANT_SLUG = 'mayaobongda'
const CATEGORY_SLUG = 'ao-bong-da-cong-ty-ngan-hang'
const SOURCE_SYSTEM = 'manual-bank-football-20260801'

type BankConfig = {
  sourceId: string
  sku: string
  slug: string
  name: string
  image: string
  shortDescription: string
  seoTitle: string
  metaDescription: string
  alt: string
  colors: string[]
  styleTags: string[]
  html: string
  paragraphs: string[]
}

const configs: Record<string, BankConfig> = {
  techcombank: {
    sourceId: 'techcombank-football-2026',
    sku: 'X24-MABD-TCB-001',
    slug: 'ao-bong-da-ngan-hang-techcombank',
    name: 'Áo bóng đá ngân hàng Techcombank 2026',
    image: '/Users/hoang/.codex/generated_images/019fbcd2-8064-7842-8603-974fdc3f08cd/call_E1sRn71eJ9GfcEqH9juQaDiH.png',
    shortDescription:
      'Áo bóng đá ngân hàng Techcombank phối trắng đỏ sáng sủa, phù hợp đội bóng nội bộ, giải giao lưu doanh nghiệp và team building thể thao.',
    seoTitle: 'Áo bóng đá ngân hàng Techcombank 2026 | Giá 119k',
    metaDescription:
      'Áo bóng đá ngân hàng Techcombank phối trắng đỏ sáng sủa, giá 119k, giá gốc 159k. Nhận thiết kế logo, tên số, size cho đội nội bộ.',
    alt: 'Áo bóng đá ngân hàng Techcombank phối trắng đỏ sáng sủa cho đội bóng nội bộ',
    colors: ['Trắng', 'Đỏ Techcombank', 'Đen nhấn chữ'],
    styleTags: ['Áo bóng đá ngân hàng', 'Sáng sủa hiện đại', 'Đồng phục doanh nghiệp'],
    paragraphs: [
      'Áo bóng đá ngân hàng Techcombank phối trắng đỏ sáng sủa, phù hợp đội bóng nội bộ, giải giao lưu doanh nghiệp và hoạt động thể thao của ngân hàng.',
      'Mẫu có thể tùy chỉnh logo, tên đội, tên cầu thủ, số áo, kiểu cổ và size theo danh sách thành viên trước khi đặt may.',
      'Thiết kế ưu tiên cảm giác sạch, sáng sân và dễ triển khai cho nhiều phòng ban hoặc nhiều đội trong cùng một chương trình.',
    ],
    html: `<h2>Áo bóng đá ngân hàng Techcombank phong cách sáng sủa, hiện đại</h2><p>Mẫu áo bóng đá ngân hàng Techcombank được thiết kế theo hướng sáng, sạch và dễ nhận diện cho đội bóng nội bộ, giải giao lưu doanh nghiệp và các hoạt động thể thao của ngân hàng. Tông trắng chủ đạo kết hợp đỏ Techcombank giúp bộ áo nổi bật mà vẫn chỉn chu.</p><h3>Điểm nổi bật của mẫu áo</h3><ul><li>Phối trắng và đỏ Techcombank, phù hợp hình ảnh chuyên nghiệp, trẻ trung.</li><li>Họa tiết hình thoi lấy cảm hứng từ nhận diện Techcombank, xử lý nhẹ để áo thoáng và sáng sân.</li><li>Có thể in logo đơn vị, tên cầu thủ, số áo, tên đội hoặc phòng ban theo danh sách.</li><li>Phù hợp đặt may cho giải nội bộ, team building, giao lưu khách hàng và giải bóng đá liên ngân hàng.</li></ul><h3>Tùy chỉnh khi đặt may</h3><p>Đội có thể điều chỉnh cổ áo, sắc độ đỏ, vị trí logo, tên đội, tên cá nhân và số áo. Khi cần bám sát bộ nhận diện thương hiệu, hãy gửi logo, mã màu hoặc mẫu tham khảo để được tư vấn phương án trước khi sản xuất.</p><h3>Giá tham khảo</h3><p>Giá ưu đãi 119.000đ, giá gốc 159.000đ. Mức giá có thể thay đổi theo số lượng, chất liệu vải, kiểu cổ áo và yêu cầu in ấn thực tế.</p>`,
  },
}

const bank = process.env.BANK || 'techcombank'
const config = configs[bank]
if (!config) throw new Error(`Unsupported BANK=${bank}`)

const rows = (values: string[]) => values.map((value) => ({ value }))

const lexical = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '',
    direction: null,
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '',
      direction: null,
      indent: 0,
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
  },
})

async function api<T>(token: string, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('authorization', `JWT ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  const response = await fetch(`${CMS_API_URL}${path}`, { ...init, headers })
  const text = await response.text()
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${path} ${response.status}: ${text.slice(0, 500)}`)
  return (text ? JSON.parse(text) : {}) as T
}

async function login() {
  const response = await fetch(`${CMS_API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: process.env.CMS_ADMIN_EMAIL,
      password: process.env.CMS_ADMIN_PASSWORD,
    }),
  })
  if (!response.ok) throw new Error(`login ${response.status}`)
  return ((await response.json()) as { token: string }).token
}

async function first(token: string, collection: string, params: URLSearchParams) {
  const result = await api<{ docs?: Record<string, any>[] }>(token, `/api/${collection}?${params}`)
  return result.docs?.[0] || null
}

const doc = (value: any) => value.doc || value

async function main() {
  const token = await login()
  const tenant = await first(token, 'tenants', new URLSearchParams({ 'where[slug][equals]': TENANT_SLUG, limit: '1', depth: '0' }))
  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantID = Number(tenant.id)

  const image = await sharp(fs.readFileSync(config.image))
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 92 })
    .toBuffer()
  const checksum = createHash('sha256').update(image).digest('hex')

  const category = await first(token, 'product-categories', new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][slug][equals]': CATEGORY_SLUG,
    limit: '1',
    depth: '0',
  }))
  if (!category) throw new Error(`Category ${CATEGORY_SLUG} not found`)

  const existingProduct = await first(token, 'products', new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
    'where[and][1][or][0][and][1][sourceId][equals]': config.sourceId,
    'where[and][1][or][1][sku][equals]': config.sku,
    'where[and][1][or][2][slug][equals]': config.slug,
    limit: '1',
    depth: '1',
  }))

  let media = await first(token, 'media', new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
    'where[and][1][or][0][and][1][sourceId][equals]': `${config.sourceId}-hero`,
    'where[and][1][or][1][sourceChecksum][equals]': checksum,
    limit: '1',
    depth: '0',
  }))

  if (!media) {
    const form = new FormData()
    form.set('_payload', JSON.stringify({
      tenant: tenantID,
      alt: config.alt,
      searchTags: rows(['áo bóng đá ngân hàng', config.name.replace('Áo bóng đá ngân hàng ', '').replace(' 2026', ''), 'áo bóng đá công ty', ...config.colors]),
      sourceSystem: SOURCE_SYSTEM,
      sourceId: `${config.sourceId}-hero`,
      sourceChecksum: checksum,
    }))
    form.set('file', new File([image], `${config.slug}.webp`, { type: 'image/webp' }))
    media = doc(await api(token, '/api/media', { method: 'POST', body: form }))
  }

  const productData = {
    tenant: tenantID,
    name: config.name,
    slug: config.slug,
    sku: config.sku,
    sport: 'football',
    productType: 'simple',
    publicationStatus: 'publish',
    featured: true,
    categories: [Number(category.id)],
    price: 119000,
    regularPrice: 159000,
    salePrice: 119000,
    compareAtPrice: 159000,
    currency: 'VND',
    stockStatus: 'instock',
    isPurchasable: false,
    isOnBackorder: false,
    shortDescription: config.shortDescription,
    description: lexical(config.paragraphs),
    contentHtml: config.html,
    attributes: [
      { name: 'Màu chủ đạo', values: rows(config.colors) },
      { name: 'Phong cách', values: rows(config.styleTags) },
      { name: 'Tùy chỉnh', values: rows(['Logo đơn vị', 'Tên cầu thủ', 'Số áo', 'Kiểu cổ áo']) },
      { name: 'Phù hợp', values: rows(['Giải nội bộ', 'Giao lưu liên ngân hàng', 'Team building thể thao']) },
    ],
    badges: [{ label: 'Ngân hàng' }, { label: 'Thiết kế riêng' }],
    searchTags: rows(['áo bóng đá ngân hàng', `áo bóng đá ${config.name.replace('Áo bóng đá ngân hàng ', '').replace(' 2026', '')}`, 'áo bóng đá công ty', 'đồng phục bóng đá doanh nghiệp', 'may áo bóng đá ngân hàng']),
    gallery: [Number(media.id)],
    seoTitle: config.seoTitle,
    metaDescription: config.metaDescription,
    legacyPath: `/${config.slug}/`,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: config.sourceId,
    sourceChecksum: checksum,
    sourceCreatedAt: new Date().toISOString(),
    sourceModifiedAt: new Date().toISOString(),
  }

  const product = existingProduct
    ? doc(await api(token, `/api/products/${existingProduct.id}`, { method: 'PATCH', body: JSON.stringify(productData) }))
    : doc(await api(token, '/api/products', { method: 'POST', body: JSON.stringify(productData) }))

  const count = await api<{ totalDocs: number }>(token, `/api/products?${new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][publicationStatus][equals]': 'publish',
    'where[and][2][categories][equals]': String(category.id),
    limit: '1',
    depth: '0',
  })}`)
  await api(token, `/api/product-categories/${category.id}`, { method: 'PATCH', body: JSON.stringify({ productCount: count.totalDocs }) })

  console.log(JSON.stringify({
    tenant: { id: tenantID, slug: TENANT_SLUG },
    category: { id: category.id, productCount: count.totalDocs },
    media: { id: media.id, url: media.url },
    product: { id: product.id, url: `https://mayaobongda.vn/${config.slug}/`, sku: config.sku },
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
