import type { CollectionConfig } from 'payload'

import { adminsOnly, publishedOrAuthenticatedRead, superAdminFieldOnly } from '../access/roles'
import {
  buildTenantCompositeIdentity,
  isInternalCatalogPath,
  isStableKey,
} from '../util/navigationIdentity'

const keyedFilterFields = [
  { name: 'sportKey', type: 'text' as const, index: true },
  {
    name: 'categoryKeys',
    type: 'array' as const,
    fields: [{ name: 'key', type: 'text' as const, required: true, index: true }],
  },
  {
    name: 'searchTagKeys',
    type: 'array' as const,
    fields: [{ name: 'key', type: 'text' as const, required: true, index: true }],
  },
  {
    name: 'productTypeKeys',
    type: 'array' as const,
    fields: [{ name: 'key', type: 'text' as const, required: true, index: true }],
  },
  {
    name: 'audienceKeys',
    type: 'array' as const,
    fields: [{ name: 'key', type: 'text' as const, required: true, index: true }],
  },
  {
    name: 'colorKeys',
    type: 'array' as const,
    fields: [{ name: 'key', type: 'text' as const, required: true, index: true }],
  },
]

export const CatalogViews: CollectionConfig = {
  slug: 'catalog-views',
  admin: {
    defaultColumns: ['title', 'key', 'path', 'indexPolicy', 'enabled', 'tenant', 'updatedAt'],
    group: 'Catalog',
    useAsTitle: 'title',
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
        const path = data?.path ?? originalDoc?.path
        const canonicalPath = data?.canonicalPath ?? originalDoc?.canonicalPath

        if (key && !isStableKey(key)) {
          throw new Error('Khóa catalog view chỉ được dùng chữ thường ASCII, số, dấu chấm, gạch ngang hoặc gạch dưới.')
        }
        if (path && !isInternalCatalogPath(path)) {
          throw new Error('Đường dẫn catalog view phải là path nội bộ ASCII, bắt đầu và kết thúc bằng dấu /.')
        }
        if (canonicalPath && !isInternalCatalogPath(canonicalPath)) {
          throw new Error('Canonical path phải là path nội bộ ASCII, bắt đầu và kết thúc bằng dấu /.')
        }

        return {
          ...data,
          ...buildTenantCompositeIdentity({
            data,
            originalDoc,
            outputField: 'tenantViewKey',
            parts: ['key'],
          }),
        }
      },
    ],
  },
  fields: [
    { name: 'key', type: 'text', required: true, index: true },
    { name: 'tenantViewKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    { name: 'path', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'taxonomy',
      type: 'relationship',
      relationTo: 'catalog-taxonomies',
      hasMany: true,
      admin: { description: 'Các taxonomy chuẩn mô tả landing này.' },
    },
    {
      name: 'filters',
      type: 'group',
      admin: { description: 'Bộ lọc exact-match. Chỉ dùng stable key, không dùng contains trên nhãn tiếng Việt.' },
      fields: keyedFilterFields,
    },
    {
      name: 'matchMode',
      type: 'select',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'Khớp tất cả', value: 'all' },
        { label: 'Khớp bất kỳ', value: 'any' },
      ],
    },
    {
      name: 'indexPolicy',
      type: 'select',
      required: true,
      defaultValue: 'noindex',
      options: [
        { label: 'Cho index', value: 'indexable' },
        { label: 'Không index', value: 'noindex' },
      ],
    },
    { name: 'canonicalPath', type: 'text' },
    { name: 'includeInSitemap', type: 'checkbox', defaultValue: false },
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    {
      name: 'distribution',
      type: 'group',
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: { description: 'Ý định phân phối; category-distributions là ledger thực thi.' },
      fields: [
        { name: 'targetMasters', type: 'relationship', relationTo: 'tenants', hasMany: true },
        { name: 'navigationLabelOverride', type: 'text' },
        { name: 'navigationOrderOverride', type: 'number' },
      ],
    },
  ],
}
