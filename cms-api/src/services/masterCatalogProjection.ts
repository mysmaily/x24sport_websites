import { createHash } from 'node:crypto'

import { relationID } from '../util/tenantIdentity'

type Doc = Record<string, any>

export type ProjectionPayload = {
  create: (args: Doc) => Promise<Doc>
  find: (args: Doc) => Promise<{ docs: Doc[]; totalPages?: number }>
  findByID: (args: Doc) => Promise<Doc>
  update: (args: Doc) => Promise<Doc>
}

export type ProjectionSummary = {
  mode: 'apply' | 'dry-run'
  scanned: number
  projectedCategories: number
  projectedCatalogViews: number
  productLinksAdded: number
  blocked: number
  skipped: number
  errors: Array<{ distributionID: number | string; message: string }>
}

const allowedMasterSlugs = new Set(['x24sport', 'pndsport'])

export const isAllowedMasterTenant = (slug: unknown) =>
  typeof slug === 'string' && allowedMasterSlugs.has(slug)

const stableHash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

const relationIDs = (values: unknown) =>
  (Array.isArray(values) ? values : [])
    .map((value) => relationID(value as Parameters<typeof relationID>[0]))
    .filter((value): value is number | string => value !== undefined)

const hasRelation = (values: unknown, id: number | string) =>
  relationIDs(values).some((value) => String(value) === String(id))

const lastPathSegment = (path: unknown) => {
  if (typeof path !== 'string') return ''
  return path.split('/').filter(Boolean).at(-1) || ''
}

