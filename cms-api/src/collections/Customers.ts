import type { CollectionConfig } from 'payload'

import { customerRead, superAdminsOnly } from '../access/roles'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    plural: 'Customers',
    singular: 'Customer',
  },
  admin: {
    defaultColumns: ['name', 'slug', 'status'],
    group: 'Platform',
    useAsTitle: 'name',
  },
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: customerRead,
    update: superAdminsOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Đang hoạt động', value: 'active' },
        { label: 'Tạm khóa', value: 'suspended' },
      ],
      required: true,
    },
  ],
}
