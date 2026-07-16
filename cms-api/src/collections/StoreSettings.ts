import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'

export const StoreSettings: CollectionConfig = {
  slug: 'store-settings',
  admin: {
    group: 'Platform',
    useAsTitle: 'siteName',
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'contactPhone', type: 'text' },
    { name: 'zaloUrl', type: 'text' },
    {
      name: 'navigation',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
