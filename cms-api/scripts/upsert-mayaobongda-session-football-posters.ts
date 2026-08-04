import 'dotenv/config'

import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const CMS_API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const TENANT_SLUG = 'mayaobongda'
const SOURCE_SYSTEM = 'football-poster-session-20260801'
const OUTPUT_DIR = '/Users/hoang/x24sport_websites/mayaobongda.vn/imagegen/outputs'
const CATEGORY_SLUG = 'ao-bong-da-thiet-ke-2026'
const CATEGORY_PATH = '/ao-bong-da-thiet-ke-2026/'
const apply = process.argv.includes('--apply')

type Doc = Record<string, any>
type Paginated<T extends Doc> = { docs: T[]; totalDocs: number }
type Poster = {
  code: string
  file: string
  slug: string
  sku: string
  colors: string[]
  accentColors: string[]
  styleTags: string[]
}

const filenameColorHints: Record<string, string[]> = {
  'red': ['Đỏ'],
  'blue': ['Xanh dương'],
  'light-blue': ['Xanh da trời'],
  'blue-purple': ['Xanh dương', 'Tím'],
  'white-teal': ['Trắng', 'Xanh teal'],
  'white': ['Trắng'],
  'purple': ['Tím'],
  'yellow-orange': ['Vàng', 'Cam'],
  'navy': ['Xanh navy'],
}

const outputColorOverrides: Record<string, string[]> = {
  'x24-br-01-light-blue': ['Xanh da trời', 'Trắng', 'Xanh dương'],
  'x24-br-05-white': ['Trắng', 'Đen'],
  'x24-br-11-blue-purple': ['Xanh dương', 'Tím'],
  'x24-br-11-white-teal': ['Trắng', 'Xanh teal'],
  'x24-br-22-blue': ['Xanh navy', 'Xanh dương', 'Đỏ'],
  'x24-br-22-red': ['Đỏ', 'Cam', 'Đen'],
  'x24-br-26-navy': ['Xanh navy', 'Đỏ'],
  'x24-br-33-yellow-orange': ['Vàng', 'Cam', 'Đỏ'],
  'x24-cb-06-purple': ['Tím', 'Hồng', 'Xanh navy'],
}

const colorCategoryMeta: Record<string, { slug: string; description: string; order: number }> = {
  'Đỏ': {
    slug: 'ao-bong-da-mau-do',
    description: 'Các mẫu áo bóng đá màu đỏ, đỏ cam và đỏ đô nổi bật cho đội bóng cần nhận diện mạnh trên sân.',
    order: 101,
  },
  'Cam': {
    slug: 'ao-bong-da-mau-cam',
    description: 'Các mẫu áo bóng đá màu cam và cam đỏ giàu năng lượng, phù hợp đội bóng trẻ và giải phong trào.',
    order: 102,
  },
  'Vàng': {
    slug: 'ao-bong-da-mau-vang',
    description: 'Các mẫu áo bóng đá màu vàng sáng sân, dễ nhận diện và phù hợp đội thích phong cách nổi bật.',
    order: 103,
  },
  'Xanh dương': {
    slug: 'ao-bong-da-mau-xanh-duong',
    description: 'Các mẫu áo bóng đá màu xanh dương, xanh royal và xanh cobalt cho đội bóng phong cách thể thao hiện đại.',
    order: 104,
  },
  'Xanh navy': {
    slug: 'ao-bong-da-mau-xanh-navy',
    description: 'Các mẫu áo bóng đá màu xanh navy, xanh đậm và phối tối chuyên nghiệp cho đội bóng.',
    order: 105,
  },
  'Xanh da trời': {
    slug: 'ao-bong-da-mau-xanh-da-troi',
    description: 'Các mẫu áo bóng đá màu xanh da trời và xanh nhạt tạo cảm giác trẻ trung, mát mắt.',
    order: 106,
  },
  'Xanh teal': {
    slug: 'ao-bong-da-mau-xanh-teal',
    description: 'Các mẫu áo bóng đá xanh teal, xanh ngọc và xanh cổ vịt cho đội bóng muốn phối màu khác biệt.',
    order: 107,
  },
  'Xanh lá': {
    slug: 'ao-bong-da-mau-xanh-la',
    description: 'Các mẫu áo bóng đá màu xanh lá, xanh rêu và xanh mint dành cho đội thích phong cách tươi mới.',
    order: 108,
  },
  'Tím': {
    slug: 'ao-bong-da-mau-tim',
    description: 'Các mẫu áo bóng đá màu tím, tím đậm và tím gradient cho đội bóng muốn tạo dấu ấn riêng.',
    order: 109,
  },
  'Hồng': {
    slug: 'ao-bong-da-mau-hong',
    description: 'Các mẫu áo bóng đá màu hồng, hồng nhạt và phối pastel trẻ trung.',
    order: 110,
  },
  'Trắng': {
    slug: 'ao-bong-da-mau-trang',
    description: 'Các mẫu áo bóng đá màu trắng, trắng phối màu và phong cách sạch sáng cho đồng phục đội.',
    order: 111,
  },
  'Đen': {
    slug: 'ao-bong-da-mau-den',
    description: 'Các mẫu áo bóng đá màu đen, đen phối màu và phong cách mạnh mẽ cho thi đấu.',
    order: 112,
  },
  'Xám': {
    slug: 'ao-bong-da-mau-xam',
    description: 'Các mẫu áo bóng đá màu xám và bạc, dễ phối logo đội bóng và số áo.',
    order: 113,
  },
}

