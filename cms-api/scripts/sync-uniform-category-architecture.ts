import 'dotenv/config'

import { existsSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type Doc = Record<string, any>

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const backupDirArg = args.find((arg) => arg.startsWith('--backup-dir='))?.slice('--backup-dir='.length)
const reportArg = args.find((arg) => arg.startsWith('--report='))?.slice('--report='.length)
const sourceSlug = 'mayaodongphuc'
const pndSlug = 'pndsport'
const dongPhucX24Slug = 'dongphucx24'
const sourceSystem = 'uniform-taxonomy-sync'

const canonicalSlugs = [
  'dong-phuc-bao-ho',
  'dong-phuc-da-ngoai-team-building',
  'dong-phuc-doanh-nghiep',
  'dong-phuc-fnb',
  'dong-phuc-gia-dinh',
  'dong-phuc-ngo-nghinh',
  'dong-phuc-su-kien-doi-nhom',
  'dong-phuc-tre-em',
  'dong-phuc-truong-hoc',
  'dong-phuc-y-te-dich-vu',
] as const

const dongPhucX24LegacySlug: Partial<Record<(typeof canonicalSlugs)[number], string>> = {
  'dong-phuc-bao-ho': 'dong-phuc-bao-ho-ky-thuat',
  'dong-phuc-da-ngoai-team-building': 'team-building-su-kien',
  'dong-phuc-doanh-nghiep': 'dong-phuc-cong-ty',
  'dong-phuc-fnb': 'dong-phuc-nha-hang-fnb',
  'dong-phuc-truong-hoc': 'ao-lop-truong-hoc',
}

const pndLegacySlugs = ['dong-phuc-cong-ty', 'dong-phuc-lop-truong-hoc'] as const

const relationID = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationID((value as Doc).id)
      : undefined

const text = (value: unknown) => String(value || '').trim()
const categoryIDs = (product: Doc) => (Array.isArray(product.categories) ? product.categories : [])
  .map(relationID)
  .filter((id): id is number | string => id !== undefined)

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
    docs.push(...result.docs)
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

async function uniqueDoc(payload: any, collection: string, where: Doc, label: string) {
  const docs = await allDocs(payload, collection, where)
  if (docs.length !== 1) throw new Error(`${label}: cần đúng 1 bản ghi, tìm thấy ${docs.length}.`)
  return docs[0]
}

function categoryCount(products: Doc[], categoryID: number | string) {
  return products.filter((product) => categoryIDs(product).some((id) => String(id) === String(categoryID))).length
}

function productTargetSlug(product: Doc) {
  const key = `${text(product.sourceId)} ${text(product.sku)}`.toUpperCase()
  if (key.includes('DPX24-PO-')) return 'dong-phuc-doanh-nghiep'
  if (key.includes('DPX24-FB-')) return 'dong-phuc-fnb'
  if (key.includes('DPX24-SC-')) return 'dong-phuc-truong-hoc'
  if (key.includes('DPX24-TB-')) return 'dong-phuc-da-ngoai-team-building'
  throw new Error(`Không xác định được danh mục cho sản phẩm Đồng Phục X24 ${product.id} (${product.sku || product.sourceId}).`)
}

function scalarChanges(doc: Doc | undefined, data: Doc) {
  if (!doc) return Object.keys(data)
  return Object.entries(data).filter(([key, value]) => {
    const current = key === 'parent' || key === 'tenant' ? relationID(doc[key]) : doc[key]
    const desired = key === 'parent' || key === 'tenant' ? relationID(value) : value
    return (current ?? null) !== (desired ?? null)
  }).map(([key]) => key)
}

async function writeJSON(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function run() {
  if (apply) {
    if (!backupDirArg || !isAbsolute(backupDirArg)) throw new Error('--apply bắt buộc có --backup-dir là đường dẫn tuyệt đối.')
    if (existsSync(backupDirArg)) throw new Error(`Thư mục backup đã tồn tại: ${backupDirArg}`)
  }

  const payload: any = await getPayload({ config })
  const [sourceTenant, pndTenant, dongPhucX24Tenant] = await Promise.all([
    uniqueDoc(payload, 'tenants', { slug: { equals: sourceSlug } }, sourceSlug),
    uniqueDoc(payload, 'tenants', { slug: { equals: pndSlug } }, pndSlug),
    uniqueDoc(payload, 'tenants', { slug: { equals: dongPhucX24Slug } }, dongPhucX24Slug),
  ])

  const [sourceCategories, pndCategories, dongPhucX24Categories, sourceProducts, pndProducts, dongPhucX24Products] = await Promise.all([
    allDocs(payload, 'product-categories', { tenant: { equals: sourceTenant.id } }),
    allDocs(payload, 'product-categories', { tenant: { equals: pndTenant.id } }),
    allDocs(payload, 'product-categories', { tenant: { equals: dongPhucX24Tenant.id } }),
    allDocs(payload, 'products', { and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }] }),
    allDocs(payload, 'products', { and: [{ tenant: { equals: pndTenant.id } }, { publicationStatus: { equals: 'publish' } }] }),
    allDocs(payload, 'products', { tenant: { equals: dongPhucX24Tenant.id } }),
  ])
  const [pndMenus, dongPhucX24Menus] = await Promise.all([
    allDocs(payload, 'navigation-menus', { tenant: { equals: pndTenant.id } }, 1),
    allDocs(payload, 'navigation-menus', { tenant: { equals: dongPhucX24Tenant.id } }, 1),
  ])
  const [pndNavigationItems, dongPhucX24NavigationItems] = await Promise.all([
    allDocs(payload, 'navigation-items', { tenant: { equals: pndTenant.id } }, 1),
    allDocs(payload, 'navigation-items', { tenant: { equals: dongPhucX24Tenant.id } }, 1),
  ])

  if (dongPhucX24Products.length !== 12) throw new Error(`Đồng Phục X24 phải có đúng 12 sản phẩm hiện hữu, thực tế ${dongPhucX24Products.length}.`)
  const pndRoot = pndCategories.find((category) => category.slug === 'dong-phuc')
  if (!pndRoot) throw new Error('PND Sport thiếu danh mục cha Đồng Phục.')

  const sourceBySlug = new Map<string, Doc>()
  for (const slug of canonicalSlugs) {
    const matches = sourceCategories.filter((category) => category.slug === slug)
    if (matches.length !== 1) throw new Error(`${sourceSlug}/${slug}: cần đúng 1 danh mục, tìm thấy ${matches.length}.`)
    sourceBySlug.set(slug, matches[0])
  }

  const pndPlans = canonicalSlugs.map((slug, index) => {
    const source = sourceBySlug.get(slug)!
    const matches = pndCategories.filter((category) => category.slug === slug)
    if (matches.length !== 1) throw new Error(`${pndSlug}/${slug}: cần đúng 1 danh mục, tìm thấy ${matches.length}.`)
    const target = matches[0]
    const sourceCount = categoryCount(sourceProducts, source.id)
    const targetCount = categoryCount(pndProducts, target.id)
    if (sourceCount !== targetCount) throw new Error(`${slug}: Maya có ${sourceCount} sản phẩm publish nhưng PND có ${targetCount}.`)
    const data = {
      tenant: pndTenant.id,
      name: source.name,
      slug,
      description: source.description || '',
      parent: pndRoot.id,
      group: 'type',
      legacyPath: `/danh-muc/${slug}/`,
      navigationLabel: source.navigationLabel || source.name,
      navigationOrder: Number(source.navigationOrder ?? source.order ?? index),
      order: Number(source.order ?? index),
      showInNavigation: true,
      status: 'active',
      sourceSystem,
      sourceId: `${sourceSlug}:${source.id}`,
      productCount: targetCount,
    }
    return { slug, source, target, count: targetCount, data, changes: scalarChanges(target, data) }
  })

  const pndRootCount = categoryCount(pndProducts, pndRoot.id)
  const canonicalPndProductIDs = new Set(pndPlans.flatMap((plan) =>
    pndProducts.filter((product) => categoryIDs(product).some((id) => String(id) === String(plan.target.id))).map((product) => String(product.id)),
  ))
  if (pndRootCount !== canonicalPndProductIDs.size) {
    throw new Error(`PND Đồng Phục có ${pndRootCount} sản phẩm trực tiếp nhưng hợp 10 danh mục con có ${canonicalPndProductIDs.size}.`)
  }

  const dpxPlans = canonicalSlugs.map((slug, index) => {
    const source = sourceBySlug.get(slug)!
    const canonical = dongPhucX24Categories.filter((category) => category.slug === slug)
    const legacySlug = dongPhucX24LegacySlug[slug]
    const legacy = legacySlug ? dongPhucX24Categories.filter((category) => category.slug === legacySlug) : []
    if (canonical.length > 1 || legacy.length > 1 || (canonical.length && legacy.length)) {
      throw new Error(`${dongPhucX24Slug}/${slug}: xung đột danh mục canonical/legacy.`)
    }
    const target = canonical[0] || legacy[0]
    const count = dongPhucX24Products.filter((product) => productTargetSlug(product) === slug && product.publicationStatus === 'publish').length
    const data = {
      tenant: dongPhucX24Tenant.id,
      name: source.name,
      slug,
      description: source.description || '',
      group: 'type',
      legacyPath: `/danh-muc/${slug}/`,
      navigationLabel: source.navigationLabel || source.name,
      navigationOrder: Number(source.navigationOrder ?? source.order ?? index),
      order: Number(source.order ?? index),
      showInNavigation: true,
      status: 'active',
      sourceSystem,
      sourceId: `${sourceSlug}:${source.id}`,
      productCount: count,
    }
    return { slug, source, target, count, data, changes: scalarChanges(target, data) }
  })

  const legacyPndPlans = pndLegacySlugs.map((slug) => {
    const matches = pndCategories.filter((category) => category.slug === slug)
    if (matches.length !== 1) throw new Error(`${pndSlug}/${slug}: cần đúng 1 danh mục legacy, tìm thấy ${matches.length}.`)
    const target = matches[0]
    if (categoryCount(pndProducts, target.id) !== 0) throw new Error(`${pndSlug}/${slug}: danh mục legacy vẫn còn sản phẩm.`)
    const data = { status: 'retired', showInNavigation: false, productCount: 0 }
    return { slug, target, data, changes: scalarChanges(target, data) }
  })

  const rootData = { status: 'active', showInNavigation: true, productCount: pndRootCount }
  const productPlans = dongPhucX24Products.map((product) => ({ product, slug: productTargetSlug(product) }))

  const report: Doc = {
    mode: apply ? 'apply' : 'dry-run',
    source: { tenant: sourceSlug, publishedProducts: sourceProducts.length },
    pndsport: {
      rootProductCount: pndRootCount,
      categories: pndPlans.map(({ slug, count, target, changes }) => ({ id: target.id, slug, count, changes })),
      retiredLegacy: legacyPndPlans.map(({ slug, target, changes }) => ({ id: target.id, slug, changes })),
      rootChanges: scalarChanges(pndRoot, rootData),
    },
    dongphucx24: {
      products: productPlans.length,
      categories: dpxPlans.map(({ slug, count, target, changes }) => ({ id: target?.id || null, slug, count, action: target ? 'update' : 'create', changes })),
      assignments: productPlans.map(({ product, slug }) => ({ id: product.id, sku: product.sku, slug })),
    },
  }

  if (apply) {
    const backupDir = resolve(backupDirArg!)
    await mkdir(backupDir, { recursive: false })
    await writeJSON(resolve(backupDir, 'before.json'), {
      sourceCategories: canonicalSlugs.map((slug) => sourceBySlug.get(slug)),
      pndCategories: [pndRoot, ...pndPlans.map((plan) => plan.target), ...legacyPndPlans.map((plan) => plan.target)],
      pndMenus,
      pndNavigationItems,
      dongPhucX24Categories,
      dongPhucX24Menus,
      dongPhucX24NavigationItems,
      dongPhucX24Products,
    })

    await payload.update({ collection: 'product-categories', id: pndRoot.id, data: rootData, overrideAccess: true })
    for (const plan of pndPlans) {
      if (plan.changes.length) await payload.update({ collection: 'product-categories', id: plan.target.id, data: plan.data, overrideAccess: true })
    }
    for (const plan of legacyPndPlans) {
      if (plan.changes.length) await payload.update({ collection: 'product-categories', id: plan.target.id, data: plan.data, overrideAccess: true })
    }

    const dpxCategoryIDs = new Map<string, number | string>()
    for (const plan of dpxPlans) {
      const category = plan.target
        ? plan.changes.length
          ? await payload.update({ collection: 'product-categories', id: plan.target.id, data: plan.data, overrideAccess: true })
          : plan.target
        : await payload.create({ collection: 'product-categories', data: plan.data, overrideAccess: true })
      dpxCategoryIDs.set(plan.slug, category.id)
    }
    for (const plan of productPlans) {
      const targetCategoryID = dpxCategoryIDs.get(plan.slug)
      if (!targetCategoryID) throw new Error(`Thiếu category ID sau apply cho ${plan.slug}.`)
      const current = categoryIDs(plan.product)
      if (current.length !== 1 || String(current[0]) !== String(targetCategoryID)) {
        await payload.update({ collection: 'products', id: plan.product.id, data: { categories: [targetCategoryID] }, overrideAccess: true })
      }
    }
    await writeJSON(resolve(backupDir, 'apply-report.json'), report)
  }

  if (reportArg) await writeJSON(resolve(reportArg), report)
  console.log(JSON.stringify(report, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
