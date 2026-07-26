import 'dotenv/config'
import config from '../src/payload.config'
import { getPayload } from 'payload'

type Doc = Record<string, any>
type ReportItem = {
  sourceId: number | string
  sourceSlug: string
  sku?: string
  action: 'create' | 'update'
  targetId?: number | string
  mediaShared: Array<number | string>
  mediaAlreadyShared: Array<number | string>
  warnings: string[]
}

const sourceSlug = 'mayaochaybo'
const targetSlug = 'x24sport'
const targetCategorySlug = 'chay-bo'
const sourceSystem = 'payload-tenant-clone'
const status = 'publish'
const blockedMediaUrls = new Set([
  'https://static.x24sport.vn/mayaochaybo/wp-609-ao-chay-bo-nam-13.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-637-ao-chay-bo-tay-ngan-nu-2-1.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-670-xuong-may-ao-chay-marathon-1.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-685-ao-chay-bo-theo-size-1.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-754-ao-chay-bo-nhom-tu-thiet-ke-1.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-760-ao-chay-bo-mau-sac-ca-tinh-1.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-787-ao-chay-bo-in-hinh-giai-chay-1.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-867-ao-chay-bo-vai-thoang-khi-1.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-878-ao-chay-bo-nhe-mat.jpg',
  'https://static.x24sport.vn/mayaochaybo/wp-985-may-ao-chay-bo-cho-cau-lac-bo-1.jpg',
])

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

const cloneValue = <T>(value: T): T | undefined =>
  value === undefined ? undefined : JSON.parse(JSON.stringify(value, (key, entry) => key === 'id' ? undefined : entry))

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
  const raw = String(value || '').trim()
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed: unknown = JSON.parse(raw)
      const parsedText: string = plainText(parsed)
      if (parsedText) return parsedText
    } catch {
      // Keep the original string when it is not valid JSON.
    }
  }
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function richTextFromParagraphs(paragraphs: string[]) {
  const format: '' = ''
  return {
    root: {
      type: 'root',
      format,
      direction: null,
      indent: 0,
      version: 1,
      children: paragraphs.filter(Boolean).map((text) => ({
        type: 'paragraph',
        format,
        direction: null,
        indent: 0,
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      })),
    },
  }
}

function attributeSummary(product: Doc) {
  const attributes = Array.isArray(product.attributes) ? product.attributes : []
  return attributes
    .map((attribute) => {
      const name = plainText(attribute?.name)
      const values = Array.isArray(attribute?.values)
        ? attribute.values.map((item: Doc) => plainText(item?.value)).filter(Boolean)
        : []
      return name && values.length ? `${name}: ${values.join(', ')}` : ''
    })
    .filter(Boolean)
}

