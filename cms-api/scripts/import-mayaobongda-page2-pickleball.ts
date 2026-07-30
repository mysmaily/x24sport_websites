import 'dotenv/config'
import config from '../src/payload.config'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const TENANT_SLUG = 'mayaopickleball'
const SOURCE_SYSTEM = 'mayaobongda-page2-pickleball-20260730'
const DEFAULT_PRICE = 135000
const DEFAULT_COMPARE_AT_PRICE = 200000

const operationDir = path.resolve(
  process.env.IMPORT_OPERATION_DIR ||
    '../mayaopickleball.vn/operations/mayaobongda-page2-payload-products-20260730',
)

const apply = process.argv.includes('--apply')

type InventoryItem = {
  index: number
  code: string
  title: string
  source_image: string
  local_source_path: string
  output_path: string
  checksum_sha256?: string
  output_checksum_sha256?: string
}

type Inventory = {
  source_page: string
  items: InventoryItem[]
}

type DesignMeta = {
  colors: string[]
  palette: string
  style: string
  pattern: string
  mood: string
  garmentCut: string
}

const designMetaByCode: Record<string, DesignMeta> = {
  'wp-1307': {
    colors: ['trắng', 'xanh navy', 'đen'],
    palette: 'Trắng phối xanh navy đen',
    style: 'minimal premium',
    pattern: 'nền trắng có texture chìm, cổ chữ V và viền tay xanh navy đen, mảng sườn tối màu',
    mood: 'sạch, sang, dễ làm đồng phục CLB',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1305': {
    colors: ['xanh navy', 'xanh dương', 'đỏ', 'trắng'],
    palette: 'Xanh navy phối xanh dương đỏ trắng',
    style: 'geometric gradient',
    pattern: 'nền xanh navy, họa tiết hình học xanh dương ở thân dưới, viền cổ tay trắng đỏ',
    mood: 'mạnh mẽ, thi đấu, gọn đội hình',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1303': {
    colors: ['vàng', 'đen'],
    palette: 'Vàng phối đen',
    style: 'tonal court energy',
    pattern: 'nền vàng rực, texture ton-sur-ton toàn thân, viền cổ tay đen và mảng sườn tối',
    mood: 'nổi bật, năng lượng, dễ nhận diện trên sân',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1301': {
    colors: ['trắng', 'xanh navy', 'xanh dương', 'đen'],
    palette: 'Trắng phối xanh navy xanh dương',
    style: 'clean geometric',
    pattern: 'nền trắng, họa tiết hình học mảnh ở thân dưới, mảng sườn xanh navy và viền xanh dương',
    mood: 'thanh lịch, sáng sân, dễ gắn logo đội',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1299': {
    colors: ['trắng', 'đỏ', 'xanh navy', 'xám'],
    palette: 'Trắng phối đỏ xanh navy xám',
    style: 'flash shoulder graphic',
    pattern: 'thân trắng xám, vai và tay áo có mảng đồ họa đỏ xanh navy dạng tốc độ',
    mood: 'trẻ trung, sắc nét, thi đấu phong trào',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1317': {
    colors: ['xanh ngọc', 'hồng', 'xanh navy'],
    palette: 'Xanh ngọc phối hồng pastel',
    style: 'abstract sleeve energy',
    pattern: 'nền xanh ngọc, họa tiết hồng xanh navy ở tay áo và sườn, texture nhẹ trên thân',
    mood: 'tươi, hiện đại, nổi bật vừa phải',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1315': {
    colors: ['hồng', 'đen', 'xanh navy'],
    palette: 'Hồng nhạt phối đen xanh navy',
    style: 'shadow contrast',
    pattern: 'nền hồng nhạt, mảng hông đen xanh navy, viền hồng đậm ở cổ và tay',
    mood: 'cá tính, trẻ, dễ mặc cho đội nam nữ',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1313': {
    colors: ['xanh ngọc', 'trắng', 'xanh navy'],
    palette: 'Xanh ngọc phối trắng xanh navy',
    style: 'tonal texture',
    pattern: 'nền xanh ngọc có texture chìm, sọc cổ tay trắng và mảng sườn xanh navy',
    mood: 'mát mắt, đồng đội, sạch thiết kế',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1311': {
    colors: ['xanh ngọc', 'trắng'],
    palette: 'Xanh ngọc phối trắng',
    style: 'stormy tonal',
    pattern: 'nền xanh ngọc có họa tiết chìm dạng chuyển động, viền cổ tay trắng và sườn sáng',
    mood: 'năng động, mát, hợp CLB ngoài trời',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1309': {
    colors: ['đỏ', 'vàng', 'đen'],
    palette: 'Đỏ phối vàng đen',
    style: 'diamond flame',
    pattern: 'nền đỏ, mảng vàng dạng lưới kim cương và tia dọc ở thân dưới, sườn đen',
    mood: 'máu lửa, mạnh, nổi bật trong giải đấu',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1329': {
    colors: ['xanh chuối', 'xanh dương', 'xanh navy'],
    palette: 'Xanh chuối phối xanh dương',
    style: 'lime geometric',
    pattern: 'nền xanh chuối, viền xanh dương và họa tiết hình học dọc ở thân dưới',
    mood: 'sáng sân, trẻ, nhiều năng lượng',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1327': {
    colors: ['trắng', 'kem', 'vàng', 'đen'],
    palette: 'Trắng kem phối vàng đen',
    style: 'ornamental premium',
    pattern: 'nền trắng kem, hoa văn vàng đen ở tay áo và sườn, cổ tay viền đen vàng',
    mood: 'cao cấp, lịch sự, khác biệt',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1325': {
    colors: ['hồng', 'xanh navy', 'đen'],
    palette: 'Hồng đậm phối xanh navy',
    style: 'bold sleeve abstract',
    pattern: 'nền hồng đậm, đồ họa xanh navy đen ở vai tay và sườn áo',
    mood: 'cá tính, thời trang, nổi bật',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1323': {
    colors: ['xanh navy', 'vàng neon', 'xanh dương'],
    palette: 'Xanh navy phối vàng neon',
    style: 'neon angular',
    pattern: 'nền xanh navy, điểm vàng neon ở cổ tay và sườn, họa tiết tuyến tính chìm trên thân',
    mood: 'hiện đại, mạnh, thể thao',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1321': {
    colors: ['đỏ', 'vàng', 'xanh dương', 'đen'],
    palette: 'Đỏ tươi phối vàng xanh dương',
    style: 'eagle sleeve graphic',
    pattern: 'nền đỏ tươi, họa tiết vàng xanh dương ở vai tay và mảng sườn đen',
    mood: 'nổi bật, thi đấu, giàu năng lượng',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1319': {
    colors: ['đỏ đô', 'vàng', 'xanh navy'],
    palette: 'Đỏ đô phối vàng xanh navy',
    style: 'vanta angular',
    pattern: 'nền đỏ đô, viền vàng ở cổ, mảng sườn xanh navy và texture góc chìm',
    mood: 'đậm, sang, hợp đội cần nhận diện mạnh',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1341': {
    colors: ['kem', 'đỏ đô', 'đen', 'vàng'],
    palette: 'Kem phối đỏ đô đen vàng',
    style: 'retro ornamental',
    pattern: 'nền kem, hoa văn đỏ đô đen vàng ở tay áo và sườn, viền cổ tay đỏ đô',
    mood: 'trẻ trung, premium, lạ mắt',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1339': {
    colors: ['hồng', 'xanh ngọc', 'đen'],
    palette: 'Hồng nhạt phối xanh ngọc',
    style: 'soft vanta panel',
    pattern: 'nền hồng nhạt, mảng sườn xanh ngọc, viền cổ tay đen nhẹ và texture chìm',
    mood: 'tươi trẻ, nhẹ, hợp nhóm nam nữ',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1337': {
    colors: ['vàng', 'đỏ đô', 'đỏ'],
    palette: 'Vàng neon phối đỏ đô',
    style: 'high visibility minimal',
    pattern: 'nền vàng neon, mảng đỏ đô ở sườn, viền cổ tay đỏ và texture hình học chìm',
    mood: 'rực rỡ, dễ nhận diện, máu lửa',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1335': {
    colors: ['đỏ', 'xanh ngọc', 'trắng', 'đen'],
    palette: 'Đỏ phối xanh ngọc trắng đen',
    style: 'shadow side panel',
    pattern: 'nền đỏ, mảng sườn xanh ngọc trắng đen, texture thân trước dạng chéo',
    mood: 'thể thao, gọn, thi đấu',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1333': {
    colors: ['trắng', 'xanh navy', 'xanh dương'],
    palette: 'Trắng phối xanh navy xanh dương',
    style: 'white court minimal',
    pattern: 'nền trắng sạch, viền cổ tay xanh navy xanh dương và mảng sườn xanh',
    mood: 'sáng, tinh tế, dễ phối logo CLB',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1331': {
    colors: ['trắng', 'đỏ', 'xanh navy', 'đen'],
    palette: 'Trắng phối đỏ xanh navy',
    style: 'shadow clean contrast',
    pattern: 'nền trắng, viền cổ đỏ xanh navy, mảng sườn đỏ xanh navy và texture chìm',
    mood: 'sắc nét, sạch, dễ thi đấu',
    garmentCut: 'Áo pickleball nam nữ cổ tròn tay ngắn',
  },
  'wp-1356': {
    colors: ['đỏ đô', 'vàng', 'xanh navy'],
    palette: 'Đỏ đô phối vàng xanh navy',
    style: 'lunes vertical geometry',
    pattern: 'nền đỏ đô, họa tiết dọc hình học ở thân dưới, viền vàng và sườn xanh navy',
    mood: 'mạnh mẽ, sang, đồng phục giải đấu',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
  },
  'wp-1354': {
    colors: ['xanh dương', 'đỏ', 'trắng'],
    palette: 'Xanh dương phối đỏ trắng',
    style: 'forza team classic',
    pattern: 'nền xanh dương, viền cổ tay đỏ trắng, mảng sườn đỏ và texture chìm',
    mood: 'đội nhóm, khỏe, dễ bán',
    garmentCut: 'Áo pickleball nam nữ cổ chữ V tay ngắn',
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

const productSummary = (meta: DesignMeta, sourceTitle: string, sku: string) =>
  `Bộ quần áo pickleball nam nữ ${sku} phối ${meta.palette.toLowerCase()}, form thể thao thoáng nhẹ, phù hợp đặt may đồng phục CLB, đội nhóm và giải giao hữu.`

const productDescription = (meta: DesignMeta, sourceTitle: string, sku: string) =>
  lexicalParagraphs([
    `Mẫu ${sku} là bộ quần áo pickleball nam nữ được phát triển theo phối màu ${meta.palette.toLowerCase()}, giữ tinh thần thiết kế thể thao nổi bật nhưng làm mới cho bối cảnh sân pickleball.`,
    `Bố cục ${meta.pattern} giúp áo có điểm nhấn rõ khi lên ảnh đội nhóm, đồng thời vẫn gọn gàng để thêm logo câu lạc bộ, tên đội, tên vận động viên hoặc số áo theo yêu cầu.`,
    `Form ${meta.garmentCut.toLowerCase()} ưu tiên sự thoải mái khi di chuyển, xoay người và cầm vợt. Chất vải có thể tư vấn theo nhu cầu tập luyện, thi đấu phong trào hoặc đồng phục sự kiện.`,
    `X24 Sport hỗ trợ chỉnh màu, phối size nam nữ và lên demo trước khi may để đội dễ chốt mẫu đồng phục pickleball đồng nhất, đẹp mắt và đúng nhận diện riêng.`,
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
  ) as Inventory

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
    limit: 1500,
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

  const baseCategories = await Promise.all([
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
    ensureCategory(payload, tenantID, {
      name: 'Áo Pickleball Cổ Tròn',
      slug: 'ao-pickleball-co-tron',
      group: 'type',
      order: 30,
    }),
  ])

  const colorCategoryMap = new Map<string, any>()
  const planned = []
  const created = []
  const skipped = []
  const affectedCategoryIDs = new Set<number>()

  for (const [offset, item] of inventory.items.entries()) {
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
    const imagePath = path.join(operationDir, 'output-webp-q96', path.basename(item.output_path))
    const imageBuffer = fs.readFileSync(imagePath)
    const checksum = sha256(imageBuffer)
    const mediaSourceId = `${sourceId}-mockup-q96`

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

    const categoryDocs = [...baseCategories, ...colorCategories]
    const categoryIDs = categoryDocs
      .map((category) => Number((category as any).id))
      .filter(Number.isFinite)
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
      meta.garmentCut.includes('cổ tròn') ? 'cổ tròn' : 'cổ chữ V',
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
      shortDescription: productSummary(meta, item.title, sku),
      description: productDescription(meta, item.title, sku),
      attributes: [
        { name: 'Màu chủ đạo', values: meta.colors.map((value) => ({ value })) },
        { name: 'Phối màu', values: [{ value: meta.palette }] },
        { name: 'Phong cách', values: [{ value: meta.style }] },
        { name: 'Hoa văn', values: [{ value: meta.pattern }] },
        { name: 'Dáng áo', values: [{ value: meta.garmentCut }] },
        { name: 'Nguồn thiết kế', values: [{ value: item.code }] },
      ],
      badges: [{ label: 'Đặt may' }, { label: 'Nam nữ' }],
      searchTags: rows(searchTags),
      seoTitle: `${name} | MayaoPickleball`,
      metaDescription: productSummary(meta, item.title, sku).slice(0, 158),
      sourceSystem: SOURCE_SYSTEM,
      sourceId,
      sourceChecksum: checksum,
      legacyPath: `/san-pham/${slug}/`,
      legacyImages: [
        {
          url: item.source_image,
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
      checksum,
      categorySlugs: categoryDocs.map((category) => (category as any).slug),
    })

    if (!apply) continue

    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        tenant: tenantID,
        alt: `${name} trên sân pickleball`,
        searchTags: rows([...searchTags, 'ảnh nam nữ trên sân pickleball']),
        sourceSystem: SOURCE_SYSTEM,
        sourceId: mediaSourceId,
        sourceUrl: item.source_image,
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
    sourcePage: inventory.source_page,
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
