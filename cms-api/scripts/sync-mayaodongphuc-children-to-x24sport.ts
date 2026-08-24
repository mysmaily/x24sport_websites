import 'dotenv/config'
import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type Doc = Record<string, any>

const sourceTenantSlug = 'mayaodongphuc'
const targetTenantSlug = 'x24sport'
const sourceCategorySlug = 'dong-phuc-tre-em'
const targetCategorySlug = 'dong-phuc-tre-em'
const sourceSystem = 'payload-tenant-clone'
const apply = process.argv.includes('--apply')
const debug = process.argv.includes('--debug')

const relationID = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationID((value as Doc).id)
      : undefined

const plainText = (value: unknown) => String(value || '').replace(/\s+/g, ' ').trim()

const uniqueIDs = (ids: Array<number | string>) => [...new Map(ids.map((id) => [String(id), id])).values()]

const stableHash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

const cloneValue = <T>(value: T): T | undefined =>
  value === undefined ? undefined : JSON.parse(JSON.stringify(value, (key, entry) => key === 'id' ? undefined : entry))

async function allDocs(payload: any, collection: string, where: Doc, depth = 0): Promise<Doc[]> {
  const docs: Doc[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({ collection, where, depth, limit: 100, page, overrideAccess: true })
    docs.push(...result.docs)
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      direction: null,
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        direction: null,
        indent: 0,
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      })),
    },
  }
}

