import 'dotenv/config'

import { createHash } from 'crypto'
import fs from 'fs'
import sharp from 'sharp'

const TENANT_SLUG = 'mayaobongda'
const CMS_API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const SOURCE_SYSTEM = 'manual-bank-football-20260801'
const SOURCE_ID = 'vietcombank-football-2026'
const SKU = 'X24-MABD-VCB-001'
const CATEGORY_SLUG = 'ao-bong-da-cong-ty-ngan-hang'
const PRODUCT_SLUG = 'ao-bong-da-ngan-hang-vietcombank'
const CATEGORY_PATH = '/ao-bong-da-cong-ty-ngan-hang/'
const PRODUCT_PATH = `/${PRODUCT_SLUG}/`
const IMAGE_PATH =
  process.env.VIETCOMBANK_FOOTBALL_IMAGE ||
  '/Users/hoang/.codex/generated_images/019fbcd2-8064-7842-8603-974fdc3f08cd/call_c1srqtFIJ86ZiO9w0SsKldhn.png'

const apply = process.argv.includes('--apply')
const adminEmail = process.env.CMS_ADMIN_EMAIL
const adminPassword = process.env.CMS_ADMIN_PASSWORD

const rows = (values: string[]) => values.map((value) => ({ value }))

type Doc = Record<string, any>
type Paginated<T extends Doc> = { docs: T[]; totalDocs: number }

const lexicalParagraphs = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    direction: null,
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      direction: null,
      indent: 0,
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
  },
})

const seoHtml = `
<h2>Áo bóng đá ngân hàng Vietcombank thiết kế theo nhận diện thương hiệu</h2>
<p>Mẫu áo bóng đá ngân hàng Vietcombank được phát triển cho các đội bóng nội bộ, giải giao lưu doanh nghiệp và hoạt động thể thao gắn kết nhân sự. Thiết kế sử dụng xanh lá làm màu chủ đạo, phối trắng và xanh đậm để giữ cảm giác chuyên nghiệp nhưng vẫn nổi bật khi ra sân.</p>
<h3>Điểm nổi bật của mẫu áo</h3>
<ul>
  <li>Phối màu xanh Vietcombank, trắng và xanh đậm, phù hợp tinh thần ngân hàng hiện đại.</li>
  <li>Form áo bóng đá tay ngắn, dễ vận động trong sân 5, sân 7 và sân 11.</li>
  <li>Có thể in logo đơn vị, tên cầu thủ, số áo, tên đội hoặc phòng ban theo danh sách.</li>
  <li>Phù hợp đặt may cho giải nội bộ, team building thể thao, giao lưu khách hàng và giải liên ngân hàng.</li>
</ul>
<h3>Tùy chỉnh khi đặt may</h3>
<p>Đội có thể điều chỉnh cổ áo, màu phụ, vị trí logo, tên đội, tên cá nhân và số áo. Khi cần đồng bộ với bộ nhận diện thương hiệu, hãy gửi logo, mã màu hoặc mẫu tham khảo để đội ngũ tư vấn lên phương án rõ ràng trước khi sản xuất.</p>
<h3>Giá tham khảo</h3>
<p>Giá ưu đãi 119.000đ, giá gốc 159.000đ. Mức giá có thể thay đổi theo số lượng, chất liệu vải, kiểu cổ áo và yêu cầu in ấn thực tế.</p>
`.trim()

const productDescription = [
  'Áo bóng đá ngân hàng Vietcombank phối xanh lá, trắng và xanh đậm, phù hợp đội bóng nội bộ, giải giao lưu doanh nghiệp và sự kiện thể thao của ngân hàng.',
  'Mẫu có thể tùy chỉnh logo, tên đội, tên cầu thủ, số áo, kiểu cổ và size theo danh sách thành viên trước khi đặt may.',
  'Thiết kế ưu tiên cảm giác chỉn chu, nhận diện rõ trên sân và dễ triển khai cho nhiều phòng ban hoặc nhiều đội trong cùng một chương trình.',
]

const categoryDescription =
  'Danh mục áo bóng đá ngân hàng dành cho đội bóng nội bộ, giải giao lưu và team building thể thao. Các mẫu có thể phối theo màu nhận diện, thêm logo, in tên số và điều chỉnh theo yêu cầu từng đơn vị.'

