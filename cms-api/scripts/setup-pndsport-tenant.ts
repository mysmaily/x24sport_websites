import 'dotenv/config'

import { randomBytes } from 'node:crypto'
import { chmod, writeFile } from 'node:fs/promises'

import config from '../src/payload.config'
import { getPayload } from 'payload'

type Doc = Record<string, any>

const SOURCE_SLUG = 'x24sport'
const TARGET_SLUG = 'pndsport'
const SOURCE_SYSTEM = 'pndsport-x24-clone'
const SERVICE_EMAIL = 'pndsport-rest@internal.invalid'
const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const secretFile = process.argv.find((arg) => arg.startsWith('--secret-file='))?.slice('--secret-file='.length)

const relationId = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationId((value as Doc).id)
      : undefined

const cloneValue = <T>(value: T): T | undefined =>
  value === undefined
    ? undefined
    : JSON.parse(JSON.stringify(value, (key, entry) => key === 'id' ? undefined : entry))

const replaceBrand = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value
      .replace(/X24\s*Sport/gi, 'PND Sport')
      .replace(/x24sport\.vn/gi, 'pndsport.vn')
      .replace(/X24/gi, 'PND')
  }
  if (Array.isArray(value)) return value.map(replaceBrand)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Doc).map(([key, entry]) => [key, replaceBrand(entry)]))
  }
  return value
}

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

function uniqueRelationIds(values: Array<number | string>) {
  return [...new Map(values.map((value) => [String(value), value])).values()]
}

function categoryData(source: Doc, tenantId: number | string, parent?: number | string) {
  return {
    tenant: tenantId,
    name: replaceBrand(source.name),
    slug: source.slug,
    parent,
    group: source.group,
    description: replaceBrand(source.description),
    legacyPath: source.legacyPath,
    order: source.order,
    sourceSystem: SOURCE_SYSTEM,
    sourceId: `category:${source.id}`,
    sourceChecksum: source.sourceChecksum,
  }
}

function productData(source: Doc, tenantId: number | string, categoryIds: Array<number | string>) {
  const priceCandidates = [source.price, source.salePrice, source.regularPrice, source.compareAtPrice]
    .filter((value): value is number => typeof value === 'number' && value > 0)
  const lowestPrice = priceCandidates.length ? Math.min(...priceCandidates) : null

  return {
    tenant: tenantId,
    name: replaceBrand(source.name),
    slug: replaceBrand(source.slug),
    sku: replaceBrand(source.sku),
    sport: source.sport,
    productType: source.productType || 'simple',
    publicationStatus: lowestPrice ? 'publish' : 'draft',
    featured: source.featured || false,
    categories: categoryIds,
    price: lowestPrice,
    regularPrice: source.regularPrice,
    salePrice: source.salePrice,
    compareAtPrice: source.compareAtPrice,
    currency: source.currency || 'VND',
    stockStatus: source.stockStatus || 'instock',
    isPurchasable: source.isPurchasable,
    isOnBackorder: source.isOnBackorder,
    shortDescription: replaceBrand(source.shortDescription),
    description: replaceBrand(cloneValue(source.description)),
    attributes: replaceBrand(cloneValue(source.attributes)),
    badges: replaceBrand(cloneValue(source.badges)),
    searchTags: replaceBrand(cloneValue(source.searchTags)),
    gallery: [],
    legacyImages: legacyImagesFromProduct(source),
    seoTitle: replaceBrand(source.seoTitle || source.name),
    metaDescription: replaceBrand(source.metaDescription || source.shortDescription),
    canonicalOverride: undefined,
    legacyPath: `/san-pham/${replaceBrand(source.slug)}/`,
    contentHtml: replaceBrand(source.contentHtml),
    sourceTags: replaceBrand(cloneValue(source.sourceTags)),
    sourceSystem: SOURCE_SYSTEM,
    sourceId: `product:${source.id}`,
    sourceModifiedAt: source.sourceModifiedAt,
    sourceCreatedAt: source.sourceCreatedAt,
    sourceChecksum: source.sourceChecksum,
  }
}

function legacyImagesFromProduct(source: Doc) {
  const fromGallery = (source.gallery || [])
    .filter((media: unknown): media is Doc => Boolean(media && typeof media === 'object' && typeof (media as Doc).url === 'string'))
    .map((media: Doc) => ({
      url: media.url,
      alt: replaceBrand(media.alt || source.name),
      width: media.width,
      height: media.height,
    }))
  return fromGallery.length ? fromGallery : replaceBrand(cloneValue(source.legacyImages))
}

