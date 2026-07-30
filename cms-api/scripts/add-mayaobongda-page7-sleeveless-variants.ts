import 'dotenv/config'
import config from '../src/payload.config'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const TENANT_SLUG = 'mayaopickleball'
const SOURCE_SYSTEM = 'mayaobongda-page7-sleeveless-variants-20260730'
const operationDir = path.resolve(
  process.env.IMPORT_OPERATION_DIR ||
    '../mayaopickleball.vn/operations/mayaobongda-page7-sleeveless-variants-20260730',
)
const apply = process.argv.includes('--apply')

const rows = (values: string[]) => [...new Set(values.filter(Boolean))].map((value) => ({ value }))
const rowValues = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map((row) => (typeof row === 'string' ? row : String((row as any)?.value || ''))).filter(Boolean)
    : []
const relationId = (value: unknown) => Number(typeof value === 'object' && value ? (value as any).id : value)
const sha256 = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex')

function upsertAttribute(attributes: any[], name: string, values: string[]) {
  const existing = attributes.find((attribute) => attribute?.name === name)
  if (!existing) {
    attributes.push({ name, values: rows(values) })
    return
  }

  existing.values = rows([...rowValues(existing.values), ...values])
}

async function main() {
  const payload = await getPayload({ config })
  const inventory = JSON.parse(fs.readFileSync(path.join(operationDir, 'inventory.json'), 'utf8')) as any[]
  if (!inventory.length) throw new Error('inventory.json is empty')

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

  const backupDir = path.join(operationDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })

  const productIds = inventory.map((item) => Number(item.targetProductId)).filter(Number.isFinite)
  const productsBefore = await payload.find({
    collection: 'products',
    depth: 2,
    limit: productIds.length,
    overrideAccess: true,
    where: { and: [{ tenant: { equals: tenantID } }, { id: { in: productIds } }] },
  })
  const productById = new Map(productsBefore.docs.map((product: any) => [Number(product.id), product]))
  const existingMediaIds = productsBefore.docs.flatMap((product: any) =>
    Array.isArray(product.gallery) ? product.gallery.map(relationId).filter(Number.isFinite) : [],
  )
  const mediaBefore = existingMediaIds.length
    ? await payload.find({
        collection: 'media',
        depth: 0,
        limit: existingMediaIds.length,
        overrideAccess: true,
        where: { id: { in: existingMediaIds } },
      })
    : { docs: [] }

  const planned = []
  for (const item of inventory) {
    const product = productById.get(Number(item.targetProductId))
    if (!product) throw new Error(`Product ${item.targetProductId} ${item.targetSku} not found`)

    const imageBuffer = fs.readFileSync(path.join(operationDir, item.final))
    const checksum = sha256(imageBuffer)
    const sourceId = `${item.targetSku}-${item.code}-${item.variantSlug}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    const duplicateMedia = await payload.find({
      collection: 'media',
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

    planned.push({
      index: item.index,
      sku: item.targetSku,
      productId: product.id,
      slug: (product as any).slug,
      currentGallery: Array.isArray((product as any).gallery)
        ? (product as any).gallery.map(relationId).filter(Number.isFinite)
        : [],
      source: { code: item.code, url: item.sourceUrl, imageUrl: item.sourceImageUrl },
      variant: {
        slug: item.variantSlug,
        garmentCut: item.metadata.garmentCut,
        bottomColor: item.metadata.bottomColor,
        final: item.final,
        checksum,
        duplicateMediaId: duplicateMedia.docs[0]?.id || null,
      },
    })
  }

  const summary: any = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    sourceSystem: SOURCE_SYSTEM,
    count: inventory.length,
    planned,
  }

  if (!apply) {
    fs.writeFileSync(path.join(operationDir, 'payload-variant-dry-run.json'), JSON.stringify(summary, null, 2))
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  fs.writeFileSync(
    path.join(backupDir, `pre-sleeveless-variants-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
    JSON.stringify({ tenant: { id: tenantID, slug: TENANT_SLUG }, products: productsBefore.docs, media: mediaBefore.docs }, null, 2),
  )

  const updated = []
  for (const item of inventory) {
    const product = productById.get(Number(item.targetProductId)) as any
    const imageBuffer = fs.readFileSync(path.join(operationDir, item.final))
    const checksum = sha256(imageBuffer)
    const sourceId = `${item.targetSku}-${item.code}-${item.variantSlug}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    const variantTags = [
      'sát nách',
      'áo sát nách',
      'áo pickleball sát nách',
      item.metadata.style,
      item.metadata.garmentCut,
      `bottom ${item.metadata.bottomColor}`,
    ]

    const duplicateMedia = await payload.find({
      collection: 'media',
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

    let media = duplicateMedia.docs[0] as any
    if (!media) {
      media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: {
          tenant: tenantID,
          alt: `${product.name} phiên bản áo sát nách, quần/váy ${item.metadata.bottomColor} trên sân pickleball`,
          searchTags: rows([
            ...rowValues(product.searchTags),
            ...variantTags,
            'quần váy trắng đen',
            'ảnh người lớn nam nữ trên sân pickleball',
          ]),
          sourceSystem: SOURCE_SYSTEM,
          sourceId,
          sourceUrl: item.sourceImageUrl,
          sourceChecksum: checksum,
        },
        file: {
          data: imageBuffer,
          mimetype: 'image/webp',
          name: `${product.slug}-sat-nach.webp`,
          size: imageBuffer.length,
        },
      })
    }

    const currentGallery = Array.isArray(product.gallery) ? product.gallery.map(relationId).filter(Number.isFinite) : []
    const nextGallery = [...new Set([...currentGallery, Number(media.id)])]
    const attributes = [...(Array.isArray(product.attributes) ? product.attributes : [])]
    upsertAttribute(attributes, 'Phong cách', [item.metadata.style])
    upsertAttribute(attributes, 'Dáng áo', [item.metadata.garmentCut])
    upsertAttribute(attributes, 'Màu quần/váy', [item.metadata.bottomColor])
    upsertAttribute(attributes, 'Nguồn thiết kế', [item.code])

    const updatedProduct = await payload.update({
      collection: 'products',
      id: product.id,
      overrideAccess: true,
      data: {
        gallery: nextGallery,
        searchTags: rows([...rowValues(product.searchTags), ...variantTags]),
        attributes,
      },
    })

    updated.push({
      sku: item.targetSku,
      productId: updatedProduct.id,
      mediaId: media.id,
      mediaUrl: media.url,
      gallery: nextGallery,
      variant: item.variantSlug,
    })
  }

  summary.updatedCount = updated.length
  summary.updated = updated
  fs.writeFileSync(path.join(operationDir, 'payload-variant-apply-summary.json'), JSON.stringify(summary, null, 2))
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
