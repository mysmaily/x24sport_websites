import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'
import { resolveTenantUploadPrefix } from '../storage/r2'
import { buildTenantIdentity } from '../util/tenantIdentity'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => ({
        ...data,
        ...buildTenantIdentity({ data, originalDoc }),
      }),
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const tenant = data?.tenant || originalDoc?.tenant

        return {
          ...data,
          prefix: await resolveTenantUploadPrefix({ req, tenant }),
        }
      },
    ],
  },
  fields: [
    { name: 'sourceSystem', type: 'text', admin: { hidden: true } },
    { name: 'sourceId', type: 'text', index: true, admin: { hidden: true } },
    { name: 'sourceUrl', type: 'text', admin: { hidden: true } },
    { name: 'sourceChecksum', type: 'text', admin: { hidden: true } },
    { name: 'tenantSourceKey', type: 'text', unique: true, admin: { hidden: true } },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'searchTags',
      type: 'array',
      admin: {
        description: 'Internal search helpers for tone, gradient, pose, and sport.',
      },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
  ],
  upload: true,
}
