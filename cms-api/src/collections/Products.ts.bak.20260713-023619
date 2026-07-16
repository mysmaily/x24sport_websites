import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    defaultColumns: ['name', 'sku', 'sport', 'price', 'featured'],
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
    { name: 'sku', type: 'text', required: true },
    {
      name: 'sport',
      type: 'select',
      required: true,
      options: ['badminton', 'volleyball', 'football', 'basketball', 'running', 'pickleball'],
    },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'compareAtPrice', type: 'number', min: 0 },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'description', type: 'richText' },
    {
      name: 'searchTags',
      type: 'array',
      admin: {
        description: 'Non-shopper search keywords such as colors, gradients, sport, and fit.',
      },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: true,
    },
    {
      name: 'badges',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
}
