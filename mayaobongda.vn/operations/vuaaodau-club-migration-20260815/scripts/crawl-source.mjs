import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const operationDir = path.resolve(__dirname, '..')
const sourceImagesDir = path.join(operationDir, 'source-images')

const SOURCE_CATEGORY_URL = 'https://vuaaodau.vn/san-pham/ao-bong-da/ao-cau-lac-bo/'
const PAGE_COUNT = 8

const htmlDecode = (value) =>
  String(value || '')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8363;/g, 'đ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const seasonFromTitle = (title) => {
  if (/2024\s*[-–/]\s*2025|2024\s*[-–/]\s*25/i.test(title)) return '2024-2025'
  if (/2025\s*[-–/]\s*2026|2025\s*[-–/]\s*26/i.test(title)) return '2025-2026'
  if (/\b2025\b/.test(title)) return '2025'
  return null
}

const kitTypeFromTitle = (title) => {
  if (/\baway\b|sân khách/i.test(title)) return 'away'
  if (/\bthird\b|mẫu ba|sân thứ ba/i.test(title)) return 'third'
  if (/\bhome\b|sân nhà/i.test(title)) return 'home'
  return null
}

const absoluteUrl = (value) => new URL(value, SOURCE_CATEGORY_URL).href

const displayTitle = (title) =>
  htmlDecode(title)
    .replace(/\bKit\b/gi, 'Kit')
    .replace(/\b2024\s*[-–/]\s*25\b/g, '2024 - 2025')
    .replace(/\b2024\s*[-–/]\s*2025\b/g, '2024 - 2025')
    .replace(/\b2025\s*[-–/]\s*26\b/g, '2025 - 2026')
    .replace(/\b2025\s*[-–/]\s*2026\b/g, '2025 - 2026')

const bestImageFromSrcset = (srcset, fallback) => {
  const candidates = String(srcset || '')
    .split(',')
    .map((entry) => {
      const [url, width] = entry.trim().split(/\s+/)
      return { url, width: Number(String(width || '').replace(/\D/g, '')) || 0 }
    })
    .filter((entry) => entry.url)
    .sort((a, b) => b.width - a.width)

  return absoluteUrl(candidates[0]?.url || fallback)
}

const fetchText = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

const pageUrl = (page) => (page === 1 ? SOURCE_CATEGORY_URL : `${SOURCE_CATEGORY_URL}page/${page}/`)

const parseProductsFromArchive = (html, page) => {
  const blocks = html.match(/<div\s+class="product-small[\s\S]*?<\/article>\s*<\/div>\s*<\/div>/g) || []
  return blocks
    .map((block) => {
      const id = block.match(/data-product-id="(\d+)"/)?.[1]
      const href = block.match(/class="vad-product-card__main-link"[\s\S]*?href="([^"]+)"/)?.[1]
      const titleFromLabel = block.match(/aria-label="([^"]+)"/)?.[1]
      const titleFromH2 = block.match(/<h2 class="vad-product-card__title">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/)?.[1]
      const imgTag = block.match(/<img\b(?=[^>]*class="vad-product-card__main-image")[^>]*>/)?.[0] || ''
      const src = imgTag.match(/\bsrc="([^"]+)"/)?.[1]
      const srcset = imgTag.match(/\bsrcset="([^"]+)"/)?.[1]
      const price = htmlDecode(block.match(/woocommerce-Price-amount amount">([\s\S]*?)<\/span>\s*<\/div>/)?.[1])
      const title = displayTitle(titleFromLabel || titleFromH2)
      const sourceUrl = href ? absoluteUrl(href) : null
      const imageUrl = src ? bestImageFromSrcset(srcset, src) : null

      if (!id || !title || !sourceUrl || !imageUrl) return null
      return {
        id: Number(id),
        page,
        sourceUrl,
        title,
        priceText: price || null,
        imageUrl,
      }
    })
    .filter(Boolean)
}

const download = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function main() {
  await mkdir(sourceImagesDir, { recursive: true })

  const products = []
  for (let page = 1; page <= PAGE_COUNT; page += 1) {
    const html = await fetchText(pageUrl(page))
    products.push(...parseProductsFromArchive(html, page))
  }

  const items = []
  for (const product of products) {
    const title = product.title
    const imageUrl = product.imageUrl
    if (!title || !imageUrl) continue

    const sourceId = `wp-${product.id}`
    const slug = slugify(title)
    const ext = path.extname(new URL(imageUrl).pathname).replace(/[^.a-z0-9]/gi, '') || '.jpg'
    const filename = `${String(product.id).padStart(5, '0')}-${slug}${ext}`
    const localPath = path.join(sourceImagesDir, filename)
    const imageBuffer = await download(imageUrl)
    await writeFile(localPath, imageBuffer)

    items.push({
      sourceSystem: 'vuaaodau-club-products-20260815',
      sourceId,
      wordpressId: product.id,
      sourcePage: product.page,
      sourceUrl: product.sourceUrl,
      title,
      slug,
      season: seasonFromTitle(title),
      kitType: kitTypeFromTitle(title),
      price: 119000,
      originalPriceText: product.priceText || '139.000 đ',
      sourceImageUrl: imageUrl,
      sourceImagePath: path.relative(operationDir, localPath),
      sourceImageChecksum: createHash('sha256').update(imageBuffer).digest('hex'),
      mockupPath: `mockups/${slug}.png`,
    })
  }

  const manifest = {
    sourceCategoryUrl: SOURCE_CATEGORY_URL,
    fetchedAt: new Date().toISOString(),
    total: items.length,
    items,
  }

  await writeFile(path.join(operationDir, 'source-products.json'), JSON.stringify(manifest, null, 2))
  console.log(`Crawled ${items.length} products`)
  console.log(path.join(operationDir, 'source-products.json'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
