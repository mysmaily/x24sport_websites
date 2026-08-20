import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const runDir = new URL('../runs/mayaocaulong-pages-4-18/', import.meta.url)
const oldDir = new URL('source-images/', runDir)
const selectedDir = new URL('selected-source-images/', runDir)
await mkdir(selectedDir, { recursive: true })

const handoffUrl = new URL('selection-handoff.json', runDir)
const catalogUrl = new URL('catalog-items.json', runDir)
const reportUrl = new URL('selection-report.md', runDir)
const handoff = JSON.parse(await readFile(handoffUrl, 'utf8'))
const catalog = JSON.parse(await readFile(catalogUrl, 'utf8'))
const selected = handoff.batches.flatMap((batch) => batch.items)

for (const item of selected) {
  const filename = basename(item.localImagePath)
  const destination = join(selectedDir.pathname, filename)
  await rename(item.localImagePath, destination)
  item.localImagePath = destination
  const catalogItem = catalog.find((candidate) => candidate.sourceId === item.sourceId)
  if (catalogItem) catalogItem.localImagePath = destination
}

const retained = new Set(selected.map((item) => basename(item.localImagePath)))
let removed = 0
for (const filename of await readdir(oldDir)) {
  if (!retained.has(filename)) {
    await rm(join(oldDir.pathname, filename))
    removed++
  }
}

const report = (await readFile(reportUrl, 'utf8'))
  .replace('xem thư mục source-images/.', 'đã giữ lại trong thư mục selected-source-images/.')
  .replace('Ảnh nguồn đã xác minh: source-images/', 'Ảnh nguồn đã chọn (30 file): selected-source-images/')
  .replace('Không có. 458/458 ảnh đã tải thành công và có header WebP hợp lệ.', 'Không có. 458/458 ảnh đã tải thành công và có header WebP hợp lệ; sau tuyển chọn chỉ giữ lại 30 ảnh nguồn được chọn.')

await writeFile(handoffUrl, JSON.stringify(handoff, null, 2) + '\n')
await writeFile(catalogUrl, JSON.stringify(catalog, null, 2) + '\n')
await writeFile(reportUrl, report)
console.log(JSON.stringify({ retained: selected.length, removed, selectedDir: selectedDir.pathname }))