function buildCopy(product: Doc) {
  const name = plainText(product.name)
  const sku = plainText(product.sku)
  const attributes = attributeSummary(product)
  const intro = `${name} được X24Sport phân phối cho nhu cầu chạy bộ, tập luyện hằng ngày, câu lạc bộ và sự kiện thể thao. Mẫu sản phẩm giữ nguyên thông tin mã hàng ${sku || 'từ catalog gốc'} để khách dễ đối chiếu khi đặt mua.`
  const consult = 'X24Sport hỗ trợ tư vấn size, chất liệu, số lượng đặt hàng và phương án in ấn theo nhu cầu đội nhóm hoặc giải chạy.'
  const shortDescription = `Sản phẩm chạy bộ ${name} do X24Sport bán và tư vấn đặt hàng, phù hợp cho luyện tập, đội nhóm và sự kiện.`
  const paragraphs = attributes.length ? [intro, `Thông tin nổi bật: ${attributes.join('; ')}.`, consult] : [intro, consult]
  const listItems = [
    'Phù hợp cho chạy bộ, tập luyện và hoạt động đội nhóm.',
    'Có thể trao đổi trực tiếp với X24Sport về size, số lượng và thời gian giao.',
    ...(sku ? [`Mã sản phẩm: ${sku}.`] : []),
  ]
  const contentHtml = [
    `<p>${escapeHtml(intro)}</p>`,
    attributes.length ? `<p><strong>Thông tin sản phẩm:</strong> ${escapeHtml(attributes.join('; '))}.</p>` : '',
    '<ul>',
    ...listItems.map((item) => `<li>${escapeHtml(item)}</li>`),
    '</ul>',
    `<p>${escapeHtml(consult)}</p>`,
  ].filter(Boolean).join('\n')
  const seoTitle = `${name} | X24Sport`
  const metaDescription = `${name} mã ${sku || 'sản phẩm'} bán tại X24Sport cho chạy bộ, đội nhóm và sự kiện. Tư vấn size, số lượng và đặt hàng nhanh.`

  return {
    shortDescription: shortDescription.slice(0, 4000),
    description: richTextFromParagraphs(paragraphs),
    contentHtml,
    seoTitle,
    metaDescription: metaDescription.slice(0, 300),
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function tenantId(value: unknown) {
  const id = relationId(value)
  return id === undefined ? undefined : String(id)
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

function mediaIds(product: Doc) {
  return (Array.isArray(product.gallery) ? product.gallery : [])
    .map(relationId)
    .filter((id): id is number | string => id !== undefined)
}

function legacyImagesFromMedia(product: Doc, gallery: Doc[]) {
  const fromMedia = gallery
    .map((media) => ({
      url: typeof media.url === 'string' ? media.url : '',
      alt: plainText(media.alt || product.name),
      width: typeof media.width === 'number' ? media.width : undefined,
      height: typeof media.height === 'number' ? media.height : undefined,
    }))
    .filter((item) => item.url && !blockedMediaUrls.has(item.url))
  if (fromMedia.length) return fromMedia
  return cloneValue(product.legacyImages)
}

async function assertUniqueByField(payload: any, field: string, value: string | undefined, targetTenantId: number | string, expectedTarget?: Doc) {
  if (!value) return
  const matches = await allDocs(payload, 'products', {
    and: [{ tenant: { equals: targetTenantId } }, { [field]: { equals: value } }],
  }, 0)
  const foreign = matches.filter((doc) => !expectedTarget || String(doc.id) !== String(expectedTarget.id))
  if (foreign.length) {
    throw new Error(`Conflict: target ${field} "${value}" already belongs to product ${foreign.map((doc) => doc.id).join(', ')}.`)
  }
}

async function run() {
  const payload: any = await getPayload({ config })
  const [sourceTenant] = await allDocs(payload, 'tenants', { slug: { equals: sourceSlug } })
  const [targetTenant] = await allDocs(payload, 'tenants', { slug: { equals: targetSlug } })
  if (!sourceTenant) throw new Error(`Không tìm thấy tenant nguồn ${sourceSlug}.`)
  if (!targetTenant) throw new Error(`Không tìm thấy tenant đích ${targetSlug}.`)
  const [superAdmin] = await allDocs(payload, 'users', { role: { equals: 'super_admin' } }, 0)
  if (apply && !superAdmin) throw new Error('Không tìm thấy tài khoản super_admin để cập nhật media sharing.')
  const adminReq = superAdmin ? ({ user: superAdmin } as any) : undefined

  const [targetCategory] = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: targetCategorySlug } }],
  }, 0)
  if (!targetCategory) throw new Error(`Không tìm thấy danh mục đích ${targetSlug}/${targetCategorySlug}.`)

  const products = await allDocs(payload, 'products', {
    and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }],
  }, 2)
  const targetProducts = await allDocs(payload, 'products', { tenant: { equals: targetTenant.id } }, 0)
  const targetsBySourceId = new Map(targetProducts.map((doc) => [doc.sourceId, doc]))

  const report: ReportItem[] = []
  let created = 0
  let updated = 0

  for (const source of products) {
    const cloneId = `${sourceSlug}:${source.id}`
    const target = targetsBySourceId.get(cloneId)
    await assertUniqueByField(payload, 'sku', plainText(source.sku), targetTenant.id, target)
    await assertUniqueByField(payload, 'slug', plainText(source.slug), targetTenant.id, target)

    const expandedGallery = Array.isArray(source.gallery) ? source.gallery.filter((item: unknown) => item && typeof item === 'object') : []
    const ids = mediaIds(source)
    const warnings: string[] = []
    if (!ids.length) warnings.push('Source product has no gallery media.')
    for (const media of expandedGallery) {
      if (tenantId(media.tenant) !== String(sourceTenant.id)) {
        warnings.push(`Media ${media.id} is not owned by source tenant ${sourceSlug}.`)
      }
      if (media.url && !String(media.url).startsWith('https://static.x24sport.vn/')) {
        warnings.push(`Media ${media.id} uses an unexpected URL: ${media.url}`)
      }
    }
    if (warnings.some((warning) => warning.includes('not owned') || warning.includes('unexpected URL'))) {
      throw new Error(`Blocker on product ${source.id}: ${warnings.join(' ')}`)
    }

    const mediaShared: Array<number | string> = []
    const mediaAlreadyShared: Array<number | string> = []
    for (const media of expandedGallery) {
      const shared = Array.isArray(media.sharedWithTenants)
        ? media.sharedWithTenants.map(relationId).filter((id: number | string | undefined): id is number | string => id !== undefined)
        : []
      if (shared.map(String).includes(String(targetTenant.id))) {
        mediaAlreadyShared.push(media.id)
      } else {
        mediaShared.push(media.id)
        if (apply) {
          await payload.update({
            collection: 'media',
            id: media.id,
            data: { sharedWithTenants: uniqueRelationIds([...shared, targetTenant.id]) },
            overrideAccess: true,
            req: adminReq,
          })
        }
      }
    }

    const copy = buildCopy(source)
    const data = {
      tenant: targetTenant.id,
      name: source.name,
      slug: source.slug,
      sku: source.sku,
      sport: 'running' as const,
      productType: source.productType || 'simple',
      publicationStatus: status,
      featured: false,
      price: source.price,
      regularPrice: source.regularPrice,
      salePrice: source.salePrice,
      compareAtPrice: source.compareAtPrice,
      currency: source.currency || 'VND',
      stockStatus: source.stockStatus || 'instock',
      isPurchasable: source.isPurchasable,
      isOnBackorder: source.isOnBackorder,
      shortDescription: copy.shortDescription,
      description: copy.description,
      attributes: cloneValue(source.attributes),
      badges: cloneValue(source.badges),
      searchTags: cloneValue(source.searchTags),
      categories: [targetCategory.id],
      gallery: [],
      legacyImages: legacyImagesFromMedia(source, expandedGallery),
      seoTitle: copy.seoTitle,
      metaDescription: copy.metaDescription,
      canonicalOverride: undefined,
      legacyPath: `/${source.slug}/`,
      contentHtml: copy.contentHtml,
      sourceTags: cloneValue(source.sourceTags),
      sourceSystem,
      sourceId: cloneId,
      sourceModifiedAt: source.sourceModifiedAt,
      sourceCreatedAt: source.sourceCreatedAt,
      sourceChecksum: source.sourceChecksum,
    }

    if (apply) {
      if (target) {
        await payload.update({ collection: 'products', id: target.id, data, overrideAccess: true, req: adminReq })
        updated += 1
      } else {
        await payload.create({ collection: 'products', data, overrideAccess: true, req: adminReq })
        created += 1
      }
    } else if (target) {
      updated += 1
    } else {
      created += 1
    }

    report.push({
      sourceId: source.id,
      sourceSlug: source.slug,
      sku: source.sku,
      action: target ? 'update' : 'create',
      targetId: target?.id,
      mediaShared,
      mediaAlreadyShared,
      warnings,
    })
  }

  if (apply) {
    const published = await allDocs(payload, 'products', {
      and: [{ tenant: { equals: targetTenant.id } }, { publicationStatus: { equals: 'publish' } }],
    }, 1)
    const targetCategories = await allDocs(payload, 'product-categories', { tenant: { equals: targetTenant.id } }, 0)
    for (const category of targetCategories) {
      const count = published.filter((product) => (Array.isArray(product.categories) ? product.categories : [])
        .map(relationId)
        .some((id) => String(id) === String(category.id))).length
      await payload.update({
        collection: 'product-categories',
        id: category.id,
        data: { productCount: count },
        overrideAccess: true,
        req: adminReq,
      })
    }
  }

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    sourceTenant: sourceSlug,
    targetTenant: targetSlug,
    targetCategory: targetCategorySlug,
    sourceProducts: products.length,
    created,
    updated,
    mediaToShare: report.reduce((sum, item) => sum + item.mediaShared.length, 0),
    warnings: report.reduce((sum, item) => sum + item.warnings.length, 0),
    items: report,
  }

  if (reportPath) {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(reportPath, JSON.stringify(summary, null, 2))
  }
  console.log(JSON.stringify({
    mode: summary.mode,
    sourceProducts: summary.sourceProducts,
    created: summary.created,
    updated: summary.updated,
    mediaToShare: summary.mediaToShare,
    warnings: summary.warnings,
    report: reportPath || null,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  if (error && typeof error === 'object') {
    const details = {
      name: (error as Doc).name,
      message: (error as Doc).message,
      data: (error as Doc).data,
      errors: (error as Doc).errors,
    }
    console.error(JSON.stringify(details, null, 2))
  }
  process.exit(1)
})
