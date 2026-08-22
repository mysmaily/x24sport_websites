import type { CollectionConfig } from 'payload'

import { adminsOnly, publishedOrAuthenticatedRead } from '../access/roles'
import { buildTenantCompositeIdentity, isStableKey } from '../util/navigationIdentity'

export const NavigationMenus: CollectionConfig = {
  slug: 'navigation-menus',
  admin: {
    defaultColumns: ['key', 'location', 'status', 'revision', 'tenant', 'updatedAt'],
    group: 'Navigation',
    useAsTitle: 'key',
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publishedOrAuthenticatedRead,
    update: adminsOnly,
  },
  versions: {
    drafts: true,
    maxPerDoc: 30,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        const key = data?.key ?? originalDoc?.key
        if (key && !isStableKey(key)) {
          throw new Error('Khóa menu chỉ được dùng chữ thường ASCII, số, dấu chấm, gạch ngang hoặc gạch dưới.')
        }

        return {
          ...data,
          ...buildTenantCompositeIdentity({
            data,
            originalDoc,
            outputField: 'tenantMenuKey',
            parts: ['key', 'location'],
          }),
        }
      },
    ],
  },
  fields: [
    { name: 'key', type: 'text', required: true, index: true },
    {
      name: 'location',
      type: 'select',
      required: true,
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Footer', value: 'footer' },
        { label: 'Theo ngữ cảnh', value: 'contextual' },
      ],
    },
    { name: 'tenantMenuKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    {
      name: 'status',
      type: 'select',
      dbName: 'menu_lifecycle_status',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Bản nháp', value: 'draft' },
        { label: 'Sẵn sàng', value: 'ready' },
        { label: 'Đang dùng', value: 'published' },
        { label: 'Lưu trữ', value: 'archived' },
      ],
    },
    { name: 'revision', type: 'number', min: 1, defaultValue: 1 },
    { name: 'manifestHash', type: 'text', index: true, admin: { readOnly: true } },
    {
      name: 'lastValidatedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
    },
  ],
}
