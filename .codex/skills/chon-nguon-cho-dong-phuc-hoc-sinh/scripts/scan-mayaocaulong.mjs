import { mkdir, writeFile } from 'node:fs/promises'

const root = new URL('..', import.meta.url)
const output = new URL('../runs/mayaocaulong-pages-4-18/', import.meta.url)
await mkdir(output, { recursive: true })

const all = []
for (let page = 4; page <= 18; page++) {
  const catalogUrl = `https://mayaocaulong.vn/san-pham/?page=${page}`
  const response = await fetch(catalogUrl)
  if (!response.ok) throw new Error(`Page ${page}: ${response.status}`)
  const html = await response.text()
  const matcher = /class="catalog-card-media" href="([^"]+)"[^>]*><img alt="([^"]+)"[^>]* src="([^"]+)"/g
  let match
  while ((match = matcher.exec(html))) {
    const [, relativeUrl, alt, imageUrl] = match
    const sourceId = (alt.match(/X24-CL-\d+/)?.[0] ?? imageUrl.match(/x24-cl-\d+/i)?.[0] ?? '').toUpperCase()
    if (sourceId && !all.some((item) => item.sourceId === sourceId)) {
      all.push({ sourceId, productUrl: new URL(relativeUrl, 'https://mayaocaulong.vn').href, imageUrl, alt, page })
    }
  }
}
await writeFile(new URL('catalog-items.json', output), JSON.stringify(all, null, 2) + '\n')
console.log(JSON.stringify({ count: all.length, pages: [...new Set(all.map((item) => item.page))] }))
