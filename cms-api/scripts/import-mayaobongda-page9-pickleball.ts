import 'dotenv/config'
import config from '../src/payload.config'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const TENANT_SLUG = 'mayaopickleball'
const SOURCE_SYSTEM = 'mayaobongda-page9-pickleball-20260730'
const DEFAULT_PRICE = 135000
const DEFAULT_COMPARE_AT_PRICE = 200000

const operationDir = path.resolve(
  process.env.IMPORT_OPERATION_DIR ||
    '../mayaopickleball.vn/operations/mayaobongda-page9-payload-products-20260730',
)

const apply = process.argv.includes('--apply')

type InventoryItem = {
  code: string
  title: string
  slug: string
  sourceUrl: string
  sourceImageUrl: string
  sourceImagePath: string
  outputPngPath: string
  outputWebpPath: string
  sourceChecksumSha256?: string
  outputWebpChecksumSha256?: string
}

type DesignMeta = {
  colors: string[]
  palette: string
  style: string
  pattern: string
  mood: string
  garmentCut: string
  collar: 'cổ tròn' | 'cổ chữ V' | 'cổ bẻ'
}

const designMetaByCode: Record<string, DesignMeta> = {
  'MABD 29': {
    colors: ['xanh dương', 'xanh navy', 'trắng', 'tím pastel'],
    palette: 'Xanh dương phối xanh navy trắng tím pastel',
    style: 'geometric gradient',
    pattern: 'nền xanh dương, mảng gradient xanh navy tím ở thân dưới, sọc vai trắng và chi tiết hông sáng',
    mood: 'trẻ, sáng sân, hợp đội nam nữ',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
    collar: 'cổ chữ V',
  },
  'MABD 30': {
    colors: ['xanh cyan', 'xanh dương', 'xanh navy', 'trắng'],
    palette: 'Xanh cyan phối xanh dương navy trắng',
    style: 'tonal hex texture',
    pattern: 'nền xanh cyan có texture lục giác chìm, cổ tay xanh nhạt, hông trắng xanh navy',
    mood: 'mát mắt, năng động, dễ nhận diện trên sân',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 27': {
    colors: ['xanh dương', 'trắng'],
    palette: 'Xanh dương phối trắng',
    style: 'classic tonal pattern',
    pattern: 'nền xanh dương có hoa văn chìm, cổ và bo tay trắng, mảng sườn trắng',
    mood: 'gọn, khỏe, hợp đồng phục CLB',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 31': {
    colors: ['xanh navy', 'kem', 'vàng đồng'],
    palette: 'Xanh navy phối kem vàng đồng',
    style: 'polo premium',
    pattern: 'nền xanh navy tối giản, cổ bẻ màu kem, bo tay kem và đường sườn sáng',
    mood: 'lịch sự, sang, phù hợp đội doanh nghiệp',
    garmentCut: 'Áo pickleball nam nữ cổ bẻ tay ngắn',
    collar: 'cổ bẻ',
  },
  'MABD 32': {
    colors: ['trắng', 'xanh navy', 'xanh dương'],
    palette: 'Trắng phối xanh navy xanh dương',
    style: 'minimal line graphic',
    pattern: 'nền trắng, họa tiết chấm và đường cong xanh navy ở thân trước, viền cổ tay navy',
    mood: 'sạch, thanh lịch, dễ gắn logo đội',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
    collar: 'cổ chữ V',
  },
  'MABD 76': {
    colors: ['cam', 'đen', 'vàng cam'],
    palette: 'Cam phối đen vàng cam',
    style: 'angular speed',
    pattern: 'nền cam, các dải chéo đen vàng cam dạng tốc độ chạy dọc thân áo',
    mood: 'rực rỡ, mạnh mẽ, nổi bật khi thi đấu',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 34': {
    colors: ['đen', 'vàng gold', 'xám'],
    palette: 'Đen phối vàng gold xám',
    style: 'luxury angular',
    pattern: 'nền đen, mảng hình học vàng gold và xám ở thân trước, viền cổ tay vàng',
    mood: 'cá tính, cao cấp, dễ làm áo đội mạnh',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
    collar: 'cổ chữ V',
  },
  'MABD 33': {
    colors: ['trắng', 'xanh dương', 'xanh navy'],
    palette: 'Trắng phối xanh dương navy',
    style: 'diagonal speed line',
    pattern: 'nền trắng, sọc chéo xanh dương ở thân dưới, vai và viền xanh navy',
    mood: 'sáng, thể thao, dễ mặc cho đội nam nữ',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
    collar: 'cổ chữ V',
  },
  'MABD 35': {
    colors: ['trắng', 'xanh navy', 'xám'],
    palette: 'Trắng phối xanh navy xám',
    style: 'curve contrast',
    pattern: 'mảng cong trắng xám lớn trên thân, nửa áo xanh navy và viền cổ tay navy',
    mood: 'gọn, hiện đại, hợp đồng phục câu lạc bộ',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
    collar: 'cổ chữ V',
  },
  'MABD 36': {
    colors: ['kem', 'đỏ đô', 'trắng'],
    palette: 'Kem phối đỏ đô trắng',
    style: 'retro premium',
    pattern: 'nền kem có texture nhẹ, vai sườn và bo tay đỏ đô, đường chéo trắng ở hông',
    mood: 'ấm, lịch sự, khác biệt trên sân',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 37': {
    colors: ['đỏ', 'đen', 'trắng'],
    palette: 'Đỏ phối đen trắng',
    style: 'classic match kit',
    pattern: 'nền đỏ có texture chìm, bo cổ tay trắng đỏ và quần/váy đen tương phản',
    mood: 'thi đấu, mạnh, dễ nhìn từ xa',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 38': {
    colors: ['trắng', 'xanh mint', 'xanh ngọc'],
    palette: 'Trắng phối xanh mint xanh ngọc',
    style: 'soft map geometric',
    pattern: 'nền trắng xanh mint, grid hình học và mảng màu loang nhẹ toàn thân',
    mood: 'mát, nhẹ, thanh lịch',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 39': {
    colors: ['trắng', 'vàng', 'nâu đồng'],
    palette: 'Trắng phối vàng nâu đồng',
    style: 'minimal diagonal accent',
    pattern: 'nền trắng, mảng sườn nâu đồng, điểm vàng và các đường chéo tối giản ở thân trước',
    mood: 'sạch, premium, dễ phối theo nhận diện đội',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 40': {
    colors: ['tím', 'xanh navy', 'tím pastel'],
    palette: 'Tím phối xanh navy tím pastel',
    style: 'tonal lower texture',
    pattern: 'nền tím xanh navy, họa tiết dọc ton-sur-ton ở thân dưới và viền tay tím',
    mood: 'hiện đại, mạnh, nổi bật vừa phải',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 41': {
    colors: ['cam', 'đen', 'đỏ cam'],
    palette: 'Cam phối đen đỏ cam',
    style: 'diagonal race stripe',
    pattern: 'vai đen, thân cam chuyển sắc, sọc chéo đen ở ngực và viền tay đen',
    mood: 'năng lượng, thi đấu, cá tính',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 42': {
    colors: ['trắng', 'xanh navy', 'tím pastel', 'vàng'],
    palette: 'Trắng phối xanh navy tím pastel vàng',
    style: 'bold geometric diagonal',
    pattern: 'nền trắng, mảng chéo xanh navy lớn, điểm tím pastel và vàng ở thân áo',
    mood: 'trẻ trung, sáng sân, hiện đại',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 43': {
    colors: ['xanh mint', 'trắng', 'xanh teal'],
    palette: 'Xanh mint phối trắng teal',
    style: 'soft wave minimal',
    pattern: 'nền xanh mint nhạt, mảng sóng trắng chìm và sọc vai xanh teal',
    mood: 'mát, nhẹ, dễ mặc',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 44': {
    colors: ['vàng', 'đen', 'trắng'],
    palette: 'Vàng phối đen trắng',
    style: 'vertical contrast panel',
    pattern: 'nền vàng, dải dọc đen trắng ở thân trước, vai và sườn đen',
    mood: 'nổi bật, rõ nhận diện, thể thao',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
    collar: 'cổ chữ V',
  },
  'MABD 45': {
    colors: ['trắng', 'xanh navy', 'vàng'],
    palette: 'Trắng phối xanh navy vàng',
    style: 'clean shoulder panel',
    pattern: 'nền trắng, vai và bo tay xanh navy, điểm line vàng mảnh ở ngực và sườn',
    mood: 'gọn, sáng, hợp áo đội',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 46': {
    colors: ['vàng gold', 'trắng'],
    palette: 'Vàng gold phối trắng',
    style: 'embossed minimal premium',
    pattern: 'nền vàng gold có texture chìm, hông trắng và bố cục tối giản cao cấp',
    mood: 'sang, sạch, khác biệt',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 47': {
    colors: ['trắng', 'đen', 'vàng gold'],
    palette: 'Trắng phối đen vàng gold',
    style: 'side graphic performance',
    pattern: 'nền trắng có texture xám chìm, vai và hông đen, họa tiết vàng gold ở hai bên sườn',
    mood: 'sạch, mạnh, thi đấu',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 48': {
    colors: ['xanh lá', 'xanh navy', 'trắng'],
    palette: 'Xanh lá phối xanh navy trắng',
    style: 'tonal geometric',
    pattern: 'nền xanh lá có họa tiết hình học chìm, bo tay và chân váy/quần xanh navy',
    mood: 'tươi, trẻ, sáng sân',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 49': {
    colors: ['trắng', 'xanh dương', 'xanh navy', 'xanh teal'],
    palette: 'Trắng phối xanh dương navy teal',
    style: 'brush splatter',
    pattern: 'nền trắng, vệt cọ xanh dương navy teal chéo qua thân trước và tay áo',
    mood: 'năng động, phóng khoáng, hợp ảnh đội',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
  },
  'MABD 50': {
    colors: ['xanh dương', 'xanh navy', 'trắng', 'đỏ'],
    palette: 'Xanh dương phối xanh navy trắng đỏ',
    style: 'starburst court graphic',
    pattern: 'nền xanh dương, họa tiết trắng dạng tia sao ở giữa thân và line xanh navy hai bên',
    mood: 'đậm, nổi bật, phù hợp đội cần nhận diện mạnh',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
    collar: 'cổ tròn',
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

const rows = (values: string[]) => [...new Set(values.filter(Boolean))].map((value) => ({ value }))

const sha256 = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')

const colorFilterTags = (colors: string[]) => {
  const tags = [...colors]
  if (colors.some((color) => color.includes('xanh'))) tags.push('xanh')
  if (colors.length >= 3) tags.push('gradient')
  return [...new Set(tags)]
}

const productSummary = (meta: DesignMeta, sku: string) =>
  `Bộ quần áo pickleball nam nữ ${sku} phối ${meta.palette.toLowerCase()}, ${meta.collar}, form thể thao thoáng nhẹ cho CLB, đội nhóm và giải giao hữu.`

const productDescription = (meta: DesignMeta, sku: string) =>
  lexicalParagraphs([
    `Mẫu ${sku} là bộ quần áo pickleball nam nữ được phát triển theo phối màu ${meta.palette.toLowerCase()}, tạo cảm giác ${meta.mood} khi lên sân và khi chụp ảnh đội nhóm.`,
    `Bố cục thiết kế gồm ${meta.pattern}. Các mảng màu được giữ gọn để đội có thể thêm logo câu lạc bộ, tên đội, tên vận động viên hoặc số áo theo yêu cầu mà tổng thể vẫn sạch mắt.`,
    `Form ${meta.garmentCut.toLowerCase()} dùng cho vận động pickleball, ưu tiên cảm giác thoải mái khi di chuyển ngang, xoay người, vung vợt và thi đấu phong trào. Bộ nam nữ có thể phối quần short, váy hoặc skort theo nhu cầu.`,
    `X24 Sport hỗ trợ chỉnh màu, tư vấn chất vải, phối size và lên demo trước khi may, phù hợp cho câu lạc bộ pickleball, nhóm chơi, công ty hoặc đội tham gia giải nội bộ.`,
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
      sourceSystem: SOURCE_SYSTEM,
      sourceId: category.slug,
    },
  })
}

