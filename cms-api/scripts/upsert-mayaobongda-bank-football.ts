import 'dotenv/config'

import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const CMS_API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const TENANT_SLUG = 'mayaobongda'
const CATEGORY_SLUG = 'ao-bong-da-cong-ty-ngan-hang'
const CATEGORY_PATH = '/ao-bong-da-cong-ty-ngan-hang/'
const SOURCE_SYSTEM = 'manual-bank-football-20260801'
const OUTPUT_DIR = process.env.BANK_IMAGE_DIR
  ? path.resolve(process.env.BANK_IMAGE_DIR)
  : path.resolve('../mayaobongda.vn/imagegen/outputs')

const apply = process.argv.includes('--apply')
const only = process.env.BANKS?.split(',').map((value) => value.trim()).filter(Boolean)

type Doc = Record<string, any>
type Paginated<T extends Doc> = { docs: T[]; totalDocs: number }
type BankConfig = {
  code: string
  bank: string
  display: string
  slug: string
  sku: string
  image: string
  colors: string[]
  tone: string
  accents: string
}

type BankTuple = [string, string, string, string, string, string[], string, string]

const bankTuples: BankTuple[] = [
  ['VCB', 'Vietcombank', 'Vietcombank', 'vietcombank', 'ao-bong-da-ngan-hang-vietcombank-2026.png', ['Xanh lá Vietcombank', 'Trắng', 'Xanh đậm'], 'chỉn chu, nhận diện rõ và chuyên nghiệp', 'phối xanh lá - trắng nổi bật trên sân'],
  ['MB', 'MB Bank', 'MB Bank', 'mb-bank', 'ao-bong-da-ngan-hang-mb-bank-2026.png', ['Xanh MB', 'Trắng', 'Đỏ nhấn'], 'mạnh mẽ, hiện đại và tin cậy', 'phối xanh thương hiệu kết hợp chi tiết đỏ năng động'],
  ['TCB', 'Techcombank', 'Techcombank', 'techcombank', 'ao-bong-da-ngan-hang-techcombank-2026.png', ['Trắng', 'Đỏ Techcombank', 'Đen nhấn chữ'], 'sáng sủa, trẻ trung và hiện đại', 'phối trắng đỏ sạch, dễ nổi bật trong ảnh đội'],
  ['MBV', 'MBV', 'MBV - Ngân hàng Việt Nam Hiện Đại', 'mbv-modern-bank-vietnam', 'ao-bong-da-ngan-hang-mbv-modern-bank-vietnam-2026.png', ['Đỏ MBV', 'Vàng sao', 'Trắng'], 'hiện đại, kết nối và giàu năng lượng', 'phối đỏ vàng theo tinh thần ngân hàng Việt Nam hiện đại'],
  ['BIDV', 'BIDV', 'BIDV', 'bidv', 'ao-bong-da-ngan-hang-bidv-2026.png', ['Xanh BIDV', 'Trắng', 'Vàng nhấn'], 'uy tín, mạnh mẽ và ổn định', 'phối xanh - vàng dễ nhận diện cho đội bóng nội bộ'],
  ['CTG', 'VietinBank', 'VietinBank', 'vietinbank', 'ao-bong-da-ngan-hang-vietinbank-2026.png', ['Xanh VietinBank', 'Đỏ nhấn', 'Trắng'], 'chuyên nghiệp, chắc chắn và thể thao', 'phối xanh đỏ cân bằng, hợp giải giao lưu liên ngân hàng'],
  ['AGR', 'Agribank', 'Agribank', 'agribank', 'ao-bong-da-ngan-hang-agribank-2026.png', ['Đỏ bordeaux', 'Trắng', 'Vàng nhấn'], 'truyền thống, bền bỉ và nổi bật', 'tông đỏ bordeaux sang, dễ đồng bộ hình ảnh tập thể'],
  ['VPB', 'VPBank', 'VPBank', 'vpbank', 'ao-bong-da-ngan-hang-vpbank-2026.png', ['Xanh VPBank', 'Đỏ nhấn', 'Trắng'], 'tươi mới, năng động và hiện đại', 'phối xanh đỏ sáng phù hợp team trẻ'],
  ['ACB', 'ACB', 'ACB', 'acb', 'ao-bong-da-ngan-hang-acb-2026.png', ['Xanh ACB', 'Cyan', 'Trắng'], 'sạch, tin cậy và công nghệ', 'phối xanh dương - cyan mát mắt'],
  ['SHB', 'SHB', 'SHB', 'shb', 'ao-bong-da-ngan-hang-shb-2026.png', ['Cam SHB', 'Xanh navy', 'Trắng'], 'năng lượng, nổi bật và chuyên nghiệp', 'cam - navy tạo độ nhận diện mạnh'],
  ['HDB', 'HDBank', 'HDBank', 'hdbank', 'ao-bong-da-ngan-hang-hdbank-2026.png', ['Đỏ HDBank', 'Vàng', 'Trắng'], 'ấm áp, nổi bật và dễ bán', 'phối đỏ vàng rực rỡ cho sự kiện đông người'],
  ['STB', 'Sacombank', 'Sacombank', 'sacombank', 'ao-bong-da-ngan-hang-sacombank-2026.png', ['Xanh Sacombank', 'Đỏ nhấn', 'Trắng'], 'chắc chắn, gọn gàng và chuyên nghiệp', 'tông xanh trắng dễ mặc, thêm viền đỏ thể thao'],
  ['TPB', 'TPBank', 'TPBank', 'tpbank', 'ao-bong-da-ngan-hang-tpbank-2026.png', ['Tím TPBank', 'Cam', 'Trắng'], 'trẻ trung, số hóa và sáng sân', 'phối tím cam hiện đại, hợp đội bóng công nghệ'],
  ['VIB', 'VIB', 'VIB', 'vib', 'ao-bong-da-ngan-hang-vib-2026.png', ['Xanh VIB', 'Cam', 'Trắng'], 'sáng, thân thiện và thể thao', 'xanh dương - cam tạo cảm giác khỏe khoắn'],
  ['MSB', 'MSB', 'MSB', 'msb', 'ao-bong-da-ngan-hang-msb-2026.png', ['Cam MSB', 'Charcoal', 'Trắng'], 'sắc nét, hiện đại và khác biệt', 'cam - charcoal cho phong cách mạnh và mới'],
  ['LPB', 'LPBank', 'LPBank', 'lpbank', 'ao-bong-da-ngan-hang-lpbank-2026.png', ['Đỏ burgundy', 'Vàng', 'Trắng'], 'sang, ấm và chỉn chu', 'burgundy - vàng phù hợp hình ảnh cao cấp'],
  ['SEAB', 'SeABank', 'SeABank', 'seabank', 'ao-bong-da-ngan-hang-seabank-2026.png', ['Đỏ SeABank', 'Xanh navy', 'Trắng'], 'năng động, tươi sáng và chuyên nghiệp', 'đỏ - navy tạo độ tương phản tốt'],
  ['OCB', 'OCB', 'OCB', 'ocb', 'ao-bong-da-ngan-hang-ocb-2026.png', ['Xanh lá OCB', 'Xanh dương', 'Trắng'], 'tươi, dễ tiếp cận và hiện đại', 'xanh lá - xanh dương sạch và thân thiện'],
  ['EIB', 'Eximbank', 'Eximbank', 'eximbank', 'ao-bong-da-ngan-hang-eximbank-2026.png', ['Xanh Eximbank', 'Đỏ nhấn', 'Trắng'], 'quốc tế, sáng và tin cậy', 'xanh trắng thêm nét đỏ tốc độ'],
  ['NAB', 'Nam A Bank', 'Nam A Bank', 'nam-a-bank', 'ao-bong-da-ngan-hang-nam-a-bank-2026.png', ['Xanh Nam A', 'Vàng', 'Trắng'], 'sang, mềm và chuyên nghiệp', 'xanh - vàng lấy cảm hứng hoa lá nhẹ'],
  ['ABB', 'ABBank', 'ABBank', 'abbank', 'ao-bong-da-ngan-hang-abbank-2026.png', ['Xanh navy', 'Vàng', 'Trắng'], 'vững vàng, lịch sự và cao cấp', 'navy - vàng tạo cảm giác chắc chắn'],
  ['PVCB', 'PVcomBank', 'PVcomBank', 'pvcombank', 'ao-bong-da-ngan-hang-pvcombank-2026.png', ['Xanh teal', 'Xanh dương', 'Đỏ nhấn'], 'năng lượng, hiện đại và khác biệt', 'teal - xanh dương - đỏ giúp áo nổi rõ'],
  ['NCB', 'NCB', 'NCB', 'ncb', 'ao-bong-da-ngan-hang-ncb-2026.png', ['Tím NCB', 'Vàng', 'Trắng'], 'trẻ, sáng và nổi bật', 'tím - vàng tạo nhận diện riêng'],
  ['BAB', 'Bac A Bank', 'Bac A Bank', 'bac-a-bank', 'ao-bong-da-ngan-hang-bac-a-bank-2026.png', ['Xanh lá', 'Vàng ấm', 'Trắng'], 'tươi, tự nhiên và gần gũi', 'xanh lá - vàng gợi tinh thần bền vững'],
  ['BVB', 'BVBank', 'BVBank', 'bvbank', 'ao-bong-da-ngan-hang-bvbank-2026.png', ['Đỏ BVBank', 'Vàng', 'Charcoal'], 'mạnh, nổi bật và hiện đại', 'đỏ - vàng trên nền trắng rất bắt mắt'],
  ['VAB', 'VietABank', 'VietABank', 'vietabank', 'ao-bong-da-ngan-hang-vietabank-2026.png', ['Xanh VietABank', 'Đỏ', 'Vàng nhấn'], 'ổn định, chuyên nghiệp và sáng sân', 'xanh dương - đỏ - vàng cân bằng'],
  ['VB', 'VietBank', 'VietBank', 'vietbank', 'ao-bong-da-ngan-hang-vietbank-2026.png', ['Xanh VietBank', 'Đỏ', 'Trắng'], 'gọn, dễ mặc và tin cậy', 'xanh trắng thêm đỏ nổi bật'],
  ['PGB', 'PGBank', 'PGBank', 'pgbank', 'ao-bong-da-ngan-hang-pgbank-2026.png', ['Cam PGBank', 'Xanh navy', 'Trắng'], 'bold, khỏe và hiện đại', 'cam - navy rất nổi trong lưới sản phẩm'],
  ['KLB', 'KienlongBank', 'KienlongBank', 'kienlongbank', 'ao-bong-da-ngan-hang-kienlongbank-2026.png', ['Xanh lá', 'Cam', 'Trắng'], 'thân thiện, tươi và cộng đồng', 'xanh - cam trẻ trung cho hoạt động nội bộ'],
  ['SGB', 'SaigonBank', 'SaigonBank', 'saigonbank', 'ao-bong-da-ngan-hang-saigonbank-2026.png', ['Xanh SaigonBank', 'Đỏ', 'Trắng'], 'cổ điển, thành thị và tin cậy', 'xanh trắng thêm nét đỏ gọn gàng'],
  ['BVBV', 'BaoViet Bank', 'BaoViet Bank', 'baoviet-bank', 'ao-bong-da-ngan-hang-baoviet-bank-2026.png', ['Xanh BaoViet', 'Vàng', 'Trắng'], 'bền vững, sang và an tâm', 'xanh - vàng tạo cảm giác tài chính ổn định'],
  ['SCB', 'SCB', 'SCB', 'scb', 'ao-bong-da-ngan-hang-scb-2026.png', ['Đỏ SCB', 'Vàng', 'Trắng'], 'cao cấp, nổi bật và chắc chắn', 'đỏ - vàng hợp giải nội bộ đông người'],
  ['VIKKI', 'Vikki Bank', 'Vikki Bank', 'vikki-bank', 'ao-bong-da-ngan-hang-vikki-bank-2026.png', ['Hồng magenta', 'Xanh lá', 'Trắng'], 'trẻ trung, số hóa và khác biệt', 'magenta - xanh lá tạo điểm nhấn mới mẻ'],
  ['GPB', 'GPBank', 'GPBank', 'gpbank', 'ao-bong-da-ngan-hang-gpbank-2026.png', ['Xanh GPBank', 'Vàng', 'Trắng'], 'tin cậy, sáng và gọn', 'xanh - vàng dễ dùng cho đội bóng nội bộ'],
  ['VCBN', 'VCBNeo', 'VCBNeo', 'vcbneo', 'ao-bong-da-ngan-hang-vcbneo-2026.png', ['Xanh Vietcombank', 'Lime', 'Trắng'], 'số hóa, tươi mới và tin cậy', 'xanh - lime mang tinh thần ngân hàng hiện đại'],
]

