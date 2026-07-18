import assert from 'node:assert/strict'

import { buildTenantIdentity, relationID } from '../src/util/tenantIdentity'

assert.equal(relationID(7), 7)
assert.equal(relationID('tenant-a'), 'tenant-a')
assert.equal(relationID({ id: 9 }), 9)

assert.deepEqual(
  buildTenantIdentity({
    data: {
      tenant: 4,
      slug: 'bo-quan-ao-bong-ro-x24-br-001',
      sourceSystem: 'wordpress',
      sourceId: '123',
      legacyPath: '/bo-quan-ao-bong-ro-x24-br-001/',
    },
  }),
  {
    tenantSlugKey: '4:bo-quan-ao-bong-ro-x24-br-001',
    tenantSourceKey: '4:wordpress:123',
    tenantLegacyPathKey: '4:/bo-quan-ao-bong-ro-x24-br-001/',
  },
)

assert.deepEqual(
  buildTenantIdentity({
    data: { tenant: { id: 4 }, slug: 'updated' },
    originalDoc: {
      sourceSystem: 'wordpress',
      sourceId: '123',
      legacyPath: '/old/',
    },
  }),
  {
    tenantSlugKey: '4:updated',
    tenantSourceKey: '4:wordpress:123',
    tenantLegacyPathKey: '4:/old/',
  },
)

console.log('tenant identity tests passed')
