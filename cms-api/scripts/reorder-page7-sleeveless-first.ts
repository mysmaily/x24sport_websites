import 'dotenv/config'
import config from '../src/payload.config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const TENANT_SLUG = 'mayaopickleball'
const operationDir = path.resolve(
  process.env.IMPORT_OPERATION_DIR ||
    '../mayaopickleball.vn/operations/mayaobongda-page7-sleeveless-variants-20260730',
)
const apply = process.argv.includes('--apply')

const relationId = (value: unknown) => Number(typeof value === 'object' && value ? (value as any).id : value)

async function main() {
  const payload = await getPayload({ config })
  const summary = JSON.parse(fs.readFileSync(path.join(operationDir, 'payload-variant-apply-summary.json'), 'utf8'))
  const updated = summary.updated as Array<{ sku: string; productId: number; mediaId: number }>

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

  const productIds = updated.map((item) => Number(item.productId)).filter(Number.isFinite)
  const productsBefore = await payload.find({
    collection: 'products',
    depth: 2,
    limit: productIds.length,
    overrideAccess: true,
    where: { and: [{ tenant: { equals: tenantID } }, { id: { in: productIds } }] },
  })
  const byId = new Map(productsBefore.docs.map((product: any) => [Number(product.id), product]))

  const planned = updated.map((item) => {
    const product = byId.get(Number(item.productId)) as any
    if (!product) throw new Error(`Product ${item.productId} ${item.sku} not found`)
    const gallery = Array.isArray(product.gallery) ? product.gallery.map(relationId).filter(Number.isFinite) : []
    const nextGallery = [Number(item.mediaId), ...gallery.filter((id: number) => id !== Number(item.mediaId))]
    return {
      sku: item.sku,
      productId: item.productId,
      mediaId: item.mediaId,
      before: gallery,
      after: nextGallery,
      changed: gallery[0] !== Number(item.mediaId),
    }
  })

  const result: any = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantID, slug: TENANT_SLUG },
    count: planned.length,
    changedCount: planned.filter((item) => item.changed).length,
    planned,
  }

  if (!apply) {
    fs.writeFileSync(path.join(operationDir, 'payload-reorder-sat-nach-first-dry-run.json'), JSON.stringify(result, null, 2))
    console.log(JSON.stringify(result, null, 2))
    return
  }

  const backupDir = path.join(operationDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  fs.writeFileSync(
    path.join(backupDir, `pre-reorder-sat-nach-first-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
    JSON.stringify({ tenant: { id: tenantID, slug: TENANT_SLUG }, products: productsBefore.docs }, null, 2),
  )

  const reordered = []
  for (const item of planned) {
    const product = await payload.update({
      collection: 'products',
      id: item.productId,
      overrideAccess: true,
      data: { gallery: item.after },
    })
    reordered.push({
      sku: item.sku,
      productId: product.id,
      gallery: item.after,
    })
  }

  result.reordered = reordered
  fs.writeFileSync(path.join(operationDir, 'payload-reorder-sat-nach-first-apply-summary.json'), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