const banks: BankConfig[] = bankTuples.map(([code, bank, display, slugSuffix, image, colors, tone, accents]) => ({
  code,
  bank,
  display,
  slug: `ao-bong-da-ngan-hang-${slugSuffix}`,
  sku: `X24-MABD-${code}-001`,
  image: path.join(OUTPUT_DIR, image),
  colors,
  tone,
  accents,
}))

const selectedBanks = only ? banks.filter((bank) => only.includes(bank.code) || only.includes(bank.slug) || only.includes(bank.bank)) : banks

if (!selectedBanks.length) {
  throw new Error(`No bank configs selected. BANKS=${process.env.BANKS || ''}`)
}

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
      format: '' as const,
      direction: null,
      indent: 0,
      version: 1,
      children: [{ type: 'text', text, version: 1 }],
    })),
  },
})

const unwrap = <T extends Doc>(value: T | { doc?: T }) => ('doc' in value && value.doc ? value.doc : (value as T))

async function authHeaders() {
  if (process.env.PAYLOAD_API_KEY) {
    return { authorization: `users API-Key ${process.env.PAYLOAD_API_KEY}` }
  }

  if (process.env.CMS_ADMIN_EMAIL && process.env.CMS_ADMIN_PASSWORD) {
    const response = await fetch(`${CMS_API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: process.env.CMS_ADMIN_EMAIL,
        password: process.env.CMS_ADMIN_PASSWORD,
      }),
    })
    if (!response.ok) throw new Error(`CMS login failed: ${response.status}`)
    const data = (await response.json()) as { token?: string }
    if (!data.token) throw new Error('CMS login response did not include a token')
    return { authorization: `JWT ${data.token}` }
  }

  throw new Error('PAYLOAD_API_KEY or CMS_ADMIN_EMAIL/CMS_ADMIN_PASSWORD is required')
}

async function api<T>(auth: Record<string, string>, route: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  for (const [key, value] of Object.entries(auth)) headers.set(key, value)
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  const response = await fetch(`${CMS_API_URL}${route}`, { ...init, headers })
  const text = await response.text()
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${route} ${response.status}: ${text.slice(0, 500)}`)
  return (text ? JSON.parse(text) : {}) as T
}

async function first<T extends Doc>(auth: Record<string, string>, collection: string, params: URLSearchParams) {
  params.set('limit', params.get('limit') || '1')
  const result = await api<Paginated<T>>(auth, `/api/${collection}?${params}`)
  return result.docs[0] ?? null
}

async function imageBuffer(imagePath: string) {
  const source = fs.readFileSync(imagePath)
  return sharp(source).resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 92 }).toBuffer()
}

