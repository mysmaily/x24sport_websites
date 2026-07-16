import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead, superAdminsOnly } from '../access/roles'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    group: 'Platform',
    useAsTitle: 'name',
  },
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'domains',
      type: 'array',
      required: true,
      fields: [{ name: 'domain', type: 'text', required: true }],
    },
    {
      name: 'brand',
      type: 'group',
      fields: [
        { name: 'headline', type: 'text', required: true },
        { name: 'subheadline', type: 'textarea', required: true },
        { name: 'primaryColor', type: 'text', defaultValue: '#101010' },
        { name: 'accentColor', type: 'text', defaultValue: '#e63946' },
        { name: 'style', type: 'select', options: ['flevo-inspired', 'arenix-inspired'] },
      ],
    },
  ],
}
