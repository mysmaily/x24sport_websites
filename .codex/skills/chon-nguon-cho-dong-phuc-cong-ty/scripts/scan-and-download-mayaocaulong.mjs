import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const runDir = new URL('../runs/mayaocaulong-pages-1-18/', import.meta.url)
const reviewDir = new URL('review-images/', runDir)
await mkdir(reviewDir, { recursive: true })

const items = []
for (let page = 1; page <= 18; page++) {
  const catalogUrl = `https://mayaocaulong.vn/san-pham/?page=${page}`
  const response = await fetch(catalogUrl)
  if (!response.ok) throw new Error(`Page ${page}: HTTP ${response.status}`)
  const html = await response.text()
  const matcher = /class="catalog-card-media" href="([^"]+)"[^>]*><img alt="([^"]+)"[^>]* src="([^"]+)"/g
  let match
  while ((match = matcher.exec(html))) {
    const [, relativeUrl, alt, imageUrl] = match
    const sourceId = (alt.match(/X24-CL-\d+/)?.[0] ?? imageUrl.match(/x24-cl-\d+/i)?.[0] ?? '').toUpperCase()
    if (sourceId && !items.some((item) => item.sourceId === sourceId)) {
      items.push({ sourceId, name: alt.replace(/ - ảnh sản phẩm 1$/, ''), productUrl: new URL(relativeUrl, 'https://mayaocaulong.vn').href, imageUrl, alt, page })
    }
  }
}

const failures = []
let cursor = 0
async function downloadWorker() {
  while (cursor < items.length) {
    const item = items[cursor++]
    const filename = `${item.sourceId.toLowerCase()}-badminton-1.webp`
    try {
      const response = await fetch(item.imageUrl)
      const bytes = new Uint8Array(await response.arrayBuffer())
      if (!response.ok || bytes.length < 1000 || String.fromCharCode(...bytes.slice(0, 4)) !== 'RIFF') {
        throw new Error(`HTTP ${response.status}; ${bytes.length} bytes`)
      }
      item.reviewImagePath = join(process.cwd(), '.codex/skills/chon-nguon-cho-dong-phuc-cong-ty/runs/mayaocaulong-pages-1-18/review-images', filename)
      await writeFile(new URL(filename, reviewDir), bytes)
    } catch (error) {
      failures.push({ sourceId: item.sourceId, imageUrl: item.imageUrl, error: String(error) })
    }
  }
}
await Promise.all(Array.from({ length: 12 }, downloadWorker))
await writeFile(new URL('catalog-items.json', runDir), JSON.stringify(items, null, 2) + '\n')
await writeFile(new URL('download-failures.json', runDir), JSON.stringify(failures, null, 2) + '\n')
console.log(JSON.stringify({ scanned: items.length, downloaded: items.length - failures.length, failures: failures.length }))