function seoFor(config: BankConfig) {
  const productName = `Áo bóng đá ngân hàng ${config.display} 2026`
  const shortDescription = `${productName} ${config.accents}, phù hợp đội bóng nội bộ, giải giao lưu doanh nghiệp và team building thể thao.`
  const paragraphs = [
    `${productName} được thiết kế cho đội bóng nội bộ, giải giao lưu liên ngân hàng, hoạt động thể thao doanh nghiệp và các chương trình gắn kết nhân sự.`,
    `Mẫu sử dụng ${config.colors.join(', ').toLowerCase()} với phong cách ${config.tone}. Thiết kế giúp đội bóng giữ được tinh thần thương hiệu nhưng vẫn thoải mái khi thi đấu.`,
    'Đội có thể tùy chỉnh logo đơn vị, tên đội, tên cầu thủ, số áo, kiểu cổ áo và size theo danh sách thành viên trước khi đặt may.',
  ]
  const html = `
<h2>${productName} cho đội bóng nội bộ</h2>
<p>${paragraphs[0]} ${config.accents.charAt(0).toUpperCase()}${config.accents.slice(1)} giúp mẫu áo dễ nhận diện khi ra sân và khi chụp ảnh tập thể.</p>
<h3>Điểm nổi bật của mẫu áo</h3>
<ul>
  <li>Phối màu ${config.colors.join(', ').toLowerCase()} theo cảm hứng nhận diện ${config.bank}.</li>
  <li>Phong cách ${config.tone}, phù hợp đội bóng ngân hàng, phòng ban, chi nhánh hoặc giải giao lưu.</li>
  <li>Có thể in logo đơn vị, tên cầu thủ, số áo, tên đội hoặc phòng ban theo danh sách.</li>
  <li>Phù hợp đặt may cho giải nội bộ, team building, giao lưu khách hàng và giải bóng đá liên ngân hàng.</li>
</ul>
<h3>Tùy chỉnh khi đặt may</h3>
<p>Đội có thể điều chỉnh cổ áo, sắc độ màu phụ, vị trí logo, tên cá nhân, tên đội và số áo. Khi cần bám sát bộ nhận diện thương hiệu, hãy gửi logo, mã màu hoặc mẫu tham khảo để được tư vấn phương án trước khi sản xuất.</p>
<h3>Giá tham khảo</h3>
<p>Giá ưu đãi 119.000đ, giá gốc 159.000đ. Mức giá có thể thay đổi theo số lượng, chất liệu vải, kiểu cổ áo và yêu cầu in ấn thực tế.</p>`.trim()

  return {
    productName,
    shortDescription,
    paragraphs,
    html,
    seoTitle: `${productName} | Giá 119k`,
    metaDescription: `${productName} ${config.accents}, giá 119k, giá gốc 159k. Nhận thiết kế logo, tên số và size cho đội bóng nội bộ.`,
    alt: `${productName} ${config.accents} cho đội bóng nội bộ`,
  }
}

