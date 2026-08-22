import type { CollectionConfig } from 'payload'

import { adminsOnly, publishedOrAuthenticatedRead } from '../access/roles'
import { buildTenantCompositeIdentity, isStableKey } from '../util/navigationIdentity'
import { validateNavigationItem } from '../util/navigationValidation'

const categoryGroupOptions = [
  { label: 'Theo bộ môn', value: 'sport' },
  { label: 'Theo loại áo', value: 'type' },
  { label: 'Theo bộ sưu tập', value: 'collection' },
  { label: 'Theo đối tượng', value: 'audience' },
  { label: 'Theo màu sắc', value: 'color' },
  { label: 'Theo từ khóa', value: 'tag' },
]

export const NavigationItems: CollectionConfig = {
  slug: 'navigation-items',
  admin: {
    defaultColumns: ['label', 'key', 'menu', 'parent', 'targetType', 'order', 'enabled', 'tenant'],
    group: 'Navigation',
    useAsTitle: 'label',
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
      async ({ data, originalDoc, req }) => {
        const key = data?.key ?? originalDoc?.key
        if (key && !isStableKey(key)) {
          throw new Error('Khóa navigation item chỉ được dùng chữ thường ASCII, số, dấu chấm, gạch ngang hoặc gạch dưới.')
        }

        const nextData = {
          ...data,
          ...buildTenantCompositeIdentity({
            data,
            originalDoc,
            outputField: 'tenantMenuItemKey',
            parts: ['menu', 'key'],
          }),
        }
        await validateNavigationItem({ data: nextData, originalDoc, req })
        return nextData
      },
    ],
  },
  fields: [
    { name: 'menu', type: 'relationship', relationTo: 'navigation-menus', required: true, index: true },
    { name: 'key', type: 'text', required: true, index: true },
    { name: 'tenantMenuItemKey', type: 'text', unique: true, index: true, admin: { hidden: true } },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'navigation-items',
      index: true,
      admin: { description: 'Tối đa ba cấp; parent phải cùng menu và cùng website.' },
    },
    { name: 'order', type: 'number', defaultValue: 0, index: true },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    { name: 'label', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'iconKey', type: 'text' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'targetType',
      type: 'select',
      required: true,
      defaultValue: 'group',
      options: [
        { label: 'Nhóm không có link', value: 'group' },
        { label: 'Danh mục', value: 'category' },
        { label: 'Catalog view', value: 'catalogView' },
        { label: 'Trang nội dung', value: 'page' },
        { label: 'URL tùy chỉnh', value: 'customUrl' },
      ],
    },
    {
      name: 'targetCategory',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: { condition: (_, siblingData) => siblingData?.targetType === 'category' },
    },
    {
      name: 'targetCatalogView',
      type: 'relationship',
      relationTo: 'catalog-views',
      admin: { condition: (_, siblingData) => siblingData?.targetType === 'catalogView' },
    },
    {
      name: 'targetPage',
      type: 'relationship',
      relationTo: 'pages',
      admin: { condition: (_, siblingData) => siblingData?.targetType === 'page' },
    },
    {
      name: 'customUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.targetType === 'customUrl',
        description: 'Chỉ path nội bộ, http, https, mailto, tel hoặc anchor.',
      },
    },
    {
      name: 'childrenSource',
      type: 'select',
      required: true,
      defaultValue: 'static',
      options: [
        { label: 'Item con cố định', value: 'static' },
        { label: 'Truy vấn danh mục', value: 'category_query' },
        { label: 'Truy vấn catalog view', value: 'catalog_view_query' },
      ],
    },
    {
      name: 'categoryQuery',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData?.childrenSource === 'category_query' },
      fields: [
        { name: 'group', type: 'select', options: categoryGroupOptions },
        { name: 'taxonomyRoot', type: 'relationship', relationTo: 'catalog-taxonomies' },
        { name: 'minimumProductCount', type: 'number', min: 0, defaultValue: 1 },
        {
          name: 'sort',
          type: 'select',
          defaultValue: 'navigation_order',
          options: [
            { label: 'Thứ tự menu', value: 'navigation_order' },
            { label: 'Tên A-Z', value: 'name_asc' },
            { label: 'Năm mới nhất', value: 'year_desc' },
            { label: 'Nhiều sản phẩm nhất', value: 'product_count_desc' },
          ],
        },
        { name: 'limit', type: 'number', min: 1, max: 100, defaultValue: 30 },
      ],
    },
    {
      name: 'catalogViewQuery',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData?.childrenSource === 'catalog_view_query' },
      fields: [
        { name: 'taxonomyRoot', type: 'relationship', relationTo: 'catalog-taxonomies' },
        {
          name: 'indexPolicy',
          type: 'select',
          dbName: 'view_index_policy',
          options: [
            { label: 'Cho index', value: 'indexable' },
            { label: 'Không index', value: 'noindex' },
          ],
        },
        {
          name: 'sort',
          type: 'select',
          defaultValue: 'title_asc',
          options: [
            { label: 'Tên A-Z', value: 'title_asc' },
            { label: 'Mới cập nhật', value: 'updated_desc' },
          ],
        },
        { name: 'limit', type: 'number', min: 1, max: 100, defaultValue: 30 },
      ],
    },
  ],
}
