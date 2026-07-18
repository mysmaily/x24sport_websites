import type { CollectionConfig } from 'payload'

import { adminsOnly } from '../access/roles'
import { relationID } from '../util/tenantIdentity'

export const MigrationRuns: CollectionConfig = {
  slug: 'migration-runs',
  admin: { group: 'Platform', useAsTitle: 'runId' },
  access: { create: adminsOnly, delete: adminsOnly, read: adminsOnly, update: adminsOnly },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        const tenant = relationID(data?.tenant ?? originalDoc?.tenant)
        const runId = String(data?.runId ?? originalDoc?.runId ?? '').trim()
        return { ...data, ...(tenant && runId ? { tenantRunKey: `${tenant}:${runId}` } : {}) }
      },
    ],
  },
  fields: [
    { name: 'runId', type: 'text', required: true },
    { name: 'tenantRunKey', type: 'text', unique: true, admin: { hidden: true } },
    { name: 'mode', type: 'select', required: true, options: ['snapshot', 'dry-run', 'import', 'delta'] },
    { name: 'status', type: 'select', required: true, options: ['running', 'completed', 'failed', 'rolled-back'] },
    { name: 'sourceUrl', type: 'text', required: true },
    { name: 'snapshotChecksum', type: 'text' },
    { name: 'startedAt', type: 'date', required: true },
    { name: 'finishedAt', type: 'date' },
    { name: 'counts', type: 'json' },
    { name: 'errors', type: 'json' },
  ],
}