async function main() {
  if (process.env.PAYLOAD_LOCAL === '1') {
    await localMain()
    return
  }

  const auth = await authHeaders()
  const me = await api<Doc>(auth, '/api/users/me')
  const tenant = await first<Doc>(auth, 'tenants', new URLSearchParams({ 'where[slug][equals]': TENANT_SLUG, depth: '0' }))
  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantID = Number(tenant.id)

  const categoryData = {
    tenant: tenantID,
    name: 'Áo bóng đá Ngân Hàng',
    slug: CATEGORY_SLUG,
    group: 'type',
    description:
      'Danh mục áo bóng đá ngân hàng dành cho đội bóng nội bộ, giải giao lưu và team building thể thao. Các mẫu có thể phối theo màu nhận diện, thêm logo, in tên số và điều chỉnh theo yêu cầu từng đơn vị.',
    legacyPath: CATEGORY_PATH,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: 'bank-football-category',
    order: 18,
  }

  const existingCategory = await first<Doc>(
    auth,
    'product-categories',
    new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][slug][equals]': CATEGORY_SLUG,
      depth: '0',
    }),
  )

  const categoryPlan = existingCategory ? { action: 'update', id: existingCategory.id } : { action: 'create' }
  const plans = []
  for (const config of selectedBanks) {
    if (!fs.existsSync(config.image)) throw new Error(`Missing image: ${config.image}`)
    const hero = await imageBuffer(config.image)
    const checksum = createHash('sha256').update(hero).digest('hex')
    const existingProduct = await first<Doc>(
      auth,
      'products',
      new URLSearchParams({
        'where[and][0][tenant][equals]': String(tenantID),
        'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
        'where[and][1][or][0][and][1][sourceId][equals]': `${config.slug}-2026`,
        'where[and][1][or][1][sku][equals]': config.sku,
        'where[and][1][or][2][slug][equals]': config.slug,
        depth: '0',
      }),
    )
    const existingMedia = await first<Doc>(
      auth,
      'media',
      new URLSearchParams({
        'where[and][0][tenant][equals]': String(tenantID),
        'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
        'where[and][1][or][0][and][1][sourceId][equals]': `${config.slug}-hero`,
        'where[and][1][or][1][sourceChecksum][equals]': checksum,
        depth: '0',
      }),
    )

    plans.push({
      bank: config.bank,
      sku: config.sku,
      product: existingProduct ? { action: 'update', id: existingProduct.id } : { action: 'create' },
      media: existingMedia ? { action: 'reuse', id: existingMedia.id } : { action: 'create' },
      url: `https://mayaobongda.vn/${config.slug}/`,
      checksum,
    })
  }

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', user: me?.user?.email || me?.email || 'authenticated', tenant: { id: tenantID, slug: TENANT_SLUG }, category: categoryPlan, products: plans }, null, 2))
    return
  }

  const category = existingCategory
    ? unwrap<Doc>(await api(auth, `/api/product-categories/${existingCategory.id}`, { method: 'PATCH', body: JSON.stringify(categoryData) }))
    : unwrap<Doc>(await api(auth, '/api/product-categories', { method: 'POST', body: JSON.stringify(categoryData) }))

  const results = []
  for (const config of selectedBanks) {
    const seo = seoFor(config)
    const hero = await imageBuffer(config.image)
    const checksum = createHash('sha256').update(hero).digest('hex')
    const existingProduct = await first<Doc>(
      auth,
      'products',
      new URLSearchParams({
        'where[and][0][tenant][equals]': String(tenantID),
        'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
        'where[and][1][or][0][and][1][sourceId][equals]': `${config.slug}-2026`,
        'where[and][1][or][1][sku][equals]': config.sku,
        'where[and][1][or][2][slug][equals]': config.slug,
        depth: '0',
      }),
    )
    let media = await first<Doc>(
      auth,
      'media',
      new URLSearchParams({
        'where[and][0][tenant][equals]': String(tenantID),
        'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
        'where[and][1][or][0][and][1][sourceId][equals]': `${config.slug}-hero`,
        'where[and][1][or][1][sourceChecksum][equals]': checksum,
        depth: '0',
      }),
    )

    if (!media) {
      const form = new FormData()
      form.set('_payload', JSON.stringify({
        tenant: tenantID,
        alt: seo.alt,
        searchTags: rows(['áo bóng đá ngân hàng', config.bank, 'áo bóng đá công ty', ...config.colors]),
        sourceSystem: SOURCE_SYSTEM,
        sourceId: `${config.slug}-hero`,
        sourceChecksum: checksum,
      }))
      form.set('file', new File([new Uint8Array(hero)], `${config.slug}.webp`, { type: 'image/webp' }))
      media = unwrap<Doc>(await api(auth, '/api/media', { method: 'POST', body: form }))
    }

    const productData = {
      tenant: tenantID,
      name: seo.productName,
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
      shortDescription: seo.shortDescription,
      description: lexical(seo.paragraphs),
      contentHtml: seo.html,
      attributes: [
        { name: 'Màu chủ đạo', values: rows(config.colors) },
        { name: 'Phong cách', values: rows(['Áo bóng đá ngân hàng', config.tone, 'Đồng phục doanh nghiệp']) },
        { name: 'Tùy chỉnh', values: rows(['Logo đơn vị', 'Tên cầu thủ', 'Số áo', 'Kiểu cổ áo']) },
        { name: 'Phù hợp', values: rows(['Giải nội bộ', 'Giao lưu liên ngân hàng', 'Team building thể thao']) },
      ],
      badges: [{ label: 'Ngân hàng' }, { label: 'Thiết kế riêng' }],
      searchTags: rows(['áo bóng đá ngân hàng', `áo bóng đá ${config.bank}`, 'áo bóng đá công ty', 'đồng phục bóng đá doanh nghiệp', 'may áo bóng đá ngân hàng']),
      gallery: [Number(media.id)],
      seoTitle: seo.seoTitle,
      metaDescription: seo.metaDescription,
      legacyPath: `/${config.slug}/`,
      sourceSystem: SOURCE_SYSTEM,
      sourceId: `${config.slug}-2026`,
      sourceChecksum: checksum,
      sourceCreatedAt: new Date().toISOString(),
      sourceModifiedAt: new Date().toISOString(),
    }

    const product = existingProduct
      ? unwrap<Doc>(await api(auth, `/api/products/${existingProduct.id}`, { method: 'PATCH', body: JSON.stringify(productData) }))
      : unwrap<Doc>(await api(auth, '/api/products', { method: 'POST', body: JSON.stringify(productData) }))

    results.push({
      bank: config.bank,
      product: { action: existingProduct ? 'updated' : 'created', id: product.id, sku: config.sku, url: `https://mayaobongda.vn/${config.slug}/` },
      media: { action: media.sourceChecksum === checksum ? 'ready' : 'used', id: media.id, url: media.url },
    })
  }

  const count = await api<Paginated<Doc>>(auth, `/api/products?${new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][publicationStatus][equals]': 'publish',
    'where[and][2][categories][equals]': String(category.id),
    depth: '0',
    limit: '1',
  })}`)
  await api(auth, `/api/product-categories/${category.id}`, { method: 'PATCH', body: JSON.stringify({ productCount: count.totalDocs }) })

  console.log(JSON.stringify({ mode: 'apply', tenant: { id: tenantID, slug: TENANT_SLUG }, category: { id: category.id, productCount: count.totalDocs }, products: results }, null, 2))
}

