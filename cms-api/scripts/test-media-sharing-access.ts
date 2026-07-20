import assert from 'node:assert/strict'

import { mediaOwnerWrite, mediaRead } from '../src/collections/Media'

const accessArgs = (user: unknown) => ({ req: { user } }) as never

assert.equal(mediaRead(accessArgs(null)), true)
assert.equal(mediaRead(accessArgs({ role: 'super_admin' })), true)
assert.deepEqual(
  mediaRead(accessArgs({ role: 'tenant_admin', tenants: [{ tenant: 6 }] })),
  {
    or: [
      { tenant: { in: [6] } },
      { sharedWithTenants: { in: [6] } },
    ],
  },
)
assert.equal(mediaRead(accessArgs({ role: 'editor', tenants: [] })), false)
assert.equal(mediaOwnerWrite(accessArgs({ role: 'super_admin' })), true)
assert.deepEqual(mediaOwnerWrite(accessArgs({ role: 'tenant_admin', tenants: [{ tenant: 3 }] })), {
  tenant: { in: [3] },
})
assert.equal(mediaOwnerWrite(accessArgs({ role: 'tenant_admin', tenants: [] })), false)

console.log('media sharing access tests passed')