function escapeHTML(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function styleName(product: Doc) {
  const name = plainText(product.name)
  return name
    .replace(/^áo\s+polo\s+đồng\s+phục\s+trẻ\s+em\s*/i, '')
    .replace(/^áo\s+đồng\s+phục\s+trẻ\s+em\s*/i, '')
    .replace(/^đồng\s+phục\s+trẻ\s+em\s*/i, '')
    .trim() || name
}

function buildX24Copy(product: Doc) {
  const sku = plainText(product.sku)
  const style = styleName(product)
  const name = `Đồng phục trẻ em ${style}`
  const isPolo = /^áo\s+polo\b/i.test(plainText(product.name))
  const garment = isPolo ? 'áo polo đồng phục trẻ em' : 'đồng phục trẻ em'
  const index = [...(sku || style)].reduce((total, character) => total + character.charCodeAt(0), 0)
  const audiences = [
    'lớp học và hoạt động ngoại khóa',
    'câu lạc bộ thiếu nhi và chương trình kỹ năng',
    'ngày hội trường, đội nhóm và sự kiện dành cho học sinh',
    'nhóm học sinh cần một bộ nhận diện vui tươi, dễ nhận biết',
  ]
  const designAngles = [
    `Bảng màu ${style} tạo ấn tượng tươi sáng và giúp tổng thể trang phục nổi bật hơn khi hoạt động theo nhóm.`,
    `Cách phối ${style} nhấn vào sự trẻ trung, phù hợp với không khí sinh hoạt tập thể của học sinh.`,
    `Phần màu ${style} giúp mẫu có điểm nhận diện rõ ràng mà vẫn giữ cảm giác gọn gàng, thân thiện với lứa tuổi nhỏ.`,
    `Sự kết hợp ${style} mang lại diện mạo năng động, dễ ứng dụng cho nhiều bối cảnh học tập và vui chơi.`,
  ]
  const planningNotes = [
    'Khi phát triển theo nhận diện riêng, có thể điều chỉnh màu chủ đạo, vị trí logo và thông tin của lớp hoặc câu lạc bộ.',
    'Mẫu có thể dùng làm điểm xuất phát để thống nhất màu sắc, logo và chi tiết in theo nhu cầu của từng đơn vị.',
    'Trước khi triển khai, nên chốt lại bảng màu, logo, size và số lượng để phương án thiết kế bám sát nhu cầu sử dụng.',
    'Các chi tiết nhận diện như tên lớp, logo hoặc thông điệp sự kiện có thể được bố trí lại theo phương án thực tế.',
  ]
  const audience = audiences[index % audiences.length]
  const design = designAngles[index % designAngles.length]
  const planning = planningNotes[index % planningNotes.length]
  const shortDescription = `${name} là mẫu ${garment} phối ${style}, phù hợp cho ${audience}. Mã mẫu: ${sku || 'đang cập nhật'}.`
  const intro = `${name} là gợi ý thiết kế dành cho ${audience}. Mẫu tập trung vào phối màu ${style}, tạo cảm giác gần gũi và năng động cho trang phục của các em.`
  const useCase = `Với form ${isPolo ? 'polo' : 'đồng phục'} quen thuộc, thiết kế này phù hợp để tham khảo khi cần xây dựng hình ảnh đồng bộ cho lớp, câu lạc bộ hoặc một chương trình dành cho trẻ em.`
  const consult = `${planning} X24Sport hỗ trợ trao đổi phương án phù hợp trước khi đặt may.`
  const reference = `Mã ${sku || 'sản phẩm'} dùng để đối chiếu đúng mẫu khi cần tư vấn hoặc gửi yêu cầu thiết kế.`
  const paragraphs = [intro, design, useCase, consult, reference]
  const contentHtml = paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('\n')
  const seoTitle = `${name} | Mã ${sku || 'đồng phục trẻ em'}`.slice(0, 120)
  const metaDescription = `${name} với phối màu ${style}, phù hợp cho ${audience}. Tham khảo thiết kế, logo và nhận diện theo nhu cầu. Mã ${sku || 'sản phẩm'}.`.slice(0, 300)

  return { name, shortDescription, description: richText(paragraphs), contentHtml, seoTitle, metaDescription, reviewText: paragraphs.join('\n\n') }
}

function galleryIDs(product: Doc) {
  return (Array.isArray(product.gallery) ? product.gallery : [])
    .map(relationID)
    .filter((id): id is number | string => id !== undefined)
}

function sourceFactFingerprint(product: Doc) {
  return stableHash({
    sku: product.sku || null,
    sport: product.sport || null,
    productType: product.productType || null,
    price: product.price ?? null,
    regularPrice: product.regularPrice ?? null,
    salePrice: product.salePrice ?? null,
    compareAtPrice: product.compareAtPrice ?? null,
    stockStatus: product.stockStatus || null,
    attributes: product.attributes || [],
    badges: product.badges || [],
    gallery: galleryIDs(product),
  })
}

function targetCopyFingerprint(copy: ReturnType<typeof buildX24Copy>) {
  return stableHash({
    name: copy.name,
    shortDescription: copy.shortDescription,
    description: copy.description,
    seoTitle: copy.seoTitle,
    metaDescription: copy.metaDescription,
  })
}

async function run() {
  const payload: any = await getPayload({ config })
  if (debug) {
    const walk = (fields: any[]): any => fields.flatMap((field) => [field, ...(field.fields || []), ...((field.tabs || []).flatMap((tab: any) => tab.fields || []))])
    const galleryField = walk(payload.collections.products.config.fields).find((field: Doc) => field.name === 'gallery')
    console.log(JSON.stringify({ galleryFilterOptions: galleryField?.filterOptions || null }, null, 2))
  }
  const [sourceTenant, targetTenant] = await Promise.all([
    allDocs(payload, 'tenants', { slug: { equals: sourceTenantSlug } }),
    allDocs(payload, 'tenants', { slug: { equals: targetTenantSlug } }),
  ]).then(([sources, targets]) => [sources[0], targets[0]])
  if (!sourceTenant || !targetTenant) throw new Error('Không tìm thấy tenant nguồn hoặc tenant đích.')

  const [sourceCategory, targetCategory, superAdmin] = await Promise.all([
    allDocs(payload, 'product-categories', { and: [{ tenant: { equals: sourceTenant.id } }, { slug: { equals: sourceCategorySlug } }] }),
    allDocs(payload, 'product-categories', { and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: targetCategorySlug } }] }),
    allDocs(payload, 'users', { role: { equals: 'super_admin' } }),
  ]).then(([sources, targets, admins]) => [sources[0], targets[0], admins[0]])
  if (!sourceCategory || !targetCategory) throw new Error('Không tìm thấy danh mục nguồn hoặc danh mục đích.')
  if (apply && !superAdmin) throw new Error('Không tìm thấy super_admin để cấp quyền dùng chung media.')

  const [sourceTenantProducts, targetProducts, distributions] = await Promise.all([
    allDocs(payload, 'products', { and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }] }, 1),
    allDocs(payload, 'products', { tenant: { equals: targetTenant.id } }, 0),
    allDocs(payload, 'catalog-distributions', { targetTenant: { equals: targetTenant.id } }, 0),
  ])
  const sourceProducts = sourceTenantProducts.filter((product) =>
    (Array.isArray(product.categories) ? product.categories : []).map(relationID).some((id) => String(id) === String(sourceCategory.id)),
  )
  if (!sourceProducts.length) throw new Error('Danh mục nguồn không có sản phẩm publish để đồng bộ.')

  const targetsBySource = new Map(targetProducts.map((product) => [plainText(product.sourceId), product]))
  const targetsBySKU = new Map(targetProducts.filter((product) => plainText(product.sku)).map((product) => [plainText(product.sku), product]))
  const targetsBySlug = new Map(targetProducts.filter((product) => plainText(product.slug)).map((product) => [plainText(product.slug), product]))
  const distributionsByKey = new Map(distributions.map((distribution) => [plainText(distribution.distributionKey), distribution]))

  const plans = sourceProducts.map((source) => {
    const cloneID = `${sourceTenantSlug}:${source.id}`
    const targetBySource = targetsBySource.get(cloneID)
    const skuMatch = targetsBySKU.get(plainText(source.sku))
    const slugMatch = targetsBySlug.get(plainText(source.slug))
    const target = targetBySource || (skuMatch && plainText(skuMatch.sourceId) === cloneID ? skuMatch : undefined)
    const existingMatches = [skuMatch, slugMatch].filter((match): match is Doc => match !== undefined)
    const conflicts = existingMatches.filter((match) => String(match.id) !== String(target?.id))
    if (conflicts.length) {
      throw new Error(`Xung đột SKU/slug ở X24Sport cho ${source.sku || source.slug}: product ${conflicts.map((item) => item.id).join(', ')}.`)
    }
    const gallery = Array.isArray(source.gallery) ? source.gallery.filter((media: unknown) => media && typeof media === 'object') as Doc[] : []
    if (!gallery.length) throw new Error(`Sản phẩm nguồn ${source.id} không có gallery media.`)
    for (const media of gallery) {
      if (String(relationID(media.tenant)) !== String(sourceTenant.id)) {
        throw new Error(`Media ${media.id} của sản phẩm ${source.id} không thuộc tenant nguồn.`)
      }
    }
    return { source, cloneID, target, gallery, copy: buildX24Copy(source) }
  })
  if (debug) {
    const firstGallery = galleryIDs(plans[0].source)
    const readable = await payload.find({
      collection: 'media',
      where: { id: { in: firstGallery } },
      depth: 0,
      limit: 0,
      pagination: false,
      user: superAdmin,
    })
    console.log(JSON.stringify({ firstGallery, readableMediaIDs: readable.docs.map((media: Doc) => media.id) }, null, 2))
  }

  let created = 0
  let updated = 0
  let mediaShared = 0
  let mediaAlreadyShared = 0
  let distributionsCreated = 0
  let distributionsUpdated = 0

  for (const plan of plans) {
    const { source, cloneID, target, gallery, copy } = plan
    for (const media of gallery) {
      const shared = Array.isArray(media.sharedWithTenants)
        ? media.sharedWithTenants.map(relationID).filter((id): id is number | string => id !== undefined)
        : []
      if (shared.some((id) => String(id) === String(targetTenant.id))) {
        mediaAlreadyShared += 1
        continue
      }
      mediaShared += 1
      if (apply) {
        await payload.update({
          collection: 'media',
          id: media.id,
          data: { sharedWithTenants: uniqueIDs([...shared, targetTenant.id]) },
          overrideAccess: true,
          user: superAdmin,
        })
      }
    }

    const data = {
      tenant: targetTenant.id,
      name: copy.name,
      slug: source.slug,
      sku: source.sku,
      sport: source.sport || 'other',
      productType: source.productType || 'simple',
      publicationStatus: 'publish',
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
      gallery: galleryIDs(source),
      legacyImages: cloneValue(source.legacyImages),
      seoTitle: copy.seoTitle,
      metaDescription: copy.metaDescription,
      canonicalOverride: undefined,
      legacyPath: undefined,
      contentHtml: copy.contentHtml,
      sourceTags: cloneValue(source.sourceTags),
      sourceSystem,
      sourceId: cloneID,
      sourceModifiedAt: source.sourceModifiedAt,
      sourceCreatedAt: source.sourceCreatedAt,
      sourceChecksum: source.sourceChecksum,
    }
    const targetProduct = apply
      ? target
        ? await payload.update({ collection: 'products', id: target.id, data, overrideAccess: true, user: superAdmin })
        : await payload.create({ collection: 'products', data, overrideAccess: true, user: superAdmin })
      : target || { id: `dry-${source.id}` }
    if (target) updated += 1
    else created += 1

    const distributionKey = `${sourceTenant.id}:${source.id}:${targetTenant.id}`
    const existingDistribution = distributionsByKey.get(distributionKey)
    const distributionData = {
      sourceTenant: sourceTenant.id,
      sourceProduct: source.id,
      targetTenant: targetTenant.id,
      targetProduct: targetProduct.id,
      status: 'published',
      copyMode: 'auto',
      sourceFactFingerprint: sourceFactFingerprint(source),
      targetCopyFingerprint: targetCopyFingerprint(copy),
      syncedAt: new Date().toISOString(),
      lastError: undefined,
      reviewNote: 'Đồng bộ từ danh mục đồng phục trẻ em của Maya Áo Đồng Phục. Nội dung X24Sport được biên tập lại riêng; media được chia sẻ có chủ đích.',
      proposedCopy: {
        name: copy.name,
        shortDescription: copy.shortDescription,
        description: copy.reviewText,
        seoTitle: copy.seoTitle,
        metaDescription: copy.metaDescription,
        model: 'editorial-template-x24sport-v1',
        promptVersion: 'mayaodongphuc-children-v1',
      },
    }
    if (apply) {
      if (existingDistribution) {
        await payload.update({ collection: 'catalog-distributions', id: existingDistribution.id, data: distributionData, overrideAccess: true, user: superAdmin })
        distributionsUpdated += 1
      } else {
        await payload.create({ collection: 'catalog-distributions', data: distributionData, overrideAccess: true, user: superAdmin })
        distributionsCreated += 1
      }
    } else if (existingDistribution) distributionsUpdated += 1
    else distributionsCreated += 1
  }

  if (apply) {
    const publishedInTarget = await allDocs(payload, 'products', {
      and: [{ tenant: { equals: targetTenant.id } }, { publicationStatus: { equals: 'publish' } }],
    }, 0)
    const productCount = publishedInTarget.filter((product) =>
      (Array.isArray(product.categories) ? product.categories : []).map(relationID).some((id) => String(id) === String(targetCategory.id)),
    ).length
    await payload.update({ collection: 'product-categories', id: targetCategory.id, data: { productCount }, overrideAccess: true, user: superAdmin })
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    sourceCategory: sourceCategory.slug,
    targetCategory: targetCategory.slug,
    sourceProducts: sourceProducts.length,
    created,
    updated,
    mediaShared,
    mediaAlreadyShared,
    distributionsCreated,
    distributionsUpdated,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  if (error && typeof error === 'object') {
    console.error(JSON.stringify({
      data: (error as Doc).data,
      errors: (error as Doc).errors,
    }, null, 2))
  }
  process.exit(1)
})
