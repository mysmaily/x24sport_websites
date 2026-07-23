import config from '../src/payload.config'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

type ManifestProduct = {
  index: number
  id: number
  slug: string
  name: string
}

type Manifest = {
  tenantSlug: 'mayaobongro'
  categorySlug: 'bo-quan-ao-bong-ro'
  products: ManifestProduct[]
}

const manifestPath = process.argv[2]
const imageDir = process.argv[3]
const apply = process.argv.includes('--apply')

if (!manifestPath || !imageDir) {
  throw new Error(
    'Usage: tsx scripts/mayaobongro-add-vba-gallery-wave.ts <manifest.json> <generated-image-dir> [--apply]',
  )
}

const requiredTags = ['chuyên nghiệp', 'phong trào']
const sourceSystem = 'imagegen-vba-professional'

const normalizeTag = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLocaleLowerCase('vi-VN') : ''

const mergeTags = (existing: unknown): Array<{ value: string }> => {
  const values = new Map<string, string>()

  if (Array.isArray(existing)) {
    for (const item of existing) {
      const raw = typeof item === 'string' ? item : item?.value
      const normalized = normalizeTag(raw)
      if (normalized) values.set(normalized, String(raw).trim())
    }
  }

  for (const tag of requiredTags) values.set(normalizeTag(tag), tag)

  return Array.from(values.values()).map((value) => ({ value }))
}

const tagKey = (existing: unknown) => {
  if (!Array.isArray(existing)) return ''
  return existing
    .map((item) => normalizeTag(typeof item === 'string' ? item : item?.value))
    .filter(Boolean)
    .sort()
    .join('|')
}

const relationID = (value: unknown) => {
  if (typeof value === 'number' || typeof value === 'string') return Number(value)
  if (value && typeof value === 'object' && 'id' in value) return Number(value.id)
  return NaN
}

const findImagePath = (product: ManifestProduct) => {
  const prefix = `${String(product.index).padStart(2, '0')}-${product.id}-`
  const matches = fs
    .readdirSync(imageDir)
    .filter((file) => file.startsWith(prefix) && /\.(png|webp|jpe?g)$/i.test(file))
    .sort()

  if (matches.length !== 1) {
    throw new Error(`Expected exactly one generated image for product ${product.id}, found ${matches.length}`)
  }

  return path.join(imageDir, matches[0])
}

const mimeTypeFor = (filename: string) => {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.webp') return 'image/webp'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  return 'image/png'
}

const run = async () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest

  if (manifest.tenantSlug !== 'mayaobongro') {
    throw new Error(`Unexpected tenant slug: ${manifest.tenantSlug}`)
  }

  if (manifest.categorySlug !== 'bo-quan-ao-bong-ro') {
    throw new Error(`Unexpected category slug: ${manifest.categorySlug}`)
  }

  if (manifest.products.length !== 20) {
    throw new Error(`Expected a 20-product wave, received ${manifest.products.length}`)
  }

  const payload = await getPayload({ config })
  const tenantResult = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 1,
    where: { slug: { equals: manifest.tenantSlug } },
  })
  const tenant = tenantResult.docs[0]
  if (!tenant) throw new Error('Tenant not found: mayaobongro')

  const summary: Array<{
    productId: number
    slug: string
    image: string
    mediaId?: number
    mediaAction: 'create' | 'reuse'
    productAction: 'update' | 'already-current'
    mediaUrl?: string
  }> = []

  for (const item of manifest.products) {
    const imagePath = findImagePath(item)
    const buffer = fs.readFileSync(imagePath)
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex')
    const stableSourceId = `mayaobongro:${item.id}:vba-professional-20260723`

    const product = await payload.findByID({
      collection: 'products',
      id: item.id,
      depth: 1,
      overrideAccess: true,
    })

    if (product.slug !== item.slug) {
      throw new Error(`Product ${item.id} slug changed from ${item.slug} to ${product.slug}`)
    }

    const productTenantID = relationID(product.tenant)
    if (productTenantID !== Number(tenant.id)) {
      throw new Error(`Product ${item.id} is not owned by mayaobongro tenant`)
    }

    const existingMedia = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { sourceSystem: { equals: sourceSystem } },
          { sourceId: { equals: stableSourceId } },
        ],
      },
    })

    let media = existingMedia.docs[0] as any
    let mediaAction: 'create' | 'reuse' = 'reuse'

    if (!media) {
      mediaAction = 'create'
      if (apply) {
        media = await payload.create({
          collection: 'media',
          data: {
            alt: `Cầu thủ bóng rổ chuyên nghiệp mặc ${item.name}`,
            tenant: tenant.id,
            sourceSystem,
            sourceId: stableSourceId,
            sourceChecksum: checksum,
            searchTags: mergeTags([]),
          },
          file: {
            data: buffer,
            mimetype: mimeTypeFor(imagePath),
            name: `${item.slug}-cau-thu-vba-chuyen-nghiep.png`,
            size: buffer.length,
          },
          overrideAccess: true,
        })
      }
    }

    const galleryIDs = Array.isArray(product.gallery)
      ? product.gallery.map(relationID).filter((id) => Number.isFinite(id))
      : []
    const nextGalleryIDs = media?.id && !galleryIDs.includes(Number(media.id))
      ? [...galleryIDs, Number(media.id)]
      : galleryIDs
    const nextTags = mergeTags(product.searchTags)
    const nextTagKey = tagKey(nextTags)
    const currentTagKey = tagKey(product.searchTags)
    const productAlreadyCurrent =
      Boolean(media?.id) &&
      galleryIDs.includes(Number(media.id)) &&
      currentTagKey === nextTagKey

    if (apply && !productAlreadyCurrent) {
      await payload.update({
        collection: 'products',
        id: item.id,
        data: {
          gallery: nextGalleryIDs,
          searchTags: nextTags,
        },
        overrideAccess: true,
      })
    }

    if (apply && media?.id) {
      await payload.update({
        collection: 'media',
        id: media.id,
        data: {
          searchTags: mergeTags(media.searchTags),
        },
        overrideAccess: true,
      })
    }

    summary.push({
      productId: item.id,
      slug: item.slug,
      image: path.basename(imagePath),
      mediaId: media?.id ? Number(media.id) : undefined,
      mediaAction,
      productAction: productAlreadyCurrent ? 'already-current' : 'update',
      mediaUrl: media?.url,
    })
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        tenant: { id: tenant.id, slug: tenant.slug },
        sourceSystem,
        products: summary.length,
        creates: summary.filter((item) => item.mediaAction === 'create').length,
        updates: summary.filter((item) => item.productAction === 'update').length,
        summary,
      },
      null,
      2,
    ),
  )
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
