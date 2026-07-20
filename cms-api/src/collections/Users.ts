import type { CollectionConfig } from 'payload'

import { superAdminFieldOnly, superAdminsOnly } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['email', 'name', 'role'],
    group: 'Platform',
    useAsTitle: 'email',
  },
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: ({ req }) => Boolean(req.user),
    update: ({ req, id }) => req.user?.id === id || req.user?.role === 'super_admin',
  },
  auth: {
    useAPIKey: true,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      defaultValue: 'editor',
      options: [
        { label: 'Quản trị hệ thống', value: 'super_admin' },
        { label: 'Quản trị website', value: 'tenant_admin' },
        { label: 'Biên tập viên', value: 'editor' },
      ],
      required: true,
    },
  ],
}
