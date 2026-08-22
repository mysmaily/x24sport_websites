import assert from 'node:assert/strict'

import {
  isAllowedMasterTenant,
  syncMasterCatalogProjections,
  type ProjectionPayload,
} from '../src/services/masterCatalogProjection'

type Doc = Record<string, any>

class FakePayload implements ProjectionPayload {
  collections: Record<string, Doc[]>
  sequence = 100

  constructor(collections: Record<string, Doc[]>) {
    this.collections = structuredClone(collections)
  }

  async find(args: Doc) {
    const docs = (this.collections[args.collection] || []).filter((doc) => matches(doc, args.where || {}))
    return { docs: structuredClone(docs), totalPages: 1 }
  }

  async findByID(args: Doc) {
    const doc = (this.collections[args.collection] || []).find((item) => String(item.id) === String(args.id))
    if (!doc) throw new Error(`missing ${args.collection}:${args.id}`)
    return structuredClone(doc)
  }

  async create(args: Doc) {
    const doc = { id: ++this.sequence, ...structuredClone(args.data) }
    this.collections[args.collection] ||= []
    this.collections[args.collection].push(doc)
    return structuredClone(doc)
  }

  async update(args: Doc) {
    const docs = this.collections[args.collection] || []
    const index = docs.findIndex((item) => String(item.id) === String(args.id))
    if (index < 0) throw new Error(`missing ${args.collection}:${args.id}`)
    docs[index] = { ...docs[index], ...structuredClone(args.data) }
    return structuredClone(docs[index])
  }
}

function valueAt(doc: Doc, path: string) {
  return path.split('.').reduce<any>((value, part) => value?.[part], doc)
}

function compare(value: unknown, operation: Doc) {
  const comparable = value && typeof value === 'object' && 'id' in value
    ? (value as { id: unknown }).id
    : value
  if ('equals' in operation) return String(comparable) === String(operation.equals)
  if ('in' in operation) return operation.in.map(String).includes(String(comparable))
  if ('not_in' in operation) return !operation.not_in.map(String).includes(String(comparable))
  return true
}

function matches(doc: Doc, where: Doc): boolean {
  if (where.and) return where.and.every((entry: Doc) => matches(doc, entry))
  if (where.or) return where.or.some((entry: Doc) => matches(doc, entry))
  return Object.entries(where).every(([path, operation]) => compare(valueAt(doc, path), operation as Doc))
}

assert.equal(isAllowedMasterTenant('x24sport'), true)
assert.equal(isAllowedMasterTenant('pndsport'), true)
assert.equal(isAllowedMasterTenant('rynosport'), false)

const payload = new FakePayload({
  tenants: [
    { id: 1, slug: 'mayaobongda' },
    { id: 2, slug: 'x24sport' },
  ],
  'product-categories': [
    { id: 10, tenant: 1, taxonomy: 90, name: 'Áo bóng đá', slug: 'ao-bong-da', group: 'sport', categories: [] },
  ],
  products: [
    { id: 20, tenant: 1, categories: [10], publicationStatus: 'publish' },
    { id: 21, tenant: 2, categories: [], publicationStatus: 'publish' },
  ],
  'catalog-distributions': [
    { id: 30, sourceTenant: 1, sourceProduct: 20, targetTenant: 2, targetProduct: 21, status: 'published' },
  ],
  'category-distributions': [
    { id: 40, sourceTenant: 1, targetTenant: 2, sourceKind: 'category', sourceCategory: 10, status: 'ready', copyMode: 'auto' },
  ],
  'catalog-views': [],
})

const dryRun = await syncMasterCatalogProjections({ payload })
assert.equal(dryRun.projectedCategories, 1)
assert.equal(payload.collections['product-categories'].length, 1)

const firstApply = await syncMasterCatalogProjections({ apply: true, payload })
assert.equal(firstApply.projectedCategories, 1)
assert.equal(payload.collections['product-categories'].length, 2)
assert.equal(payload.collections.products[1].categories.length, 1)
assert.equal(payload.collections['category-distributions'][0].status, 'published')

const secondApply = await syncMasterCatalogProjections({ apply: true, payload })
assert.equal(secondApply.projectedCategories, 1)
assert.equal(secondApply.productLinksAdded, 0)
assert.equal(payload.collections['product-categories'].length, 2)
assert.equal(payload.collections.products[1].categories.length, 1)

await assert.rejects(
  () => syncMasterCatalogProjections({ payload, targetSlugs: ['rynosport'] }),
  /không phải master projection/,
)

console.log('master catalog projection contract: ok')
