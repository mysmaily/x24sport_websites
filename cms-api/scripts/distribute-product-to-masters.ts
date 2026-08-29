import 'dotenv/config'

import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type Doc = Record<string, any>

const args = new Map(
  process.argv.slice(2).filter((arg) => arg.startsWith('--') && arg.includes('='))
    .map((arg) => {
      const [key, ...value] = arg.slice(2).split('=')
      return [key, value.join('=')]
    }),
)

const sourceTenantSlug = args.get('source-tenant') || ''
const sourceProductID = args.get('source-product-id') || ''
const targetTenantSlugs = (args.get('targets') || 'x24sport,pndsport')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
const apply = process.argv.includes('--apply')
const publishTargets = process.argv.includes('--publish-targets')
const targetPublicationStatus = publishTargets ? 'publish' : 'draft'
const distributionStatus = publishTargets ? 'published' : 'draft_created'

if (!sourceTenantSlug || !sourceProductID) {
  throw new Error('Cần --source-tenant=<slug> và --source-product-id=<id>.')
}
if (!targetTenantSlugs.length) throw new Error('Danh sách tenant đích đang trống.')

const relationID = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationID((value as Doc).id)
      : undefined

const plainText = (value: unknown) => String(value || '').replace(/\s+/g, ' ').trim()
const uniqueIDs = (ids: Array<number | string>) => [...new Map(ids.map((id) => [String(id), id])).values()]
const cloneValue = <T>(value: T): T | undefined =>
  value === undefined
    ? undefined
    : JSON.parse(JSON.stringify(value, (key, entry) => key === 'id' ? undefined : entry))
const stableHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

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

function buildTargetCopy(product: Doc, targetSlug: string) {
  const name = plainText(product.name)
  const sku = plainText(product.sku)
  const targetName = targetSlug === 'pndsport' ? 'PND Sport Việt Nam' : 'X24Sport'
  const paragraphs = targetSlug === 'pndsport'
    ? [
        `${name} nổi bật với nền áo xanh navy và artwork kính thiên văn vui nhộn, phù hợp để tạo dấu ấn riêng cho câu lạc bộ học sinh và nhóm bạn cùng sở thích.`,
        'Mẫu có thể dùng trong sinh hoạt câu lạc bộ, hoạt động ngoại khóa, ngày hội khoa học hoặc buổi chụp ảnh kỷ niệm tại trường.',
        'Tên câu lạc bộ, slogan, màu áo và vị trí hình in có thể điều chỉnh theo nhận diện thực tế của từng tập thể.',
        `Khi cần tư vấn, hãy cung cấp mã ${sku}, logo, số lượng và danh sách size để ${targetName} đối chiếu đúng thiết kế.`,
      ]
    : [
        `${name} là gợi ý đồng phục câu lạc bộ học sinh với tông xanh navy, hình kính thiên văn hoạt hình và thông điệp “Nhìn Xa Mơ Lớn”.`,
        'Thiết kế phù hợp cho câu lạc bộ trường học, đội nhóm yêu khoa học, hoạt động ngoại khóa và các dịp chụp ảnh tập thể.',
        'Có thể tùy chỉnh tên câu lạc bộ, slogan, màu áo và bố cục artwork để đồng bộ với nhận diện của đơn vị.',
        `Sử dụng mã ${sku} khi gửi yêu cầu để ${targetName} tư vấn phương án, size, số lượng và báo giá theo nhu cầu thực tế.`,
      ]
  const shortDescription = targetSlug === 'pndsport'
    ? `Mẫu áo CLB học sinh xanh navy với artwork kính thiên văn vui nhộn; có thể tùy chỉnh tên CLB, slogan và màu áo. Mã mẫu: ${sku}.`
    : `Áo CLB chủ đề thiên văn với tông xanh navy và thông điệp “Nhìn Xa Mơ Lớn”, phù hợp hoạt động trường học. Mã mẫu: ${sku}.`
  const seoTitle = (targetSlug === 'pndsport' ? name : `${name} | ${targetName}`).slice(0, 120)
  const metaDescription = `${name}, mã ${sku}. Mẫu áo câu lạc bộ học sinh có thể tùy chỉnh tên CLB, slogan, màu áo và hình in theo nhu cầu.`.slice(0, 300)
  return {
    name,
    shortDescription,
    description: richText(paragraphs),
    contentHtml: paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('\n'),
    seoTitle,
    metaDescription,
    reviewText: paragraphs.join('\n\n'),
    model: `editorial-template-${targetSlug}-v1`,
    promptVersion: 'single-product-master-distribution-v1',
  }
}