const allDocs = async (
  payload: ProjectionPayload,
  collection: string,
  where: Doc,
  depth = 0,
  select?: Doc,
) => {
  const docs: Doc[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({
      collection,
      depth,
      limit: 1000,
      overrideAccess: true,
      page,
      select,
      where,
    })
    docs.push(...result.docs)
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

type ProjectionLookup = {
  categories: Doc[]
  categoriesByID: Map<string, Doc>
  tenantsByID: Map<string, Doc>
  views: Doc[]
  viewsByID: Map<string, Doc>
}

const publishedProductDistributions = async (
  payload: ProjectionPayload,
  sourceTenantID: number | string,
  targetTenantID: number | string,
) =>
  allDocs(payload, 'catalog-distributions', {
    and: [
      { sourceTenant: { equals: sourceTenantID } },
      { targetTenant: { equals: targetTenantID } },
      { status: { equals: 'published' } },
    ],
  }, 0, { sourceProduct: true, targetProduct: true })

type ProductDistributionPair = { distribution: Doc; source: Doc; target: Doc }

const hydrateProductDistributions = async (
  payload: ProjectionPayload,
  distributions: Doc[],
): Promise<ProductDistributionPair[]> => {
  const sourceIDs = Array.from(new Set(distributions.map((item) => relationID(item.sourceProduct)).filter((id): id is number | string => id !== undefined)))
  const targetIDs = Array.from(new Set(distributions.map((item) => relationID(item.targetProduct)).filter((id): id is number | string => id !== undefined)))
  const [sources, targets] = await Promise.all([
    sourceIDs.length
      ? allDocs(payload, 'products', { id: { in: sourceIDs } }, 0, { categories: true, publicationStatus: true })
      : [],
    targetIDs.length
      ? allDocs(payload, 'products', { id: { in: targetIDs } }, 0, { categories: true, publicationStatus: true })
      : [],
  ])
  const sourcesByID = new Map(sources.map((doc) => [String(doc.id), doc]))
  const targetsByID = new Map(targets.map((doc) => [String(doc.id), doc]))
  return distributions.flatMap((distribution) => {
    const sourceID = relationID(distribution.sourceProduct)
    const targetID = relationID(distribution.targetProduct)
    const source = sourceID === undefined ? undefined : sourcesByID.get(String(sourceID))
    const target = targetID === undefined ? undefined : targetsByID.get(String(targetID))
    return source && target ? [{ distribution, source, target }] : []
  })
}

const hydrateTargetProducts = async (
  payload: ProjectionPayload,
  distributions: Doc[],
  targetTenantID: number | string,
) => {
  const targetIDs = new Set(
    distributions
      .map((item) => relationID(item.targetProduct))
      .filter((id): id is number | string => id !== undefined)
      .map(String),
  )
  if (!targetIDs.size) return []
  const products = await allDocs(payload, 'products', { tenant: { equals: targetTenantID } }, 2, {
        categories: true,
        publicationStatus: true,
        searchTags: true,
      })
  return products.filter((product) => targetIDs.has(String(product.id)))
}

const rowKeys = (rows: unknown) => new Set(
  (Array.isArray(rows) ? rows : [])
    .map((row) => typeof row?.key === 'string' ? row.key.trim() : '')
    .filter(Boolean),
)

const productMatchesView = (product: Doc, source: Doc) => {
  if (product.publicationStatus !== 'publish') return false
  const filters = source.filters || {}
  const tagKeys = rowKeys(product.searchTags)
  const productTaxonomyKeys = new Set(
    (Array.isArray(product.categories) ? product.categories : [])
      .map((category) => category && typeof category === 'object' ? category.taxonomy : undefined)
      .map((taxonomy) => taxonomy && typeof taxonomy === 'object' && typeof taxonomy.key === 'string' ? taxonomy.key.trim() : '')
      .filter(Boolean),
  )
  const requiredCategoryKeys = [...rowKeys(filters.categoryKeys)]
  const requiredTagKeys = [
    ...rowKeys(filters.searchTagKeys),
    ...rowKeys(filters.productTypeKeys),
    ...rowKeys(filters.audienceKeys),
    ...rowKeys(filters.colorKeys),
    ...(typeof filters.sportKey === 'string' && filters.sportKey.trim() ? [filters.sportKey.trim()] : []),
  ]
  const conditions = [
    ...requiredCategoryKeys.map((key) => productTaxonomyKeys.has(key)),
    ...requiredTagKeys.map((key) => tagKeys.has(key)),
  ]
  if (!conditions.length) return true
  return source.matchMode === 'any' ? conditions.some(Boolean) : conditions.every(Boolean)
}

const eligibleCategoryProducts = async ({
  productPairs,
  sourceCategoryID,
}: {
  productPairs: ProductDistributionPair[]
  sourceCategoryID: number | string
}) => {
  return productPairs.filter(({ source, target }) =>
    hasRelation(source.categories, sourceCategoryID) && target.publicationStatus === 'publish')
}

const findTargetCategory = async ({
  lookup,
  targetCategory,
  targetTenantID,
  taxonomyID,
}: {
  lookup: ProjectionLookup
  targetCategory: unknown
  targetTenantID: number | string
  taxonomyID: number | string
}) => {
  const relatedID = relationID(targetCategory as Parameters<typeof relationID>[0])
  const related = relatedID === undefined ? undefined : lookup.categoriesByID.get(String(relatedID))
  if (related) return related
  const matches = lookup.categories.filter((category) =>
    String(relationID(category.tenant)) === String(targetTenantID)
      && String(relationID(category.taxonomy)) === String(taxonomyID))
  if (matches.length > 1) throw new Error('Có nhiều category đích dùng cùng taxonomy; cần review thủ công.')
  return matches[0]
}

const findTargetCatalogView = async ({
  lookup,
  sourceKey,
  targetCatalogView,
  targetTenantID,
}: {
  lookup: ProjectionLookup
  sourceKey: string
  targetCatalogView: unknown
  targetTenantID: number | string
}) => {
  const relatedID = relationID(targetCatalogView as Parameters<typeof relationID>[0])
  const related = relatedID === undefined ? undefined : lookup.viewsByID.get(String(relatedID))
  if (related) return related
  const matches = lookup.views.filter((view) =>
    String(relationID(view.tenant)) === String(targetTenantID) && view.key === sourceKey)
  if (matches.length > 1) throw new Error('Có nhiều catalog view đích dùng cùng stable key; cần review thủ công.')
  return matches[0]
}

const sourceCategoryFingerprint = (source: Doc) =>
  stableHash({
    description: source.description || '',
    group: source.group || 'type',
    name: source.name || '',
    navigationLabel: source.navigationLabel || '',
    navigationOrder: source.navigationOrder ?? source.order ?? 0,
    slug: source.slug || '',
    taxonomy: relationID(source.taxonomy) || null,
  })

const targetCategoryFingerprint = (target: Doc | undefined) =>
  stableHash({
    description: target?.description || '',
    name: target?.name || '',
    navigationLabel: target?.navigationLabel || '',
    navigationOrder: target?.navigationOrder ?? target?.order ?? 0,
    showInNavigation: Boolean(target?.showInNavigation),
    slug: target?.slug || '',
    status: target?.status || '',
    taxonomy: relationID(target?.taxonomy) || null,
  })

const sourceViewFingerprint = (source: Doc) =>
  stableHash({
    canonicalPath: source.canonicalPath || '',
    description: source.description || '',
    filters: source.filters || {},
    heading: source.heading || '',
    includeInSitemap: Boolean(source.includeInSitemap),
    indexPolicy: source.indexPolicy || 'noindex',
    key: source.key || '',
    matchMode: source.matchMode || 'all',
    path: source.path || '',
    taxonomy: relationIDs(source.taxonomy),
    title: source.title || '',
  })

const targetViewFingerprint = (target: Doc | undefined) =>
  stableHash({
    canonicalPath: target?.canonicalPath || '',
    description: target?.description || '',
    enabled: Boolean(target?.enabled),
    filters: target?.filters || {},
    heading: target?.heading || '',
    includeInSitemap: Boolean(target?.includeInSitemap),
    indexPolicy: target?.indexPolicy || 'noindex',
    key: target?.key || '',
    matchMode: target?.matchMode || 'all',
    path: target?.path || '',
    taxonomy: relationIDs(target?.taxonomy),
    title: target?.title || '',
  })

async function syncCategory({
  apply,
  distribution,
  lookup,
  payload,
  productPairs,
  sourceTenant,
  targetTenant,
}: {
  apply: boolean
  distribution: Doc
  lookup: ProjectionLookup
  payload: ProjectionPayload
  productPairs: ProductDistributionPair[]
  sourceTenant: Doc
  targetTenant: Doc
}) {
  const sourceID = relationID(distribution.sourceCategory)
  const source = sourceID === undefined ? undefined : lookup.categoriesByID.get(String(sourceID))
  if (!source) throw new Error('Không tìm thấy category nguồn.')
  const taxonomyID = relationID(source.taxonomy)
  if (taxonomyID === undefined) throw new Error('Category nguồn chưa có stable taxonomy.')

  let target = await findTargetCategory({
    lookup,
    targetCategory: distribution.targetCategory,
    targetTenantID: targetTenant.id,
    taxonomyID,
  })
  const eligible = await eligibleCategoryProducts({
    productPairs,
    sourceCategoryID: source.id,
  })
  const proposed = distribution.proposedCopy || {}
  const slug = lastPathSegment(proposed.path) || source.slug
  const categoryData = {
    tenant: targetTenant.id,
    taxonomy: taxonomyID,
    name: proposed.name || source.name,
    slug,
    group: source.group || 'type',
    description: proposed.description || source.description || '',
    navigationLabel: proposed.navigationLabel || source.navigationLabel || source.name,
    navigationOrder: proposed.navigationOrder ?? source.navigationOrder ?? source.order ?? 0,
    order: proposed.navigationOrder ?? source.navigationOrder ?? source.order ?? 0,
    legacyPath: proposed.path || `/danh-muc/${slug}/`,
    productCount: eligible.length,
    showInNavigation: eligible.length > 0,
    status: eligible.length > 0 ? 'active' : 'hidden',
    sourceSystem: 'category-projection',
    sourceId: `${sourceTenant.slug}:${source.id}`,
  }

  if (apply && distribution.copyMode !== 'manual_locked') {
    target = target
      ? await payload.update({
          collection: 'product-categories',
          data: categoryData,
          id: target.id,
          overrideAccess: true,
        })
      : await payload.create({ collection: 'product-categories', data: categoryData, overrideAccess: true })
    lookup.categoriesByID.set(String(target.id), target)
    const existingIndex = lookup.categories.findIndex((category) => String(category.id) === String(target.id))
    if (existingIndex >= 0) lookup.categories[existingIndex] = target
    else lookup.categories.push(target)
  }

  let productLinksAdded = 0
  if (apply && target && eligible.length > 0) {
    for (const item of eligible) {
      if (hasRelation(item.target.categories, target.id)) continue
      await payload.update({
        collection: 'products',
        data: { categories: [...relationIDs(item.target.categories), target.id] },
        id: item.target.id,
        overrideAccess: true,
      })
      productLinksAdded += 1
    }
  }

  if (apply) {
    await payload.update({
      collection: 'category-distributions',
      data: {
        lastError: '',
        sourceFactFingerprint: sourceCategoryFingerprint(source),
        status: eligible.length > 0 && target ? 'published' : 'draft_created',
        syncedAt: new Date().toISOString(),
        targetCategory: target?.id,
        targetCopyFingerprint: targetCategoryFingerprint(target),
      },
      id: distribution.id,
      overrideAccess: true,
    })
  }

  return { productLinksAdded, projected: Boolean(target) || distribution.copyMode !== 'manual_locked' }
}

async function syncCatalogView({
  apply,
  distribution,
  lookup,
  payload,
  targetProducts,
  targetTenant,
}: {
  apply: boolean
  distribution: Doc
  lookup: ProjectionLookup
  payload: ProjectionPayload
  targetProducts: Doc[]
  targetTenant: Doc
}) {
  const sourceID = relationID(distribution.sourceCatalogView)
  const source = sourceID === undefined ? undefined : lookup.viewsByID.get(String(sourceID))
  if (!source) throw new Error('Không tìm thấy catalog view nguồn.')
  let target = await findTargetCatalogView({
    lookup,
    sourceKey: source.key,
    targetCatalogView: distribution.targetCatalogView,
    targetTenantID: targetTenant.id,
  })
  const hasMatchingProducts = targetProducts.some((product) => productMatchesView(product, source))
  const proposed = distribution.proposedCopy || {}
  const enabled = hasMatchingProducts
  const viewData = {
    tenant: targetTenant.id,
    key: source.key,
    path: proposed.path || source.path,
    title: proposed.name || source.title,
    heading: proposed.name || source.heading,
    description: proposed.description || source.description || '',
    taxonomy: relationIDs(source.taxonomy),
    filters: source.filters || {},
    matchMode: source.matchMode || 'all',
    indexPolicy: source.indexPolicy || 'noindex',
    canonicalPath: proposed.path || source.canonicalPath || source.path,
    includeInSitemap: enabled && Boolean(source.includeInSitemap),
    enabled,
  }

  if (apply && distribution.copyMode !== 'manual_locked') {
    target = target
      ? await payload.update({
          collection: 'catalog-views',
          data: viewData,
          draft: !enabled,
          id: target.id,
          overrideAccess: true,
        })
      : await payload.create({
          collection: 'catalog-views',
          data: viewData,
          draft: !enabled,
          overrideAccess: true,
        })
    lookup.viewsByID.set(String(target.id), target)
    const existingIndex = lookup.views.findIndex((view) => String(view.id) === String(target.id))
    if (existingIndex >= 0) lookup.views[existingIndex] = target
    else lookup.views.push(target)
  }

  if (apply) {
    await payload.update({
      collection: 'category-distributions',
      data: {
        lastError: '',
        sourceFactFingerprint: sourceViewFingerprint(source),
        status: enabled && target ? 'published' : 'draft_created',
        syncedAt: new Date().toISOString(),
        targetCatalogView: target?.id,
        targetCopyFingerprint: targetViewFingerprint(target),
      },
      id: distribution.id,
      overrideAccess: true,
    })
  }

  return { projected: Boolean(target) || distribution.copyMode !== 'manual_locked' }
}

export async function syncMasterCatalogProjections({
  apply = false,
  distributionIDs,
  payload,
  targetSlugs,
}: {
  apply?: boolean
  distributionIDs?: Array<number | string>
  payload: ProjectionPayload
  targetSlugs?: string[]
}): Promise<ProjectionSummary> {
  const requestedTargets = new Set(targetSlugs || [...allowedMasterSlugs])
  for (const slug of requestedTargets) {
    if (!isAllowedMasterTenant(slug)) throw new Error(`Tenant ${slug} không phải master projection được phép.`)
  }

  const distributions = await allDocs(payload, 'category-distributions', {
    and: [
      { status: { not_in: ['archived', 'blocked'] } },
      ...(distributionIDs?.length ? [{ id: { in: distributionIDs } }] : []),
    ],
  }, 0)
  const [tenants, categories, views] = await Promise.all([
    allDocs(payload, 'tenants', {}, 0),
    allDocs(payload, 'product-categories', {}, 0),
    allDocs(payload, 'catalog-views', {}, 0),
  ])
  const lookup: ProjectionLookup = {
    categories,
    categoriesByID: new Map(categories.map((doc) => [String(doc.id), doc])),
    tenantsByID: new Map(tenants.map((doc) => [String(doc.id), doc])),
    views,
    viewsByID: new Map(views.map((doc) => [String(doc.id), doc])),
  }
  const summary: ProjectionSummary = {
    mode: apply ? 'apply' : 'dry-run',
    scanned: distributions.length,
    projectedCategories: 0,
    projectedCatalogViews: 0,
    productLinksAdded: 0,
    blocked: 0,
    skipped: 0,
    errors: [],
  }
  const productDistributionCache = new Map<string, Promise<Doc[]>>()
  const productPairCache = new Map<string, Promise<ProductDistributionPair[]>>()
  const targetProductCache = new Map<string, Promise<Doc[]>>()
  const cachedTenant = (value: unknown) => {
    const id = relationID(value as Parameters<typeof relationID>[0])
    return id === undefined ? undefined : lookup.tenantsByID.get(String(id))
  }

  for (const distribution of distributions) {
    try {
      const [sourceTenant, targetTenant] = await Promise.all([
        cachedTenant(distribution.sourceTenant),
        cachedTenant(distribution.targetTenant),
      ])
      if (!sourceTenant || !targetTenant) throw new Error('Ledger thiếu tenant nguồn hoặc tenant đích.')
      if (!isAllowedMasterTenant(targetTenant.slug) || !requestedTargets.has(targetTenant.slug)) {
        summary.skipped += 1
        continue
      }
      if (String(sourceTenant.id) === String(targetTenant.id)) {
        throw new Error('Projection không được dùng cùng tenant nguồn và đích.')
      }

      const pairKey = `${sourceTenant.id}:${targetTenant.id}`
      let productDistributions = productDistributionCache.get(pairKey)
      if (!productDistributions) {
        productDistributions = publishedProductDistributions(payload, sourceTenant.id, targetTenant.id)
        productDistributionCache.set(pairKey, productDistributions)
      }
      const publishedDistributions = await productDistributions
      if (distribution.sourceKind === 'category') {
        let productPairs = productPairCache.get(pairKey)
        if (!productPairs) {
          productPairs = hydrateProductDistributions(payload, publishedDistributions)
          productPairCache.set(pairKey, productPairs)
        }
        const result = await syncCategory({
          apply,
          distribution,
          lookup,
          payload,
          productPairs: await productPairs,
          sourceTenant,
          targetTenant,
        })
        if (result.projected) summary.projectedCategories += 1
        summary.productLinksAdded += result.productLinksAdded
      } else if (distribution.sourceKind === 'catalog_view') {
        let targetProducts = targetProductCache.get(pairKey)
        if (!targetProducts) {
          targetProducts = hydrateTargetProducts(payload, publishedDistributions, targetTenant.id)
          targetProductCache.set(pairKey, targetProducts)
        }
        const result = await syncCatalogView({
          apply,
          distribution,
          lookup,
          payload,
          targetProducts: await targetProducts,
          targetTenant,
        })
        if (result.projected) summary.projectedCatalogViews += 1
      } else {
        throw new Error('sourceKind không hợp lệ.')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      summary.blocked += 1
      summary.errors.push({ distributionID: distribution.id, message })
      if (apply) {
        await payload.update({
          collection: 'category-distributions',
          data: { lastError: message, status: 'blocked', syncedAt: new Date().toISOString() },
          id: distribution.id,
          overrideAccess: true,
        })
      }
    }
  }

  return summary
}
