import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

type Doc = Record<string, any>

const sourceSlug = 'mayaochaybo'
const targetSlug = 'x24sport'
const categorySlug = 'bong-ro'
const sourceSystem = 'payload-tenant-clone'

const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const reportPathArg = process.argv.find((arg) => arg.startsWith('--report='))
const reportPath = reportPathArg?.slice('--report='.length)

const relationId = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationId((value as Doc).id)
      : undefined

async function allDocs(payload: any, collection: string, where: Doc, depth = 0) {
  const docs: Doc[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({
      collection,
      where,
      depth,
      limit: 100,
      page,
      overrideAccess: true,
    })
    docs.push(...(result.docs as Doc[]))
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

async function recalculateCategoryCounts(payload: any, targetTenantId: number | string, req?: any) {
  const published = await allDocs(payload, 'products', {
    and: [{ tenant: { equals: targetTenantId } }, { publicationStatus: { equals: 'publish' } }],
  }, 1)
  const categories = await allDocs(payload, 'product-categories', { tenant: { equals: targetTenantId } }, 0)
  for (const category of categories) {
    const count = published.filter((product) => (Array.isArray(product.categories) ? product.categories : [])
      .map(relationId)
      .some((id) => String(id) === String(category.id))).length
    await payload.update({
      collection: 'product-categories',
      id: category.id,
      data: { productCount: count },
      overrideAccess: true,
      req,
    })
  }
}

async function run() {
  const payload: any = await getPayload({ config })
  const [targetTenant] = await allDocs(payload, 'tenants', { slug: { equals: targetSlug } })
  if (!targetTenant) throw new Error(`Không tìm thấy tenant đích ${targetSlug}.`)

  const [targetCategory] = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: categorySlug } }],
  }, 0)
  if (!targetCategory) throw new Error(`Không tìm thấy danh mục ${targetSlug}/${categorySlug}.`)

  const [superAdmin] = await allDocs(payload, 'users', { role: { equals: 'super_admin' } }, 0)
  if (apply && !superAdmin) throw new Error('Không tìm thấy tài khoản super_admin để cập nhật sản phẩm.')
  const adminReq = superAdmin ? ({ user: superAdmin } as any) : undefined

  const products = await allDocs(payload, 'products', {
    and: [
      { tenant: { equals: targetTenant.id } },
      { sourceSystem: { equals: sourceSystem } },
      { sourceId: { like: `${sourceSlug}:` } },
      { categories: { equals: targetCategory.id } },
      { publicationStatus: { equals: 'publish' } },
    ],
  }, 1)

  const changed: Doc[] = []
  for (const product of products) {
    const categoryIds = (Array.isArray(product.categories) ? product.categories : [])
      .map(relationId)
      .filter((id): id is number | string => id !== undefined)
      .filter((id) => String(id) !== String(targetCategory.id))
    changed.push(product)
    if (apply) {
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { categories: categoryIds },
        overrideAccess: true,
        req: adminReq,
      })
    }
  }

  if (apply) {
    await recalculateCategoryCounts(payload, targetTenant.id, adminReq)
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    targetTenant: targetSlug,
    sourceTenant: sourceSlug,
    removedCategory: categorySlug,
    matchedProducts: products.length,
    removedFromCategory: changed.length,
    items: changed.map((product) => ({
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      sourceId: product.sourceId,
    })),
  }

  if (reportPath) {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(reportPath, JSON.stringify(summary, null, 2))
  }

  console.log(JSON.stringify({
    mode: summary.mode,
    matchedProducts: summary.matchedProducts,
    removedFromCategory: summary.removedFromCategory,
    report: reportPath || null,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