function targetCopyFingerprint(copy: ReturnType<typeof buildTargetCopy>) {
  return stableHash({
    name: copy.name,
    shortDescription: copy.shortDescription,
    description: copy.description,
    seoTitle: copy.seoTitle,
    metaDescription: copy.metaDescription,
  })
}

async function resolveTargetCategories(payload: any, source: Doc, targetTenant: Doc) {
  const sourceSlugs = (Array.isArray(source.categories) ? source.categories : [])
    .map((category: unknown) => typeof category === 'object' && category ? plainText((category as Doc).slug) : '')
    .filter(Boolean)
  const exact = sourceSlugs.length
    ? await allDocs(payload, 'product-categories', {
        and: [{ tenant: { equals: targetTenant.id } }, { slug: { in: sourceSlugs } }, { status: { equals: 'active' } }],
      })
    : []
  if (exact.length) return { categories: exact, mapping: 'exact-slug' }

  const fallback = await allDocs(payload, 'product-categories', {
    and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: 'dong-phuc' } }, { status: { equals: 'active' } }],
  })
  if (!fallback[0]) {
    throw new Error(`Tenant ${targetTenant.slug} không có danh mục đích phù hợp hoặc fallback dong-phuc.`)
  }
  return { categories: [fallback[0]], mapping: 'fallback-dong-phuc' }
}

