import type { CollectionConfig } from 'payload'

import { customerRead, superAdminFieldOnly, superAdminsOnly } from '../access/roles'

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
    {
      name: 'r2Storage',
      type: 'group',
      access: {
        create: superAdminFieldOnly,
        read: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        description: 'Cloudflare R2 config riêng cho customer. Các website cùng customer dùng chung bucket này.',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: 'Bật R2 riêng cho customer',
        },
        {
          name: 'bucket',
          type: 'text',
          label: 'Bucket',
        },
        {
          name: 'endpoint',
          type: 'text',
          label: 'Endpoint',
          admin: {
            description: 'Ví dụ https://<account-id>.r2.cloudflarestorage.com.',
          },
        },
        {
          name: 'publicBaseUrl',
          type: 'text',
          label: 'Public base URL',
          admin: {
            description: 'Ví dụ https://static.example.com.',
          },
        },
        {
          name: 'accessKeyId',
          type: 'text',
          label: 'Access key ID',
        },
        {
          name: 'secretAccessKey',
          type: 'text',
          label: 'Secret access key',
          admin: {
            description: 'Chỉ hiển thị qua tài khoản super admin/service account.',
          },
        },
      ],
    },
  ],
}
