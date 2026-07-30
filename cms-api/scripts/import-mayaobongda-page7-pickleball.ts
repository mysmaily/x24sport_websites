import 'dotenv/config'
import config from '../src/payload.config'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const TENANT_SLUG = 'mayaopickleball'
const SOURCE_SYSTEM = 'mayaobongda-page7-pickleball-20260729'
const DEFAULT_PRICE = 135000
const DEFAULT_COMPARE_AT_PRICE = 200000

const operationDir = path.resolve(
  process.env.IMPORT_OPERATION_DIR ||
    '../mayaopickleball.vn/operations/mayaobongda-page7-payload-products-20260729',
)

const apply = process.argv.includes('--apply')

type InventoryItem = {
  index: number
  code: string
  media_id: string
  slug: string
  url: string
  image: string
  final: string
}

type DesignMeta = {
  colors: string[]
  palette: string
  style: string
  pattern: string
  mood: string
}

const designMetaByCode: Record<string, DesignMeta> = {
  'MABD 114': {
    colors: ['đỏ', 'cam', 'vàng', 'xanh navy'],
    palette: 'Đỏ cam vàng phối xanh navy',
    style: 'gradient năng lượng',
    pattern: 'mảng chuyển màu ngực vai, thân dưới tối và họa tiết chuyển động',
    mood: 'nổi bật, tốc độ, thi đấu',
  },
  'MABD 113': {
    colors: ['trắng', 'hồng', 'xanh da trời'],
    palette: 'Trắng hồng xanh pastel',
    style: 'pastel hình học',
    pattern: 'tam giác và mảng màu pastel ở vai, hông và thân áo',
    mood: 'trẻ trung, sáng sân, nhẹ nhàng',
  },
  'MABD 112': {
    colors: ['xanh dương', 'trắng'],
    palette: 'Xanh dương phối trắng',
    style: 'tối giản thể thao',
    pattern: 'thân xanh trơn, viền tay và hông trắng gọn',
    mood: 'sạch, khỏe, dễ mặc',
  },
  'MABD 111': {
    colors: ['xanh dương', 'trắng'],
    palette: 'Xanh dương thể thao phối trắng',
    style: 'classic court sport',
    pattern: 'nền xanh mạnh, viền trắng và mảng hông sáng',
    mood: 'đồng đội, gọn gàng, nam nữ đều hợp',
  },
  'MABD 110': {
    colors: ['trắng', 'xanh navy'],
    palette: 'Trắng phối xanh navy',
    style: 'minimal premium',
    pattern: 'nền trắng sạch với chi tiết navy nhỏ',
    mood: 'sang, nhẹ, dễ gắn logo đội',
  },
  'MABD 109': {
    colors: ['kem', 'đen', 'xanh navy'],
    palette: 'Kem đen phối navy',
    style: 'retro typography',
    pattern: 'nền kem, chữ lớn thể thao và trim tối màu',
    mood: 'cá tính, street sport, nhận diện mạnh',
  },
  'MABD 108': {
    colors: ['trắng', 'xanh ngọc', 'xanh teal'],
    palette: 'Trắng xanh ngọc',
    style: 'geometric stripe',
    pattern: 'dải họa tiết ngang xanh ngọc lặp nhịp',
    mood: 'tươi, mát, đồng phục câu lạc bộ',
  },
  'MABD 107': {
    colors: ['kem', 'đen'],
    palette: 'Kem đen cổ điển',
    style: 'classic contrast',
    pattern: 'nền sáng, viền đen rõ ở cổ tay và sườn áo',
    mood: 'gọn, lịch sự, dễ phối',
  },
  'MABD 105': {
    colors: ['trắng', 'đỏ', 'đen', 'xám'],
    palette: 'Trắng đỏ đen splatter',
    style: 'paint splatter',
    pattern: 'vệt sơn đỏ đen trên nền trắng',
    mood: 'năng động, trẻ, nổi bật',
  },
  'MABD 106': {
    colors: ['trắng', 'đỏ'],
    palette: 'Trắng đỏ',
    style: 'chevron stripe',
    pattern: 'sọc đỏ dạng chevron và viền cổ đỏ',
    mood: 'sạch, thi đấu, dễ nhận diện',
  },
  'MABD 104': {
    colors: ['trắng', 'tím', 'xanh navy'],
    palette: 'Trắng tím xanh navy',
    style: 'mountain gradient',
    pattern: 'gradient tím ở thân dưới với mảng núi/brush mờ',
    mood: 'lạ mắt, mềm, cao cấp',
  },
  'MABD 103': {
    colors: ['xanh ngọc', 'đen'],
    palette: 'Xanh ngọc phối đen',
    style: 'solid contrast',
    pattern: 'nền xanh ngọc gần trơn, cổ tay và hông tối',
    mood: 'tối giản, mát mắt, dễ mặc',
  },
  'MABD 81': {
    colors: ['trắng', 'xám'],
    palette: 'Trắng xám',
    style: 'embossed minimal',
    pattern: 'họa tiết chìm ton-sur-ton trên nền trắng',
    mood: 'sạch, tinh tế, nhẹ',
  },
  'MABD 85': {
    colors: ['trắng', 'đỏ', 'vàng'],
    palette: 'Trắng đỏ vàng',
    style: 'brush accent',
    pattern: 'vệt brush đỏ vàng trên nền trắng',
    mood: 'nổi bật, vui, sự kiện',
  },
  'MABD 84': {
    colors: ['xanh dương', 'xanh navy'],
    palette: 'Xanh dương ton-sur-ton',
    style: 'tonal texture',
    pattern: 'nền xanh với texture chìm và chuyển sắc nhẹ',
    mood: 'đậm chất đội nhóm, mạnh mẽ',
  },
  'MABD 83': {
    colors: ['hồng', 'xanh da trời', 'trắng'],
    palette: 'Hồng xanh pastel',
    style: 'pastel gradient',
    pattern: 'mảng hồng xanh sáng, viền và thân áo chuyển màu nhẹ',
    mood: 'trẻ trung, nổi bật vừa phải',
  },
  'MABD 86': {
    colors: ['trắng', 'xanh dương', 'đỏ'],
    palette: 'Trắng xanh đỏ',
    style: 'brush split',
    pattern: 'mảng brush xanh đỏ chia thân áo',
    mood: 'thi đấu, sắc nét, mạnh',
  },
  'MABD 88': {
    colors: ['cam', 'hồng'],
    palette: 'Cam hồng coral',
    style: 'soft diagonal',
    pattern: 'gradient cam hồng với mảng chéo mềm',
    mood: 'ấm, trẻ, nổi bật',
  },
  'MABD 91': {
    colors: ['trắng', 'xanh dương'],
    palette: 'Trắng xanh dương',
    style: 'geometric light',
    pattern: 'họa tiết xanh dương mảnh ở thân dưới',
    mood: 'sạch, sáng, dễ bán',
  },
  'MABD 92': {
    colors: ['trắng', 'tím than', 'xanh navy'],
    palette: 'Trắng tím than',
    style: 'classic jacquard',
    pattern: 'nền trắng họa tiết chìm với viền cổ tím than',
    mood: 'lịch sự, premium, tinh tế',
  },
  'MABD 93': {
    colors: ['đỏ', 'đen'],
    palette: 'Đỏ phối đen',
    style: 'bold chevron',
    pattern: 'họa tiết chevron đỏ ton-sur-ton, phối quần đen',
    mood: 'mạnh, thi đấu, rực sân',
  },
  'MABD 94': {
    colors: ['tím than', 'xanh teal', 'hồng'],
    palette: 'Tím than xanh teal hồng',
    style: 'neon abstract',
    pattern: 'nền tím than với họa tiết teal và điểm hồng sáng',
    mood: 'hiện đại, cá tính, đêm sân',
  },
  'MABD 95': {
    colors: ['vàng', 'cam', 'đen'],
    palette: 'Vàng cam phối đen',
    style: 'sunset gradient',
    pattern: 'gradient vàng sang cam với trim đen',
    mood: 'năng lượng, sáng sân, dễ nhìn',
  },
  'MABD 96': {
    colors: ['hồng', 'trắng', 'đen'],
    palette: 'Hồng phối trắng đen',
    style: 'playful pattern',
    pattern: 'nền hồng có texture nhẹ và chi tiết vui mắt',
    mood: 'trẻ, dễ thương, casual team',
  },
}

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

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const rows = (values: string[]) => values.map((value) => ({ value }))

