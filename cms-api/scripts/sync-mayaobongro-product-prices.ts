import 'dotenv/config'
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

type SourcePrice = {
  sourceId: string
  slug: string
  sku: string
  productType: 'simple'
  price: number
  compareAtPrice: number | null
}

type SourceSnapshot = {
  schemaVersion: 1
  source: 'wordpress'
  tenantSlug: 'mayaobongro'
  exportedAt: string
  products: SourcePrice[]
}

const expectedProducts = 665
const inputPath = process.argv[2]
const apply = process.argv.includes('--apply')

if (!inputPath) throw new Error('Usage: tsx scripts/sync-mayaobongro-product-prices.ts <source-prices.json> [--apply]')

const source = JSON.parse(fs.readFileSync(inputPath, 'utf8')) as SourceSnapshot
if (source.schemaVersion !== 1 || source.source !== 'wordpress' || source.tenantSlug !== 'mayaobongro') {
  throw new Error('Invalid mayaobongro WordPress price snapshot')
}
if (source.products.length !== expectedProducts) {
  throw new Error(`Expected ${expectedProducts} source products, received ${source.products.length}`)
}
const sourceById = new Map<string, SourcePrice>()
for (const product of source.products) {
  if (product.productType !== 'simple') throw new Error(`Unexpected product type for source ID ${product.sourceId}`)
  if (!Number.isFinite(product.price) || product.price <= 0) throw new Error(`Invalid price for source ID ${product.sourceId}`)
  if (sourceById.has(product.sourceId)) throw new Error(`Duplicate source ID ${product.sourceId}`)
  sourceById.set(product.sourceId, product)
}

const run = async () => {
  const payload = await getPayload({ config })
  const tenantResult = await payload.find({ collection: 'tenants', limit: 1, depth: 0, where: { slug: { equals: source.tenantSlug } } })
  const tenant = tenantResult.docs[0]
  if (!tenant) throw new Error(`Tenant not found: ${source.tenantSlug}`)

  const result = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0,
    pagination: false,
    where: { and: [{ tenant: { equals: tenant.id } }, { sourceSystem: { equals: source.source } }, { publicationStatus: { equals: 'publish' } }] },
  })
  if (result.docs.length !== expectedProducts) throw new Error(`Expected ${expectedProducts} Payload products, received ${result.docs.length}`)

  const missing: string[] = []
  const mismatchedSlugs: string[] = []
  const changes: Array<{ id: number; sourceId: string; price: number; compareAtPrice: number | null }> = []
  for (const product of result.docs) {
    const sourceId = String(product.sourceId || '')
    const sourceProduct = sourceById.get(sourceId)
    if (!sourceProduct) {
      missing.push(sourceId || `payload:${product.id}`)
      continue
    }
    if (sourceProduct.slug !== product.slug) mismatchedSlugs.push(sourceId)
    if (product.price !== sourceProduct.price || (product.compareAtPrice ?? null) !== sourceProduct.compareAtPrice) {
      changes.push({ id: product.id, sourceId, price: sourceProduct.price, compareAtPrice: sourceProduct.compareAtPrice })
    }
  }
  if (missing.length) throw new Error(`Payload/source identity mismatch for ${missing.length} products: ${missing.slice(0, 10).join(', ')}`)
  if (mismatchedSlugs.length) throw new Error(`Slug mismatch for ${mismatchedSlugs.length} products: ${mismatchedSlugs.slice(0, 10).join(', ')}`)

  const backup = {
    createdAt: new Date().toISOString(),
    sourceSnapshot: path.resolve(inputPath),
    tenant: { id: tenant.id, slug: tenant.slug },
    products: result.docs.map((product) => ({ id: product.id, sourceId: product.sourceId, slug: product.slug, price: product.price ?? null, compareAtPrice: product.compareAtPrice ?? null })),
  }
  const backupPath = path.resolve(path.dirname(inputPath), `payload-prices-before-${new Date().toISOString().replaceAll(':', '-')}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', tenantId: tenant.id, sourceProducts: source.products.length, payloadProducts: result.docs.length, changes: changes.length, backupPath }))
    return
  }

  let cursor = 0
  let updated = 0
  const workers = Array.from({ length: 8 }, async () => {
    while (cursor < changes.length) {
      const change = changes[cursor++]
      await payload.update({ collection: 'products', id: change.id, data: { price: change.price, compareAtPrice: change.compareAtPrice } })
      updated += 1
    }
  })
  await Promise.all(workers)
  console.log(JSON.stringify({ mode: 'apply', tenantId: tenant.id, sourceProducts: source.products.length, updated, backupPath }))
}

run().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1) })
