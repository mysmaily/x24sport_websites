import { createHash } from 'node:crypto'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const API = 'https://cms.x24sport.vn'
const TENANT_ID = 8
const TENANT_SLUG = 'mayaobongda'
const OPERATION = 'basketball-kids-to-football-20260730'
const ROOT = new URL('.', import.meta.url).pathname
const APPLY = process.argv.includes('--apply')
const INCLUDE_DRAFTS = process.argv.includes('--include-drafts')
const CREDENTIALS = new URL('../../../cms-api/operations/mayaobongda-20260719/admin-credentials.txt', import.meta.url)

const parseCredentials = async () => {
  const text = await readFile(CREDENTIALS, 'utf8')
  const email = text.match(/^Email:\s*(.+)$/m)?.[1]?.trim()
  const password = text.match(/^Password:\s*(.+)$/m)?.[1]?.trim()
  if (!email || !password) throw new Error('Could not parse CMS credentials')
  return { email, password }
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, options)
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${await response.text()}`)
  if (response.status === 204) return null
  return response.json()
}

const login = async () => {
  const { email, password } = await parseCredentials()
  const body = await request('/api/users/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!body.token) throw new Error('CMS login did not return a token')
  return body.token
}

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` })

const findOne = async (token, collection, where, depth = 0) => {
  const params = new URLSearchParams({ limit: '1', depth: String(depth) })
  for (const [field, value] of Object.entries(where)) params.set(`where[${field}][equals]`, String(value))
  const result = await request(`/api/${collection}?${params}`, { headers: authHeaders(token) })
  return result.docs?.[0] || null
}

const ensureCategory = async (token, { slug, name, group, description, order }) => {
  const existing = await findOne(token, 'product-categories', {
    'tenant.slug': TENANT_SLUG,
    slug,
  })
  if (existing?.id) return existing.id
  if (!APPLY) return `<new-category:${slug}>`
  const result = await request('/api/product-categories', {
    method: 'POST',
    headers: { ...authHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify({
      tenant: TENANT_ID,
      name,
      slug,
      group,
      description,
      productCount: 0,
      order,
      sourceSystem: OPERATION,
      sourceId: `category:${slug}`,
    }),
  })
  return (result.doc || result).id
}

const generatedExists = async (file) => {
  try {
    await access(join(ROOT, 'generated', file))
    return true
  } catch {
    return false
  }
}

const mediaSourceId = (item) => item.variant === 'kids'
  ? `${OPERATION}:${item.sourceProductId}`
  : `${OPERATION}:adult:${item.sourceProductId}`

const mediaForSource = async (token, sourceId) => findOne(token, 'media', {
  tenantSourceKey: `${TENANT_ID}:manual-imagegen:${sourceId}`,
})

const uploadMedia = async (token, item) => {
  const sourceId = mediaSourceId(item)
  const existing = await mediaForSource(token, sourceId)
  if (existing?.id) return { media: existing, reused: true }

  const filePath = join(ROOT, 'generated', item.targetImageFile)
  const bytes = await readFile(filePath)
  const checksum = createHash('sha256').update(bytes).digest('hex')
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'image/webp' }), basename(filePath))
  form.append('_payload', JSON.stringify({
    tenant: TENANT_ID,
    alt: `${item.targetName} ${item.imageAltSuffix}`,
    sourceSystem: 'manual-imagegen',
    sourceId,
    sourceUrl: `local://${TENANT_SLUG}/${OPERATION}/${item.targetImageFile}`,
    sourceChecksum: checksum,
    searchTags: [
      { value: 'football' },
      { value: item.ageSlug },
      { value: item.variant },
      { value: 'imagegen' },
      { value: OPERATION },
    ],
  }))
  const result = await request('/api/media', {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  })
  return { media: result.doc || result, reused: false }
}

