import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'
import { buildTenantIdentity } from '../util/tenantIdentity'
import { validateCategoryHierarchy } from '../util/navigationValidation'

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
      async ({ data, originalDoc, req }) => {
        const nextData = {
          ...data,
          ...buildTenantIdentity({ data, originalDoc }),
        }
        await validateCategoryHierarchy({ data: nextData, originalDoc, req })
        return nextData
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'tenantSlugKey', type: 'text', unique: true, admin: { hidden: true } },
    {
      name: 'taxonomy',
      type: 'relationship',
      relationTo: 'catalog-taxonomies',
      admin: { description: 'Taxonomy chuẩn dùng để đồng bộ danh mục giữa các website.' },
    },
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
        { label: 'Theo bo suu tap', value: 'collection' },
        { label: 'Theo doi tuong', value: 'audience' },
        { label: 'Theo mau sac', value: 'color' },
        { label: 'Theo tu khoa', value: 'tag' },
      ],
    },
    { name: 'description', type: 'textarea' },
    { name: 'navigationLabel', type: 'text' },
    { name: 'showInNavigation', type: 'checkbox', defaultValue: false },
    { name: 'navigationOrder', type: 'number', defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Đang dùng', value: 'active' },
        { label: 'Ẩn', value: 'hidden' },
        { label: 'Ngừng dùng', value: 'retired' },
      ],
    },
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
