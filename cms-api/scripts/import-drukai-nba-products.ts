import config from '../src/payload.config'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

type ScrapedProduct = {
  sourceId: string
  sourceUrl: string
  sourceImageUrl: string
  sourceThumbnailUrl: string
  name: string
  slug: string
  price: number
  regularPrice: number
}

const sourceSystem = 'drukai-nba-category'
const mediaSourceSystem = 'drukai-nba-category-media'
const tenantSlug = 'mayaobongro'
const categorySlug = 'ao-bong-ro-nba'
const importTimestamp = '2026-07-26T16:01:00.000Z'
const sourceCategoryUrls = [
  'https://drukaisport.vn/ao-bong-ro-nba/',
  'https://drukaisport.vn/ao-bong-ro-nba/page/2/',
]

const apply = process.argv.includes('--apply')
const operationsDir =
  process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length) ||
  path.resolve(process.cwd(), 'operations', `drukai-nba-import-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`)

const decodeEntities = (value: string) =>
  value
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8363;/g, 'đ')
    .replace(/&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const checksum = (value: unknown) =>
  crypto.createHash('sha256').update(JSON.stringify(value, Object.keys(value as object).sort())).digest('hex')

function richTextFromParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      direction: null,
      format: '' as const,
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        direction: null,
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}

