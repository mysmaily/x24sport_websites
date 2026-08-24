import type { CollectionConfig, TextFieldValidation, Where } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'
import { enrichProductDistributionSummary } from '../hooks/enrichProductDistributionSummary'
import { isStableKey } from '../util/navigationIdentity'
import { buildTenantIdentity, relationID } from '../util/tenantIdentity'

type ProductValidationData = {
  id?: number | string
  tenant?: number | string | { id?: number | string } | null
}

const normalizeSKU = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : ''

const uniqueTenantSKU: TextFieldValidation = async (value, { data, id, req, siblingData }) => {
  const sku = normalizeSKU(value)

  if (!sku) return true

  const validationData = data as ProductValidationData | undefined
  const validationSiblingData = siblingData as ProductValidationData | undefined
  const tenant = relationID(validationSiblingData?.tenant ?? validationData?.tenant)

  if (!tenant) return true

  const currentID = id ?? validationData?.id ?? validationSiblingData?.id
  const duplicateFilters: Where[] = [
    { tenant: { equals: tenant } },
    { sku: { equals: sku } },
    ...(currentID ? [{ id: { not_equals: currentID } }] : []),
  ]

  const duplicates = await req.payload.find({
    collection: 'products',
    depth: 0,
    limit: 1,
    where: {
      and: duplicateFilters,
    },
  })

  if (duplicates.totalDocs > 0) {
    return `SKU "${sku}" đã tồn tại trên website này. Vui lòng dùng mã sản phẩm khác.`
  }

  return true
}

