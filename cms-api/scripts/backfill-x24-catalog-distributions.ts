import 'dotenv/config'
import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type Doc = Record<string, any>

const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const targetSlug = 'x24sport'
const cloneSystem = 'payload-tenant-clone'

const relationID = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationID((value as Doc).id)
      : undefined

const stableHash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

async function allDocs(payload: any, collection: string, where: Doc, depth = 0) {
  const docs: Doc[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({ collection, where, depth, limit: 100, page, overrideAccess: true })
    docs.push(...result.docs)
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

function parseCloneIdentity(value: unknown) {
  const match = String(value || '').match(/^([a-z0-9-]+):(\d+)$/)
  return match ? { sourceSlug: match[1], sourceProductID: Number(match[2]) } : undefined
}

function sourceFactFingerprint(product: Doc) {
  return stableHash({
    sku: product.sku || null,
    sport: product.sport || null,
    productType: product.productType || null,
    price: product.price ?? null,
    regularPrice: product.regularPrice ?? null,
    salePrice: product.salePrice ?? null,
    compareAtPrice: product.compareAtPrice ?? null,
    stockStatus: product.stockStatus || null,
    attributes: product.attributes || [],
    badges: product.badges || [],
    gallery: Array.isArray(product.gallery) ? product.gallery.map(relationID).filter(Boolean) : [],
  })
}

function targetCopyFingerprint(product: Doc) {
  return stableHash({
    name: product.name || '',
    shortDescription: product.shortDescription || '',
    description: product.description || null,
    seoTitle: product.seoTitle || '',
    metaDescription: product.metaDescription || '',
  })
}

function hasMediaSharedToTarget(source: Doc, targetTenantID: number | string) {
  const gallery = Array.isArray(source.gallery) ? source.gallery : []
  return gallery.some((media) => {
    const shared = media && typeof media === 'object' && Array.isArray(media.sharedWithTenants)
      ? media.sharedWithTenants
      : []
    return shared.map(relationID).some((id: number | string | undefined) => String(id) === String(targetTenantID))
  })
}

async function run() {
  const payload: any = await getPayload({ config })
  const [targetTenant] = await allDocs(payload, 'tenants', { slug: { equals: targetSlug } })
  if (!targetTenant) throw new Error(`Không tìm thấy tenant đích ${targetSlug}.`)

  const [tenants, targetProducts, existingDistributions] = await Promise.all([
    allDocs(payload, 'tenants', {}, 0),
    allDocs(payload, 'products', { and: [{ tenant: { equals: targetTenant.id } }, { sourceSystem: { equals: cloneSystem } }] }, 1),
    allDocs(payload, 'catalog-distributions', { targetTenant: { equals: targetTenant.id } }, 0),
  ])

  const tenantsBySlug = new Map(tenants.map((tenant) => [tenant.slug, tenant]))
  const sourceIDsBySlug = new Map<string, number[]>()
  for (const targetProduct of targetProducts) {
    const identity = parseCloneIdentity(targetProduct.sourceId)
    if (!identity) continue
    const ids = sourceIDsBySlug.get(identity.sourceSlug) || []
    ids.push(identity.sourceProductID)
    sourceIDsBySlug.set(identity.sourceSlug, ids)
  }

  const sourceDocs = (await Promise.all([...sourceIDsBySlug.entries()].flatMap(([slug, ids]) => {
    const tenant = tenantsBySlug.get(slug)
    if (!tenant) return []
    return Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) =>
      payload.find({
        collection: 'products',
        depth: 1,
        limit: 100,
        overrideAccess: true,
        where: {
          and: [
            { tenant: { equals: tenant.id } },
            { id: { in: ids.slice(index * 100, index * 100 + 100) } },
          ],
        },
      }).then((result: { docs: Doc[] }) => result.docs),
    )
  }))).flat()

  const sourcesByKey = new Map<string, Doc>()
  for (const product of sourceDocs) {
    const tenant = product.tenant as Doc | undefined
    if (tenant?.slug && product.id) sourcesByKey.set(`${tenant.slug}:${product.id}`, product)
  }
  const distributionsByKey = new Map(existingDistributions.map((item) => [item.distributionKey, item]))

  let candidates = 0
  let created = 0
  let updated = 0
  let skippedMissingSource = 0
  let skippedWithoutSharedMedia = 0
  let conflicts = 0

  for (const targetProduct of targetProducts) {
    const identity = parseCloneIdentity(targetProduct.sourceId)
    if (!identity) {
      skippedMissingSource += 1
      continue
    }
    const source = sourcesByKey.get(`${identity.sourceSlug}:${identity.sourceProductID}`)
    if (!source) {
      skippedMissingSource += 1
      continue
    }
    if (!hasMediaSharedToTarget(source, targetTenant.id)) {
      skippedWithoutSharedMedia += 1
      continue
    }

    candidates += 1
    const sourceTenantID = relationID(source.tenant)
    if (!sourceTenantID) throw new Error(`Product nguồn ${source.id} không có tenant.`)
    const distributionKey = `${sourceTenantID}:${source.id}:${targetTenant.id}`
    const existing = distributionsByKey.get(distributionKey)
    if (existing && String(relationID(existing.sourceProduct)) !== String(source.id)) {
      conflicts += 1
      continue
    }

    const data = {
      sourceTenant: sourceTenantID,
      sourceProduct: source.id,
      targetTenant: targetTenant.id,
      targetProduct: targetProduct.id,
      status: targetProduct.publicationStatus === 'publish' ? 'published' : 'draft_created',
      copyMode: 'manual_locked',
      sourceFactFingerprint: sourceFactFingerprint(source),
      targetCopyFingerprint: targetCopyFingerprint(targetProduct),
      syncedAt: targetProduct.updatedAt || new Date().toISOString(),
      reviewNote: 'Backfill từ X24 clone có media nguồn đã được chia sẻ sang X24. Copy hiện hữu được khóa để không bị AI ghi đè.',
    }

    if (apply) {
      if (existing) {
        await payload.update({ collection: 'catalog-distributions', id: existing.id, data, overrideAccess: true })
        updated += 1
      } else {
        await payload.create({ collection: 'catalog-distributions', data, overrideAccess: true })
        created += 1
      }
    } else if (existing) {
      updated += 1
    } else {
      created += 1
    }
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    targetTenant: targetSlug,
    targetCloneProducts: targetProducts.length,
    candidatesWithSharedSourceMedia: candidates,
    created,
    updated,
    skippedMissingSource,
    skippedWithoutSharedMedia,
    conflicts,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
