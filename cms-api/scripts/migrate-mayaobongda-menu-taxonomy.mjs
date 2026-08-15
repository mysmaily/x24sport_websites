const API_URL = process.env.CMS_API_URL || 'https://cms.x24sport.vn'
const TENANT_SLUG = 'mayaobongda'
const apply = process.argv.includes('--apply')
const apiKey = process.env.PAYLOAD_API_KEY

if (apply && !apiKey) throw new Error('PAYLOAD_API_KEY is required for --apply')

const authHeaders = apply ? { Authorization: `users API-Key ${apiKey}` } : {}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...authHeaders,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text.slice(0, 500)}`)
  }
  return body
}

async function listAll(collection, params) {
  const docs = []
  let page = 1
  while (true) {
    const query = new URLSearchParams({ ...params, limit: '100', page: String(page), depth: '0' })
    const result = await request(`/api/${collection}?${query}`)
    docs.push(...result.docs)
    if (!result.hasNextPage) return docs
    page += 1
  }
}

const categorySpecs = [
  { slug: 'ao-thiet-ke', name: 'Mẫu thiết kế', group: 'type', order: 2 },
  { slug: 'ao-khong-logo', name: 'Áo bóng đá không logo', group: 'tag', order: 90 },
  { slug: 'cau-lac-bo', name: 'Áo CLB nổi tiếng', group: 'type', order: 3 },
  { slug: 'doi-tuyen', name: 'Áo đội tuyển quốc gia', group: 'type', order: 4 },
  { slug: 'ao-bong-da-thiet-ke-2026', name: 'Mẫu thiết kế 2026', group: 'collection', order: 10 },
  { slug: 'ao-bong-da-thiet-ke-2025', name: 'Mẫu thiết kế 2025', group: 'collection', order: 11 },
  { slug: 'ao-bong-da-thiet-ke-2024', name: 'Mẫu thiết kế 2024', group: 'collection', order: 12 },
  {
    slug: 'ao-bong-da-doi-bong-cau-lac-bo',
    name: 'Đội bóng & CLB phong trào',
    group: 'audience',
    legacyPath: '/ao-bong-da-doi-bong-cau-lac-bo/',
    order: 30,
  },
  {
    slug: 'ao-bong-da-truong-hoc-sinh-vien',
    name: 'Trường học & sinh viên',
    group: 'audience',
    legacyPath: '/ao-bong-da-truong-hoc-sinh-vien/',
    order: 31,
  },
  {
    slug: 'ao-bong-da-cong-ty',
    name: 'Công ty & doanh nghiệp',
    group: 'audience',
    legacyPath: '/thiet-ke-ao-bong-da-cong-ty/',
    order: 32,
  },
  {
    slug: 'ao-bong-da-cong-ty-ngan-hang',
    name: 'Ngân hàng',
    group: 'audience',
    order: 33,
  },
  {
    slug: 'ao-bong-da-giai-phong-trao',
    name: 'Giải đấu & hội thao',
    group: 'audience',
    legacyPath: '/ao-bong-da-giai-phong-trao/',
    order: 34,
  },
  { slug: 'cong-ty', group: 'tag', order: 98 },
  { slug: 'ngan-hang', group: 'tag', order: 99 },
]

function relationIDs(value) {
  return (value || []).map((item) => Number(typeof item === 'object' ? item.id : item)).filter(Number.isFinite)
}

function changedFields(current, spec) {
  const fields = {}
  for (const key of ['name', 'group', 'legacyPath', 'order']) {
    if (spec[key] !== undefined && current[key] !== spec[key]) fields[key] = spec[key]
  }
  return fields
}

async function main() {
  const tenants = await listAll('tenants', { 'where[slug][equals]': TENANT_SLUG })
  if (tenants.length !== 1) throw new Error(`Expected one ${TENANT_SLUG} tenant, found ${tenants.length}`)
  const tenant = tenants[0]

  let categories = await listAll('product-categories', { 'where[tenant][equals]': String(tenant.id) })
  const duplicateSlugs = categories
    .map((category) => category.slug)
    .filter((slug, index, values) => values.indexOf(slug) !== index)
  if (duplicateSlugs.length) throw new Error(`Duplicate tenant category slugs: ${[...new Set(duplicateSlugs)].join(', ')}`)

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))
  const categoryCreates = categorySpecs.filter((spec) => !categoryBySlug.has(spec.slug))
  const categoryUpdates = categorySpecs
    .filter((spec) => categoryBySlug.has(spec.slug))
    .map((spec) => ({ category: categoryBySlug.get(spec.slug), fields: changedFields(categoryBySlug.get(spec.slug), spec) }))
    .filter((entry) => Object.keys(entry.fields).length)

  const products = await listAll('products', { 'where[tenant][equals]': String(tenant.id) })
  const localCategoryIDs = new Set(categories.map((category) => Number(category.id)))
  const invalidRelations = products.flatMap((product) =>
    relationIDs(product.categories)
      .filter((id) => !localCategoryIDs.has(id))
      .map((id) => ({ productId: product.id, sku: product.sku, categoryId: id })),
  )
  if (invalidRelations.length) {
    throw new Error(`Found ${invalidRelations.length} cross-tenant or unresolved category relationships`)
  }

  const existing = (slug) => categoryBySlug.get(slug)
  const noLogoID = existing('ao-khong-logo')?.id
  const designID = existing('ao-thiet-ke')?.id
  const currentYearID = existing('ao-bong-da-thiet-ke-2026')?.id
  if (!noLogoID || !designID || !currentYearID) throw new Error('Required source categories are missing')

  const noLogoProducts = products.filter((product) => relationIDs(product.categories).includes(Number(noLogoID)))
  const designProducts = products.filter((product) => relationIDs(product.categories).includes(Number(designID)))
  const currentYearProducts = products.filter((product) => relationIDs(product.categories).includes(Number(currentYearID)))
  const designUnion = new Set([...designProducts, ...noLogoProducts].map((product) => product.id))
  const audienceSlugs = [
    'ao-bong-da-doi-bong-cau-lac-bo',
    'ao-bong-da-truong-hoc-sinh-vien',
    'ao-bong-da-cong-ty',
    'ao-bong-da-giai-phong-trao',
  ]
  const existingAudienceIDs = audienceSlugs.map((slug) => Number(existing(slug)?.id)).filter(Number.isFinite)
  const currentYearProductsNeedingAudienceTags = currentYearProducts.filter((product) => {
    const ids = relationIDs(product.categories)
    return existingAudienceIDs.length !== audienceSlugs.length || existingAudienceIDs.some((id) => !ids.includes(id))
  })
  const publishedProducts = products.filter((product) => product.publicationStatus === 'publish')
  const computedCounts = new Map(categories.map((category) => [Number(category.id), 0]))
  for (const product of publishedProducts) {
    for (const categoryID of relationIDs(product.categories)) {
      computedCounts.set(categoryID, (computedCounts.get(categoryID) || 0) + 1)
    }
  }
  const countMismatches = categories
    .filter((category) => Number(category.productCount || 0) !== (computedCounts.get(Number(category.id)) || 0))
    .map((category) => ({ slug: category.slug, stored: Number(category.productCount || 0), computed: computedCounts.get(Number(category.id)) || 0 }))

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: TENANT_SLUG,
    products: products.length,
    baseline: {
      design: designProducts.length,
      noLogo: noLogoProducts.length,
      designUnion: designUnion.size,
      currentYear2026: currentYearProducts.length,
    },
    categoryCreates: categoryCreates.map(({ slug, name, group, legacyPath }) => ({ slug, name, group, legacyPath })),
    categoryUpdates: categoryUpdates.map(({ category, fields }) => ({ id: category.id, slug: category.slug, fields })),
    productsNeedingDesign: noLogoProducts.filter((product) => !relationIDs(product.categories).includes(Number(designID))).length,
    currentYearProductsNeedingAudienceTags: currentYearProductsNeedingAudienceTags.length,
    categoryCountMismatches: countMismatches,
    invalidRelations: invalidRelations.length,
  }

  if (!apply) {
    console.log(JSON.stringify(summary, null, 2))
    return
  }

  for (const spec of categoryCreates) {
    await request('/api/product-categories', {
      method: 'POST',
      body: JSON.stringify({ tenant: tenant.id, productCount: 0, ...spec }),
    })
  }
  for (const { category, fields } of categoryUpdates) {
    await request(`/api/product-categories/${category.id}`, { method: 'PATCH', body: JSON.stringify(fields) })
  }

  categories = await listAll('product-categories', { 'where[tenant][equals]': String(tenant.id) })
  const updatedCategoryBySlug = new Map(categories.map((category) => [category.slug, category]))
  const audienceIDs = audienceSlugs.map((slug) => Number(updatedCategoryBySlug.get(slug)?.id))
  if (audienceIDs.some((id) => !Number.isFinite(id))) throw new Error('Audience categories were not created correctly')

  let patchedProducts = 0
  for (const product of products) {
    const ids = relationIDs(product.categories)
    const next = new Set(ids)
    if (ids.includes(Number(noLogoID))) next.add(Number(designID))
    if (ids.includes(Number(currentYearID))) audienceIDs.forEach((id) => next.add(id))
    if (next.size === ids.length) continue
    await request(`/api/products/${product.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ categories: [...next] }),
    })
    patchedProducts += 1
  }

  const refreshedProducts = await listAll('products', { 'where[tenant][equals]': String(tenant.id) })
  const refreshedPublishedProducts = refreshedProducts.filter((product) => product.publicationStatus === 'publish')
  const counts = new Map(categories.map((category) => [Number(category.id), 0]))
  for (const product of refreshedPublishedProducts) {
    for (const categoryID of relationIDs(product.categories)) {
      counts.set(categoryID, (counts.get(categoryID) || 0) + 1)
    }
  }

  let patchedCounts = 0
  for (const category of categories) {
    const nextCount = counts.get(Number(category.id)) || 0
    if (Number(category.productCount || 0) === nextCount) continue
    await request(`/api/product-categories/${category.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ productCount: nextCount }),
    })
    patchedCounts += 1
  }

  const finalProducts = await listAll('products', { 'where[tenant][equals]': String(tenant.id) })
  const finalDesignCount = finalProducts.filter((product) => relationIDs(product.categories).includes(Number(designID))).length
  if (finalDesignCount !== designUnion.size) {
    throw new Error(`Design union mismatch: expected ${designUnion.size}, received ${finalDesignCount}`)
  }

  console.log(JSON.stringify({ ...summary, patchedProducts, patchedCounts, finalDesignCount }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
