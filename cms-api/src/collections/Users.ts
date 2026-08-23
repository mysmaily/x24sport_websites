import type { CollectionConfig } from 'payload'

import { superAdminFieldOnly, superAdminsOnly } from '../access/roles'
import { applyCustomerTenantAccess, CUSTOMER_TENANTS_ACCESS_MODE } from '../util/customerTenantAccess'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['email', 'name', 'role', 'customer', 'tenantAccessMode'],
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
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => applyCustomerTenantAccess({ data, originalDoc, req }),
    ],
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
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      index: true,
      saveToJWT: true,
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tenantAccessMode',
      type: 'select',
      defaultValue: 'assigned_tenants',
      saveToJWT: true,
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        description: 'Chọn "Toàn bộ customer" cho tài khoản dashboard quản lý tất cả website của khách hàng.',
        position: 'sidebar',
      },
      options: [
        { label: 'Website được gán', value: 'assigned_tenants' },
        { label: 'Toàn bộ customer', value: CUSTOMER_TENANTS_ACCESS_MODE },
      ],
      required: true,
    },
  ],
}
