import type { CollectionConfig } from 'payload'

import { adminsOnly, superAdminFieldOnly, superAdminsOnly } from '../access/roles'
import { relationID } from '../util/tenantIdentity'

const buildTenantConnectionKey = ({
  data,
  originalDoc,
}: {
  data?: Record<string, unknown> | null
  originalDoc?: Record<string, unknown> | null
}) => {
  const tenant = relationID(
    (data?.tenant ?? originalDoc?.tenant) as number | string | { id?: number | string } | null,
  )

  return tenant ? { tenantConnectionKey: String(tenant) } : {}
}

export const TenantPinterestConnections: CollectionConfig = {
  slug: 'tenant-pinterest-connections',
  admin: {
    defaultColumns: [
      'tenant',
      'pinterestUsername',
      'defaultBoardName',
      'tokenExpiresAt',
      'lastPublishedAt',
    ],
    group: 'Platform',
    useAsTitle: 'pinterestUsername',
  },
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: adminsOnly,
    update: superAdminsOnly,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => ({
        ...data,
        ...buildTenantConnectionKey({ data, originalDoc }),
      }),
    ],
  },
  fields: [
    {
      name: 'tenantConnectionKey',
      type: 'text',
      unique: true,
      access: {
        create: superAdminFieldOnly,
        read: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'pinterestAccountId',
      type: 'text',
      admin: {
        description: 'ID tài khoản Pinterest được trả về sau khi OAuth thành công.',
      },
    },
    {
      name: 'pinterestUsername',
      type: 'text',
      admin: {
        description: 'Username tài khoản Pinterest hiện đang liên kết với tenant này.',
      },
    },
    {
      name: 'defaultBoardId',
      type: 'text',
      admin: {
        description:
          'Board mặc định để đăng sản phẩm. Nếu bỏ trống, hệ thống sẽ tự tạo board khi đăng lần đầu.',
      },
    },
    {
      name: 'defaultBoardName',
      type: 'text',
      admin: {
        description: 'Tên board đang dùng để đăng sản phẩm.',
      },
    },
    {
      name: 'scope',
      type: 'text',
      admin: {
        description: 'Danh sách scope OAuth đã cấp cho tenant này.',
        readOnly: true,
      },
    },
    {
      name: 'accessToken',
      type: 'textarea',
      access: {
        create: superAdminFieldOnly,
        read: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'refreshToken',
      type: 'textarea',
      access: {
        create: superAdminFieldOnly,
        read: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'tokenExpiresAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'refreshTokenExpiresAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'lastPublishedPinId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastPublishedProductId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastPublishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
  ],
}