const colorSamples: Array<{ name: string; rgb: [number, number, number] }> = [
  { name: 'Đỏ', rgb: [210, 35, 35] },
  { name: 'Cam', rgb: [235, 105, 25] },
  { name: 'Vàng', rgb: [235, 205, 35] },
  { name: 'Xanh lá', rgb: [45, 155, 75] },
  { name: 'Xanh teal', rgb: [25, 150, 150] },
  { name: 'Xanh da trời', rgb: [95, 180, 230] },
  { name: 'Xanh dương', rgb: [35, 95, 200] },
  { name: 'Xanh navy', rgb: [20, 35, 80] },
  { name: 'Tím', rgb: [125, 65, 175] },
  { name: 'Hồng', rgb: [220, 90, 155] },
  { name: 'Trắng', rgb: [235, 235, 230] },
  { name: 'Đen', rgb: [25, 25, 28] },
  { name: 'Xám', rgb: [125, 130, 135] },
]

const rows = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))].map((value) => ({ value }))
const unique = (values: string[]) => [...new Set(values.filter(Boolean))]

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

const normalizeCode = (filename: string) =>
  filename
    .replace(/^football-poster-/, '')
    .replace(/\.png$/i, '')
    .toUpperCase()
    .replace(/-/g, ' ')
    .replace(/\s(V2)$/i, ' $1')

const slugBase = (filename: string) => filename.replace(/^football-poster-/, '').replace(/\.png$/i, '')

function productSlug(base: string) {
  return `ao-bong-da-thiet-ke-${base}`
}

function skuFor(base: string) {
  return `X24-MABD-${base.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`
}