const sha256 = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')

const productSummary = (meta: DesignMeta, code: string, sku: string) =>
  `Bộ quần áo pickleball nam nữ ${sku} chuyển thể từ mẫu ${code}, phối ${meta.palette.toLowerCase()}, phong cách ${meta.style}, phù hợp đặt may đồng phục CLB và đội nhóm.`

const productDescription = (meta: DesignMeta, code: string, sku: string) =>
  lexicalParagraphs([
    `Mẫu ${sku} được chuyển thể sang áo pickleball nam nữ từ thiết kế nguồn ${code}, giữ lại tinh thần phối màu ${meta.palette.toLowerCase()} và bố cục đồ họa ${meta.pattern}.`,
    `Phong cách ${meta.style} tạo cảm giác ${meta.mood}, phù hợp cho câu lạc bộ, nhóm chơi, giải phong trào hoặc đồng phục công ty khi cần một mẫu áo nổi bật trên sân pickleball.`,
    `Có thể tùy chỉnh màu sắc, logo đội, tên, số áo và size nam nữ theo yêu cầu. Form áo ưu tiên vận động trên sân: gọn, thoáng, dễ xoay người và cầm vợt.`,
  ])

const ensureCategory = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenantID: number,
  category: { name: string; slug: string; group: 'sport' | 'type' | 'color' | 'tag'; order: number },
) => {
  const existing = await payload.find({
    collection: 'product-categories',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { and: [{ tenant: { equals: tenantID } }, { slug: { equals: category.slug } }] },
  })

  if (existing.docs[0]) return existing.docs[0]

  if (!apply) return { ...category, id: `dry-${category.slug}` }

  return payload.create({
    collection: 'product-categories',
    overrideAccess: true,
    data: {
      ...category,
      tenant: tenantID,
      description: category.name,
    },
  })
}