async function run() {
  const payload: any = await getPayload({ config })
  const [sourceTenant] = await allDocs(payload, 'tenants', { slug: { equals: sourceTenantSlug } })
  if (!sourceTenant) throw new Error(`Không tìm thấy tenant nguồn ${sourceTenantSlug}.`)
  if (targetTenantSlugs.includes(sourceTenantSlug)) throw new Error('Tenant nguồn không thể đồng thời là tenant đích.')
  if (['x24sport', 'pndsport'].includes(sourceTenantSlug)) throw new Error('Nguồn phân phối phải là website chuyên biệt, không phải master catalog.')

  const source = await payload.findByID({
    collection: 'products',
    id: sourceProductID,
    depth: 2,
    overrideAccess: true,
  })
  if (String(relationID(source.tenant)) !== String(sourceTenant.id)) {
    throw new Error(`Sản phẩm ${sourceProductID} không thuộc tenant ${sourceTenantSlug}.`)
  }
  if (plainText(source.sourceSystem) === 'payload-tenant-clone') {
    throw new Error('Không phân phối tiếp từ một sản phẩm clone.')
  }
  const gallery = Array.isArray(source.gallery)
    ? source.gallery.filter((media: unknown): media is Doc => Boolean(media) && typeof media === 'object')
    : []
  if (!gallery.length) throw new Error('Sản phẩm nguồn không có gallery media.')
  for (const media of gallery) {
    if (String(relationID(media.tenant)) !== String(sourceTenant.id)) {
      throw new Error(`Media ${media.id} không thuộc tenant nguồn ${sourceTenantSlug}.`)
    }
  }

  const tenants = await allDocs(payload, 'tenants', { slug: { in: targetTenantSlugs } })
  const tenantBySlug = new Map(tenants.map((tenant) => [plainText(tenant.slug), tenant]))
  for (const slug of targetTenantSlugs) {
    if (!tenantBySlug.has(slug)) throw new Error(`Không tìm thấy tenant đích ${slug}.`)
  }
  const [superAdmin] = await allDocs(payload, 'users', { role: { equals: 'super_admin' } })
  if (apply && !superAdmin) throw new Error('Không tìm thấy super_admin để chia sẻ media và tạo ledger.')

  const plans = []
  for (const targetSlug of targetTenantSlugs) {
    const targetTenant = tenantBySlug.get(targetSlug)!
    const cloneID = `${sourceTenantSlug}:${source.id}`
    const [bySource, bySKU, bySlug, categoryResolution, existingLedger] = await Promise.all([
      allDocs(payload, 'products', { and: [{ tenant: { equals: targetTenant.id } }, { sourceSystem: { equals: 'payload-tenant-clone' } }, { sourceId: { equals: cloneID } }] }, 0),
      plainText(source.sku) ? allDocs(payload, 'products', { and: [{ tenant: { equals: targetTenant.id } }, { sku: { equals: source.sku } }] }, 0) : Promise.resolve([]),
      allDocs(payload, 'products', { and: [{ tenant: { equals: targetTenant.id } }, { slug: { equals: source.slug } }] }, 0),
      resolveTargetCategories(payload, source, targetTenant),
      allDocs(payload, 'catalog-distributions', { distributionKey: { equals: `${sourceTenant.id}:${source.id}:${targetTenant.id}` } }, 0),
    ])
    const target = bySource[0]
    const conflicts = [...bySKU, ...bySlug]
      .filter((product, index, items) => items.findIndex((item) => String(item.id) === String(product.id)) === index)
      .filter((product) => String(product.id) !== String(target?.id))
    if (conflicts.length) {
      throw new Error(`Xung đột SKU/slug ở ${targetSlug}: product ${conflicts.map((item) => item.id).join(', ')}.`)
    }
    plans.push({
      targetSlug,
      targetTenant,
      target,
      cloneID,
      copy: buildTargetCopy(source, targetSlug),
      targetCategories: categoryResolution.categories,
      categoryMapping: categoryResolution.mapping,
      existingLedger: existingLedger[0],
    })
  }

  const results = []
  for (const plan of plans) {
    let mediaShared = 0
    let mediaAlreadyShared = 0
    for (const media of gallery) {
      const shared: Array<number | string> = Array.isArray(media.sharedWithTenants)
        ? media.sharedWithTenants.map(relationID).filter((id: number | string | undefined): id is number | string => id !== undefined)
        : []
      if (shared.some((id) => String(id) === String(plan.targetTenant.id))) {
        mediaAlreadyShared += 1
      } else {
        mediaShared += 1
        if (apply) {
          await payload.update({
            collection: 'media',
            id: media.id,
            data: { sharedWithTenants: uniqueIDs([...shared, plan.targetTenant.id]) },
            overrideAccess: true,
            user: superAdmin,
          })
          media.sharedWithTenants = uniqueIDs([...shared, plan.targetTenant.id])
        }
      }
    }

    const data = {
      tenant: plan.targetTenant.id,
      name: plan.copy.name,
      slug: source.slug,
      sku: source.sku,
      sport: source.sport || 'other',
      productType: source.productType || 'simple',
      publicationStatus: targetPublicationStatus,
      featured: false,
      price: source.price,
      regularPrice: source.regularPrice,
      salePrice: source.salePrice,
      compareAtPrice: source.compareAtPrice,
      currency: source.currency || 'VND',
      stockStatus: source.stockStatus || 'instock',
      isPurchasable: source.isPurchasable,
      isOnBackorder: source.isOnBackorder,
      shortDescription: plan.copy.shortDescription,
      description: plan.copy.description,
      attributes: cloneValue(source.attributes),
      badges: cloneValue(source.badges),
      searchTags: cloneValue(source.searchTags),
      categories: plan.targetCategories.map((category: Doc) => category.id),
      gallery: galleryIDs(source),
      legacyImages: cloneValue(source.legacyImages),
      seoTitle: plan.copy.seoTitle,
      metaDescription: plan.copy.metaDescription,
      canonicalOverride: undefined,
      legacyPath: undefined,
      contentHtml: plan.copy.contentHtml,
      sourceTags: cloneValue(source.sourceTags),
      sourceSystem: 'payload-tenant-clone',
      sourceId: plan.cloneID,
      sourceModifiedAt: source.sourceModifiedAt,
      sourceCreatedAt: source.sourceCreatedAt,
      sourceChecksum: source.sourceChecksum,
    }
    const targetProduct = apply
      ? plan.target
        ? await payload.update({ collection: 'products', id: plan.target.id, data, overrideAccess: true, user: superAdmin })
        : await payload.create({ collection: 'products', data, overrideAccess: true, user: superAdmin })
      : plan.target || { id: `dry-${source.id}-${plan.targetSlug}` }

    const ledgerData = {
      sourceTenant: sourceTenant.id,
      sourceProduct: source.id,
      targetTenant: plan.targetTenant.id,
      targetProduct: targetProduct.id,
      status: distributionStatus,
      copyMode: 'auto',
      sourceFactFingerprint: sourceFactFingerprint(source),
      targetCopyFingerprint: targetCopyFingerprint(plan.copy),
      syncedAt: new Date().toISOString(),
      lastError: undefined,
      reviewNote: `Bản nháp master từ ${sourceTenantSlug}; nội dung ${plan.targetSlug} được biên tập riêng, media dùng chung có chủ đích, category mapping: ${plan.categoryMapping}.`,
      proposedCopy: {
        name: plan.copy.name,
        shortDescription: plan.copy.shortDescription,
        description: plan.copy.reviewText,
        seoTitle: plan.copy.seoTitle,
        metaDescription: plan.copy.metaDescription,
        model: plan.copy.model,
        promptVersion: plan.copy.promptVersion,
      },
    }
    let ledgerDoc = plan.existingLedger || { id: `dry-ledger-${source.id}-${plan.targetSlug}`, status: distributionStatus }
    if (apply) {
      if (plan.existingLedger) {
        ledgerDoc = await payload.update({ collection: 'catalog-distributions', id: plan.existingLedger.id, data: ledgerData, overrideAccess: true, user: superAdmin })
      } else {
        ledgerDoc = await payload.create({ collection: 'catalog-distributions', data: ledgerData, overrideAccess: true, user: superAdmin })
      }
    }
    results.push({
      targetTenant: plan.targetSlug,
      action: plan.target ? 'updated' : 'created',
      targetProductID: targetProduct.id,
      publicationStatus: apply ? targetProduct.publicationStatus : targetPublicationStatus,
      sourceSystem: targetProduct.sourceSystem || 'payload-tenant-clone',
      sourceId: targetProduct.sourceId || plan.cloneID,
      categories: plan.targetCategories.map((category: Doc) => ({ id: category.id, slug: category.slug })),
      categoryMapping: plan.categoryMapping,
      mediaShared,
      mediaAlreadyShared,
      ledger: {
        action: plan.existingLedger ? 'updated' : 'created',
        id: ledgerDoc.id,
        status: apply ? ledgerDoc.status : distributionStatus,
      },
    })

    if (apply) {
      for (const category of plan.targetCategories) {
        const published = await allDocs(payload, 'products', {
          and: [{ tenant: { equals: plan.targetTenant.id } }, { publicationStatus: { equals: 'publish' } }, { categories: { contains: category.id } }],
        })
        await payload.update({
          collection: 'product-categories',
          id: category.id,
          data: { productCount: published.length },
          overrideAccess: true,
          user: superAdmin,
        })
      }
    }
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    sourceTenant: sourceTenantSlug,
    sourceProduct: { id: source.id, sku: source.sku, publicationStatus: source.publicationStatus },
    targets: results,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  if (error && typeof error === 'object') {
    console.error(JSON.stringify({ data: (error as Doc).data, errors: (error as Doc).errors }, null, 2))
  }
  process.exit(1)
})
