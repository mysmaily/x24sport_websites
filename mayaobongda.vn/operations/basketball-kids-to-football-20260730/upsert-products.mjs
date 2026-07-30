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

const mediaForSource = async (token, sourceId) => findOne(token, 'media', {
  tenantSourceKey: `${TENANT_ID}:manual-imagegen:${sourceId}`,
})

const uploadMedia = async (token, item) => {
  const sourceId = `${OPERATION}:${item.sourceProductId}`
  const existing = await mediaForSource(token, sourceId)
  if (existing?.id) return { media: existing, reused: true }

  const filePath = join(ROOT, 'generated', item.targetImageFile)
  const bytes = await readFile(filePath)
  const checksum = createHash('sha256').update(bytes).digest('hex')
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'image/webp' }), basename(filePath))
  form.append('_payload', JSON.stringify({
    tenant: TENANT_ID,
    alt: `${item.targetName} trên sân bóng đá trẻ em`,
    sourceSystem: 'manual-imagegen',
    sourceId,
    sourceUrl: `local://${TENANT_SLUG}/${OPERATION}/${item.targetImageFile}`,
    sourceChecksum: checksum,
    searchTags: [
      { value: 'football' },
      { value: 'tre-em' },
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
    shortDescription: `Mẫu áo bóng đá trẻ em tông ${color}, phù hợp cho đội lớp, trường học, trung tâm đào tạo và giải phong trào. Có thể tùy chỉnh màu, logo, tên và số áo theo danh sách đội.`,
    contentHtml: `<h2>Tổng quan mẫu áo</h2>
<p>${item.targetName} là gợi ý đồng phục bóng đá cho trẻ em, học sinh, đội lớp, câu lạc bộ trường học và trung tâm đào tạo. Tông ${color} trong ảnh mẫu giúp đội có điểm bắt đầu rõ ràng khi trao đổi thiết kế: giữ màu chính, đổi màu viền, thêm logo, đặt tên cầu thủ, số áo hoặc làm thêm quần đồng bộ.</p>
<h2>Điểm nổi bật</h2>
<ul>
  <li><strong>Phù hợp sân cỏ:</strong> form áo bóng đá vận động linh hoạt, dễ phối thành bộ thi đấu hoặc tập luyện.</li>
  <li><strong>Dễ cá nhân hóa:</strong> có thể thêm logo đội, tên cầu thủ, số áo và màu viền theo nhận diện riêng.</li>
  <li><strong>Dành cho trẻ em:</strong> phù hợp đội lớp, trường học, trung tâm bóng đá và giải phong trào.</li>
</ul>
<h2>Đặt may theo yêu cầu</h2>
<p>Gửi mã mẫu hoặc hình ảnh sản phẩm cho X24 Sport để được tư vấn chất liệu, size, màu sắc và bản thiết kế trước khi sản xuất.</p>`,
    attributes: [
      { name: 'Nhóm sử dụng', values: [{ value: 'Trẻ em' }] },
      ...(item.colorText ? [{ name: 'Màu chính', values: [{ value: item.colorText }] }] : []),
      { name: 'Dịch vụ', values: [{ value: 'May theo yêu cầu' }, { value: 'In tên và số áo' }, { value: 'Tùy chỉnh logo đội' }] },
    ],
    badges: [{ label: 'Trẻ em' }, { label: 'Thiết kế riêng' }],
    searchTags: [
      { value: 'trẻ em' },
      { value: 'áo bóng đá' },
      ...(item.colorText ? [{ value: item.colorText }] : []),
      ...(item.targetSku ? [{ value: item.targetSku }] : []),
    ],
    seoTitle: `${item.targetName} | X24 Sport`,
    metaDescription: `Mẫu áo bóng đá trẻ em tông ${color}, có thể tùy chỉnh logo, tên và số áo cho đội lớp, trường học và trung tâm đào tạo.`,
    sourceSystem: OPERATION,
    sourceId: `mayaobongro-product:${item.sourceProductId}`,
    sourceUrl: item.sourceImageUrl,
    legacyPath: `/${item.targetSlug}/`,
    sourceModifiedAt: new Date().toISOString(),
    sourceChecksum: item.sourceProductId ? createHash('sha256').update(`${item.sourceProductId}:${item.sourceSlug}:${item.sourceImageUrl || ''}`).digest('hex') : undefined,
  }
}

const main = async () => {
  await mkdir(join(ROOT, 'logs'), { recursive: true })
  const ledger = JSON.parse(await readFile(join(ROOT, 'ledger.json'), 'utf8'))
  const token = await login()
  const baseCategoryIds = [
    await ensureCategory(token, {
      slug: 'tre-em',
      name: 'Trẻ em',
      group: 'tag',
      description: 'Các mẫu áo bóng đá trẻ em cho đội lớp, trường học, câu lạc bộ và trung tâm đào tạo.',
      order: 100,
    }),
    await ensureCategory(token, {
      slug: 'ao-thiet-ke',
      name: 'Áo Thiết Kế',
      group: 'type',
      description: 'Mẫu áo bóng đá thiết kế theo yêu cầu, có thể tùy chỉnh màu, logo, tên và số.',
      order: 20,
    }),
  ]

  const existingTargets = []
  const log = []

  for (const item of ledger) {
    const hasImage = await generatedExists(item.targetImageFile)
    if (!hasImage && !INCLUDE_DRAFTS) {
      log.push({ sourceProductId: item.sourceProductId, targetSlug: item.targetSlug, skipped: 'missing-generated-image' })
      continue
    }

    const colorIds = []
    for (const color of item.colorCategories || []) {
      colorIds.push(await ensureCategory(token, {
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
    const body = productBody(item, [...baseCategoryIds, ...colorIds], mediaId)

    if (!APPLY) {
      log.push({
        sourceProductId: item.sourceProductId,
        targetSlug: item.targetSlug,
        existingProductId: existing?.id || null,
        hasImage,
        plannedStatus: body.publicationStatus,
        plannedGallery: mediaId ? [mediaId] : [],
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
      targetProductId: product.id,
      targetSlug: product.slug,
      mediaId,
      mediaUrl: mediaResult?.media?.url || null,
      mediaReused: mediaResult?.reused || false,
      status: product.publicationStatus,
      action: existing?.id ? 'updated' : 'created',
    })
  }

  await writeFile(join(ROOT, 'target-products-before.json'), JSON.stringify(existingTargets, null, 2))
  await writeFile(join(ROOT, APPLY ? 'apply-log.json' : 'dry-run.json'), JSON.stringify({ apply: APPLY, includeDrafts: INCLUDE_DRAFTS, count: log.length, log }, null, 2))
  console.log(JSON.stringify({ apply: APPLY, includeDrafts: INCLUDE_DRAFTS, count: log.length, readyImages: log.filter((item) => item.hasImage || item.mediaId).length }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
