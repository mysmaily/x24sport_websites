import type { CollectionConfig } from 'payload'

import { publicRead, superAdminsOnly } from '../access/roles'
import { isStableKey } from '../util/navigationIdentity'
import { relationID } from '../util/tenantIdentity'

export const CatalogTaxonomies: CollectionConfig = {
  slug: 'catalog-taxonomies',
  admin: {
    defaultColumns: ['key', 'name', 'kind', 'status', 'updatedAt'],
    group: 'Catalog',
    useAsTitle: 'name',
  },
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: publicRead,
    update: superAdminsOnly,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        const key = data?.key ?? originalDoc?.key
        if (key && !isStableKey(key)) {
          throw new Error('Khóa taxonomy chỉ được dùng chữ thường ASCII, số, dấu chấm, gạch ngang hoặc gạch dưới.')
        }

        const currentID = relationID(originalDoc?.id)
        let parentID = relationID(data?.parent ?? originalDoc?.parent)
        const visited = new Set(currentID === undefined ? [] : [String(currentID)])

        while (parentID !== undefined) {
          const parentKey = String(parentID)
          if (visited.has(parentKey)) {
            throw new Error('Cây taxonomy không được tạo chu trình.')
          }
          visited.add(parentKey)

          const parent = await req.payload.findByID({
            collection: 'catalog-taxonomies',
            id: parentID,
            depth: 0,
            overrideAccess: true,
          })
          parentID = relationID(parent.parent)
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Khóa ổn định toàn hệ thống, ví dụ sport.football hoặc color.red.' },
    },
    { name: 'name', type: 'text', required: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Bộ môn', value: 'sport' },
        { label: 'Nhóm danh mục', value: 'category' },
        { label: 'Loại sản phẩm', value: 'product_type' },
        { label: 'Đối tượng', value: 'audience' },
        { label: 'Màu sắc', value: 'color' },
        { label: 'Bộ sưu tập', value: 'collection' },
        { label: 'Chất liệu', value: 'material' },
        { label: 'Dáng áo', value: 'fit' },
        { label: 'Tag khác', value: 'tag' },
      ],
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'catalog-taxonomies',
      admin: { description: 'Taxonomy cha, nếu đây là một nhánh con.' },
    },
    {
      name: 'aliases',
      type: 'array',
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Đang dùng', value: 'active' },
        { label: 'Ngừng dùng', value: 'retired' },
      ],
    },
  ],
}
