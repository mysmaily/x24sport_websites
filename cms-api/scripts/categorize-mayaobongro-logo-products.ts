import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

type Doc = Record<string, any>

const tenantSlug = 'x24sport'
const sourceSlug = 'mayaobongro'
const parentCategorySlug = 'bong-ro'
const logoCategorySlug = 'logo-bong-ro'
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

function plainText(value: unknown): string {
  if (value && typeof value === 'object') {
    const object = value as Doc
    return plainText(object.name ?? object.label ?? object.value ?? object.slug ?? '')
  }
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isLogoProduct(product: Doc) {
  const haystack = [
    product.name,
    product.slug,
    ...(Array.isArray(product.searchTags) ? product.searchTags.map((tag: Doc) => tag?.value) : []),
    ...(Array.isArray(product.sourceTags) ? product.sourceTags.flatMap((tag: Doc) => [tag?.name, tag?.slug]) : []),
  ].map(plainText).join(' ').toLocaleLowerCase('vi')
  return /\blogo\b|lô\s*gô/.test(haystack)
}

function uniqueRelationIds(ids: Array<number | string>) {
  const seen = new Set<string>()
  const result: Array<number | string> = []
  for (const id of ids) {
    const key = String(id)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(id)
  }
  return result
}

async function ensureLogoCategory(payload: any, tenantId: number | string, parentCategory: Doc, req?: any) {
  const [existing] = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: tenantId } }, { slug: { equals: logoCategorySlug } }],
  }, 0)
  const data = {
    tenant: tenantId,
    name: 'Logo bóng rổ',
    slug: logoCategorySlug,
    parent: parentCategory.id,
    group: 'sport' as const,
    description: 'Logo bóng rổ cho đội nhóm, lớp học, câu lạc bộ và nhận diện giải đấu.',
    legacyPath: `/danh-muc/${logoCategorySlug}/`,
    sourceSystem: 'manual',
    sourceId: `${tenantSlug}:${logoCategorySlug}`,
    order: 31,
  }
  if (!apply) return existing || { ...data, id: '(dry-run)' }
  if (existing) {
    return payload.update({
      collection: 'product-categories',
      id: existing.id,
      data,
      overrideAccess: true,
      req,
    })
  }
  return payload.create({
    collection: 'product-categories',
    data,
    overrideAccess: true,
    req,
  })
}

async function recalculateCategoryCounts(payload: any, tenantId: number | string, req?: any) {
  const published = await allDocs(payload, 'products', {
    and: [{ tenant: { equals: tenantId } }, { publicationStatus: { equals: 'publish' } }],
  }, 1)
  const categories = await allDocs(payload, 'product-categories', { tenant: { equals: tenantId } }, 0)
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
  const [tenant] = await allDocs(payload, 'tenants', { slug: { equals: tenantSlug } })
  if (!tenant) throw new Error(`Không tìm thấy tenant ${tenantSlug}.`)

  const [parentCategory] = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: tenant.id } }, { slug: { equals: parentCategorySlug } }],
  }, 0)
  if (!parentCategory) throw new Error(`Không tìm thấy danh mục ${tenantSlug}/${parentCategorySlug}.`)

  const [superAdmin] = await allDocs(payload, 'users', { role: { equals: 'super_admin' } }, 0)
  if (apply && !superAdmin) throw new Error('Không tìm thấy tài khoản super_admin để cập nhật sản phẩm.')
  const adminReq = superAdmin ? ({ user: superAdmin } as any) : undefined
  const logoCategory = await ensureLogoCategory(payload, tenant.id, parentCategory, adminReq)

  const sourceProducts = await allDocs(payload, 'products', {
    and: [
      { tenant: { equals: tenant.id } },
      { sourceSystem: { equals: sourceSystem } },
      { sourceId: { like: `${sourceSlug}:` } },
      { publicationStatus: { equals: 'publish' } },
    ],
  }, 1)

  const logoProducts = sourceProducts.filter(isLogoProduct)
  const changed: Doc[] = []
  const alreadySeparated: Doc[] = []

  for (const product of logoProducts) {
    const categoryIds = (Array.isArray(product.categories) ? product.categories : [])
      .map(relationId)
      .filter((id): id is number | string => id !== undefined)
      .filter((id) => String(id) !== String(parentCategory.id))
    const nextCategories = uniqueRelationIds([...categoryIds, logoCategory.id])
    const unchanged = nextCategories.map(String).includes(String(logoCategory.id))
      && !categoryIds.map(String).includes(String(parentCategory.id))
      && nextCategories.length === categoryIds.length
    if (unchanged) {
      alreadySeparated.push(product)
      continue
    }

    changed.push(product)
    if (apply) {
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { categories: nextCategories },
        overrideAccess: true,
        req: adminReq,
      })
    }
  }

  if (apply) {
    await recalculateCategoryCounts(payload, tenant.id, adminReq)
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: tenantSlug,
    sourceTenant: sourceSlug,
    parentCategory: parentCategorySlug,
    logoCategory: logoCategorySlug,
    sourceProducts: sourceProducts.length,
    logoProducts: logoProducts.length,
    movedToLogoCategory: changed.length,
    alreadySeparated: alreadySeparated.length,
    items: changed.map((product) => ({
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      sourceId: product.sourceId,
    })),
  }

  if (reportPath) {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(reportPath, JSON.stringify(summary, null, 2))
  }

  console.log(JSON.stringify({
    mode: summary.mode,
    sourceProducts: summary.sourceProducts,
    logoProducts: summary.logoProducts,
    movedToLogoCategory: summary.movedToLogoCategory,
    alreadySeparated: summary.alreadySeparated,
    report: reportPath || null,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
