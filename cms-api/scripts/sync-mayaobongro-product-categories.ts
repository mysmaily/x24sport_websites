import 'dotenv/config'
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

type SourceCategory = {
  sourceId: number
  name: string
  slug: string
  description: string
  productSourceIds: number[]
}

type SourceMap = {
  source: 'wordpress'
  tenantSlug: 'mayaobongro'
  exportedAt: string
  categories: SourceCategory[]
}

const expectedCounts = new Map([
  ['bo-quan-ao-bong-ro', 605],
  ['logo-doi-bong-ro', 60],
])

const inputPath = process.argv[2]
const apply = process.argv.includes('--apply')

if (!inputPath) {
  throw new Error('Usage: tsx scripts/sync-mayaobongro-product-categories.ts <source-map.json> [--apply]')
}

const source = JSON.parse(fs.readFileSync(inputPath, 'utf8')) as SourceMap
if (source.source !== 'wordpress' || source.tenantSlug !== 'mayaobongro') {
  throw new Error('The source map is not for the mayaobongro WordPress tenant')
}
if (source.categories.length !== expectedCounts.size) {
  throw new Error(`Expected ${expectedCounts.size} split categories, received ${source.categories.length}`)
}

const sourceAssignments = new Map<string, string>()
for (const category of source.categories) {
  const expected = expectedCounts.get(category.slug)
  if (expected === undefined) throw new Error(`Unexpected category slug: ${category.slug}`)
  if (category.productSourceIds.length !== expected) {
    throw new Error(`Category ${category.slug} expected ${expected} products, received ${category.productSourceIds.length}`)
  }
  for (const sourceId of category.productSourceIds) {
    const key = String(sourceId)
    if (sourceAssignments.has(key)) throw new Error(`Product source ID ${key} is assigned to both split categories`)
    sourceAssignments.set(key, category.slug)
  }
}

const run = async () => {
  const payload = await getPayload({ config })
  const tenantResult = await payload.find({
    collection: 'tenants',
    limit: 1,
    depth: 0,
    where: { slug: { equals: source.tenantSlug } },
  })
  const tenant = tenantResult.docs[0]
  if (!tenant) throw new Error(`Tenant not found: ${source.tenantSlug}`)

  const products = await payload.find({
    collection: 'products',
    limit: 1000,
    depth: 0,
    pagination: false,
    where: {
      and: [
        { tenant: { equals: tenant.id } },
        { sourceSystem: { equals: source.source } },
        { publicationStatus: { equals: 'publish' } },
      ],
    },
  })
  const productsBySourceId = new Map(products.docs.map((product) => [String(product.sourceId), product]))
  const missing = [...sourceAssignments.keys()].filter((sourceId) => !productsBySourceId.has(sourceId))
  if (missing.length) throw new Error(`Payload is missing ${missing.length} source products: ${missing.slice(0, 10).join(', ')}`)
  if (products.docs.length !== sourceAssignments.size) {
    throw new Error(`Payload has ${products.docs.length} published WordPress products but the split map has ${sourceAssignments.size}`)
  }

  const existingCategories = await payload.find({
    collection: 'product-categories',
    limit: 100,
    depth: 0,
    pagination: false,
    where: { tenant: { equals: tenant.id } },
  })
  const backup = {
    createdAt: new Date().toISOString(),
    tenant: { id: tenant.id, slug: tenant.slug },
    categories: existingCategories.docs,
    products: products.docs.map((product) => ({
      id: product.id,
      sourceId: product.sourceId,
      categories: product.categories ?? [],
    })),
  }
  const backupPath = path.resolve(path.dirname(inputPath), `payload-before-${new Date().toISOString().replaceAll(':', '-')}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', backupPath, products: products.docs.length, categories: source.categories.map(({ slug, productSourceIds }) => ({ slug, products: productSourceIds.length })) }))
    return
  }

  const categoryIds = new Map<string, number>()
  for (const [index, category] of source.categories.entries()) {
    const existing = existingCategories.docs.find((item) => item.slug === category.slug)
    const data = {
      tenant: tenant.id,
      name: category.name,
      slug: category.slug,
      group: 'type' as const,
      description: category.description,
      order: (index + 1) * 10,
    }
    const saved = existing
      ? await payload.update({ collection: 'product-categories', id: existing.id, data })
      : await payload.create({ collection: 'product-categories', data })
    categoryIds.set(category.slug, saved.id)
  }

  let updated = 0
  for (const product of products.docs) {
    const categorySlug = sourceAssignments.get(String(product.sourceId))
    const categoryId = categorySlug ? categoryIds.get(categorySlug) : undefined
    if (!categoryId) throw new Error(`No target category for Payload product ${product.id}`)
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { categories: [categoryId] },
    })
    updated += 1
  }

  console.log(JSON.stringify({ mode: 'apply', backupPath, updated, categoryIds: Object.fromEntries(categoryIds) }))
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
