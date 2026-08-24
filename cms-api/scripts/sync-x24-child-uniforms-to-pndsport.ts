import 'dotenv/config'
import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type Doc = Record<string, any>

const sourceTenantSlug = 'x24sport'
const targetTenantSlug = 'pndsport'
const categorySlug = 'dong-phuc-tre-em'
const sourceSystem = 'payload-tenant-clone'
const apply = process.argv.includes('--apply')

const relationID = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationID((value as Doc).id)
      : undefined

const plainText = (value: unknown) => String(value || '').replace(/\s+/g, ' ').trim()
const cloneValue = <T>(value: T): T | undefined => value === undefined ? undefined : JSON.parse(JSON.stringify(value, (key, entry) => key === 'id' ? undefined : entry))
const stableHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const uniqueIDs = (ids: Array<number | string>) => [...new Map(ids.map((id) => [String(id), id])).values()]

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
      type: 'root', format: '', direction: null, indent: 0, version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph', format: '', direction: null, indent: 0, version: 1,
        children: [{ type: 'text', text, version: 1 }],
      })),
    },
  }
}

function escapeHTML(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function styleName(product: Doc) {
  return plainText(product.name)
    .replace(/^đồng\s+phục\s+trẻ\s+em\s*/i, '')
    .replace(/^áo\s+polo\s+đồng\s+phục\s+trẻ\s+em\s*/i, '')
    .trim() || plainText(product.name)
}

function galleryIDs(product: Doc) {
  return (Array.isArray(product.gallery) ? product.gallery : []).map(relationID).filter((id): id is number | string => id !== undefined)
}

function buildPNDCopy(product: Doc) {
  const name = plainText(product.name)
  const sku = plainText(product.sku)
  const style = styleName(product)
  const isPolo = /^áo\s+polo\b/i.test(plainText(product.name)) || /\bpolo\b/i.test(plainText(product.shortDescription))
  const form = isPolo ? 'áo polo' : 'mẫu đồng phục'
  const index = [...(sku || style)].reduce((total, character) => total + character.charCodeAt(0), 0)
  const occasions = [
    'lớp học, hoạt động ngoại khóa và ngày hội trường',
    'câu lạc bộ thiếu nhi, lớp kỹ năng và đội nhóm nhỏ',
    'các chương trình thiếu nhi cần màu sắc vui tươi, dễ nhận diện',
    'tập thể học sinh muốn xây dựng hình ảnh đồng bộ',
  ]
  const notes = [
    'Bố cục logo, tên lớp và gam màu chủ đạo có thể điều chỉnh theo nhận diện riêng.',
    'PND Sport có thể cùng đơn vị chốt màu sắc, logo và thông tin in trước khi triển khai.',
    'Khi đặt theo nhóm, nên thống nhất size, số lượng và chi tiết nhận diện để hoàn thiện phương án phù hợp.',
    'Mẫu có thể phát triển thành một bộ đồng phục riêng với màu sắc và thông tin của từng tập thể.',
  ]
  const occasion = occasions[index % occasions.length]
  const note = notes[index % notes.length]
  const shortDescription = `${name} là mẫu ${form} có phối ${style}, phù hợp cho ${occasion}. Mã mẫu: ${sku || 'đang cập nhật'}.`
  const paragraphs = [
    `${name} có phối màu ${style}, tạo cảm giác tươi sáng và năng động cho trang phục trẻ em. Form ${isPolo ? 'polo' : 'đồng phục'} giúp tổng thể gọn gàng khi tham gia các hoạt động tập thể.`,
    `Mẫu phù hợp cho ${occasion}. Bảng màu có thể dùng làm nền để xây dựng hình ảnh chung cho lớp, câu lạc bộ hoặc chương trình của trường.`,
    `${note} PND Sport Việt Nam hỗ trợ tư vấn theo nhu cầu thực tế của từng đơn vị.`,
    `Sử dụng mã ${sku || 'sản phẩm'} khi cần trao đổi để PND Sport đối chiếu đúng mẫu.`,
  ]
  return {
    name,
    shortDescription,
    description: richText(paragraphs),
    contentHtml: paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('\n'),
    seoTitle: `${name} | Mã ${sku || 'đồng phục trẻ em'}`.slice(0, 120),
    metaDescription: `${name}, mã ${sku || 'sản phẩm'}, phù hợp cho ${occasion}. PND Sport tư vấn điều chỉnh logo, màu nhận diện và thông tin tập thể.`.slice(0, 300),
    reviewText: paragraphs.join('\n\n'),
  }
}

function sourceFactFingerprint(product: Doc) {
  return stableHash({ sku: product.sku || null, sport: product.sport || null, productType: product.productType || null, price: product.price ?? null, regularPrice: product.regularPrice ?? null, salePrice: product.salePrice ?? null, compareAtPrice: product.compareAtPrice ?? null, stockStatus: product.stockStatus || null, attributes: product.attributes || [], badges: product.badges || [], gallery: galleryIDs(product) })
}

function targetCopyFingerprint(copy: ReturnType<typeof buildPNDCopy>) {
  return stableHash({ name: copy.name, shortDescription: copy.shortDescription, description: copy.description, seoTitle: copy.seoTitle, metaDescription: copy.metaDescription })
}

async function run() {
  const payload: any = await getPayload({ config })
  const [sourceTenant, targetTenant, superAdmin] = await Promise.all([
    allDocs(payload, 'tenants', { slug: { equals: sourceTenantSlug } }),
    allDocs(payload, 'tenants', { slug: { equals: targetTenantSlug } }),
    allDocs(payload, 'users', { role: { equals: 'super_admin' } }),
  ]).then(([sources, targets, admins]) => [sources[0], targets[0], admins[0]])
  if (!sourceTenant || !targetTenant || (apply && !superAdmin)) throw new Error('Thiếu tenant nguồn, tenant đích hoặc quyền super_admin.')

  const [sourceCategory, targetCategory] = await Promise.all([
    allDocs(payload, 'product-categories', { and: [{ tenant: { equals: sourceTenant.id } }, { slug: { equals: categorySlug } }] }),
    allDocs(payload, 'product-categories', { and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: categorySlug } }] }),
  ]).then(([sources, targets]) => [sources[0], targets[0]])
  if (!sourceCategory || !targetCategory) throw new Error('Không tìm thấy danh mục Đồng Phục Trẻ Em ở nguồn hoặc PND Sport.')
  const parentID = relationID(targetCategory.parent)
  if (!parentID) throw new Error('Danh mục PND Đồng Phục Trẻ Em chưa có danh mục cha Đồng Phục.')
  const [targetParent] = await allDocs(payload, 'product-categories', { and: [{ id: { equals: parentID } }, { tenant: { equals: targetTenant.id } }, { slug: { equals: 'dong-phuc' } }] })
  if (!targetParent) throw new Error('Danh mục cha PND Đồng Phục không hợp lệ.')

  const [sourceTenantProducts, targetProducts, distributions] = await Promise.all([
    allDocs(payload, 'products', { and: [{ tenant: { equals: sourceTenant.id } }, { publicationStatus: { equals: 'publish' } }] }, 1),
    allDocs(payload, 'products', { tenant: { equals: targetTenant.id } }, 0),
    allDocs(payload, 'catalog-distributions', { targetTenant: { equals: targetTenant.id } }, 0),
  ])
  const sources = sourceTenantProducts.filter((product) => (Array.isArray(product.categories) ? product.categories : []).map(relationID).some((id) => String(id) === String(sourceCategory.id)))
  if (!sources.length) throw new Error('Danh mục nguồn không có sản phẩm publish.')

  const targetBySource = new Map(targetProducts.map((product) => [plainText(product.sourceId), product]))
  const targetBySKU = new Map(targetProducts.filter((product) => plainText(product.sku)).map((product) => [plainText(product.sku), product]))
  const targetBySlug = new Map(targetProducts.filter((product) => plainText(product.slug)).map((product) => [plainText(product.slug), product]))
  const distributionByKey = new Map(distributions.map((distribution) => [plainText(distribution.distributionKey), distribution]))
  const plans = sources.map((source) => {
    const cloneID = `${sourceTenantSlug}:${source.id}`
    const bySource = targetBySource.get(cloneID)
    const bySKU = targetBySKU.get(plainText(source.sku))
    const bySlug = targetBySlug.get(plainText(source.slug))
    const target = bySource || (bySKU && plainText(bySKU.sourceId) === cloneID ? bySKU : undefined)
    const conflicts = [bySKU, bySlug].filter((item): item is Doc => item !== undefined && String(item.id) !== String(target?.id))
    if (conflicts.length) throw new Error(`Xung đột SKU/slug PND cho ${source.sku || source.slug}: ${conflicts.map((item) => item.id).join(', ')}.`)
    const gallery = Array.isArray(source.gallery) ? source.gallery.filter((media: unknown): media is Doc => Boolean(media) && typeof media === 'object') : []
    if (!gallery.length) throw new Error(`Sản phẩm nguồn ${source.id} không có gallery.`)
    for (const media of gallery) {
      const owner = relationID(media.tenant)
      const shared = Array.isArray(media.sharedWithTenants) ? media.sharedWithTenants.map(relationID) : []
      if (String(owner) !== String(sourceTenant.id) && !shared.some((id) => String(id) === String(sourceTenant.id))) throw new Error(`Media ${media.id} chưa được chia sẻ hợp lệ cho X24Sport.`)
    }
    return { source, cloneID, target, gallery, copy: buildPNDCopy(source) }
  })

  let created = 0; let updated = 0; let mediaShared = 0; let mediaAlreadyShared = 0; let distributionsCreated = 0; let distributionsUpdated = 0
  for (const { source, cloneID, target, gallery, copy } of plans) {
    for (const media of gallery) {
      const shared = Array.isArray(media.sharedWithTenants) ? media.sharedWithTenants.map(relationID).filter((id): id is number | string => id !== undefined) : []
      if (shared.some((id) => String(id) === String(targetTenant.id))) { mediaAlreadyShared += 1; continue }
      mediaShared += 1
      if (apply) await payload.update({ collection: 'media', id: media.id, data: { sharedWithTenants: uniqueIDs([...shared, targetTenant.id]) }, overrideAccess: true, user: superAdmin })
    }
    const data = {
      tenant: targetTenant.id, name: copy.name, slug: source.slug, sku: source.sku, sport: source.sport || 'other', productType: source.productType || 'simple', publicationStatus: 'publish', featured: false,
      price: source.price, regularPrice: source.regularPrice, salePrice: source.salePrice, compareAtPrice: source.compareAtPrice, currency: source.currency || 'VND', stockStatus: source.stockStatus || 'instock', isPurchasable: source.isPurchasable, isOnBackorder: source.isOnBackorder,
      shortDescription: copy.shortDescription, description: copy.description, attributes: cloneValue(source.attributes), badges: cloneValue(source.badges), searchTags: cloneValue(source.searchTags), categories: [targetCategory.id], gallery: galleryIDs(source), legacyImages: cloneValue(source.legacyImages),
      seoTitle: copy.seoTitle, metaDescription: copy.metaDescription, canonicalOverride: undefined, legacyPath: undefined, contentHtml: copy.contentHtml, sourceTags: cloneValue(source.sourceTags), sourceSystem, sourceId: cloneID, sourceModifiedAt: source.sourceModifiedAt, sourceCreatedAt: source.sourceCreatedAt, sourceChecksum: source.sourceChecksum,
    }
    const targetProduct = apply ? target ? await payload.update({ collection: 'products', id: target.id, data, overrideAccess: true, user: superAdmin }) : await payload.create({ collection: 'products', data, overrideAccess: true, user: superAdmin }) : target || { id: `dry-${source.id}` }
    if (target) updated += 1; else created += 1
    const key = `${sourceTenant.id}:${source.id}:${targetTenant.id}`
    const ledger = distributionByKey.get(key)
    const ledgerData = { sourceTenant: sourceTenant.id, sourceProduct: source.id, targetTenant: targetTenant.id, targetProduct: targetProduct.id, status: 'published', copyMode: 'auto', sourceFactFingerprint: sourceFactFingerprint(source), targetCopyFingerprint: targetCopyFingerprint(copy), syncedAt: new Date().toISOString(), lastError: undefined, reviewNote: 'Đồng bộ danh mục Đồng Phục Trẻ Em từ X24Sport sang PND Sport; nội dung PND được biên tập riêng, media dùng chung có chủ đích.', proposedCopy: { name: copy.name, shortDescription: copy.shortDescription, description: copy.reviewText, seoTitle: copy.seoTitle, metaDescription: copy.metaDescription, model: 'editorial-template-pndsport-v1', promptVersion: 'x24-children-uniforms-v1' } }
    if (apply) {
      if (ledger) { await payload.update({ collection: 'catalog-distributions', id: ledger.id, data: ledgerData, overrideAccess: true, user: superAdmin }); distributionsUpdated += 1 }
      else { await payload.create({ collection: 'catalog-distributions', data: ledgerData, overrideAccess: true, user: superAdmin }); distributionsCreated += 1 }
    } else if (ledger) distributionsUpdated += 1; else distributionsCreated += 1
  }
  if (apply) {
    const published = await allDocs(payload, 'products', { and: [{ tenant: { equals: targetTenant.id } }, { publicationStatus: { equals: 'publish' } }] }, 0)
    const count = published.filter((product) => (Array.isArray(product.categories) ? product.categories : []).map(relationID).some((id) => String(id) === String(targetCategory.id))).length
    await payload.update({ collection: 'product-categories', id: targetCategory.id, data: { productCount: count }, overrideAccess: true, user: superAdmin })
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', sourceCategory: sourceCategory.id, targetCategory: targetCategory.id, sourceProducts: sources.length, created, updated, mediaShared, mediaAlreadyShared, distributionsCreated, distributionsUpdated }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => { console.error(error instanceof Error ? error.stack || error.message : error); process.exit(1) })
