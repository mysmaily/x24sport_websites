#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const sharp = require('../cms-api/node_modules/sharp')

const args = new Map()
for (const arg of process.argv.slice(2)) {
  const [key, ...rest] = arg.replace(/^--/, '').split('=')
  args.set(key, rest.join('=') || true)
}

const required = ['source', 'product', 'main', 'image2', 'catalog', 'sku']
for (const key of required) {
  if (!args.get(key)) throw new Error(`Missing --${key}=...`)
}

const root = process.cwd()
const productKey = String(args.get('product'))
const productNumber = productKey.replace(/^x24-cl-/, '')
const outDir = path.resolve(root, 'generated/tao-anh-dong-phuc-tre-em', `mayaodongphuc-${productKey}`)
const sourcePath = path.resolve(String(args.get('source')))
const sourceSystem = 'tao-anh-dong-phuc-tre-em'
const shirtText = String(args.get('shirtText') || 'VUI ĐẾN TRƯỜNG')
const colors = String(args.get('colors') || 'hồng, vàng')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
const pattern = String(args.get('pattern') || 'phối màu hồng chuyển vàng với họa tiết sóng nhẹ')
const sku = String(args.get('sku'))
const slug = `dong-phuc-tre-em-${productKey.replace(/^x24-/, '')}-${colors.join('-').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
const name = `Áo đồng phục trẻ em ${colors.join(' ')} mẫu ${productNumber}`

const roleInputs = [
  {
    key: 'main',
    role: 'product hero',
    aspectRatio: '1:1',
    path: path.resolve(String(args.get('main'))),
    output: path.join(outDir, `mayaodongphuc-${productKey}-main.webp`),
    modelCount: 4,
    altSeed: `Đồng phục trẻ em ${colors.join(' ')} trong bối cảnh sân trường tiểu học.`,
    captionSeed: `Mẫu áo trẻ em ${colors.join(' ')} phù hợp hoạt động lớp học, ngày hội trường và dã ngoại.`,
    tags: ['đồng phục trẻ em', ...colors.map((color) => `màu ${color}`), 'áo polo', 'tay ngắn', 'sân trường'],
    placement: { gallery: true, contentEmbed: false, contentOrder: null },
    overlay: { campaignLogo: 'mayaodongphuc-logo.png', garmentText: shirtText, hotline: '0982 254 458' },
  },
  {
    key: 'image-2',
    role: 'content-inline lifestyle',
    aspectRatio: '1:1',
    path: path.resolve(String(args.get('image2'))),
    output: path.join(outDir, `mayaodongphuc-${productKey}-image-2.webp`),
    modelCount: 6,
    altSeed: `Mẫu áo đồng phục trẻ em ${colors.join(' ')} xuất hiện rõ trong hoạt động mỹ thuật ở trường.`,
    captionSeed: `Bối cảnh học tập và vui chơi giúp mẫu áo thể hiện sự thoải mái khi trẻ vận động mỗi ngày.`,
    tags: ['áo đồng phục trẻ em', ...colors.map((color) => `màu ${color}`), 'hoạt động trường học', 'mặt trước và mặt sau'],
    placement: { gallery: true, contentEmbed: true, contentOrder: 1 },
    overlay: { campaignLogo: 'mayaodongphuc-logo.png', garmentText: shirtText },
  },
  {
    key: 'catalog',
    role: 'content-inline catalog',
    aspectRatio: '5:4',
    path: path.resolve(String(args.get('catalog'))),
    output: path.join(outDir, `mayaodongphuc-${productKey}-catalog.webp`),
    modelCount: 6,
    altSeed: `Thiết kế đồng phục trẻ em ${colors.join(' ')} kèm thông tin tư vấn đặt may cho lớp và trường.`,
    captionSeed: `Mẫu áo trẻ em ${colors.join(' ')} hỗ trợ đặt may theo logo, tên lớp và chủ đề hoạt động.`,
    tags: ['catalog đồng phục trẻ em', ...colors.map((color) => `màu ${color}`), 'hotline', 'đặt may theo yêu cầu'],
    placement: { gallery: true, contentEmbed: true, contentOrder: 2 },
    overlay: {
      campaignLogo: 'mayaodongphuc-logo.png',
      garmentText: shirtText,
      title: 'ĐỒNG PHỤC / TRẺ EM',
      slogan: 'Vui đến trường - Dễ vận động',
      hotline: '0982 254 458',
      website: 'mayaodongphuc.com.vn',
    },
  },
]

async function toWebp(input, output) {
  await sharp(input).rotate().webp({ quality: 100 }).toFile(output)
  const bytes = await import('node:fs/promises').then((fs) => fs.readFile(output))
  return createHash('sha256').update(bytes).digest('hex')
}

await mkdir(outDir, { recursive: true })

const now = new Date()
const createdAt = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
}).format(now).replace(' ', 'T') + '+07:00'

for (const item of roleInputs) {
  item.sha256 = await toWebp(item.path, item.output)
}

const handoff = {
  schemaVersion: '1.0',
  producerSkill: 'tao-anh-dong-phuc-tre-em',
  createdAt,
  consumerPolicy: { visualInspection: 'not-required-after-validation' },
  publishingIntent: {
    action: 'publish',
    tenantSlug: 'mayaodongphuc',
    domain: 'mayaodongphuc.com.vn',
    categorySlug: 'dong-phuc-tre-em',
    pricingMode: 'quote-only',
    isPurchasable: false,
    stockStatus: 'instock',
    currency: 'VND',
  },
  sourceTransformations: [],
  sourceReferences: [{ path: sourcePath, classification: 'exact garment design with source branding removed' }],
  acceptedImages: roleInputs.map((item) => ({
    path: item.output,
    sha256: item.sha256,
    role: item.role,
    aspectRatio: item.aspectRatio,
    modelCount: item.modelCount,
    altSeed: item.altSeed,
    captionSeed: item.captionSeed,
    visualTags: item.tags,
    productPlacement: item.placement,
    overlay: item.overlay,
  })),
  garmentFacts: {
    productType: 'áo polo đồng phục trẻ em',
    collar: 'cổ polo',
    sleeves: 'tay ngắn',
    fit: 'form dễ vận động nhìn thấy trong ảnh',
    colors,
    pattern,
    approvedArtwork: [`text trẻ em ngắn đặt trong vùng in chính: ${shirtText}`],
    removedArtwork: ['mọi logo, tên lớp, tên trường, thương hiệu và chữ gốc trên áo tham chiếu'],
    visibleSides: ['front', 'back'],
  },
  audiences: ['trẻ em', 'mầm non', 'tiểu học', 'lớp ngoại khóa', 'nhóm dã ngoại'],
  useCases: ['đồng phục trẻ em', 'đồng phục mầm non', 'đồng phục tiểu học', 'ngày hội trường', 'dã ngoại'],
  featureLock: {
    fabric: { copy: 'Mềm mại, thoáng mát', evidenceLevel: 'provided' },
    design: { copy: 'In tên lớp, logo trường hoặc hình minh họa theo yêu cầu', evidenceLevel: 'provided' },
    durability: { copy: 'Bền màu, dễ bảo quản', evidenceLevel: 'provided' },
    printing: { copy: 'Text trẻ em ngắn in trong vùng chính', evidenceLevel: 'visible' },
  },
  unsupportedClaims: ['fabric composition', 'GSM', 'named printing process', 'safety certification', 'wash-cycle count', 'fixed delivery time', 'fixed price'],
  fidelityCaveats: ['Mặt sau là bố cục minh họa đồng phục trẻ em dựa trên phong cách mặt trước khi ảnh tham chiếu không cung cấp mặt sau rõ.'],
  suggestedCategory: { name: 'Đồng phục trẻ em', slug: 'dong-phuc-tre-em' },
  copySeeds: ['đồng phục trẻ em', 'đồng phục mầm non', 'đồng phục tiểu học', 'áo nhóm dã ngoại cho bé', 'đặt may theo yêu cầu'],
}

const sourceId = `${sourceSystem}:${roleInputs[0].sha256}`
const mediaAlt = [
  `Mẫu áo trẻ em ${colors.join(' ')} phù hợp hoạt động lớp học, ngày hội trường và dã ngoại.`,
  `Bối cảnh học tập và vui chơi giúp mẫu áo ${colors.join(' ')} thể hiện sự thoải mái khi trẻ vận động mỗi ngày.`,
  `Mẫu áo trẻ em ${colors.join(' ')} hỗ trợ đặt may theo logo, tên lớp và chủ đề hoạt động.`,
]

const productInput = {
  tenantSlug: 'mayaodongphuc',
  domain: 'mayaodongphuc.com.vn',
  uploadFormat: 'webp',
  webpQuality: 100,
  sourceSystem,
  sourceId,
  categorySlugs: ['dong-phuc-tre-em'],
  product: {
    name,
    slug,
    sku,
    sport: 'other',
    productType: 'simple',
    publicationStatus: 'publish',
    featured: false,
    currency: 'VND',
    stockStatus: 'instock',
    isPurchasable: false,
    isOnBackorder: false,
    shortDescription: `Áo polo đồng phục trẻ em ${colors.join(' ')} đặt may theo lớp, trường hoặc hoạt động ngoại khóa; nhận tư vấn logo, size và số lượng theo yêu cầu.`,
    descriptionParagraphs: [
      `${name} được phát triển theo tinh thần đồng phục học đường vui tươi, dễ mặc và dễ nhận diện trong các hoạt động của trẻ.`,
      `Thiết kế nổi bật với ${pattern}, phù hợp cho lớp mầm non lớn, tiểu học, câu lạc bộ thiếu nhi hoặc ngày hội trường.`,
      `Mayaodongphuc hỗ trợ tùy chỉnh tên lớp, logo trường hoặc hình minh họa thân thiện với trẻ em trước khi sản xuất hàng loạt.`,
      `Form áo tay ngắn, cổ polo gọn gàng giúp trẻ dễ vận động khi học tập, vui chơi trong sân trường hoặc tham gia dã ngoại có giám sát.`,
      `Sản phẩm ở trạng thái đặt may theo báo giá. Đội ngũ xưởng sẽ tư vấn size, số lượng, màu nhận diện và maket in trước khi chốt đơn.`,
    ],
    attributes: [
      { name: 'Dòng áo', values: ['Áo polo đồng phục trẻ em'] },
      { name: 'Màu sắc', values: colors },
      { name: 'Cổ áo', values: ['Cổ polo'] },
      { name: 'Tay áo', values: ['Tay ngắn'] },
      { name: 'Ứng dụng', values: ['Đồng phục mầm non', 'Đồng phục tiểu học', 'Ngày hội trường', 'Dã ngoại'] },
    ],
    badges: ['Đặt may theo yêu cầu', 'In tên - logo lớp', 'Tư vấn size theo nhóm tuổi'],
    searchTags: ['đồng phục trẻ em', 'đồng phục mầm non', 'đồng phục tiểu học', 'áo polo trẻ em', 'áo lớp thiếu nhi', 'đặt may đồng phục', ...colors.map((color) => `màu ${color}`)],
    seoTitle: `${name} | Mayaodongphuc.com.vn`,
    metaDescription: `Đặt may ${name.toLowerCase()} cho lớp, trường và dã ngoại. Tư vấn logo, size, số lượng; sản xuất theo yêu cầu tại Mayaodongphuc.`,
    legacyPath: `/san-pham/${slug}/`,
  },
  media: roleInputs.map((item, index) => ({
    path: item.output,
    alt: mediaAlt[index],
    searchTags: item.tags,
    sourceId: `${sourceId}:${item.key}`,
    filenameBase: `${slug}-${index === 0 ? 'anh-chinh' : item.key}`,
  })),
}

await writeFile(path.join(outDir, 'product-handoff.json'), `${JSON.stringify(handoff, null, 2)}\n`)
await writeFile(path.join(outDir, 'product-input.json'), `${JSON.stringify(productInput, null, 2)}\n`)

console.log(JSON.stringify({
  outDir,
  manifest: path.join(outDir, 'product-handoff.json'),
  input: path.join(outDir, 'product-input.json'),
  images: roleInputs.map((item) => item.output),
  sourceId,
  sku,
  slug,
}, null, 2))