async function localMain() {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../src/payload.config'),
  ])
  const payload = await getPayload({ config })

  const tenantResult = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: TENANT_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const tenant = tenantResult.docs[0] as Doc | undefined
  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantID = Number(tenant.id)

  const categoryResult = await payload.find({
    collection: 'product-categories',
    where: { and: [{ tenant: { equals: tenantID } }, { slug: { equals: CATEGORY_SLUG } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const existingCategory = categoryResult.docs[0] as Doc | undefined
  const categoryData = {
    tenant: tenantID,
    name: 'Áo bóng đá Ngân Hàng',
    slug: CATEGORY_SLUG,
    group: 'type' as const,
    description:
      'Danh mục áo bóng đá ngân hàng dành cho đội bóng nội bộ, giải giao lưu và team building thể thao. Các mẫu có thể phối theo màu nhận diện, thêm logo, in tên số và điều chỉnh theo yêu cầu từng đơn vị.',
    legacyPath: CATEGORY_PATH,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: 'bank-football-category',
    order: 18,
  }

  const plans = []
  for (const bank of selectedBanks) {
    if (!fs.existsSync(bank.image)) throw new Error(`Missing image: ${bank.image}`)
    const hero = await imageBuffer(bank.image)
    const checksum = createHash('sha256').update(hero).digest('hex')
    const existingProduct = await payload.find({
      collection: 'products',
      where: {
        and: [
          { tenant: { equals: tenantID } },
          {
            or: [
              { and: [{ sourceSystem: { equals: SOURCE_SYSTEM } }, { sourceId: { equals: `${bank.slug}-2026` } }] },
              { sku: { equals: bank.sku } },
              { slug: { equals: bank.slug } },
            ],
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const existingMedia = await payload.find({
      collection: 'media',
      where: {
        and: [
          { tenant: { equals: tenantID } },
          {
            or: [
              { and: [{ sourceSystem: { equals: SOURCE_SYSTEM } }, { sourceId: { equals: `${bank.slug}-hero` } }] },
              { sourceChecksum: { equals: checksum } },
            ],
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    plans.push({
      bank: bank.bank,
      sku: bank.sku,
      product: existingProduct.docs[0] ? { action: 'update', id: existingProduct.docs[0].id } : { action: 'create' },
      media: existingMedia.docs[0] ? { action: 'reuse', id: existingMedia.docs[0].id } : { action: 'create' },
      url: `https://mayaobongda.vn/${bank.slug}/`,
    })
  }

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run-local',
      tenant: { id: tenantID, slug: TENANT_SLUG },
      category: existingCategory ? { action: 'update', id: existingCategory.id } : { action: 'create' },
      products: plans,
    }, null, 2))
    return
  }

  const category = existingCategory
    ? await payload.update({ collection: 'product-categories', id: existingCategory.id, data: categoryData as any, overrideAccess: true })
    : await payload.create({ collection: 'product-categories', data: categoryData as any, overrideAccess: true })

  const results = []
  for (const bank of selectedBanks) {
    const seo = seoFor(bank)
    const hero = await imageBuffer(bank.image)
    const checksum = createHash('sha256').update(hero).digest('hex')
    const existingProduct = await payload.find({
      collection: 'products',
      where: {
        and: [
          { tenant: { equals: tenantID } },
          {
            or: [
              { and: [{ sourceSystem: { equals: SOURCE_SYSTEM } }, { sourceId: { equals: `${bank.slug}-2026` } }] },
              { sku: { equals: bank.sku } },
              { slug: { equals: bank.slug } },
            ],
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const existingMedia = await payload.find({
      collection: 'media',
      where: {
        and: [
          { tenant: { equals: tenantID } },
          {
            or: [
              { and: [{ sourceSystem: { equals: SOURCE_SYSTEM } }, { sourceId: { equals: `${bank.slug}-hero` } }] },
              { sourceChecksum: { equals: checksum } },
            ],
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const media = (existingMedia.docs[0] as Doc | undefined) || await payload.create({
      collection: 'media',
      data: {
        tenant: tenantID,
        alt: seo.alt,
        searchTags: rows(['áo bóng đá ngân hàng', bank.bank, 'áo bóng đá công ty', ...bank.colors]),
        sourceSystem: SOURCE_SYSTEM,
        sourceId: `${bank.slug}-hero`,
        sourceChecksum: checksum,
      },
      file: {
        data: hero,
        mimetype: 'image/webp',
        name: `${bank.slug}.webp`,
        size: hero.length,
      },
      overrideAccess: true,
    } as any)

    const productData = {
      tenant: tenantID,
      name: seo.productName,
      slug: bank.slug,
      sku: bank.sku,
      sport: 'football',
      productType: 'simple',
      publicationStatus: 'publish',
      featured: true,
      categories: [Number((category as Doc).id)],
      price: 119000,
      regularPrice: 159000,
      salePrice: 119000,
      compareAtPrice: 159000,
      currency: 'VND',
      stockStatus: 'instock',
      isPurchasable: false,
      isOnBackorder: false,
      shortDescription: seo.shortDescription,
      description: lexical(seo.paragraphs),
      contentHtml: seo.html,
      attributes: [
        { name: 'Màu chủ đạo', values: rows(bank.colors) },
        { name: 'Phong cách', values: rows(['Áo bóng đá ngân hàng', bank.tone, 'Đồng phục doanh nghiệp']) },
        { name: 'Tùy chỉnh', values: rows(['Logo đơn vị', 'Tên cầu thủ', 'Số áo', 'Kiểu cổ áo']) },
        { name: 'Phù hợp', values: rows(['Giải nội bộ', 'Giao lưu liên ngân hàng', 'Team building thể thao']) },
      ],
      badges: [{ label: 'Ngân hàng' }, { label: 'Thiết kế riêng' }],
      searchTags: rows(['áo bóng đá ngân hàng', `áo bóng đá ${bank.bank}`, 'áo bóng đá công ty', 'đồng phục bóng đá doanh nghiệp', 'may áo bóng đá ngân hàng']),
      gallery: [Number((media as Doc).id)],
      seoTitle: seo.seoTitle,
      metaDescription: seo.metaDescription,
      legacyPath: `/${bank.slug}/`,
      sourceSystem: SOURCE_SYSTEM,
      sourceId: `${bank.slug}-2026`,
      sourceChecksum: checksum,
      sourceCreatedAt: new Date().toISOString(),
      sourceModifiedAt: new Date().toISOString(),
    }

    const product = existingProduct.docs[0]
      ? await payload.update({ collection: 'products', id: existingProduct.docs[0].id, data: productData as any, overrideAccess: true })
      : await payload.create({ collection: 'products', data: productData as any, overrideAccess: true })

    results.push({
      bank: bank.bank,
      product: { action: existingProduct.docs[0] ? 'updated' : 'created', id: (product as Doc).id, sku: bank.sku, url: `https://mayaobongda.vn/${bank.slug}/` },
      media: { id: (media as Doc).id, url: (media as Doc).url },
    })
  }

  const count = await payload.find({
    collection: 'products',
    where: {
      and: [
        { tenant: { equals: tenantID } },
        { publicationStatus: { equals: 'publish' } },
        { categories: { equals: Number((category as Doc).id) } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  await payload.update({
    collection: 'product-categories',
    id: (category as Doc).id,
    data: { productCount: count.totalDocs },
    overrideAccess: true,
  })

  console.log(JSON.stringify({ mode: 'apply-local', tenant: { id: tenantID, slug: TENANT_SLUG }, category: { id: (category as Doc).id, productCount: count.totalDocs }, products: results }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
