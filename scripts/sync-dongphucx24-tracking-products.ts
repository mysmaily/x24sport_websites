import { products } from '../cms-frontend/src/app/[tenant]/_dongphucx24/data'

const apply = process.argv.includes('--apply')
const apiUrl = (process.env.CMS_API_URL || 'https://cms.x24sport.vn').replace(/\/$/, '')
const apiKey = process.env.PAYLOAD_API_KEY
const tenantSlug = 'dongphucx24'
const sourceSystem = 'dongphucx24-static-catalog'

if (apply && !apiKey) throw new Error('PAYLOAD_API_KEY is required with --apply')

const headers = {
  Authorization: `users API-Key ${apiKey || ''}`,
  'Content-Type': 'application/json',
}

async function request(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${path} failed ${response.status}: ${text.slice(0, 500)}`)
  return data
}

function query(values: Record<string, string>) {
  return new URLSearchParams({ ...values, limit: '1', depth: '0' }).toString()
}

async function findOne(collection: string, values: Record<string, string>) {
  const result = await request(`/api/${collection}?${query(values)}`)
  return result.docs?.[0]
}

async function main() {
  const tenant = await findOne('tenants', { 'where[slug][equals]': tenantSlug })
  if (!tenant) throw new Error(`Tenant not found: ${tenantSlug}`)

  const summary: Array<{ action: 'create' | 'update'; id?: number | string; sku: string; slug: string }> = []

  for (const product of products) {
    const sourceId = product.sku
    const existing =
      await findOne('products', {
        'where[tenant.slug][equals]': tenantSlug,
        'where[sourceSystem][equals]': sourceSystem,
        'where[sourceId][equals]': sourceId,
      }) ||
      await findOne('products', {
        'where[tenant.slug][equals]': tenantSlug,
        'where[sku][equals]': product.sku,
      }) ||
      await findOne('products', {
        'where[tenant.slug][equals]': tenantSlug,
        'where[slug][equals]': product.slug,
      })

    const payload = {
      tenant: tenant.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      sport: 'other',
      productType: 'simple',
      publicationStatus: 'publish',
      featured: false,
      currency: 'VND',
      stockStatus: 'instock',
      isPurchasable: false,
      isOnBackorder: false,
      shortDescription: `Mẫu ${product.name.toLocaleLowerCase('vi')} được phát triển và báo giá theo yêu cầu của tổ chức.`,
      sourceSystem,
      sourceId,
      legacyPath: `/san-pham/${product.slug}/`,
    }

    if (apply) {
      const result = await request(existing ? `/api/products/${existing.id}` : '/api/products', {
        method: existing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      const record = result.doc || result
      summary.push({ action: existing ? 'update' : 'create', id: record.id, sku: product.sku, slug: product.slug })
    } else {
      summary.push({ action: existing ? 'update' : 'create', id: existing?.id, sku: product.sku, slug: product.slug })
    }
  }

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', tenant: tenantSlug, total: summary.length, summary }, null, 2))
}

void main()