const relationID = (value: unknown) => {
  if (typeof value === 'number' || typeof value === 'string') return Number(value)
  if (value && typeof value === 'object' && 'id' in value) return Number(value.id)
  return NaN
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    },
  })
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`)
  return response.text()
}

async function fetchBuffer(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    },
  })
  if (!response.ok) throw new Error(`Image fetch failed ${response.status}: ${url}`)
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const arrayBuffer = await response.arrayBuffer()
  return { buffer: Buffer.from(arrayBuffer), contentType }
}

function bestSrcFromSrcset(srcset: string, fallback: string) {
  const candidates = srcset
    .split(',')
    .map((item) => item.trim().match(/^(https?:\/\/\S+)\s+(\d+)w$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({ url: match[1], width: Number(match[2]) }))
    .sort((a, b) => b.width - a.width)

  return candidates[0]?.url || fallback
}

function scrapeProductsFromCategory(html: string) {
  const products: ScrapedProduct[] = []
  const blocks = html.match(/<div class="product-small col[\s\S]*?(?=<div class="product-small col|<\/div><\/div>\s*<\/div>\s*<nav class="woocommerce-pagination"|$)/g) || []

  for (const block of blocks) {
    const idMatch = block.match(/\bpost-(\d+)\b/)
    const linkMatch = block.match(/<a href="(https:\/\/drukaisport\.vn\/[^"]+\/)"[^>]*aria-label="([^"]+)"/)
    const imgMatch = block.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*(?:srcset="([^"]+)")?/)
    const priceMatch = block.match(/<ins[\s\S]*?<bdi>([\d.]+)&nbsp;/) || block.match(/<span class="price">[\s\S]*?<bdi>([\d.]+)&nbsp;/)
    const regularMatch = block.match(/<del[\s\S]*?<bdi>([\d.]+)&nbsp;/)

    if (!idMatch || !linkMatch || !imgMatch) continue

    const name = decodeEntities(linkMatch[2])
    const sourceThumbnailUrl = decodeEntities(imgMatch[1])
    const sourceImageUrl = bestSrcFromSrcset(decodeEntities(imgMatch[3] || ''), sourceThumbnailUrl)
    const price = Number((priceMatch?.[1] || '169000').replace(/\./g, ''))
    const regularPrice = Number((regularMatch?.[1] || '299000').replace(/\./g, ''))

    products.push({
      sourceId: idMatch[1],
      sourceUrl: linkMatch[1],
      sourceImageUrl,
      sourceThumbnailUrl,
      name,
      slug: slugify(name),
      price,
      regularPrice,
    })
  }

  return products
}

function productCopy(product: ScrapedProduct) {
  const cleanName = product.name.replace(/^Áo (Đấu |Bóng Rổ )?/i, 'Áo bóng rổ ')
  const shortDescription = `${cleanName} thuộc bộ sưu tập áo bóng rổ NBA, form suông thoáng, dễ đặt in tên, số áo và tùy chỉnh theo đội.`
  const paragraphs = [
    `${cleanName} được đăng trong danh mục Áo bóng rổ NBA của Mayaobongro.vn để khách tham khảo nhanh mẫu phối màu, nhận diện đội và phong cách jersey thi đấu.`,
    'Mẫu phù hợp cho nhóm chơi bóng rổ, fan jersey, câu lạc bộ hoặc đội phong trào muốn đặt may áo theo size, tên, số và chi tiết cá nhân hóa.',
    'Khi đặt hàng, xưởng có thể tư vấn chất liệu, bảng size, phương án in/chuyển nhiệt và điều chỉnh màu sắc để phù hợp ngân sách cũng như lịch thi đấu của đội.',
  ]
  return {
    shortDescription,
    description: richTextFromParagraphs(paragraphs),
    metaDescription: `${cleanName} tại Mayaobongro.vn, áo bóng rổ NBA form suông, nhận đặt in tên số và tùy chỉnh theo đội.`,
  }
}

function productData(product: ScrapedProduct, tenantId: number, categoryIds: number[], mediaId?: number) {
  const copy = productCopy(product)
  const data = {
    tenant: tenantId,
    name: product.name,
    slug: product.slug,
    sku: `X24-NBA-${product.sourceId}`,
    sport: 'basketball' as const,
    productType: 'simple' as const,
    publicationStatus: 'publish' as const,
    featured: false,
    categories: categoryIds,
    price: product.price,
    regularPrice: product.regularPrice,
    salePrice: product.price < product.regularPrice ? product.price : undefined,
    compareAtPrice: product.regularPrice > product.price ? product.regularPrice : undefined,
    currency: 'VND',
    stockStatus: 'instock' as const,
    isPurchasable: false,
    isOnBackorder: false,
    shortDescription: copy.shortDescription,
    description: copy.description,
    seoTitle: `${product.name} | Mayaobongro.vn`,
    metaDescription: copy.metaDescription,
    legacyPath: new URL(product.sourceUrl).pathname,
    sourceSystem,
    sourceId: product.sourceId,
    sourceModifiedAt: importTimestamp,
    sourceCreatedAt: importTimestamp,
    sourceChecksum: checksum({
      name: product.name,
      sourceUrl: product.sourceUrl,
      image: product.sourceImageUrl,
      price: product.price,
      regularPrice: product.regularPrice,
    }),
    searchTags: [
      { value: 'nba' },
      { value: 'áo bóng rổ nba' },
      { value: 'jersey bóng rổ' },
      { value: 'bóng rổ' },
    ],
    attributes: [
      { name: 'Dòng mẫu', values: [{ value: 'NBA jersey' }] },
      { name: 'Form áo', values: [{ value: 'Suông bóng rổ' }] },
      { name: 'Tùy chỉnh', values: [{ value: 'Tên, số áo, logo đội' }] },
    ],
    ...(mediaId ? { gallery: [mediaId] } : {}),
  }

  return data
}

async function run() {
  fs.mkdirSync(operationsDir, { recursive: true })

  const products: ScrapedProduct[] = []
  for (const url of sourceCategoryUrls) {
    const html = await fetchText(url)
    fs.writeFileSync(path.join(operationsDir, `source-${products.length ? 'page2' : 'page1'}.html`), html)
    products.push(...scrapeProductsFromCategory(html))
  }

  const uniqueProducts = Array.from(new Map(products.map((product) => [product.sourceId, product])).values())
  if (uniqueProducts.length !== 37) {
    throw new Error(`Expected 37 Drukai NBA products, scraped ${uniqueProducts.length}`)
  }

  fs.writeFileSync(path.join(operationsDir, 'scraped-products.json'), JSON.stringify(uniqueProducts, null, 2))

  const payload = await getPayload({ config })
  const tenant = (
    await payload.find({ collection: 'tenants', limit: 1, depth: 0, where: { slug: { equals: tenantSlug } } })
  ).docs[0]
  if (!tenant) throw new Error(`Tenant not found: ${tenantSlug}`)
  const tenantId = Number(tenant.id)

  const parent = (
    await payload.find({
      collection: 'product-categories',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: 'bo-quan-ao-bong-ro' } }] },
    })
  ).docs[0]

  const existingCategory = (
    await payload.find({
      collection: 'product-categories',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: categorySlug } }] },
    })
  ).docs[0]

  const categoryPayload = {
    tenant: tenantId,
    name: 'Áo bóng rổ NBA',
    slug: categorySlug,
    parent: parent?.id,
    group: 'type' as const,
    description: 'Tổng hợp mẫu áo bóng rổ NBA để tham khảo phối màu, form jersey và đặt may theo tên số riêng.',
    sourceSystem,
    sourceId: categorySlug,
    order: 30,
  }

  const category = apply
    ? existingCategory
      ? await payload.update({ collection: 'product-categories', id: existingCategory.id, data: categoryPayload, overrideAccess: true })
      : await payload.create({ collection: 'product-categories', data: categoryPayload, overrideAccess: true })
    : existingCategory || { id: 'dry-category' }

  const summary = []

  for (const product of uniqueProducts) {
    const existingProduct = (
      await payload.find({
        collection: 'products',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { sourceSystem: { equals: sourceSystem } },
            { sourceId: { equals: product.sourceId } },
          ],
        },
      })
    ).docs[0]

    let media = (
      await payload.find({
        collection: 'media',
        limit: 1,
        depth: 0,
        overrideAccess: true,
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { sourceSystem: { equals: mediaSourceSystem } },
            { sourceId: { equals: product.sourceId } },
          ],
        },
      })
    ).docs[0] as any

    let mediaAction = media ? 'reuse' : 'create'
    if (apply && !media) {
      const { buffer, contentType } = await fetchBuffer(product.sourceImageUrl)
      const sourceChecksum = crypto.createHash('sha256').update(buffer).digest('hex')
      media = await payload.create({
        collection: 'media',
        data: {
          tenant: tenantId,
          alt: product.name,
          sourceSystem: mediaSourceSystem,
          sourceId: product.sourceId,
          sourceUrl: product.sourceImageUrl,
          sourceChecksum,
          searchTags: [{ value: 'nba' }, { value: 'áo bóng rổ' }],
        },
        file: {
          data: buffer,
          mimetype: contentType,
          name: `${product.slug}.jpg`,
          size: buffer.length,
        },
        overrideAccess: true,
      })
    }

    const categoryIds = [relationID(parent), Number(category.id)].filter((id) => Number.isFinite(id))
    const desired = productData(product, tenantId, categoryIds, media?.id ? Number(media.id) : undefined)
    const productAction = existingProduct ? 'update' : 'create'
    let saved: { id?: number | string } | undefined = existingProduct

    if (apply) {
      saved = existingProduct
        ? await payload.update({ collection: 'products', id: existingProduct.id, data: desired as any, overrideAccess: true })
        : await payload.create({ collection: 'products', data: desired as any, overrideAccess: true })
    }

    summary.push({
      sourceId: product.sourceId,
      productId: saved?.id,
      slug: product.slug,
      name: product.name,
      productAction,
      mediaAction,
      mediaId: media?.id,
      mediaUrl: media?.url,
    })
  }

  if (apply) {
    const published = await payload.find({
      collection: 'products',
      limit: 1000,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { categories: { contains: Number(category.id) } },
          { publicationStatus: { equals: 'publish' } },
        ],
      },
    })
    await payload.update({
      collection: 'product-categories',
      id: category.id,
      data: { productCount: published.docs.length },
      overrideAccess: true,
    })
  }

  const result = {
    mode: apply ? 'apply' : 'dry-run',
    tenant: { id: tenantId, slug: tenantSlug },
    category: { id: category.id, slug: categorySlug, existed: Boolean(existingCategory) },
    sourceSystem,
    sourceUrls: sourceCategoryUrls,
    scraped: uniqueProducts.length,
    creates: summary.filter((item) => item.productAction === 'create').length,
    updates: summary.filter((item) => item.productAction === 'update').length,
    mediaCreates: summary.filter((item) => item.mediaAction === 'create').length,
    mediaReuses: summary.filter((item) => item.mediaAction === 'reuse').length,
    summary,
  }

  fs.writeFileSync(path.join(operationsDir, `${apply ? 'apply' : 'dry-run'}-result.json`), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
