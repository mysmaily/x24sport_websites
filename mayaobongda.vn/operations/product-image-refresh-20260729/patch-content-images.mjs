import { readFile } from 'node:fs/promises'

const API = 'https://cms.x24sport.vn'
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
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${body}`)
  }
  return response.json()
}

const login = async () => {
  const { email, password } = await parseCredentials()
  const body = await request('/api/users/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return body.token
}

const imageUrls = (html) =>
  Array.from(new Set(String(html || '').match(/https?:\/\/[^"'<>\s]+?\.(?:jpg|jpeg|png|webp)/gi) || []))

const main = async () => {
  const before = JSON.parse(await readFile(`${ROOT}/page4-products-before.json`, 'utf8'))
  const applyLog = JSON.parse(await readFile(`${ROOT}/apply-log.json`, 'utf8'))
  const mediaByProduct = new Map(applyLog.log.map((item) => [String(item.productId), item.mediaUrl]))
  const token = await login()
  const headers = { Authorization: `Bearer ${token}`, 'content-type': 'application/json' }
  const log = []

  for (const [index, product] of before.docs.entries()) {
    if (index < 5) continue
    const newUrl = mediaByProduct.get(String(product.id))
    if (!newUrl || !product.contentHtml) continue
    const urls = imageUrls(product.contentHtml)
    if (!urls.length) {
      log.push({ productId: product.id, changed: false, reason: 'no image urls in contentHtml' })
      continue
    }
    let nextHtml = product.contentHtml
    for (const url of urls) {
      nextHtml = nextHtml.split(url).join(newUrl)
    }
    const changed = nextHtml !== product.contentHtml
    if (APPLY && changed) {
      await request(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          contentHtml: nextHtml,
          legacyImages: [{ url: newUrl, alt: `${product.name} trên mẫu nam Việt Nam`, width: 1200, height: 1200 }],
        }),
      })
    }
    log.push({ productId: product.id, name: product.name, changed, replaced: urls, newUrl })
  }

  console.log(JSON.stringify({ apply: APPLY, count: log.length, changed: log.filter((item) => item.changed).length, log }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