const validateGalleryAccess = async (value: unknown, { data, req, siblingData }: any) => {
  const selectedMedia = (Array.isArray(value) ? value : [value])
    .map(relationID)
    .filter((id): id is number | string => id !== undefined)
  const mediaIDs = [...new Set(selectedMedia.map(String))]
  if (!mediaIDs.length) return true

  const productData = (siblingData || data) as ProductValidationData | undefined
  const tenant = relationID(productData?.tenant)
  if (!tenant) return 'Sản phẩm phải có website trước khi chọn ảnh.'

  const visibleMedia = await req.payload.find({
    collection: 'media',
    depth: 0,
    limit: mediaIDs.length,
    overrideAccess: true,
    where: {
      and: [
        { id: { in: mediaIDs } },
        {
          or: [
            { tenant: { equals: tenant } },
            { sharedWithTenants: { in: [tenant] } },
          ],
        },
      ],
    },
  })

  return visibleMedia.totalDocs === mediaIDs.length
    ? true
    : 'Mỗi ảnh phải thuộc website của sản phẩm hoặc đã được chia sẻ cho website đó.'
}

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    defaultColumns: [
      'gallery',
      'name',
      'viewCount',
      'sku',
      'sport',
      'price',
      'publicationStatus',
      'outboundDistributionSummary',
      'inboundDistributionSummary',
      'featured',
      'pinterestPublishAction',
    ],
    group: 'Catalog',
    useAsTitle: 'name',
  },
  defaultSort: '-viewCount',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  hooks: {
    afterOperation: [enrichProductDistributionSummary],
    beforeValidate: [
      ({ data, originalDoc }) => ({
        ...data,
        ...buildTenantIdentity({ data, originalDoc }),
      }),
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Thông tin',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: {
                    components: {
                      Cell: '/components/products/ProductNameCell#ProductNameCell',
                    },
                    width: '60%',
                  },
                },
                {
                  name: 'slug',
                  type: 'text',
                  required: true,
                  index: true,
                  admin: {
                    description: 'Đường dẫn sản phẩm, nên giữ ngắn gọn và ổn định.',
                    width: '40%',
                  },
                },
              ],
            },
            { name: 'tenantSlugKey', type: 'text', unique: true, admin: { hidden: true } },
            {
              type: 'row',
              fields: [
                {
                  name: 'sku',
                  type: 'text',
                  index: true,
                  validate: uniqueTenantSKU,
                  admin: { width: '33%' },
                },
                {
                  name: 'sport',
                  type: 'select',
                  required: true,
                  options: [
                    'badminton',
                    'volleyball',
                    'football',
                    'basketball',
                    'running',
                    'pickleball',
                    'other',
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'productType',
                  type: 'select',
                  options: ['simple', 'variable', 'grouped', 'external'],
                  defaultValue: 'simple',
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'publicationStatus',
                  type: 'select',
                  defaultValue: 'publish',
                  options: ['publish', 'draft', 'private', 'pending'],
                  admin: { width: '50%' },
                },
                { name: 'featured', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
              ],
            },
            {
              name: 'viewCount',
              type: 'number',
              label: 'Lượt xem',
              defaultValue: 0,
              index: true,
              admin: {
                description: 'Tổng lượt xem hợp lệ của sản phẩm; mỗi phiên chỉ được tính một lần.',
                readOnly: true,
              },
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'product-categories',
              hasMany: true,
              admin: {
                description: 'Chọn danh mục hiển thị trên website.',
              },
            },
          ],
        },
        {
          label: 'Giá & kho',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'price', type: 'number', min: 0, admin: { width: '33%' } },
                { name: 'regularPrice', type: 'number', min: 0, admin: { width: '33%' } },
                { name: 'salePrice', type: 'number', min: 0, admin: { width: '34%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'compareAtPrice', type: 'number', min: 0, admin: { width: '33%' } },
                { name: 'currency', type: 'text', defaultValue: 'VND', admin: { width: '33%' } },
                {
                  name: 'stockStatus',
                  type: 'select',
                  options: ['instock', 'outofstock', 'onbackorder'],
                  defaultValue: 'instock',
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'isPurchasable',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { width: '50%' },
                },
                {
                  name: 'isOnBackorder',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Nội dung',
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              admin: {
                description: 'Tóm tắt ngắn hiển thị ở thẻ sản phẩm hoặc đầu trang.',
                rows: 4,
              },
            },
            {
              name: 'description',
              type: 'richText',
              admin: {
                description: 'Nội dung biên tập chính bằng Lexical Rich Text.',
              },
            },
            {
              type: 'collapsible',
              label: 'Thuộc tính, nhãn và từ khóa',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'attributes',
                  type: 'array',
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    {
                      name: 'values',
                      type: 'array',
                      fields: [{ name: 'value', type: 'text', required: true }],
                    },
                  ],
                },
                {
                  name: 'badges',
                  type: 'array',
                  fields: [{ name: 'label', type: 'text', required: true }],
                },
                {
                  name: 'searchTags',
                  type: 'array',
                  admin: {
                    description:
                      'Từ khóa nội bộ như màu sắc, chất liệu, môn thể thao, dáng áo.',
                  },
                  fields: [
                    {
                      name: 'key',
                      type: 'text',
                      index: true,
                      validate: (value: unknown) =>
                        !value || isStableKey(value) || 'Key phải là stable key chữ thường ASCII.',
                      admin: { description: 'Khóa exact-match chuẩn, ví dụ color.red.' },
                    },
                    { name: 'value', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Hình ảnh',
          fields: [
            {
              name: 'gallery',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              label: 'Ảnh',
              validate: validateGalleryAccess,
              admin: {
                components: {
                  Cell: '/components/products/ProductGalleryCell#ProductGalleryCell',
                },
                description: 'Ảnh sản phẩm đang dùng trên frontend mới.',
              },
            },
            {
              type: 'collapsible',
              label: 'Ảnh gốc từ WordPress',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'legacyImages',
                  type: 'array',
                  fields: [
                    { name: 'url', type: 'text', required: true },
                    { name: 'alt', type: 'text' },
                    { name: 'width', type: 'number', min: 1 },
                    { name: 'height', type: 'number', min: 1 },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea', admin: { rows: 4 } },
            { name: 'canonicalOverride', type: 'text' },
            {
              name: 'legacyPath',
              type: 'text',
              index: true,
              admin: { description: 'Đường dẫn canonical gốc của website cũ.' },
            },
            { name: 'tenantLegacyPathKey', type: 'text', unique: true, admin: { hidden: true } },
          ],
        },
        {
          label: 'Pinterest',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'pinterestPublishEnvironment',
                  type: 'select',
                  options: ['production', 'sandbox'],
                  admin: {
                    readOnly: true,
                    width: '33%',
                  },
                },
                {
                  name: 'pinterestPublishedAt',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                    readOnly: true,
                    width: '33%',
                  },
                },
                {
                  name: 'pinterestBoardName',
                  type: 'text',
                  admin: {
                    readOnly: true,
                    width: '34%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'pinterestPinId',
                  type: 'text',
                  admin: {
                    readOnly: true,
                    width: '50%',
                  },
                },
                {
                  name: 'pinterestBoardId',
                  type: 'text',
                  admin: {
                    readOnly: true,
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'pinterestPinUrl',
              type: 'text',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
        {
          label: 'Migration',
          fields: [
            {
              name: 'contentHtml',
              type: 'textarea',
              maxLength: 2_000_000,
              admin: {
                description:
                  'HTML gốc đã sanitize từ WordPress. Dùng để đối chiếu/migration, không phải nội dung biên tập chính.',
                rows: 14,
              },
            },
            {
              name: 'sourceTags',
              type: 'array',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true },
              ],
            },
            { name: 'sourceSystem', type: 'text', admin: { hidden: true } },
            { name: 'sourceId', type: 'text', index: true, admin: { hidden: true } },
            { name: 'tenantSourceKey', type: 'text', unique: true, admin: { hidden: true } },
            { name: 'sourceModifiedAt', type: 'date', admin: { hidden: true } },
            { name: 'sourceCreatedAt', type: 'date', admin: { hidden: true } },
            { name: 'sourceChecksum', type: 'text', admin: { hidden: true } },
          ],
        },
      ],
    },
    {
      name: 'pinterestPublishAction',
      type: 'ui',
      label: 'Pinterest',
      admin: {
        components: {
          Cell: '/components/pinterest/ProductPinterestPublishCell#ProductPinterestPublishCell',
          Field: '/components/pinterest/EmptyUIField',
        },
      },
    },
    {
      name: 'outboundDistributionSummary',
      type: 'text',
      virtual: true,
      label: 'Có tại',
      admin: {
        components: {
          Cell: '/components/products/ProductDistributionCell#ProductDistributionSummaryCell',
        },
      },
    },
    {
      name: 'inboundDistributionSummary',
      type: 'text',
      virtual: true,
      label: 'Nhận từ',
      admin: {
        components: {
          Cell: '/components/products/ProductDistributionCell#ProductDistributionSummaryCell',
        },
      },
    },
    {
      name: 'outboundDistributions',
      type: 'join',
      collection: 'catalog-distributions',
      on: 'sourceProduct',
      defaultLimit: 12,
      defaultSort: '-syncedAt',
      maxDepth: 2,
      label: 'Có tại (chi tiết)',
      admin: {
        components: {
          Cell: '/components/products/ProductDistributionCell#ProductOutboundDistributionCell',
        },
      },
    },
    {
      name: 'inboundDistributions',
      type: 'join',
      collection: 'catalog-distributions',
      on: 'targetProduct',
      defaultLimit: 12,
      defaultSort: '-syncedAt',
      maxDepth: 2,
      label: 'Nhận từ (chi tiết)',
      admin: {
        components: {
          Cell: '/components/products/ProductDistributionCell#ProductInboundDistributionCell',
        },
      },
    },
  ],
}