async function main() {
  const payload = await getPayload({ config })
  const inventory = JSON.parse(
    fs.readFileSync(path.join(operationDir, 'source-inventory.json'), 'utf8'),
  ) as InventoryItem[]

  if (inventory.length !== 24) throw new Error(`Expected 24 inventory items, received ${inventory.length}`)

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
    limit: 2000,
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

  const baseCategoryInputs = [
    { name: 'Áo Pickleball', slug: 'ao-pickleball', group: 'sport' as const, order: 10 },
    {
      name: 'Áo Pickleball Thiết Kế Riêng',
      slug: 'ao-pickleball-thiet-ke-rieng',
      group: 'type' as const,
      order: 20,
    },
    { name: 'Áo Pickleball Cổ Tròn', slug: 'ao-pickleball-co-tron', group: 'type' as const, order: 30 },
    { name: 'Áo Pickleball Cổ Chữ V', slug: 'ao-pickleball-co-chu-v', group: 'type' as const, order: 31 },
    { name: 'Áo Pickleball Cổ Bẻ', slug: 'ao-pickleball-co-be', group: 'type' as const, order: 32 },
  ]
  const baseCategoryDocs = await Promise.all(baseCategoryInputs.map((category) => ensureCategory(payload, tenantID, category)))
  const baseCategoryBySlug = new Map(baseCategoryDocs.map((category) => [(category as any).slug, category]))

  const colorCategoryMap = new Map<string, any>()
  const planned = []
  const created = []
  const skipped = []
  const affectedCategoryIDs = new Set<number>()

  for (const [offset, item] of inventory.entries()) {
    const meta = designMetaByCode[item.code]
    if (!meta) throw new Error(`Missing design metadata for ${item.code}`)

    const sourceId = item.code
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
    const imagePath = path.join(operationDir, 'output-webp-q96', item.outputWebpPath)
    const imageBuffer = fs.readFileSync(imagePath)
    const checksum = sha256(imageBuffer)
    const mediaSourceId = `${sourceId}-mockup-q96`

    const collarCategorySlug =
      meta.collar === 'cổ chữ V'
        ? 'ao-pickleball-co-chu-v'
        : meta.collar === 'cổ bẻ'
          ? 'ao-pickleball-co-be'
          : 'ao-pickleball-co-tron'

    const colorCategories = await Promise.all(
      colorFilterTags(meta.colors).map(async (color, index) => {
        const categorySlug = `mau-${slugify(color)}`
        if (colorCategoryMap.has(categorySlug)) return colorCategoryMap.get(categorySlug)
        const category = await ensureCategory(payload, tenantID, {
          name: `Màu ${color}`,
          slug: categorySlug,
          group: 'color',
          order: 100 + index,
        })
        colorCategoryMap.set(categorySlug, category)
        return category
      }),
    )

    const categoryDocs = [
      baseCategoryBySlug.get('ao-pickleball'),
      baseCategoryBySlug.get('ao-pickleball-thiet-ke-rieng'),
      baseCategoryBySlug.get(collarCategorySlug),
      ...colorCategories,
    ].filter(Boolean)
    const categoryIDs = categoryDocs.map((category) => Number((category as any).id)).filter(Number.isFinite)
    categoryIDs.forEach((id) => affectedCategoryIDs.add(id))

    const colorTags = colorFilterTags(meta.colors)
    const searchTags = [
      'pickleball',
      'áo pickleball',
      'áo pickleball nam',
      'áo pickleball nữ',
      'bộ quần áo pickleball',
      'đồng phục pickleball',
      'thiết kế riêng',
      'đội nhóm',
      'câu lạc bộ',
      meta.collar,
      'tay ngắn',
      meta.style,
      meta.mood,
      ...colorTags,
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
      categories: categoryIDs,
      price: DEFAULT_PRICE,
      regularPrice: DEFAULT_COMPARE_AT_PRICE,
      salePrice: DEFAULT_PRICE,
      compareAtPrice: DEFAULT_COMPARE_AT_PRICE,
      currency: 'VND',
      stockStatus: 'instock' as const,
      isPurchasable: false,
      isOnBackorder: false,
      shortDescription: productSummary(meta, sku),
      description: productDescription(meta, sku),
      attributes: [
        { name: 'Màu chủ đạo', values: meta.colors.map((value) => ({ value })) },
        { name: 'Phối màu', values: [{ value: meta.palette }] },
        { name: 'Phong cách', values: [{ value: meta.style }] },
        { name: 'Hoa văn', values: [{ value: meta.pattern }] },
        { name: 'Dáng áo', values: [{ value: meta.garmentCut }] },
        { name: 'Kiểu cổ', values: [{ value: meta.collar }] },
        { name: 'Nguồn thiết kế', values: [{ value: item.code }] },
      ],
      badges: [{ label: 'Đặt may' }, { label: 'Nam nữ' }],
      searchTags: rows(searchTags),
      seoTitle: `${name} | MayaoPickleball`,
      metaDescription: productSummary(meta, sku).slice(0, 158),
      sourceSystem: SOURCE_SYSTEM,
      sourceId,
      sourceChecksum: checksum,
      legacyPath: `/san-pham/${slug}/`,
      legacyImages: [
        {
          url: item.sourceImageUrl,
          alt: `Ảnh thiết kế nguồn ${item.code}`,
        },
      ],
    }

    planned.push({
      code: item.code,
      sourceTitle: item.title,
      sku,
      slug,
      image: path.relative(operationDir, imagePath),
      colors: meta.colors,
      colorFilterTags: colorTags,
      palette: meta.palette,
      style: meta.style,
      pattern: meta.pattern,
      collar: meta.collar,
      garmentCut: meta.garmentCut,
      checksum,
      categorySlugs: categoryDocs.map((category) => (category as any).slug),
    })

    if (!apply) continue

    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        tenant: tenantID,
        alt: `${name} ${meta.collar} trên sân pickleball`,
        searchTags: rows([
          ...searchTags,
          'ảnh nam nữ trên sân pickleball',
          'sân pickleball ngoài trời',
          'vợt pickleball',
          meta.garmentCut,
        ]),
        sourceSystem: SOURCE_SYSTEM,
        sourceId: mediaSourceId,
        sourceUrl: item.sourceImageUrl,
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

  const categoryCounts = []
  if (apply) {
    for (const categoryID of [...affectedCategoryIDs]) {
      const count = await payload.count({
        collection: 'products',
        overrideAccess: true,
        where: {
          and: [
            { tenant: { equals: tenantID } },
            { categories: { contains: categoryID } },
            { publicationStatus: { equals: 'publish' } },
          ],
        },
      })
      await payload.update({
        collection: 'product-categories',
        id: categoryID,
        overrideAccess: true,
        data: { productCount: count.totalDocs },
      })
      categoryCounts.push({ categoryID, productCount: count.totalDocs })
    }
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    sourceSystem: SOURCE_SYSTEM,
    sourcePage: 'https://mayaobongda.vn/shop/?page=9',
    existingProductCount: existingProducts.totalDocs,
    maxSKU,
    plannedCount: planned.length,
    createdCount: created.length,
    skippedCount: skipped.length,
    planned,
    created,
    skipped,
    categoryCounts,
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

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
