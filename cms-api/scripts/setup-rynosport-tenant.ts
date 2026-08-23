import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const tenantSlug = 'rynosport'

async function run() {
  const payload = await getPayload({ config })
  const customer =
    (await payload.find({ collection: 'customers', limit: 1, where: { slug: { equals: 'x24sport' } }, overrideAccess: true })).docs[0] ||
    (await payload.create({
      collection: 'customers',
      data: { name: 'X24Sport', slug: 'x24sport', status: 'active' },
      overrideAccess: true,
    }))
  const existing = await payload.find({
    collection: 'tenants',
    limit: 1,
    where: { slug: { equals: tenantSlug } },
  })

  const data = {
    name: 'RynoSport',
    slug: tenantSlug,
    customer: customer.id,
    domains: [{ domain: 'rynosport.vn' }, { domain: 'www.rynosport.vn' }],
    brand: {
      headline: 'RynoSport',
      subheadline: 'Trang phục thể thao.',
      primaryColor: '#101010',
      accentColor: '#e63946',
      style: 'arenix-inspired' as const,
    },
  }

  const tenant = existing.docs[0]
    ? await payload.update({ collection: 'tenants', id: existing.docs[0].id, data })
    : await payload.create({ collection: 'tenants', data })

  console.log(`Configured tenant ${tenant.slug} for rynosport.vn.`)
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
