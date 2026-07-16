import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'
import { resolveTenantUploadPrefix } from '../storage/r2'

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
