import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'
import { buildTenantIdentity } from '../util/tenantIdentity'

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
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => ({
        ...data,
        ...buildTenantIdentity({ data, originalDoc }),
      }),
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'tenantSlugKey', type: 'text', unique: true, admin: { hidden: true } },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: { description: 'Danh mục cha trong cây phân loại của website.' },
    },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'type',
      options: [
        { label: 'Theo bộ môn', value: 'sport' },
        { label: 'Theo loai ao', value: 'type' },
        { label: 'Theo mau sac', value: 'color' },
        { label: 'Theo tu khoa', value: 'tag' },
      ],
    },
    { name: 'description', type: 'textarea' },
    { name: 'legacyPath', type: 'text', index: true },
    { name: 'tenantLegacyPathKey', type: 'text', unique: true, admin: { hidden: true } },
    { name: 'sourceSystem', type: 'text', admin: { hidden: true } },
    { name: 'sourceId', type: 'text', index: true, admin: { hidden: true } },
    { name: 'tenantSourceKey', type: 'text', unique: true, admin: { hidden: true } },
    { name: 'sourceChecksum', type: 'text', admin: { hidden: true } },
    { name: 'productCount', type: 'number', min: 0, defaultValue: 0 },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
