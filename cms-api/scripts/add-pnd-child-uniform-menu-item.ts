import 'dotenv/config'
import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type Doc = Record<string, any>

const apply = process.argv.includes('--apply')
const tenantSlug = 'pndsport'
const menuKey = 'primary'
const parentKey = 'category-dong-phuc'
const itemKey = 'category-dong-phuc-tre-em'

const relationID = (value: unknown): number | string | undefined =>
  typeof value === 'number' || typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? relationID((value as Doc).id)
      : undefined

async function allDocs(payload: any, collection: string, where: Doc, depth = 0): Promise<Doc[]> {
  const docs: Doc[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({ collection, where, depth, limit: 100, page, overrideAccess: true })
    docs.push(...result.docs)
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

function itemHref(item: Doc) {
  if (item.targetType === 'category') {
    const category = item.targetCategory as Doc | undefined
    return category?.legacyPath || (category?.slug ? `/danh-muc/${category.slug}/` : '')
  }
  if (item.targetType === 'customUrl') return item.customUrl || ''
  return ''
}

function manifest(items: Doc[]) {
  const byParent = new Map<string, Doc[]>()
  for (const item of items.filter((item) => item.enabled !== false)) {
    const parent = relationID(item.parent)
    const key = parent === undefined ? '' : String(parent)
    byParent.set(key, [...(byParent.get(key) || []), item])
  }
  const rows: Array<Record<string, string | number>> = []
  const walk = (parent: string, depth: number, parentKey: string) => {
    const siblings = [...(byParent.get(parent) || [])].sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
    siblings.forEach((item, order) => {
      rows.push({ depth, href: itemHref(item), key: item.key, kind: item.targetType || 'group', label: item.label, order, parentKey })
      walk(String(item.id), depth + 1, item.key)
    })
  }
  walk('', 0, '')
  return { rows, hash: createHash('sha256').update(JSON.stringify(rows)).digest('hex') }
}

async function run() {
  const payload: any = await getPayload({ config })
  const [tenant, superAdmin] = await Promise.all([
    allDocs(payload, 'tenants', { slug: { equals: tenantSlug } }),
    allDocs(payload, 'users', { role: { equals: 'super_admin' } }),
  ]).then(([tenants, admins]) => [tenants[0], admins[0]])
  if (!tenant || (apply && !superAdmin)) throw new Error('Không tìm thấy PND Sport hoặc quyền super_admin.')
  const [menu, category] = await Promise.all([
    allDocs(payload, 'navigation-menus', { and: [{ tenant: { equals: tenant.id } }, { key: { equals: menuKey } }, { location: { equals: 'header' } }] }),
    allDocs(payload, 'product-categories', { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: 'dong-phuc-tre-em' } }] }),
  ]).then(([menus, categories]) => [menus[0], categories[0]])
  if (!menu || !category) throw new Error('Thiếu menu primary/header hoặc danh mục Đồng Phục Trẻ Em PND.')
  const items = await allDocs(payload, 'navigation-items', { menu: { equals: menu.id } }, 2)
  const parent = items.find((item) => item.key === parentKey)
  if (!parent) throw new Error('Không tìm thấy menu cha Đồng Phục.')
  const existing = items.find((item) => item.key === itemKey)
  const children = items.filter((item) => String(relationID(item.parent)) === String(parent.id))
  const data = {
    _status: 'published', tenant: tenant.id, menu: menu.id, parent: parent.id,
    order: existing?.order ?? children.length,
    enabled: true, key: itemKey, label: 'Đồng Phục Trẻ Em',
    description: 'Mẫu đồng phục trẻ em cho lớp học, câu lạc bộ và hoạt động ngoại khóa.',
    iconKey: '', featured: false, targetType: 'category', targetCategory: category.id,
    targetCatalogView: undefined, targetPage: undefined, customUrl: undefined, childrenSource: 'static',
  }
  const result = apply
    ? existing
      ? await payload.update({ collection: 'navigation-items', id: existing.id, data, draft: false, overrideAccess: true, user: superAdmin })
      : await payload.create({ collection: 'navigation-items', data, draft: false, overrideAccess: true, user: superAdmin })
    : existing || { id: `dry-${itemKey}`, ...data }
  const nextItems = existing ? items.map((item) => String(item.id) === String(existing.id) ? { ...item, ...data } : item) : [...items, result]
  const nextManifest = manifest(nextItems)
  if (apply) {
    await payload.update({
      collection: 'navigation-menus', id: menu.id,
      data: {
        _status: 'published', status: 'published', manifestHash: nextManifest.hash,
        revision: menu.manifestHash && menu.manifestHash !== nextManifest.hash ? Number(menu.revision || 1) + 1 : Number(menu.revision || 1),
        lastValidatedAt: new Date().toISOString(),
      },
      draft: false, overrideAccess: true, user: superAdmin,
    })
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', action: existing ? 'update' : 'create', menuID: menu.id, parentID: parent.id, categoryID: category.id, itemID: result.id, manifestHash: nextManifest.hash }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => { console.error(error instanceof Error ? error.stack || error.message : error); process.exit(1) })
