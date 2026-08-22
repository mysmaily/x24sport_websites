import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type Doc = Record<string, any>
type CollectionName = 'products' | 'media'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const tenantSlug = args.find((arg) => arg.startsWith('--tenant='))?.slice('--tenant='.length)

const normalize = (value: unknown) => typeof value === 'string'
  ? value.normalize('NFC').toLocaleLowerCase('vi-VN').replace(/\s+/g, ' ').trim()
  : ''

const keysByValue = new Map<string, string>([
  ['đỏ', 'color.red'],
  ['màu đỏ', 'color.red'],
  ['đen', 'color.black'],
  ['màu đen', 'color.black'],
  ['trắng', 'color.white'],
  ['màu trắng', 'color.white'],
  ['vàng', 'color.yellow'],
  ['màu vàng', 'color.yellow'],
  ['cam', 'color.orange'],
  ['màu cam', 'color.orange'],
  ['hồng', 'color.pink'],
  ['màu hồng', 'color.pink'],
  ['tím', 'color.purple'],
  ['màu tím', 'color.purple'],
  ['gradient', 'color.gradient'],
  ['chuyển màu', 'color.gradient'],
  ['sát nách', 'type.sleeveless'],
  ['không tay', 'type.sleeveless'],
  ['có tay', 'type.sleeved'],
  ['tay ngắn', 'type.sleeved'],
  ['cổ trụ', 'type.polo'],
  ['cổ bẻ', 'type.polo'],
  ['polo', 'type.polo'],
  ['cổ tròn', 'type.crew-neck'],
  ['thiết kế riêng', 'type.custom'],
  ['mẫu thiết kế', 'type.custom'],
  ['cờ đỏ sao vàng', 'collection.vn-flag'],
  ['bóng đá', 'sport.football'],
  ['áo bóng đá', 'sport.football'],
  ['cầu lông', 'sport.badminton'],
  ['áo cầu lông', 'sport.badminton'],
  ['pickleball', 'sport.pickleball'],
  ['áo pickleball', 'sport.pickleball'],
  ['bóng chuyền', 'sport.volleyball'],
  ['áo bóng chuyền', 'sport.volleyball'],
  ['bóng rổ', 'sport.basketball'],
  ['áo bóng rổ', 'sport.basketball'],
  ['chạy bộ', 'sport.running'],
  ['áo chạy bộ', 'sport.running'],
  ['đồng phục', 'business.uniform'],
])

async function tenantID(payload: any) {
  if (!tenantSlug) return undefined
  const result = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    where: { slug: { equals: tenantSlug } },
  })
  if (result.docs.length !== 1) throw new Error(`Không tìm thấy tenant unique ${tenantSlug}.`)
  return result.docs[0].id
}

function keyedTags(tags: unknown) {
  const rows = Array.isArray(tags) ? tags : []
  const usedKeys = new Set(rows.map((row) => normalize(row?.key)).filter(Boolean))
  let added = 0
  let conflicts = 0
  const values: string[] = []
  const next = rows.map((row) => {
    const value = normalize(row?.value)
    if (value) values.push(value)
    const mappedKey = keysByValue.get(value)
    const currentKey = normalize(row?.key)
    if (!mappedKey || currentKey === mappedKey || usedKeys.has(mappedKey)) return row
    if (currentKey) {
      conflicts += 1
      return row
    }
    usedKeys.add(mappedKey)
    added += 1
    return { ...row, key: mappedKey }
  })
  return { added, conflicts, next, values }
}

async function processCollection(payload: any, collection: CollectionName, filterTenantID: number | string | undefined) {
  let page = 1
  let totalPages = 1
  const summary = { collection, scanned: 0, changed: 0, keysAdded: 0, conflicts: 0, unmapped: new Map<string, number>() }
  do {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 100,
      overrideAccess: true,
      page,
      sort: 'id',
      where: filterTenantID === undefined ? {} : { tenant: { equals: filterTenantID } },
    })
    totalPages = result.totalPages || 1
    for (const doc of result.docs as Doc[]) {
      summary.scanned += 1
      const keyed = keyedTags(doc.searchTags)
      summary.conflicts += keyed.conflicts
      for (const value of keyed.values) {
        if (!keysByValue.has(value)) summary.unmapped.set(value, (summary.unmapped.get(value) || 0) + 1)
      }
      if (!keyed.added) continue
      summary.changed += 1
      summary.keysAdded += keyed.added
      if (apply) {
        await payload.update({ collection, id: doc.id, data: { searchTags: keyed.next }, overrideAccess: true })
      }
    }
    page += 1
  } while (page <= totalPages)
  return {
    collection,
    scanned: summary.scanned,
    changed: summary.changed,
    keysAdded: summary.keysAdded,
    conflicts: summary.conflicts,
    unmappedTop: [...summary.unmapped.entries()].sort((left, right) => right[1] - left[1]).slice(0, 25),
  }
}

async function run() {
  const payload: any = await getPayload({ config })
  const filterTenantID = await tenantID(payload)
  const results = []
  for (const collection of ['products', 'media'] as const) {
    results.push(await processCollection(payload, collection, filterTenantID))
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', tenantSlug: tenantSlug || 'all', results }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
