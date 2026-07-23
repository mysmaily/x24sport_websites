import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

type Doc = Record<string, any>

const sourceSlug = 'x24sport'
const targetSlug = 'rynosport'
const productLimit = 54

const rynoSports = [
  ['bong-da', 'Bóng đá', 'football'],
  ['cau-long', 'Cầu lông', 'badminton'],
  ['bong-chuyen', 'Bóng chuyền', 'volleyball'],
  ['bong-ro', 'Bóng rổ', 'basketball'],
  ['pickleball', 'Pickleball', 'pickleball'],
  ['chay-bo', 'Chạy bộ', 'running'],
  ['dong-phuc-doi-nhom', 'Đồng phục đội nhóm', 'other'],
  ['tap-luyen', 'Tập luyện', 'other'],
  ['esports', 'Esports', 'other'],
] as const

const relationId = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationId((value as Doc).id)
      : undefined

const cloneValue = <T>(value: T): T => JSON.parse(JSON.stringify(value, (key, entry) => key === 'id' ? undefined : entry)) as T

async function allDocs(payload: any, collection: any, where: Doc, depth = 0) {
  const docs: Doc[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({ collection, where, depth, limit: 100, page, overrideAccess: true })
    docs.push(...(result.docs as Doc[]))
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

async function run() {
  const payload: any = await getPayload({ config })
  const [sourceTenant] = await allDocs(payload, 'tenants', { slug: { equals: sourceSlug } })
  if (!sourceTenant) throw new Error('Không tìm thấy tenant nguồn x24sport.')

  const [existingTarget] = await allDocs(payload, 'tenants', { slug: { equals: targetSlug } })
  const tenantData = {
    name: 'RynoSport',
    slug: targetSlug,
    domains: [{ domain: 'rynosport.vn' }, { domain: 'www.rynosport.vn' }],
    brand: {
      headline: 'RynoSport',
      subheadline: 'Trang phục thể thao cho đội nhóm.',
      primaryColor: '#07101d',
      accentColor: '#b9ff34',
      style: 'arenix-inspired' as const,
    },
  }
  const targetTenant = existingTarget
    ? await payload.update({ collection: 'tenants', id: existingTarget.id, data: tenantData, overrideAccess: true })
    : await payload.create({ collection: 'tenants', data: tenantData, overrideAccess: true })

  const sourceCategories = await allDocs(payload, 'product-categories', { tenant: { equals: sourceTenant.id } }, 0)
  const targetCategories = await allDocs(payload, 'product-categories', { tenant: { equals: targetTenant.id } }, 0)
  const categoriesByCloneId = new Map(targetCategories.map((doc) => [doc.sourceId, doc]))
  const categoryMap = new Map<string, number | string>()

  for (const source of sourceCategories) {
    const cloneId = `${sourceSlug}:${source.id}`
    let target = categoriesByCloneId.get(cloneId)
    const data = {
      tenant: targetTenant.id,
      name: source.name,
      slug: source.slug,
      group: source.group,
      description: source.description,
      legacyPath: source.legacyPath,
      order: source.order,
      sourceSystem: 'payload-tenant-clone',
      sourceId: cloneId,
      sourceChecksum: source.sourceChecksum,
    }
    const saved = target
      ? await payload.update({ collection: 'product-categories', id: target.id, data, overrideAccess: true })
      : await payload.create({ collection: 'product-categories', data, overrideAccess: true })
    categoryMap.set(String(source.id), saved.id)
  }

  for (const source of sourceCategories) {
    const targetID = categoryMap.get(String(source.id))
    const parentID = relationId(source.parent)
    if (!targetID || !parentID) continue
    const mappedParent = categoryMap.get(String(parentID))
    if (mappedParent) await payload.update({ collection: 'product-categories', id: targetID, data: { parent: mappedParent }, overrideAccess: true })
  }

  const currentCategories = await allDocs(payload, 'product-categories', { tenant: { equals: targetTenant.id } }, 0)
  const categoriesBySlug = new Map(currentCategories.map((doc) => [doc.slug, doc]))
  for (const [slug, name] of rynoSports) {
    if (!categoriesBySlug.has(slug)) {
      const created = await payload.create({
        collection: 'product-categories',
        data: {
          tenant: targetTenant.id, name, slug, group: 'sport', order: categoriesBySlug.size + 1,
          description: `Trang phục ${name.toLowerCase()} thiết kế theo nhu cầu đội nhóm tại RynoSport.`,
          sourceSystem: 'rynosport-catalog-seed', sourceId: slug,
        },
        overrideAccess: true,
      })
      categoriesBySlug.set(slug, created)
    }
  }

  const sourceProducts = (await allDocs(payload, 'products', {
    and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }],
  }, 2)).slice(0, productLimit)
  const targetProducts = await allDocs(payload, 'products', { tenant: { equals: targetTenant.id } }, 0)
  const targetsByCloneId = new Map(targetProducts.map((doc) => [doc.sourceId, doc]))
  let created = 0
  let updated = 0

  for (const source of sourceProducts) {
    const cloneId = `${sourceSlug}:${source.id}`
    const categories = (source.categories || []).map(relationId).map((id: number | string | undefined) => id && categoryMap.get(String(id))).filter(Boolean)
    const data = {
      tenant: targetTenant.id,
      name: source.name,
      slug: source.slug,
      sku: source.sku,
      sport: source.sport,
      productType: source.productType,
      publicationStatus: 'publish' as const,
      featured: source.featured,
      price: source.price,
      regularPrice: source.regularPrice,
      salePrice: source.salePrice,
      compareAtPrice: source.compareAtPrice,
      currency: source.currency || 'VND',
      stockStatus: source.stockStatus,
      isPurchasable: source.isPurchasable,
      isOnBackorder: source.isOnBackorder,
      shortDescription: source.shortDescription,
      description: cloneValue(source.description),
      attributes: cloneValue(source.attributes),
      badges: cloneValue(source.badges),
      searchTags: cloneValue(source.searchTags),
      categories,
      // Product relationships are tenant-owned by Payload. Retain the migrated
      // public image URLs below rather than changing an X24 media owner.
      gallery: [],
      legacyImages: cloneValue(source.legacyImages),
      seoTitle: source.seoTitle,
      metaDescription: source.metaDescription,
      canonicalOverride: undefined,
      legacyPath: `/${source.slug}/`,
      contentHtml: source.contentHtml,
      sourceTags: cloneValue(source.sourceTags),
      sourceSystem: 'payload-tenant-clone',
      sourceId: cloneId,
      sourceModifiedAt: source.sourceModifiedAt,
      sourceCreatedAt: source.sourceCreatedAt,
      sourceChecksum: source.sourceChecksum,
    }
    const target = targetsByCloneId.get(cloneId)
    if (target) {
      await payload.update({ collection: 'products', id: target.id, data, overrideAccess: true })
      updated += 1
    } else {
      await payload.create({ collection: 'products', data, overrideAccess: true })
      created += 1
    }
  }

  const published = await allDocs(payload, 'products', {
    and: [{ tenant: { equals: targetTenant.id } }, { publicationStatus: { equals: 'publish' } }],
  })
  for (const category of await allDocs(payload, 'product-categories', { tenant: { equals: targetTenant.id } })) {
    const count = published.filter((product) => (product.categories || []).map(relationId).some((id: number | string | undefined) => String(id) === String(category.id))).length
    await payload.update({ collection: 'product-categories', id: category.id, data: { productCount: count }, overrideAccess: true })
  }

  console.log(JSON.stringify({ tenant: targetTenant.id, categories: (await allDocs(payload, 'product-categories', { tenant: { equals: targetTenant.id } })).length, created, updated, publishedProducts: published.length }))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
