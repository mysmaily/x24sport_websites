import 'dotenv/config'
import config from '../src/payload.config'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const TENANT_SLUG = 'mayaopickleball'
const SOURCE_SYSTEM = 'mayaobongro-x24-br-24-to-pickleball-20260730'
const operationDir = path.resolve(
  process.env.IMPORT_OPERATION_DIR ||
    '../mayaopickleball.vn/operations/mayaobongro-x24-br-24-to-pickleball-20260730',
)
const apply = process.argv.includes('--apply')

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

type CategorySeed = {
  name: string
  slug: string
  group: 'sport' | 'type' | 'color' | 'tag'
  order: number
}

const ensureCategory = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenantID: number,
  category: CategorySeed,
) => {
  const found = await payload.find({
    collection: 'product-categories',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { and: [{ tenant: { equals: tenantID } }, { slug: { equals: category.slug } }] },
  })
  if (found.docs[0]) return found.docs[0]
  if (!apply) return { ...category, id: `dry-${category.slug}` }
  return payload.create({
    collection: 'product-categories',
    overrideAccess: true,
    data: { ...category, tenant: tenantID, description: category.name },
  })
}

async function main() {
  const payload = await getPayload({ config })
  const [item] = JSON.parse(fs.readFileSync(path.join(operationDir, 'inventory.json'), 'utf8'))
  if (!item) throw new Error('inventory.json is empty')

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

  const sourceId = `${item.sourceTenant}-${item.sourceProductId}-${item.sourceCode}`.toLowerCase()
  const duplicate = await payload.find({
    collection: 'products',
    depth: 0,
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
  if (duplicate.docs[0]) {
    const summary = {
      mode: apply ? 'apply' : 'dry-run',
      skipped: true,
      reason: 'source already imported',
      productId: duplicate.docs[0].id,
    }
    fs.writeFileSync(path.join(operationDir, 'payload-import-summary.json'), JSON.stringify(summary, null, 2))
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  const maxSKU = existingProducts.docs.reduce((max, product) => {
    const match = String((product as any).sku || '').match(/^X24-PB-(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  const sku = `X24-PB-${String(maxSKU + 1).padStart(3, '0')}`
  const palette = item.metadata.palette as string
  const name = `Bộ Quần Áo Pickleball Trẻ Em ${sku} ${palette}`
  const slug = slugify(name)
  const imagePath = path.join(operationDir, item.final)
  const imageBuffer = fs.readFileSync(imagePath)
  const checksum = sha256(imageBuffer)

  const categories = await Promise.all([
    ensureCategory(payload, tenantID, { name: 'Áo Pickleball', slug: 'ao-pickleball', group: 'sport', order: 10 }),
    ensureCategory(payload, tenantID, {
      name: 'Áo Pickleball Thiết Kế Riêng',
      slug: 'ao-pickleball-thiet-ke-rieng',
      group: 'type',
      order: 20,
    }),
    ensureCategory(payload, tenantID, {
      name: 'Áo Pickleball Trẻ Em',
      slug: 'ao-pickleball-tre-em',
      group: 'type',
      order: 30,
    }),
  ])

  const searchTags = [
    'pickleball',
    'áo pickleball',
    'áo pickleball trẻ em',
    'đồng phục pickleball',
    'thiết kế riêng',
    'trẻ em',
    'không tay',
    'cổ V',
    'xanh ve chai',
    'trắng',
    'xanh đậm',
    'gradient',
    'texture chấm',
    'graphic hông',
  ]

  const shortDescription =
    `Bộ quần áo pickleball trẻ em ${sku} phối xanh ve chai và trắng, dáng không tay cổ V, giữ tinh thần thiết kế ${item.sourceCode} nhưng chuyển hoàn toàn sang bối cảnh pickleball.`

  const productData = {
    tenant: tenantID,
    name,
    slug,
    sku,
    sport: 'pickleball' as const,
    productType: 'simple' as const,
    publicationStatus: 'publish' as const,
    featured: false,
    categories: categories.map((category) => Number((category as any).id)).filter(Number.isFinite),
    price: 135000,
    regularPrice: 200000,
    salePrice: 135000,
    compareAtPrice: 200000,
    currency: 'VND',
    stockStatus: 'instock' as const,
    isPurchasable: false,
    isOnBackorder: false,
    shortDescription,
    description: lexicalParagraphs([
      `Mẫu ${sku} được chuyển thể từ thiết kế ${item.sourceCode} sang bộ quần áo pickleball trẻ em, giữ phối màu xanh ve chai và trắng cùng cổ V không tay gọn gàng.`,
      `Thân áo có gradient xanh ve chai xuống trắng, texture chấm mờ và graphic hông tạo cảm giác thể thao nhưng đã loại bỏ bối cảnh bóng rổ để phù hợp sân pickleball.`,
      `Phù hợp cho lớp học, câu lạc bộ, trung tâm thể thao hoặc đội trẻ em cần đồng phục pickleball có thể tùy chỉnh logo, tên và số áo.`,
    ]),
    attributes: [
      { name: 'Nhóm sử dụng', values: [{ value: 'Trẻ em' }] },
      { name: 'Màu chủ đạo', values: item.metadata.colors.map((value: string) => ({ value })) },
      { name: 'Phối màu', values: [{ value: palette }] },
      { name: 'Phong cách', values: [{ value: item.metadata.style }] },
      { name: 'Hoa văn', values: [{ value: item.metadata.pattern }] },
      { name: 'Dáng áo', values: [{ value: item.metadata.garmentCut }] },
      { name: 'Nguồn thiết kế', values: [{ value: item.sourceCode }] },
    ],
    badges: [{ label: 'Trẻ em' }, { label: 'Đặt may' }],
    searchTags: rows([...new Set(searchTags)]),
    seoTitle: `${name} | MayaoPickleball`,
    metaDescription: shortDescription.slice(0, 158),
    sourceSystem: SOURCE_SYSTEM,
    sourceId,
    sourceChecksum: checksum,
    legacyPath: `/san-pham/${slug}/`,
    legacyImages: [
      {
        url: item.sourceImageUrl,
        alt: `Ảnh nguồn ${item.sourceCode} từ mayaobongro.vn`,
        width: 1000,
        height: 1000,
      },
    ],
  }

  if (apply) {
    fs.writeFileSync(
      path.join(backupDir, `pre-import-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
      JSON.stringify(
        { tenant: { id: tenantID, slug: TENANT_SLUG }, products: existingProducts.docs, productCategories: existingCategories.docs },
        null,
        2,
      ),
    )
  }

  const summary: any = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    source: { productId: item.sourceProductId, sku: item.sourceSku, code: item.sourceCode, url: item.sourceUrl },
    planned: { sku, name, slug, categories: categories.map((category) => ({ id: (category as any).id, slug: (category as any).slug })), metadata: item.metadata, checksum },
  }

  if (apply) {
    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        tenant: tenantID,
        alt: `${name} trên sân pickleball`,
        searchTags: rows([...new Set([...searchTags, 'ảnh trẻ em nam nữ trên sân pickleball'])]),
        sourceSystem: SOURCE_SYSTEM,
        sourceId: `${sourceId}-hero-q96`,
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
      data: { ...productData, gallery: [Number(media.id)] },
    })
    summary.created = {
      productId: product.id,
      mediaId: media.id,
      mediaUrl: (media as any).url,
      slug: (product as any).slug,
    }

    const updatedCategories = []
    for (const category of categories) {
      const id = Number((category as any).id)
      if (!Number.isFinite(id)) continue
      const products = await payload.find({
        collection: 'products',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { and: [{ tenant: { equals: tenantID } }, { categories: { contains: id } }] },
      })
      const updated = await payload.update({
        collection: 'product-categories',
        id,
        overrideAccess: true,
        data: { productCount: products.totalDocs },
      })
      updatedCategories.push({ id: updated.id, slug: (updated as any).slug, productCount: (updated as any).productCount })
    }
    summary.updatedCategories = updatedCategories
  }

  fs.writeFileSync(
    path.join(operationDir, apply ? 'payload-import-apply-summary.json' : 'payload-import-dry-run.json'),
    JSON.stringify(summary, null, 2),
  )
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
