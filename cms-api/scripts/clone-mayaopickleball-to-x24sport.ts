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
  targetCategory: string
  mediaShared: Array<number | string>
  mediaAlreadyShared: Array<number | string>
  warnings: string[]
}
type DuplicateItem = {
  sourceId: number | string
  sourceSlug: string
  sku?: string
  keptSourceId: number | string
}

const sourceSlug = 'mayaopickleball'
const targetSlug = 'x24sport'
const defaultCategorySlug = 'ao-pickleball'
const logoCategorySlug = 'logo-ao-pickleball'
const pickleballParentSlug = 'pickleball'
const sourceSystem = 'payload-tenant-clone'
const status = 'publish'
const blockedMediaUrls = new Set([
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-130-xanh-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-141-xanh-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-146-xanh-nang-dong-ao-co-tay-co-co.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-199-vang-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-210-xanh-ngoc-xanh-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-228-hong-tim-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-248-tim-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-290-noi-bat-nang-dong-ao-co-tay-co-co.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-330-do-nang-dong-ao-co-tay-co-co.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-349-noi-bat-nang-dong-ao-co-tay-co-co.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-431-do-nang-dong-ao-co-tay-co-co.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-442-do-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-456-vang-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-498-noi-bat-nang-dong-ao-co-tay-co-co.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-498-noi-bat-nang-dong-ao-khong-tay.webp',
  'https://static.x24sport.vn/mayaopickleball/bo-quan-ao-pickleball-x24-pb-614-noi-bat-nang-dong-ao-co-tay-co-co.webp',
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

function textHaystack(product: Doc) {
  return [
    product.name,
    product.slug,
    product.sku,
    product.shortDescription,
    product.contentHtml,
    ...(Array.isArray(product.searchTags) ? product.searchTags.map((tag: Doc) => tag?.value) : []),
    ...(Array.isArray(product.sourceTags) ? product.sourceTags.flatMap((tag: Doc) => [tag?.name, tag?.slug]) : []),
  ].map(plainText).join(' ').toLowerCase()
}

function isLogoProduct(product: Doc) {
  const haystack = textHaystack(product)
  return /\blogo\b|lô\s*gô/i.test(haystack)
}

function buildCopy(product: Doc, logoProduct: boolean) {
  const name = plainText(product.name)
  const sku = plainText(product.sku)
  const attributes = attributeSummary(product)
  const useCase = logoProduct
    ? 'logo áo pickleball, nhận diện đội nhóm và thiết kế theo yêu cầu'
    : 'áo pickleball, luyện tập, thi đấu phong trào, câu lạc bộ và đội nhóm'
  const intro = `${name} được X24Sport phân phối cho nhu cầu ${useCase}. Mẫu sản phẩm giữ nguyên mã ${sku || 'từ catalog gốc'} để khách dễ đối chiếu khi đặt mua.`
  const consult = 'X24Sport hỗ trợ tư vấn size, chất liệu, phối màu, số lượng đặt hàng và phương án in tên, số hoặc logo theo nhu cầu đội nhóm.'
  const shortDescription = logoProduct
    ? `${name} do X24Sport bán và tư vấn cho nhu cầu logo áo pickleball, nhận diện đội nhóm và thiết kế theo yêu cầu.`
    : `${name} do X24Sport bán và tư vấn đặt hàng áo pickleball cho luyện tập, thi đấu, câu lạc bộ và đội nhóm.`
  const paragraphs = attributes.length ? [intro, `Thông tin nổi bật: ${attributes.join('; ')}.`, consult] : [intro, consult]
  const listItems = [
    logoProduct
      ? 'Phù hợp cho đội pickleball cần logo, nhận diện màu áo hoặc thiết kế đồng bộ.'
      : 'Phù hợp cho luyện tập, thi đấu pickleball và đồng phục đội nhóm.',
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
  const metaDescription = `${name} mã ${sku || 'sản phẩm'} bán tại X24Sport cho pickleball, đội nhóm và thiết kế theo yêu cầu. Tư vấn size và đặt hàng nhanh.`

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

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function chooseCanonicalProduct(products: Doc[]) {
  return [...products].sort((left, right) => productScore(right) - productScore(left))[0]
}

function productScore(product: Doc) {
  const sku = plainText(product.sku)
  const slug = plainText(product.slug)
  const skuSlug = sku ? slugify(sku) : ''
  const hasGallery = mediaIds(product).length > 0
  const hasRepeatedSkuSuffix = skuSlug ? slug.endsWith(`-${skuSlug}`) : false
  return (hasGallery ? 10_000 : 0) + (hasRepeatedSkuSuffix ? 0 : 1_000) - slug.length
}

function dedupeBySku(products: Doc[]) {
  const bySku = new Map<string, Doc[]>()
  const withoutSku: Doc[] = []
  for (const product of products) {
    const sku = plainText(product.sku)
    if (!sku) {
      withoutSku.push(product)
      continue
    }
    const group = bySku.get(sku) || []
    group.push(product)
    bySku.set(sku, group)
  }

  const selected: Doc[] = [...withoutSku]
  const skipped: DuplicateItem[] = []
  for (const group of bySku.values()) {
    if (group.length === 1) {
      selected.push(group[0])
      continue
    }
    const canonical = chooseCanonicalProduct(group)
    selected.push(canonical)
    for (const duplicate of group) {
      if (String(duplicate.id) === String(canonical.id)) continue
      skipped.push({
        sourceId: duplicate.id,
        sourceSlug: duplicate.slug,
        sku: duplicate.sku,
        keptSourceId: canonical.id,
      })
    }
  }

  return {
    selected: selected.sort((left, right) => Number(right.id) - Number(left.id)),
    skipped,
  }
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

async function ensureLogoCategory(payload: any, targetTenant: Doc, parentCategory: Doc, adminReq?: any) {
  const existing = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: logoCategorySlug } }],
  }, 0)
  const data = {
    tenant: targetTenant.id,
    name: 'Logo áo Pickleball',
    slug: logoCategorySlug,
    group: 'type',
    parent: parentCategory.id,
    description: 'Logo áo Pickleball tại X24Sport cho đội nhóm, câu lạc bộ và nhận diện giải đấu.',
    sourceSystem: 'x24sport-category-setup',
    sourceId: logoCategorySlug,
  }
  if (existing[0]) {
    if (apply) return payload.update({ collection: 'product-categories', id: existing[0].id, data, overrideAccess: true, req: adminReq })
    return { ...existing[0], ...data }
  }
  if (apply) return payload.create({ collection: 'product-categories', data, overrideAccess: true, req: adminReq })
  return { id: `dry-${logoCategorySlug}`, ...data }
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

  const [defaultCategory] = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: defaultCategorySlug } }],
  }, 0)
  if (!defaultCategory) throw new Error(`Không tìm thấy danh mục đích ${targetSlug}/${defaultCategorySlug}.`)
  const [pickleballParent] = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: pickleballParentSlug } }],
  }, 0)
  if (!pickleballParent) throw new Error(`Không tìm thấy danh mục cha ${targetSlug}/${pickleballParentSlug}.`)
  const logoCategory = await ensureLogoCategory(payload, targetTenant, pickleballParent, adminReq)

  const sourceProducts = await allDocs(payload, 'products', {
    and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }],
  }, 2)
  const { selected: products, skipped: skippedDuplicates } = dedupeBySku(sourceProducts)
  const targetProducts = await allDocs(payload, 'products', { tenant: { equals: targetTenant.id } }, 0)
  const targetsBySourceId = new Map(targetProducts.map((doc) => [doc.sourceId, doc]))
  const targetsBySku = new Map(targetProducts.filter((doc) => plainText(doc.sku)).map((doc) => [plainText(doc.sku), doc]))

  const report: ReportItem[] = []
  let created = 0
  let updated = 0
  let logoProducts = 0

  for (const source of products) {
    const cloneId = `${sourceSlug}:${source.id}`
    const existingBySku = targetsBySku.get(plainText(source.sku))
    const target = targetsBySourceId.get(cloneId) || (
      existingBySku && plainText(existingBySku.sourceId).startsWith(`${sourceSlug}:`) ? existingBySku : undefined
    )
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

    const logoProduct = isLogoProduct(source)
    if (logoProduct) logoProducts += 1
    const targetCategory = logoProduct ? logoCategory : defaultCategory
    const copy = buildCopy(source, logoProduct)
    const data = {
      tenant: targetTenant.id,
      name: source.name,
      slug: source.slug,
      sku: source.sku,
      sport: 'pickleball' as const,
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
      targetCategory: targetCategory.slug,
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
    defaultCategory: defaultCategorySlug,
    logoCategory: logoCategorySlug,
    sourceProducts: sourceProducts.length,
    processedProducts: products.length,
    skippedDuplicates: skippedDuplicates.length,
    logoProducts,
    created,
    updated,
    mediaToShare: report.reduce((sum, item) => sum + item.mediaShared.length, 0),
    warnings: report.reduce((sum, item) => sum + item.warnings.length, 0),
    items: report,
    duplicateSkips: skippedDuplicates,
  }

  if (reportPath) {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(reportPath, JSON.stringify(summary, null, 2))
  }
  console.log(JSON.stringify({
    mode: summary.mode,
    sourceProducts: summary.sourceProducts,
    processedProducts: summary.processedProducts,
    skippedDuplicates: summary.skippedDuplicates,
    logoProducts: summary.logoProducts,
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
