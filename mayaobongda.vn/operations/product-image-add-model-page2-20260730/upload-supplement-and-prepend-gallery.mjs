import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const API = 'https://cms.x24sport.vn'
const TENANT_ID = 8
const TENANT_SLUG = 'mayaobongda'
const OPERATION = 'product-image-add-model-page2-20260730'
const ROOT = new URL('.', import.meta.url).pathname
const APPLY = process.argv.includes('--apply')

const parseCredentials = async () => {
  const text = await readFile(new URL('../../../cms-api/operations/mayaobongda-20260719/admin-credentials.txt', import.meta.url), 'utf8')
  const email = text.match(/^Email:\s*(.+)$/m)?.[1]?.trim()
  const password = text.match(/^Password:\s*(.+)$/m)?.[1]?.trim()
  if (!email || !password) throw new Error('Could not parse CMS credentials')
  return { email, password }
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, options)
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${await response.text()}`)
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

const mediaForSource = async (token, sourceId) => {
  const params = new URLSearchParams({
    'where[tenantSourceKey][equals]': `${TENANT_ID}:manual-imagegen:${sourceId}`,
    limit: '1',
    depth: '0',
  })
  const result = await request(`/api/media?${params}`, { headers: authHeaders(token) })
  return result.docs?.[0] || null
}

const uploadMedia = async (token, product, filePath, checksum) => {
  const sourceId = `${OPERATION}:${product.id}`
  const existing = await mediaForSource(token, sourceId)
  if (existing?.id) return { media: existing, reused: true }

  const bytes = await readFile(filePath)
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'image/webp' }), basename(filePath))
  form.append(
    '_payload',
    JSON.stringify({
      tenant: TENANT_ID,
      alt: `${product.name} trên mẫu đội bóng nam Việt Nam`,
      sourceSystem: 'manual-imagegen',
      sourceId,
      sourceUrl: `local://${TENANT_SLUG}/${OPERATION}/${basename(filePath)}`,
      sourceChecksum: checksum,
      searchTags: [{ value: 'football' }, { value: 'team-model' }, { value: 'imagegen' }, { value: OPERATION }],
    }),
  )

  const result = await request('/api/media', {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  })
  return { media: result.doc || result, reused: false }
}

const galleryIds = (product) => (product.gallery || [])
  .map((item) => (typeof item === 'object' ? item.id : item))
  .filter(Boolean)

const main = async () => {
  const before = JSON.parse(await readFile(join(ROOT, 'page2-products-supplement-before.json'), 'utf8'))
  const token = await login()
  const log = []

  for (const product of before.docs) {
    const filePath = join(ROOT, 'generated', `${product.id}-${product.slug}.webp`)
    const bytes = await readFile(filePath)
    const checksum = createHash('sha256').update(bytes).digest('hex')
    const oldGallery = galleryIds(product)
    const sourceId = `${OPERATION}:${product.id}`
    const existing = await mediaForSource(token, sourceId)
    const mediaId = existing?.id || '<new-media-id>'
    const plannedGallery = [mediaId, ...oldGallery.filter((id) => id !== mediaId)]

    if (!APPLY) {
      log.push({ productId: product.id, name: product.name, file: basename(filePath), oldGallery, plannedGallery, existingMediaId: existing?.id || null })
      continue
    }

    const { media, reused } = await uploadMedia(token, product, filePath, checksum)
    const nextGallery = [media.id, ...oldGallery.filter((id) => id !== media.id)]
    const updated = await request(`/api/products/${product.id}`, {
      method: 'PATCH',
      headers: { ...authHeaders(token), 'content-type': 'application/json' },
      body: JSON.stringify({ gallery: nextGallery }),
    })
    log.push({ productId: product.id, name: product.name, mediaId: media.id, mediaUrl: media.url, reused, oldGallery, nextGallery, updatedAt: (updated.doc || updated).updatedAt })
  }

  console.log(JSON.stringify({ apply: APPLY, count: log.length, log }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
