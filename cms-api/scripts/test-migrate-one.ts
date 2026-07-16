import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'

const PRODUCT_DIR = path.resolve(
  process.env.MIGRATE_SOURCE_DIR ||
    '../mayaopickleball.vn/operations/transfer-running-image-to-pickleball-v5-batch-20260709',
)
const TENANT_SLUG = 'mayaopickleball'

function htmlToLexical(html: string) {
  // Simple HTML → Lexical converter: strips <figure><img>, keeps <p>, <strong>, <em>
  const cleaned = html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .trim()

  // Split into paragraphs
  const paragraphs = cleaned
    .split(/<\/?p[^>]*>/i)
    .map((s) => s.trim())
    .filter(Boolean)

  const children = paragraphs.map((text) => {
    // Parse bold and italic within paragraph
    const parts: Array<{ type: string; text: string; bold?: boolean; italic?: boolean }> = []
    let remaining = text
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/<strong>([\s\S]*?)<\/strong>/i)
      const emMatch = remaining.match(/<em>([\s\S]*?)<\/em>/i)

      if (boldMatch && (!emMatch || boldMatch.index! <= emMatch.index!)) {
        if (boldMatch.index! > 0) {
          parts.push({ type: 'text', text: remaining.slice(0, boldMatch.index!), version: 1 } as any)
        }
        parts.push({ type: 'text', text: boldMatch[1], bold: true, version: 1 } as any)
        remaining = remaining.slice(boldMatch.index! + boldMatch[0].length)
      } else if (emMatch) {
        if (emMatch.index! > 0) {
          parts.push({ type: 'text', text: remaining.slice(0, emMatch.index!), version: 1 } as any)
        }
        parts.push({ type: 'text', text: emMatch[1], italic: true, version: 1 } as any)
        remaining = remaining.slice(emMatch.index! + emMatch[0].length)
      } else {
        parts.push({ type: 'text', text: remaining, version: 1 } as any)
        remaining = ''
      }
    }

    return {
      type: 'paragraph',
      format: '' as const,
      direction: null,
      indent: 0,
      version: 1,
      children: parts.length
        ? parts
        : [{ type: 'text', text: '', version: 1 }],
    }
  })

  return {
    root: {
      type: 'root',
      format: '' as const,
      direction: null,
      indent: 0,
      version: 1,
      children: children.length
        ? children
        : [
            {
              type: 'paragraph',
              format: '' as const,
              direction: null,
              indent: 0,
              version: 1,
              children: [{ type: 'text', text: '', version: 1 }],
            },
          ],
    },
  }
}

function extractSearchTags(name: string, shortDescription: string): Array<{ value: string }> {
  const knownColors = [
    'trắng', 'đỏ', 'hồng', 'xanh navy', 'xanh ngọc', 'xanh đậm', 'xanh da trời',
    'xanh', 'vàng', 'cam', 'đen', 'tím', 'xám', 'xanh lá', 'xanh neon',
    'xanh cyan', 'xanh lime', 'xanh teal', 'xanh dương', 'xanh ve chai',
    'tím than', 'tím navy', 'hồng nhạt', 'xám nhạt', 'vàng nghệ', 'vàng olive',
    'đỏ burgundy', 'đỏ ruby', 'xanh mint', 'xanh bích', 'kem', 'nổi bật',
  ]

  const text = `${name} ${shortDescription}`.toLowerCase()
  const tags = knownColors.filter((c) => text.includes(c))

  // Add gradient tag if name suggests multi-color
  const colorCount = knownColors.filter((c) => c !== 'nổi bật' && text.includes(c)).length
  if (colorCount >= 2) {
    tags.push('gradient')
  }

  return [...new Set(tags)].map((v) => ({ value: v }))
}

async function run() {
  const payload = await getPayload({ config })

  // Find tenant
  const { docs: tenants } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: TENANT_SLUG } },
    limit: 1,
  })

  if (!tenants.length) {
    console.error(`Tenant "${TENANT_SLUG}" not found.`)
    process.exit(1)
  }

  const tenant = tenants[0]
  console.log(`Tenant: id=${tenant.id} slug=${tenant.slug}`)

  // Pick first product directory
  const productsDir = path.join(PRODUCT_DIR, 'products')
  const dirs = fs.readdirSync(productsDir).filter((d) => d.startsWith('product-'))
  if (!dirs.length) {
    console.error('No product directories found.')
    process.exit(1)
  }

  const dir = dirs[0]
  const productDir = path.join(productsDir, dir)
  console.log(`Processing: ${dir}`)

  // Read product-payload.json
  const payloadPath = path.join(productDir, 'product-payload.json')
  if (!fs.existsSync(payloadPath)) {
    console.error(`No product-payload.json in ${dir}`)
    process.exit(1)
  }

  const productData = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'))
  const sku = productData.sku
  console.log(`Product: ${productData.name} (SKU: ${sku})`)

  // Check if already exists
  const { docs: existing } = await payload.find({
    collection: 'products',
    where: { sku: { equals: sku } },
    limit: 1,
  })

  if (existing.length) {
    console.log(`Product with SKU ${sku} already exists (id=${existing[0].id}). Skipping.`)
    return
  }

  // Upload images from final/ directory
  const finalDir = path.join(productDir, 'final')
  const imageFiles = fs.readdirSync(finalDir).filter((f) => f.endsWith('.webp'))

  const mediaIds: Array<number | string> = []
  for (const imgFile of imageFiles) {
    const imgPath = path.join(finalDir, imgFile)
    const buffer = fs.readFileSync(imgPath)
    const altText = `${productData.name} - ${imgFile.replace(/\.webp$/, '').replace(/-/g, ' ')}`

    console.log(`  Uploading: ${imgFile} (${(buffer.length / 1024).toFixed(0)} KB)...`)

    const media = await payload.create({
      collection: 'media',
      data: {
        alt: altText,
        tenant: tenant.id,
      },
      file: {
        data: buffer,
        mimetype: 'image/webp',
        name: imgFile,
        size: buffer.length,
      },
    })

    console.log(`    → Media id=${media.id} url=${(media as any).url}`)
    mediaIds.push(media.id)
  }

  // Build description in Lexical format
  const description = htmlToLexical(productData.description || '')

  // Extract search tags
  const searchTags = extractSearchTags(productData.name, productData.short_description || '')

  // Create product
  const product = await payload.create({
    collection: 'products',
    data: {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      sku: productData.sku,
      sport: 'pickleball',
      price: parseInt(productData.regular_price) || 200000,
      compareAtPrice: parseInt(productData.sale_price) || undefined,
      shortDescription: productData.short_description || '',
      description,
      searchTags,
      gallery: mediaIds.map((id) => id),
      badges: [{ label: 'Đặt may' }, { label: 'In tên số' }],
      featured: true,
      tenant: tenant.id,
    },
  })

  console.log(`\n✅ Product created: id=${product.id} slug=${(product as any).slug}`)
  console.log(`   Gallery: ${mediaIds.length} images`)
  console.log(`   Search tags: ${searchTags.map((t) => t.value).join(', ')}`)
}

run()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