const productBody = (item, categoryIds, mediaId = null) => {
  const color = item.colorText ? item.colorText.toLowerCase() : 'theo mẫu'
  const audiencePhrase = item.variant === 'adult'
    ? 'đội bóng người lớn, câu lạc bộ, công ty và giải phong trào'
    : 'đội lớp, trường học, trung tâm đào tạo và giải phong trào'
  const introAudience = item.variant === 'adult'
    ? 'đội bóng người lớn, câu lạc bộ, đội công ty và nhóm đá phủi'
    : 'trẻ em, học sinh, đội lớp, câu lạc bộ trường học và trung tâm đào tạo'
  return {
    tenant: TENANT_ID,
    name: item.targetName,
    slug: item.targetSlug,
    sku: item.targetSku,
    sport: 'football',
    productType: 'simple',
    publicationStatus: mediaId ? 'publish' : 'draft',
    featured: false,
    categories: categoryIds,
    gallery: mediaId ? [mediaId] : [],
    price: null,
    regularPrice: null,
    salePrice: null,
    compareAtPrice: null,
    currency: 'VND',
    stockStatus: 'instock',
    isPurchasable: false,
    shortDescription: `Mẫu áo bóng đá ${item.ageLabel.toLowerCase()} tông ${color}, phù hợp cho ${audiencePhrase}. Có thể tùy chỉnh màu, logo, tên và số áo theo danh sách đội.`,
    contentHtml: `<h2>Tổng quan mẫu áo</h2>
<p>${item.targetName} là gợi ý đồng phục bóng đá cho ${introAudience}. Tông ${color} trong ảnh mẫu giúp đội có điểm bắt đầu rõ ràng khi trao đổi thiết kế: giữ màu chính, đổi màu viền, thêm logo, đặt tên cầu thủ, số áo hoặc làm thêm quần đồng bộ.</p>
<h2>Điểm nổi bật</h2>
<ul>
  <li><strong>Phù hợp sân cỏ:</strong> form áo bóng đá vận động linh hoạt, dễ phối thành bộ thi đấu hoặc tập luyện.</li>
  <li><strong>Dễ cá nhân hóa:</strong> có thể thêm logo đội, tên cầu thủ, số áo và màu viền theo nhận diện riêng.</li>
  <li><strong>Đúng nhóm sử dụng:</strong> phiên bản ${item.ageLabel.toLowerCase()} giúp khách chọn nhanh mẫu phù hợp vóc dáng và mục đích thi đấu.</li>
</ul>
<h2>Đặt may theo yêu cầu</h2>
<p>Gửi mã mẫu hoặc hình ảnh sản phẩm cho X24 Sport để được tư vấn chất liệu, size, màu sắc và bản thiết kế trước khi sản xuất.</p>`,
    attributes: [
      { name: 'Nhóm sử dụng', values: [{ value: item.ageLabel }] },
      ...(item.colorText ? [{ name: 'Màu chính', values: [{ value: item.colorText }] }] : []),
      { name: 'Dịch vụ', values: [{ value: 'May theo yêu cầu' }, { value: 'In tên và số áo' }, { value: 'Tùy chỉnh logo đội' }] },
    ],
    badges: [{ label: item.ageLabel }, { label: 'Thiết kế riêng' }],
    searchTags: [
      { value: item.ageLabel.toLowerCase() },
      { value: 'áo bóng đá' },
      ...(item.colorText ? [{ value: item.colorText }] : []),
      ...(item.targetSku ? [{ value: item.targetSku }] : []),
    ],
    seoTitle: `${item.targetName} | X24 Sport`,
    metaDescription: `Mẫu áo bóng đá ${item.ageLabel.toLowerCase()} tông ${color}, có thể tùy chỉnh logo, tên và số áo cho đội bóng.`,
    sourceSystem: OPERATION,
    sourceId: `mayaobongro-product:${item.sourceProductId}:${item.variant}`,
    sourceUrl: item.sourceImageUrl,
    legacyPath: `/${item.targetSlug}/`,
    sourceModifiedAt: new Date().toISOString(),
    sourceChecksum: createHash('sha256').update(`${item.sourceProductId}:${item.variant}:${item.sourceSlug}:${item.sourceImageUrl || ''}`).digest('hex'),
  }
}

