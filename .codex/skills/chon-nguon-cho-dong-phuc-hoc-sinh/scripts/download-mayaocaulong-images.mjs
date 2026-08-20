import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const runDir = new URL('../runs/mayaocaulong-pages-4-18/', import.meta.url)
const imageDir = new URL('source-images/', runDir)
await mkdir(imageDir, { recursive: true })
const items = JSON.parse(await readFile(new URL('catalog-items.json', runDir), 'utf8'))
const failures = []

let cursor = 0
async function worker() {
  while (cursor < items.length) {
    const item = items[cursor++]
    const filename = `${item.sourceId.toLowerCase()}-badminton-1.webp`
    const destination = new URL(filename, imageDir)
    try {
      const response = await fetch(item.imageUrl)
      const bytes = new Uint8Array(await response.arrayBuffer())
      if (!response.ok || bytes.length < 1_000 || String.fromCharCode(...bytes.slice(0, 4)) !== 'RIFF') {
        throw new Error(`HTTP ${response.status}; ${bytes.length} bytes`)
      }
      await writeFile(destination, bytes)
      item.localImagePath = join(process.cwd(), '.codex/skills/chon-nguon-cho-dong-phuc-hoc-sinh/runs/mayaocaulong-pages-4-18/source-images', filename)
    } catch (error) {
      failures.push({ sourceId: item.sourceId, imageUrl: item.imageUrl, error: String(error) })
    }
  }
}
await Promise.all(Array.from({ length: 12 }, worker))
await writeFile(new URL('catalog-items.json', runDir), JSON.stringify(items, null, 2) + '\n')
await writeFile(new URL('download-failures.json', runDir), JSON.stringify(failures, null, 2) + '\n')
console.log(JSON.stringify({ downloaded: items.length - failures.length, failures: failures.length }))