async function main() {
  const payload = await getPayload({ config })
  const inventory = JSON.parse(
    fs.readFileSync(path.join(operationDir, 'source-inventory.json'), 'utf8'),
  ) as InventoryItem[]

  const tenantResult = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: TENANT_SLUG } },
  })
  const tenant = tenantResult.docs[0]
  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantID = Number(tenant.id)

  const backupDir = path.join(operationDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })

  const existingProducts = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: { tenant: { equals: tenantID } },
  })

  const existingCategories = await payload.find({
    collection: 'product-categories',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    where: { tenant: { equals: tenantID } },
  })

  if (apply) {
    fs.writeFileSync(
      path.join(backupDir, `pre-import-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
      JSON.stringify(
        {
          tenant: { id: tenantID, slug: TENANT_SLUG },
          products: existingProducts.docs,
          productCategories: existingCategories.docs,
        },
        null,
        2,
      ),
    )
  }

  const maxSKU = existingProducts.docs.reduce((max, product) => {
    const match = String((product as any).sku || '').match(/^X24-PB-(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  const categoryDocs = await Promise.all([
    ensureCategory(payload, tenantID, {
      name: 'Áo Pickleball',
      slug: 'ao-pickleball',
      group: 'sport',
      order: 10,
    }),
    ensureCategory(payload, tenantID, {
      name: 'Áo Pickleball Thiết Kế Riêng',
      slug: 'ao-pickleball-thiet-ke-rieng',
      group: 'type',
      order: 20,
    }),
  ])

  const planned = []
  const created = []
  const skipped = []

  for (const [offset, item] of inventory.entries()) {
    const meta = designMetaByCode[item.code]
    if (!meta) throw new Error(`Missing design metadata for ${item.code}`)

    const sourceId = item.code.replace(/\s+/g, '-').toLowerCase()
    const existingBySource = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { tenant: { equals: tenantID } },
          { sourceSystem: { equals: SOURCE_SYSTEM } },
          { sourceId: { equals: sourceId } },
        ],
      },
    })

    if (existingBySource.docs[0]) {
      skipped.push({ code: item.code, reason: 'source already imported', id: existingBySource.docs[0].id })
      continue
    }

    const sku = `X24-PB-${String(maxSKU + offset + 1).padStart(3, '0')}`
    const name = `Bộ Quần Áo Pickleball Nam Nữ ${sku} ${meta.palette}`
    const slug = slugify(`bo quan ao pickleball nam nu ${sku} ${meta.palette}`)
    const imagePath = path.join(operationDir, 'output-webp-q96', path.basename(item.final))
    const imageBuffer = fs.readFileSync(imagePath)
    const checksum = sha256(imageBuffer)
    const mediaSourceId = `${sourceId}-hero-q96`

    const searchTags = [
      'pickleball',
      'áo pickleball',
      'áo pickleball nam',
      'áo pickleball nữ',
      'đồng phục pickleball',
      'thiết kế riêng',
      'cổ tròn',
      'tay ngắn',
      meta.style,
      meta.mood,
      ...meta.colors,
      ...(meta.colors.length >= 2 ? ['gradient'] : []),
    ]

    const productPayload = {
      tenant: tenantID,
      name,
      slug,
      sku,
      sport: 'pickleball' as const,
      productType: 'simple' as const,
      publicationStatus: 'publish' as const,
      featured: false,
      categories: categoryDocs.map((category) => Number((category as any).id)).filter(Number.isFinite),
      price: DEFAULT_PRICE,
      regularPrice: DEFAULT_COMPARE_AT_PRICE,
      salePrice: DEFAULT_PRICE,
      compareAtPrice: DEFAULT_COMPARE_AT_PRICE,
      currency: 'VND',
      stockStatus: 'instock' as const,
      isPurchasable: false,
      isOnBackorder: false,
      shortDescription: productSummary(meta, item.code, sku),
      description: productDescription(meta, item.code, sku),
      attributes: [
        { name: 'Màu chủ đạo', values: meta.colors.map((value) => ({ value })) },
        { name: 'Phối màu', values: [{ value: meta.palette }] },
        { name: 'Phong cách', values: [{ value: meta.style }] },
        { name: 'Hoa văn', values: [{ value: meta.pattern }] },
        { name: 'Dáng áo', values: [{ value: 'Áo pickleball nam nữ cổ tròn tay ngắn' }] },
        { name: 'Nguồn thiết kế', values: [{ value: item.code }] },
      ],
      badges: [{ label: 'Đặt may' }, { label: 'Nam nữ' }],
      searchTags: rows([...new Set(searchTags)]),
      seoTitle: `${name} | MayaoPickleball`,
      metaDescription: productSummary(meta, item.code, sku).slice(0, 158),
      sourceSystem: SOURCE_SYSTEM,
      sourceId,
      sourceChecksum: checksum,
      legacyPath: `/san-pham/${slug}/`,
      legacyImages: [
        {
          url: item.image,
          alt: `Ảnh nguồn ${item.code} từ mayaobongda.vn`,
          width: 700,
          height: 700,
        },
      ],
    }

    planned.push({
      code: item.code,
      sku,
      slug,
      image: path.relative(operationDir, imagePath),
      colors: meta.colors,
      palette: meta.palette,
      style: meta.style,
      pattern: meta.pattern,
      checksum,
    })

    if (!apply) continue

    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        tenant: tenantID,
        alt: `${name} trên sân pickleball`,
        searchTags: rows([...new Set([...searchTags, 'ảnh nam nữ trên sân pickleball'])]),
        sourceSystem: SOURCE_SYSTEM,
        sourceId: mediaSourceId,
        sourceUrl: item.image,
        sourceChecksum: checksum,
      },
      file: {
        data: imageBuffer,
        mimetype: 'image/webp',
        name: `${slug}.webp`,
        size: imageBuffer.length,
      },
    })

    const product = await payload.create({
      collection: 'products',
      overrideAccess: true,
      data: {
        ...productPayload,
        gallery: [Number(media.id)],
      },
    })

    created.push({
      code: item.code,
      sku,
      productId: product.id,
      mediaId: media.id,
      slug: (product as any).slug,
      mediaUrl: (media as any).url,
    })
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    existingProductCount: existingProducts.totalDocs,
    maxSKU,
    plannedCount: planned.length,
    createdCount: created.length,
    skippedCount: skipped.length,
    categoryIds: categoryDocs.map((category) => ({ id: (category as any).id, slug: (category as any).slug })),
    planned,
    created,
    skipped,
  }

  fs.writeFileSync(
    path.join(operationDir, apply ? 'payload-import-apply-summary.json' : 'payload-import-dry-run.json'),
    JSON.stringify(summary, null, 2),
  )

  if (apply) {
    fs.writeFileSync(
      path.join(backupDir, `created-records-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
      JSON.stringify(created, null, 2),
    )
  }

  console.log(JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

process.on('beforeExit', () => {
  process.exit(0)
})
