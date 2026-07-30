import 'dotenv/config'
import config from '../src/payload.config'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const TENANT_SLUG = 'mayaopickleball'
const TARGET_SKU = 'X24-PB-695'
const SOURCE_SYSTEM = 'mayaobongro-x24-br-24-collared-sleeved-variant-20260730'
const operationDir = path.resolve(
  process.env.IMPORT_OPERATION_DIR ||
    '../mayaopickleball.vn/operations/mayaobongro-x24-br-24-collared-sleeved-variant-20260730',
)
const apply = process.argv.includes('--apply')

const rows = (values: string[]) => [...new Set(values.filter(Boolean))].map((value) => ({ value }))
const rowValues = (rowsValue: unknown): string[] =>
  Array.isArray(rowsValue)
    ? rowsValue.map((row) => (typeof row === 'string' ? row : String((row as any)?.value || ''))).filter(Boolean)
    : []
const relationId = (value: unknown) => Number(typeof value === 'object' && value ? (value as any).id : value)
const sha256 = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')

function upsertAttribute(attributes: any[], name: string, values: string[]) {
  const existing = attributes.find((attribute) => attribute?.name === name)
  if (!existing) {
    attributes.push({ name, values: rows(values) })
    return attributes
  }

  existing.values = rows([...rowValues(existing.values), ...values])
  return attributes
}

async function main() {
  const payload = await getPayload({ config })
  const [item] = JSON.parse(fs.readFileSync(path.join(operationDir, 'inventory.json'), 'utf8'))
  if (!item) throw new Error('inventory.json is empty')

  const tenant = (
    await payload.find({
      collection: 'tenants',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: TENANT_SLUG } },
    })
  ).docs[0]
  if (!tenant) throw new Error(`Tenant ${TENANT_SLUG} not found`)
  const tenantID = Number(tenant.id)

  const product = (
    await payload.find({
      collection: 'products',
      depth: 2,
      limit: 1,
      overrideAccess: true,
      where: { and: [{ tenant: { equals: tenantID } }, { sku: { equals: TARGET_SKU } }] },
    })
  ).docs[0] as any
  if (!product) throw new Error(`Product ${TARGET_SKU} not found in ${TENANT_SLUG}`)

  const imagePath = path.join(operationDir, item.final)
  const imageBuffer = fs.readFileSync(imagePath)
  const checksum = sha256(imageBuffer)
  const sourceId = `${item.sourceTenant}-${item.sourceProductId}-${item.sourceCode}-${item.variant}`.toLowerCase()

  const duplicateMedia = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { tenant: { equals: tenantID } },
        { sourceSystem: { equals: SOURCE_SYSTEM } },
        { sourceId: { equals: `${sourceId}-q96` } },
      ],
    },
  })

  const currentGallery = Array.isArray(product.gallery) ? product.gallery.map(relationId).filter(Number.isFinite) : []
  const variantTags = [
    'có cổ',
    'cổ bẻ tay ngắn',
    'tay ngắn',
    'ống tay',
    'polo pickleball',
    'áo pickleball có cổ',
  ]
  const productTags = rows([...rowValues(product.searchTags), ...variantTags])
  const attributes = [...(Array.isArray(product.attributes) ? product.attributes : [])]
  upsertAttribute(attributes, 'Dáng áo', [item.metadata.garmentCut])
  upsertAttribute(attributes, 'Phong cách', [item.metadata.style])

  const planned = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    product: { id: product.id, sku: product.sku, slug: product.slug, currentGallery },
    source: {
      productId: item.sourceProductId,
      sku: item.sourceSku,
      code: item.sourceCode,
      url: item.sourceUrl,
      imageUrl: item.sourceImageUrl,
    },
    variant: {
      sourceSystem: SOURCE_SYSTEM,
      sourceId: `${sourceId}-q96`,
      checksum,
      final: item.final,
      metadata: item.metadata,
      duplicateMediaId: duplicateMedia.docs[0]?.id || null,
    },
  }

  if (!apply) {
    fs.writeFileSync(path.join(operationDir, 'payload-variant-dry-run.json'), JSON.stringify(planned, null, 2))
    console.log(JSON.stringify(planned, null, 2))
    return
  }

  const backupDir = path.join(operationDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const currentMedia = currentGallery.length
    ? await payload.find({
        collection: 'media',
        depth: 0,
        limit: currentGallery.length,
        overrideAccess: true,
        where: { id: { in: currentGallery } },
      })
    : { docs: [] }
  fs.writeFileSync(
    path.join(backupDir, `pre-variant-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
    JSON.stringify({ tenant: { id: tenantID, slug: TENANT_SLUG }, product, media: currentMedia.docs }, null, 2),
  )

  let media = duplicateMedia.docs[0] as any
  if (!media) {
    media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      data: {
        tenant: tenantID,
        alt: 'Bộ Quần Áo Pickleball Nam Nữ X24-PB-695 xanh ve chai phối trắng phiên bản có cổ tay ngắn trên sân pickleball',
        searchTags: rows([
          ...rowValues(product.searchTags),
          ...variantTags,
          'xanh ve chai',
          'trắng',
          'gradient',
          'texture chấm',
          'graphic hông',
          'ảnh người lớn nam nữ trên sân pickleball',
        ]),
        sourceSystem: SOURCE_SYSTEM,
        sourceId: `${sourceId}-q96`,
        sourceUrl: item.sourceImageUrl,
        sourceChecksum: checksum,
      },
      file: {
        data: imageBuffer,
        mimetype: 'image/webp',
        name: `${product.slug}-co-co-tay-ngan.webp`,
        size: imageBuffer.length,
      },
    })
  }

  const nextGallery = [...new Set([...currentGallery, Number(media.id)])]
  const updatedProduct = await payload.update({
    collection: 'products',
    id: product.id,
    overrideAccess: true,
    data: {
      gallery: nextGallery,
      searchTags: productTags,
      attributes,
    },
  })

  const summary = {
    ...planned,
    updated: {
      productId: updatedProduct.id,
      mediaId: media.id,
      mediaUrl: media.url,
      gallery: nextGallery,
      attributes: (updatedProduct as any).attributes,
    },
  }
  fs.writeFileSync(path.join(operationDir, 'payload-variant-apply-summary.json'), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