async function upsertBySourceId(payload: any, collection: string, tenantId: number | string, sourceId: string, data: Doc) {
  const existing = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { and: [{ tenant: { equals: tenantId } }, { sourceSystem: { equals: SOURCE_SYSTEM } }, { sourceId: { equals: sourceId } }] },
  })
  return existing.docs[0]
    ? payload.update({ collection, id: existing.docs[0].id, data, overrideAccess: true })
    : payload.create({ collection, data, overrideAccess: true })
}

async function run() {
  if (apply && !secretFile) throw new Error('Apply mode requires --secret-file=<absolute path>.')

  const payload: any = await getPayload({ config })
  const [sourceTenant] = await allDocs(payload, 'tenants', { slug: { equals: SOURCE_SLUG } }, 0)
  if (!sourceTenant) throw new Error(`Source tenant ${SOURCE_SLUG} was not found.`)

  const [existingTarget] = await allDocs(payload, 'tenants', { slug: { equals: TARGET_SLUG } }, 0)
  const [sourceCategories, sourceProducts, sourceContent] = await Promise.all([
    allDocs(payload, 'product-categories', { tenant: { equals: sourceTenant.id } }, 1),
    allDocs(payload, 'products', {
      and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }],
    }, 2),
    allDocs(payload, 'web-content', {
      and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }],
    }, 0),
  ])

  const missingPrice = sourceProducts.filter((product) => ![product.price, product.salePrice, product.regularPrice, product.compareAtPrice]
    .some((value) => typeof value === 'number' && value > 0))
  const mediaById = new Map<number | string, Doc>()
  for (const product of sourceProducts) {
    for (const media of product.gallery || []) {
      const id = relationId(media)
      if (id !== undefined && media && typeof media === 'object') mediaById.set(id, media)
    }
  }

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      targetExists: Boolean(existingTarget),
      categories: sourceCategories.length,
      products: sourceProducts.length,
      publishedProductsWithPrice: sourceProducts.length - missingPrice.length,
      productsToKeepDraftForMissingPrice: missingPrice.length,
      webContent: sourceContent.length,
      referencedMedia: mediaById.size,
    }, null, 2))
    return
  }

  const tenantData = {
    name: 'PND Sport Việt Nam',
    slug: TARGET_SLUG,
    domains: [{ domain: 'pndsport.vn' }, { domain: 'www.pndsport.vn' }],
    brand: {
      headline: 'Trang phục thể thao mang bản sắc riêng',
      subheadline: 'Chọn mẫu theo môn và gửi yêu cầu thiết kế, phối màu, logo, tên số cho đội nhóm.',
      primaryColor: '#111827',
      accentColor: '#f4511e',
      style: 'flevo-inspired' as const,
    },
  }
  const targetTenant = existingTarget
    ? await payload.update({ collection: 'tenants', id: existingTarget.id, data: tenantData, overrideAccess: true })
    : await payload.create({ collection: 'tenants', data: tenantData, overrideAccess: true })

  const settingsData = {
    tenant: targetTenant.id,
    siteName: 'PND Sport Việt Nam',
    contactPhone: '0989 353 247',
    zaloUrl: 'https://zalo.me/0989353247',
    navigation: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Bóng đá', href: '/danh-muc/bong-da/' },
      { label: 'Cầu lông', href: '/danh-muc/cau-long/' },
      { label: 'Bóng chuyền', href: '/danh-muc/bong-chuyen/' },
      { label: 'Pickleball', href: '/danh-muc/pickleball/' },
      { label: 'Chạy bộ', href: '/danh-muc/chay-bo/' },
      { label: 'Bóng rổ', href: '/danh-muc/bong-ro/' },
      { label: 'Sản phẩm', href: '/san-pham/' },
      { label: 'Góc tư vấn', href: '/blog/' },
    ],
  }
  const [existingSettings] = await allDocs(payload, 'store-settings', { tenant: { equals: targetTenant.id } }, 0)
  if (existingSettings) await payload.update({ collection: 'store-settings', id: existingSettings.id, data: settingsData, overrideAccess: true })
  else await payload.create({ collection: 'store-settings', data: settingsData, overrideAccess: true })

  const categoryMap = new Map<string, number | string>()
  for (const source of sourceCategories) {
    const target = await upsertBySourceId(payload, 'product-categories', targetTenant.id, `category:${source.id}`, categoryData(source, targetTenant.id))
    categoryMap.set(String(source.id), target.id)
  }
  for (const source of sourceCategories) {
    const parentId = relationId(source.parent)
    if (parentId === undefined) continue
    const targetId = categoryMap.get(String(source.id))
    const targetParentId = categoryMap.get(String(parentId))
    if (targetId && targetParentId) {
      await payload.update({ collection: 'product-categories', id: targetId, data: { parent: targetParentId }, overrideAccess: true })
    }
  }

  const [superAdmin] = await allDocs(payload, 'users', { role: { equals: 'super_admin' } }, 0)
  if (!superAdmin) throw new Error('No super_admin user exists for media sharing.')
  const adminReq = { user: superAdmin } as any
  let sharedMedia = 0
  for (const media of mediaById.values()) {
    const shared = (media.sharedWithTenants || []).map(relationId).filter((id: unknown): id is number | string => id !== undefined)
    if (shared.map(String).includes(String(targetTenant.id))) continue
    await payload.update({
      collection: 'media',
      id: media.id,
      data: { sharedWithTenants: uniqueRelationIds([...shared, targetTenant.id]) },
      overrideAccess: true,
      req: adminReq,
    })
    sharedMedia += 1
  }

  let publishedProducts = 0
  let draftProducts = 0
  for (const source of sourceProducts) {
    const categoryIds = (source.categories || [])
      .map(relationId)
      .map((id: number | string | undefined) => id === undefined ? undefined : categoryMap.get(String(id)))
      .filter((id: number | string | undefined): id is number | string => id !== undefined)
    const data = productData(source, targetTenant.id, categoryIds)
    await upsertBySourceId(payload, 'products', targetTenant.id, `product:${source.id}`, data)
    if (data.publicationStatus === 'publish') publishedProducts += 1
    else draftProducts += 1
  }

  for (const source of sourceContent) {
    const sourceId = `content:${source.id}`
    await upsertBySourceId(payload, 'web-content', targetTenant.id, sourceId, {
      tenant: targetTenant.id,
      title: replaceBrand(source.title),
      slug: replaceBrand(source.slug),
      kind: source.kind,
      legacyPath: replaceBrand(source.legacyPath),
      contentHtml: replaceBrand(source.contentHtml),
      excerpt: replaceBrand(source.excerpt),
      publicationStatus: 'publish',
      sourceSystem: SOURCE_SYSTEM,
      sourceId,
      sourceModifiedAt: source.sourceModifiedAt,
      sourceChecksum: source.sourceChecksum,
    })
  }

  const published = await allDocs(payload, 'products', {
    and: [{ tenant: { equals: targetTenant.id } }, { publicationStatus: { equals: 'publish' } }],
  }, 1)
  for (const source of sourceCategories) {
    const targetId = categoryMap.get(String(source.id))
    if (!targetId) continue
    const count = published.filter((product) => (product.categories || []).map(relationId).some((id: unknown) => String(id) === String(targetId))).length
    await payload.update({ collection: 'product-categories', id: targetId, data: { productCount: count }, overrideAccess: true })
  }

  const [existingUser] = await allDocs(payload, 'users', { email: { equals: SERVICE_EMAIL } }, 0)
  const apiKey = typeof existingUser?.apiKey === 'string' && existingUser.apiKey.length > 20
    ? existingUser.apiKey
    : randomBytes(32).toString('hex')
  const password = randomBytes(32).toString('base64url')
  const userData = {
    email: SERVICE_EMAIL,
    name: 'PND Sport REST',
    role: 'tenant_admin' as const,
    tenants: [{ tenant: targetTenant.id }],
    enableAPIKey: true,
    apiKey,
    ...(!existingUser ? { password } : {}),
  }
  if (existingUser) await payload.update({ collection: 'users', id: existingUser.id, data: userData, overrideAccess: true })
  else await payload.create({ collection: 'users', data: userData, overrideAccess: true })

  const secret = [
    'CMS_API_URL=https://cms.x24sport.vn',
    `TENANT_SLUG=${TARGET_SLUG}`,
    `PAYLOAD_API_USER=${SERVICE_EMAIL}`,
    `PAYLOAD_API_KEY=${apiKey}`,
    'PAYLOAD_AUTH_COLLECTION=users',
    '',
  ].join('\n')
  await writeFile(secretFile!, secret, { mode: 0o600 })
  await chmod(secretFile!, 0o600)

  console.log(JSON.stringify({
    mode: 'apply',
    tenantId: targetTenant.id,
    categories: categoryMap.size,
    publishedProducts,
    draftProducts,
    webContent: sourceContent.length,
    sharedMedia,
    serviceUser: SERVICE_EMAIL,
    secretWritten: true,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