const main = async () => {
  await mkdir(join(ROOT, 'logs'), { recursive: true })
  const ledger = JSON.parse(await readFile(join(ROOT, 'variant-ledger.json'), 'utf8'))
  const token = await login()
  const typeCategoryId = await ensureCategory(token, {
    slug: 'ao-thiet-ke',
    name: 'Áo Thiết Kế',
    group: 'type',
    description: 'Mẫu áo bóng đá thiết kế theo yêu cầu, có thể tùy chỉnh màu, logo, tên và số.',
    order: 20,
  })

  const ageCategoryCache = new Map()
  const ensureAgeCategory = async (item) => {
    if (ageCategoryCache.has(item.ageSlug)) return ageCategoryCache.get(item.ageSlug)
    const id = await ensureCategory(token, {
      slug: item.ageSlug,
      name: item.ageLabel,
      group: 'tag',
      description: item.variant === 'adult'
        ? 'Các mẫu áo bóng đá người lớn cho đội bóng, câu lạc bộ, công ty và giải phong trào.'
        : 'Các mẫu áo bóng đá trẻ em cho đội lớp, trường học, câu lạc bộ và trung tâm đào tạo.',
      order: item.variant === 'adult' ? 110 : 100,
    })
    ageCategoryCache.set(item.ageSlug, id)
    return id
  }

  const existingTargets = []
  const log = []

  for (const item of ledger) {
    const hasImage = await generatedExists(item.targetImageFile)
    if (!hasImage && !INCLUDE_DRAFTS) {
      log.push({ sourceProductId: item.sourceProductId, variant: item.variant, targetSlug: item.targetSlug, skipped: 'missing-generated-image' })
      continue
    }

    const categoryIds = [typeCategoryId, await ensureAgeCategory(item)]
    for (const color of item.colorCategories || []) {
      categoryIds.push(await ensureCategory(token, {
        slug: color.slug,
        name: color.name,
        group: 'color',
        description: `Các mẫu áo bóng đá có ${color.name} là màu chủ đạo hoặc màu phối nổi bật.`,
        order: 300,
      }))
    }

    const existing = await findOne(token, 'products', {
      'tenant.slug': TENANT_SLUG,
      slug: item.targetSlug,
    }, 1)
    if (existing) existingTargets.push(existing)

    const mediaResult = hasImage && APPLY ? await uploadMedia(token, item) : null
    const mediaId = mediaResult?.media?.id || null
    const body = productBody(item, categoryIds, mediaId)

    if (!APPLY) {
      log.push({
        sourceProductId: item.sourceProductId,
        variant: item.variant,
        targetSlug: item.targetSlug,
        existingProductId: existing?.id || null,
        hasImage,
        plannedStatus: body.publicationStatus,
      })
      continue
    }

    const result = existing?.id
      ? await request(`/api/products/${existing.id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(token), 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      : await request('/api/products', {
        method: 'POST',
        headers: { ...authHeaders(token), 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })

    const product = result.doc || result
    log.push({
      sourceProductId: item.sourceProductId,
      variant: item.variant,
      targetProductId: product.id,
      targetSlug: product.slug,
      mediaId,
      mediaUrl: mediaResult?.media?.url || null,
      mediaReused: mediaResult?.reused || false,
      status: product.publicationStatus,
      action: existing?.id ? 'updated' : 'created',
    })
  }

  await writeFile(join(ROOT, 'variant-target-products-before.json'), JSON.stringify(existingTargets, null, 2))
  await writeFile(join(ROOT, APPLY ? 'variant-apply-log.json' : 'variant-dry-run.json'), JSON.stringify({ apply: APPLY, includeDrafts: INCLUDE_DRAFTS, count: log.length, log }, null, 2))
  console.log(JSON.stringify({
    apply: APPLY,
    includeDrafts: INCLUDE_DRAFTS,
    count: log.length,
    readyImages: log.filter((item) => item.hasImage || item.mediaId).length,
    skipped: log.filter((item) => item.skipped).length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
