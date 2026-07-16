import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  admin: {
    defaultColumns: ['name', 'slug', 'group', 'order'],
    group: 'Catalog',
    useAsTitle: 'name',
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'type',
      options: [
        { label: 'Theo loai ao', value: 'type' },
        { label: 'Theo mau sac', value: 'color' },
      ],
    },
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