function distance(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

function rgbToHsv(r: number, g: number, b: number) {
  const nr = r / 255
  const ng = g / 255
  const nb = b / 255
  const max = Math.max(nr, ng, nb)
  const min = Math.min(nr, ng, nb)
  const d = max - min
  const s = max === 0 ? 0 : d / max
  return { saturation: s, value: max }
}

function nearestColor(r: number, g: number, b: number) {
  let best = colorSamples[0]
  let bestScore = Number.POSITIVE_INFINITY
  for (const color of colorSamples) {
    const score = distance([r, g, b], color.rgb)
    if (score < bestScore) {
      best = color
      bestScore = score
    }
  }
  return best.name
}

async function analyzeColors(file: string, base: string) {
  if (outputColorOverrides[base]) return outputColorOverrides[base]

  const hinted = Object.entries(filenameColorHints)
    .sort((a, b) => b[0].length - a[0].length)
    .filter(([hint]) => base.includes(hint))
    .flatMap(([, colors]) => colors)

  const { data, info } = await sharp(file)
    .resize({ width: 96, height: 96, fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const counts = new Map<string, number>()
  for (let index = 0; index < data.length; index += info.channels) {
    const r = data[index] ?? 0
    const g = data[index + 1] ?? 0
    const b = data[index + 2] ?? 0
    const { saturation, value } = rgbToHsv(r, g, b)
    if (value < 0.08) {
      counts.set('Đen', (counts.get('Đen') || 0) + 1)
      continue
    }
    if (saturation < 0.12 && value > 0.82) {
      counts.set('Trắng', (counts.get('Trắng') || 0) + 1)
      continue
    }
    if (saturation < 0.1) continue
    const color = nearestColor(r, g, b)
    counts.set(color, (counts.get(color) || 0) + 1)
  }

  const analyzed = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)
    .filter((color) => colorCategoryMeta[color])

  const combined = unique([...hinted, ...analyzed])
  if (hinted.length) return combined.slice(0, 3)
  const preferred = combined.filter((color) => !['Đen', 'Trắng', 'Xám'].includes(color))
  const main = (preferred.length ? preferred : combined).slice(0, 3)
  return main.length ? main : ['Xanh dương']
}

function colorText(colors: string[]) {
  return colors.join(' phối ').toLowerCase()
}

function nameFor(poster: Poster) {
  return `Áo bóng đá thiết kế ${poster.code} - ${colorText(poster.colors)}`
}

function sourceIdFor(poster: Poster) {
  return `${poster.slug}-poster`
}

function contentFor(poster: Poster) {
  const name = nameFor(poster)
  const colors = colorText(poster.colors)
  const accent = poster.accentColors.length ? `, điểm nhấn ${colorText(poster.accentColors)}` : ''
  const shortDescription = `${name} dành cho đội bóng đặt may đồng phục thi đấu, phối màu ${colors}${accent}, hỗ trợ in logo, tên cầu thủ, số áo và chọn size theo danh sách.`
  const paragraphs = [
    `${name} là mẫu áo bóng đá thiết kế 2026 dành cho đội bóng phong trào, câu lạc bộ, lớp học, công ty hoặc giải đấu nội bộ muốn có bộ nhận diện thi đấu riêng.`,
    `Mẫu sử dụng màu chủ đạo ${colors}${accent}. Bố cục poster thể hiện cả áo mặc trên người, mặt trước, mặt sau và quần đồng bộ để đội dễ hình dung trước khi đặt may.`,
    `Khi sản xuất thực tế, đội có thể tùy chỉnh logo đội bóng, nhà tài trợ, tên cầu thủ, số áo, kiểu cổ và size từ S đến 4XL theo danh sách thành viên.`,
    `Chất liệu, form áo và kỹ thuật in có thể tư vấn theo ngân sách, số lượng và cường độ sử dụng: đá sân 5, sân 7, sân 11, giải nội bộ hoặc hoạt động team building thể thao.`,
  ]
  const html = `
<h2>${name}</h2>
<p>${paragraphs[0]}</p>
<h3>Màu sắc và phong cách thiết kế</h3>
<p>${paragraphs[1]}</p>
<h3>Tùy chỉnh theo đội bóng</h3>
<ul>
  <li>In logo đội bóng, logo nhà tài trợ hoặc biểu tượng câu lạc bộ.</li>
  <li>In tên cầu thủ, số áo, tên đội và chia size theo danh sách.</li>
  <li>Chọn kiểu cổ áo phù hợp với mẫu: cổ tròn, cổ V hoặc cổ polo.</li>
  <li>Phù hợp đặt may cho đội bóng phong trào, trường lớp, doanh nghiệp và giải nội bộ.</li>
</ul>
<h3>Giá tham khảo</h3>
<p>Giá ưu đãi 119.000đ, giá gốc 159.000đ. Giá thực tế phụ thuộc số lượng, chất liệu vải và yêu cầu in ấn.</p>`.trim()
  return { shortDescription, paragraphs, html }
}

async function authHeaders() {
  if (!process.env.PAYLOAD_API_KEY) throw new Error('PAYLOAD_API_KEY is required')
  return { authorization: `users API-Key ${process.env.PAYLOAD_API_KEY}` }
}

async function api<T>(auth: Record<string, string>, route: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  for (const [key, value] of Object.entries(auth)) headers.set(key, value)
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  const response = await fetch(`${CMS_API_URL}${route}`, { ...init, headers })
  const text = await response.text()
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${route} ${response.status}: ${text.slice(0, 600)}`)
  return (text ? JSON.parse(text) : {}) as T
}

async function first<T extends Doc>(auth: Record<string, string>, collection: string, params: URLSearchParams) {
  params.set('limit', params.get('limit') || '1')
  const result = await api<Paginated<T>>(auth, `/api/${collection}?${params}`)
  return result.docs[0] ?? null
}

const unwrap = <T extends Doc>(value: T | { doc?: T }) => ('doc' in value && value.doc ? value.doc : (value as T))

async function imageBuffer(imagePath: string) {
  const sourceBuffer = fs.readFileSync(imagePath)
  return sharp(sourceBuffer).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 92 }).toBuffer()
}

async function discoverPosters(): Promise<Poster[]> {
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter((file) => file.startsWith('football-poster-') && file.endsWith('.png') && !file.includes('contact-sheet'))
    .sort()

  const posters: Poster[] = []
  for (const filename of files) {
    const file = path.join(OUTPUT_DIR, filename)
    const base = slugBase(filename)
    const colors = await analyzeColors(file, base)
    posters.push({
      code: normalizeCode(filename),
      file,
      slug: productSlug(base),
      sku: skuFor(base),
      colors,
      accentColors: colors.slice(1),
      styleTags: ['football 2026 collection', 'poster áo bóng đá', 'đặt may áo bóng đá'],
    })
  }
  return posters
}

async function ensureCategory(auth: Record<string, string>, tenantID: number, data: Doc) {
  const existing = await first<Doc>(auth, 'product-categories', new URLSearchParams({
    'where[and][0][tenant][equals]': String(tenantID),
    'where[and][1][slug][equals]': data.slug,
    depth: '0',
  }))
  if (!apply) return existing ? { action: 'update', id: existing.id, slug: data.slug } : { action: 'create', slug: data.slug }
  return existing
    ? unwrap<Doc>(await api(auth, `/api/product-categories/${existing.id}`, { method: 'PATCH', body: JSON.stringify(data) }))
    : unwrap<Doc>(await api(auth, '/api/product-categories', { method: 'POST', body: JSON.stringify(data) }))
}

async function main() {
  const posters = await discoverPosters()
  if (!posters.length) throw new Error(`No poster PNG files found in ${OUTPUT_DIR}`)

  const auth = await authHeaders()
  const me = await api<Doc>(auth, '/api/users/me')
  const tenant = await first<Doc>(auth, 'tenants', new URLSearchParams({ 'where[slug][equals]': TENANT_SLUG, depth: '0' }))
  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantID = Number(tenant.id)

  const mainCategoryData = {
    tenant: tenantID,
    name: 'Áo bóng đá thiết kế 2026',
    slug: CATEGORY_SLUG,
    group: 'type',
    description: 'Bộ sưu tập áo bóng đá thiết kế 2026 với nhiều phối màu, kiểu cổ và bố cục poster để đội bóng chọn mẫu trước khi đặt may theo logo, tên số và size riêng.',
    legacyPath: CATEGORY_PATH,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: 'session-football-posters-category',
    order: 16,
  }
  const mainCategory = await ensureCategory(auth, tenantID, mainCategoryData)

  const colorCategoryPlans = new Map<string, Doc>()
  for (const color of unique(posters.flatMap((poster) => poster.colors))) {
    const meta = colorCategoryMeta[color]
    if (!meta) continue
    const data = {
      tenant: tenantID,
      name: `Áo bóng đá màu ${color.toLowerCase()}`,
      slug: meta.slug,
      group: 'color',
      description: meta.description,
      legacyPath: `/${meta.slug}/`,
      sourceSystem: SOURCE_SYSTEM,
      sourceId: `color-${meta.slug}`,
      order: meta.order,
    }
    colorCategoryPlans.set(color, await ensureCategory(auth, tenantID, data))
  }

  const plans = []
  for (const poster of posters) {
    const buffer = await imageBuffer(poster.file)
    const checksum = createHash('sha256').update(buffer).digest('hex')
    const sourceId = sourceIdFor(poster)
    const existingProduct = await first<Doc>(auth, 'products', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': sourceId,
      'where[and][1][or][1][sku][equals]': poster.sku,
      'where[and][1][or][2][slug][equals]': poster.slug,
      depth: '0',
    }))
    const existingMedia = await first<Doc>(auth, 'media', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': `${sourceId}-hero`,
      'where[and][1][or][1][sourceChecksum][equals]': checksum,
      depth: '0',
    }))
    plans.push({
      code: poster.code,
      name: nameFor(poster),
      sku: poster.sku,
      colors: poster.colors,
      product: existingProduct ? { action: 'update', id: existingProduct.id } : { action: 'create' },
      media: existingMedia ? { action: 'reuse', id: existingMedia.id } : { action: 'create' },
      url: `https://mayaobongda.vn/${poster.slug}/`,
    })
  }

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      user: me?.user?.email || me?.email || 'authenticated',
      tenant: { id: tenantID, slug: TENANT_SLUG },
      category: mainCategory,
      colorCategories: Object.fromEntries([...colorCategoryPlans.entries()].map(([color, category]) => [color, category])),
      productCount: plans.length,
      products: plans,
    }, null, 2))
    return
  }

  const results = []
  for (const poster of posters) {
    const buffer = await imageBuffer(poster.file)
    const checksum = createHash('sha256').update(buffer).digest('hex')
    const sourceId = sourceIdFor(poster)
    const content = contentFor(poster)
    const colorCategoryIDs = poster.colors
      .map((color) => colorCategoryPlans.get(color)?.id)
      .filter(Boolean)
      .map(Number)
    const categoryIDs = unique([Number(mainCategory.id), ...colorCategoryIDs].map(String)).map(Number)
    const sharedTags = rows([
      'áo bóng đá',
      'áo bóng đá thiết kế',
      'đồng phục bóng đá',
      'đặt may áo bóng đá',
      'in tên số áo bóng đá',
      'football 2026 collection',
      poster.code,
      ...poster.colors,
      ...poster.accentColors,
      ...poster.styleTags,
    ])

    let media = await first<Doc>(auth, 'media', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': `${sourceId}-hero`,
      'where[and][1][or][1][sourceChecksum][equals]': checksum,
      depth: '0',
    }))
    if (!media) {
      const form = new FormData()
      form.set('_payload', JSON.stringify({
        tenant: tenantID,
        alt: `${nameFor(poster)} - poster áo bóng đá đặt may`,
        searchTags: sharedTags,
        sourceSystem: SOURCE_SYSTEM,
        sourceId: `${sourceId}-hero`,
        sourceChecksum: checksum,
        sourceUrl: poster.file,
      }))
      form.set('file', new File([new Uint8Array(buffer)], `${poster.slug}.webp`, { type: 'image/webp' }))
      media = unwrap<Doc>(await api(auth, '/api/media', { method: 'POST', body: form }))
    }

    const existingProduct = await first<Doc>(auth, 'products', new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][or][0][and][0][sourceSystem][equals]': SOURCE_SYSTEM,
      'where[and][1][or][0][and][1][sourceId][equals]': sourceId,
      'where[and][1][or][1][sku][equals]': poster.sku,
      'where[and][1][or][2][slug][equals]': poster.slug,
      depth: '0',
    }))

    const productData = {
      tenant: tenantID,
      name: nameFor(poster),
      slug: poster.slug,
      sku: poster.sku,
      sport: 'football',
      productType: 'simple',
      publicationStatus: 'publish',
      featured: false,
      categories: categoryIDs,
      price: 119000,
      regularPrice: 159000,
      salePrice: 119000,
      compareAtPrice: 159000,
      currency: 'VND',
      stockStatus: 'instock',
      isPurchasable: false,
      isOnBackorder: false,
      shortDescription: content.shortDescription,
      description: lexical(content.paragraphs),
      contentHtml: content.html,
      attributes: [
        { name: 'Màu chủ đạo', values: rows(poster.colors) },
        { name: 'Màu nhấn', values: rows(poster.accentColors) },
        { name: 'Phong cách', values: rows(['Áo bóng đá thiết kế 2026', 'Poster chọn mẫu', 'Đồng phục đội bóng']) },
        { name: 'Tùy chỉnh', values: rows(['Logo đội bóng', 'Tên cầu thủ', 'Số áo', 'Kiểu cổ áo', 'Size S-4XL']) },
      ],
      badges: [{ label: 'Football 2026' }, { label: 'Thiết kế riêng' }],
      searchTags: sharedTags,
      gallery: [Number(media.id)],
      seoTitle: `${nameFor(poster)} | May áo bóng đá 119k`,
      metaDescription: `${nameFor(poster)} phối màu ${colorText(poster.colors)}, giá tham khảo 119k. Nhận in logo, tên số, chọn cổ áo và size theo đội bóng.`,
      legacyPath: `/${poster.slug}/`,
      sourceSystem: SOURCE_SYSTEM,
      sourceId,
      sourceChecksum: checksum,
      sourceCreatedAt: new Date().toISOString(),
      sourceModifiedAt: new Date().toISOString(),
    }

    const product = existingProduct
      ? unwrap<Doc>(await api(auth, `/api/products/${existingProduct.id}`, { method: 'PATCH', body: JSON.stringify(productData) }))
      : unwrap<Doc>(await api(auth, '/api/products', { method: 'POST', body: JSON.stringify(productData) }))

    results.push({
      code: poster.code,
      product: {
        action: existingProduct ? 'updated' : 'created',
        id: product.id,
        sku: poster.sku,
        url: `https://mayaobongda.vn/${poster.slug}/`,
      },
      media: { id: media.id, url: media.url },
      colors: poster.colors,
    })
  }

  const categoriesToCount = unique([String(mainCategory.id), ...[...colorCategoryPlans.values()].map((category) => String(category.id))])
  for (const categoryID of categoriesToCount) {
    const count = await api<Paginated<Doc>>(auth, `/api/products?${new URLSearchParams({
      'where[and][0][tenant][equals]': String(tenantID),
      'where[and][1][publicationStatus][equals]': 'publish',
      'where[and][2][categories][equals]': categoryID,
      depth: '0',
      limit: '1',
    })}`)
    await api(auth, `/api/product-categories/${categoryID}`, { method: 'PATCH', body: JSON.stringify({ productCount: count.totalDocs }) })
  }

  console.log(JSON.stringify({
    mode: 'apply',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    category: { id: mainCategory.id },
    productCount: results.length,
    products: results,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