async function imageBuffer() {
  const source = fs.readFileSync(IMAGE_PATH)
  return sharp(source)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 92 })
    .toBuffer()
}

function sha256(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function login() {
  if (!adminEmail || !adminPassword) throw new Error('CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD are required')
  const response = await fetch(`${CMS_API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  })
  if (!response.ok) throw new Error(`Login failed: ${response.status}`)
  const data = (await response.json()) as { token?: string }
  if (!data.token) throw new Error('Login response did not include a token')
  return data.token
}

async function api<T>(token: string, route: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('authorization', `JWT ${token}`)
  if (init?.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  const response = await fetch(`${CMS_API_URL}${route}`, { ...init, headers })
  const text = await response.text()
  if (!response.ok) throw new Error(`CMS ${init?.method || 'GET'} ${route} failed: ${response.status} ${text.slice(0, 500)}`)
  return (text ? JSON.parse(text) : {}) as T
}

async function firstDoc<T extends Doc>(token: string, collection: string, params: URLSearchParams) {
  params.set('limit', params.get('limit') || '1')
  const result = await api<Paginated<T>>(token, `/api/${collection}?${params}`)
  return result.docs[0] ?? null
}

function docFrom<T extends Doc>(response: T | { doc?: T }) {
  return 'doc' in response && response.doc ? response.doc : (response as T)
}

async function main() {
  const token = await login()
  const tenantParams = new URLSearchParams({
    'where[slug][equals]': TENANT_SLUG,
    depth: '0',
    limit: '1',
  })
  const tenant = await firstDoc<Doc>(token, 'tenants', tenantParams)

  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)

  const tenantID = Number(tenant.id)
  const hero = await imageBuffer()
  const checksum = sha256(hero)

  const categoryData = {
    tenant: tenantID,
    name: 'Áo bóng đá Ngân Hàng',
    slug: CATEGORY_SLUG,
    group: 'type' as const,
    description: categoryDescription,
    legacyPath: CATEGORY_PATH,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: 'bank-football-category',
    sourceChecksum: checksum,
    order: 18,
  }

  const categoryParams = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][slug][equals]': CATEGORY_SLUG,
    depth: '0',
    limit: '1',
  })
  const existingCategory = await firstDoc<Doc>(token, 'product-categories', categoryParams)

  const productParams = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
    'where[and][1][or][0][and][1][sourceId][equals]': SOURCE_ID,
    'where[and][1][or][1][sku][equals]': SKU,
    'where[and][1][or][2][slug][equals]': PRODUCT_SLUG,
    depth: '1',
    limit: '1',
  })
  const existingProduct = await firstDoc<Doc>(token, 'products', productParams)

  const mediaParams = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
    'where[and][1][or][0][and][1][sourceId][equals]': `${SOURCE_ID}-hero`,
    'where[and][1][or][1][sourceChecksum][equals]': checksum,
    depth: '0',
    limit: '1',
  })
  const existingMedia = await firstDoc<Doc>(token, 'media', mediaParams)

  const plan = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    category: existingCategory ? { action: 'update', id: existingCategory.id } : { action: 'create' },
    media: existingMedia ? { action: 'reuse', id: existingMedia.id } : { action: 'create' },
    product: existingProduct ? { action: 'update', id: existingProduct.id } : { action: 'create' },
    productUrl: `https://mayaobongda.vn${PRODUCT_PATH}`,
    categoryUrl: `https://mayaobongda.vn${CATEGORY_PATH}`,
    sku: SKU,
    imageChecksum: checksum,
  }

  if (!apply) {
    console.log(JSON.stringify(plan, null, 2))
    return
  }

  const category = existingCategory
    ? docFrom<Doc>(
        await api(token, `/api/product-categories/${existingCategory.id}`, {
          method: 'PATCH',
          body: JSON.stringify(categoryData),
        }),
      )
    : docFrom<Doc>(
        await api(token, '/api/product-categories', {
          method: 'POST',
          body: JSON.stringify(categoryData),
        }),
      )

  const media =
    existingMedia ||
    docFrom<Doc>(
      await api(token, '/api/media', {
        method: 'POST',
        body: (() => {
          const form = new FormData()
          form.set(
            '_payload',
            JSON.stringify({
              tenant: tenantID,
              alt: 'Áo bóng đá ngân hàng Vietcombank phối xanh lá trắng cho đội bóng nội bộ',
              searchTags: rows([
                'áo bóng đá ngân hàng',
                'Vietcombank',
                'áo bóng đá công ty',
                'xanh lá',
                'trắng',
                'đồng phục bóng đá doanh nghiệp',
              ]),
              sourceSystem: SOURCE_SYSTEM,
              sourceId: `${SOURCE_ID}-hero`,
              sourceChecksum: checksum,
            }),
          )
          form.set('file', new File([hero], `${PRODUCT_SLUG}.webp`, { type: 'image/webp' }))
          return form
        })(),
      }),
    )

  const productData = {
    tenant: tenantID,
    name: 'Áo bóng đá ngân hàng Vietcombank 2026',
    slug: PRODUCT_SLUG,
    sku: SKU,
    sport: 'football' as const,
    productType: 'simple' as const,
    publicationStatus: 'publish' as const,
    featured: true,
    categories: [Number(category.id)],
    price: 119000,
    regularPrice: 159000,
    salePrice: 119000,
    compareAtPrice: 159000,
    currency: 'VND',
    stockStatus: 'instock' as const,
    isPurchasable: false,
    isOnBackorder: false,
    shortDescription:
      'Áo bóng đá ngân hàng Vietcombank phối xanh lá, trắng và xanh đậm, phù hợp đội bóng nội bộ, giải giao lưu doanh nghiệp và team building thể thao.',
    description: lexicalParagraphs(productDescription),
    contentHtml: seoHtml,
    attributes: [
      { name: 'Màu chủ đạo', values: rows(['Xanh lá Vietcombank', 'Trắng', 'Xanh đậm']) },
      { name: 'Phong cách', values: rows(['Áo bóng đá ngân hàng', 'Đồng phục doanh nghiệp']) },
      { name: 'Tùy chỉnh', values: rows(['Logo đơn vị', 'Tên cầu thủ', 'Số áo', 'Kiểu cổ áo']) },
      { name: 'Phù hợp', values: rows(['Giải nội bộ', 'Giao lưu liên ngân hàng', 'Team building thể thao']) },
    ],
    badges: [{ label: 'Ngân hàng' }, { label: 'Thiết kế riêng' }],
    searchTags: rows([
      'áo bóng đá ngân hàng',
      'áo bóng đá Vietcombank',
      'áo bóng đá công ty',
      'đồng phục bóng đá doanh nghiệp',
      'áo bóng đá xanh lá',
      'may áo bóng đá ngân hàng',
    ]),
    gallery: [Number(media.id)],
    seoTitle: 'Áo bóng đá ngân hàng Vietcombank 2026 | Giá 119k',
    metaDescription:
      'Áo bóng đá ngân hàng Vietcombank phối xanh lá trắng, giá 119k, giá gốc 159k. Nhận thiết kế logo, tên số, size cho đội bóng nội bộ.',
    legacyPath: PRODUCT_PATH,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: SOURCE_ID,
    sourceChecksum: checksum,
    sourceCreatedAt: new Date().toISOString(),
    sourceModifiedAt: new Date().toISOString(),
  }

  const product = existingProduct
    ? docFrom<Doc>(
        await api(token, `/api/products/${existingProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(productData),
        }),
      )
    : docFrom<Doc>(
        await api(token, '/api/products', {
          method: 'POST',
          body: JSON.stringify(productData),
        }),
      )

  const countParams = new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][publicationStatus][equals]': 'publish',
    'where[and][2][categories][equals]': String(category.id),
    depth: '0',
    limit: '1',
  })
  const categoryProductCount = await api<Paginated<Doc>>(token, `/api/products?${countParams}`)

  await api(token, `/api/product-categories/${category.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ productCount: categoryProductCount.totalDocs }),
  })

  console.log(
    JSON.stringify(
      {
        ...plan,
        category: { action: existingCategory ? 'updated' : 'created', id: category.id, productCount: categoryProductCount.totalDocs },
        media: { action: existingMedia ? 'reused' : 'created', id: media.id, url: (media as { url?: string }).url },
        product: { action: existingProduct ? 'updated' : 'created', id: product.id },
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
