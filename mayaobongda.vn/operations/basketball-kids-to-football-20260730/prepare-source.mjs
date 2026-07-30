import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { basename, join } from 'node:path'
import { pipeline } from 'node:stream/promises'

const API = 'https://cms.x24sport.vn'
const OPERATION = 'basketball-kids-to-football-20260730'
const ROOT = new URL('.', import.meta.url).pathname
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

const getAll = async (token, path, params) => {
  const docs = []
  let page = 1
  for (;;) {
    const query = new URLSearchParams({ ...params, page: String(page), limit: '100', depth: '2' })
    const result = await request(`${path}?${query}`, { headers: authHeaders(token) })
    docs.push(...(result.docs || []))
    if (!result.hasNextPage) break
    page += 1
  }
  return docs
}

const footballSlug = (slug) => slug
  .replaceAll('ao-bong-ro', 'ao-bong-da')
  .replaceAll('x24-br', 'x24-bd')

const footballName = (name) => name
  .replace(/Áo bóng rổ Trẻ em/g, 'Áo bóng đá trẻ em')
  .replace(/áo bóng rổ trẻ em/g, 'áo bóng đá trẻ em')
  .replace(/X24-BR/g, 'X24-BĐ')

const galleryUrl = (product) => {
  const first = product.gallery?.[0]
  return typeof first === 'object' ? first.url : null
}

const main = async () => {
  await mkdir(join(ROOT, 'originals'), { recursive: true })
  await mkdir(join(ROOT, 'logs'), { recursive: true })
  const token = await login()
  const sourceProducts = await getAll(token, '/api/products', {
    'where[tenant.slug][equals]': 'mayaobongro',
    'where[name][contains]': 'Trẻ em',
    sort: 'sku',
  })

  const ledger = sourceProducts.map((product) => {
    const sourceUrl = galleryUrl(product)
    const targetSlug = footballSlug(product.slug)
    return {
      sourceProductId: product.id,
      sourceSlug: product.slug,
      sourceName: product.name,
      sourceSku: product.sku,
      sourceImageUrl: sourceUrl,
      targetSlug,
      targetName: footballName(product.name),
      targetSku: product.sku?.replace('X24-BR-', 'X24-BD-') || null,
      targetImageFile: `${targetSlug}.webp`,
      colorCategories: (product.categories || [])
        .filter((category) => typeof category === 'object' && category.group === 'color')
        .map((category) => ({ slug: `mau-${category.slug}`, name: `màu ${category.name.toLowerCase()}` })),
      colorText: (product.categories || []).find((category) => typeof category === 'object' && category.group === 'color')?.name || '',
    }
  })

  await writeFile(join(ROOT, 'source-products.json'), JSON.stringify(sourceProducts, null, 2))
  await writeFile(join(ROOT, 'ledger.json'), JSON.stringify(ledger, null, 2))
  await writeFile(
    join(ROOT, 'products.tsv'),
    ['sourceProductId\ttargetSlug\ttargetName\ttargetSku\tsourceImageUrl\ttargetImageFile', ...ledger.map((item) => [
      item.sourceProductId,
      item.targetSlug,
      item.targetName,
      item.targetSku || '',
      item.sourceImageUrl || '',
      item.targetImageFile,
    ].join('\t'))].join('\n'),
  )

  let downloaded = 0
  for (const item of ledger) {
    if (!item.sourceImageUrl) continue
    const out = join(ROOT, 'originals', `${item.sourceProductId}-${basename(new URL(item.sourceImageUrl).pathname)}`)
    const response = await fetch(item.sourceImageUrl)
    if (!response.ok || !response.body) throw new Error(`Download failed ${item.sourceImageUrl}: ${response.status}`)
    await pipeline(response.body, createWriteStream(out))
    downloaded += 1
  }

  console.log(JSON.stringify({ operation: OPERATION, sourceCount: sourceProducts.length, ledgerCount: ledger.length, downloaded }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
