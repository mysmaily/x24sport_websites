import type { Access, CollectionConfig, Where } from 'payload'

import {
  adminsOnly,
  isSuperAdmin,
  superAdminFieldOnly,
  userTenantIDs,
  type UserWithRole,
} from '../access/roles'
import { resolveCustomerR2Storage } from '../storage/r2'
import { isStableKey } from '../util/navigationIdentity'
import { buildTenantIdentity, relationID } from '../util/tenantIdentity'

export const mediaRead: Access = ({ req }) => {
  const user = req.user as UserWithRole | null

  // R2 objects and product media are intentionally public. Authenticated tenant
  // users receive a narrower result so the admin media picker cannot leak assets.
  if (!user || isSuperAdmin(user)) return true

  const tenantIDs = userTenantIDs(user)
  if (!tenantIDs.length) return false

  const visibleMedia: Where[] = [
    { tenant: { in: tenantIDs } },
    { sharedWithTenants: { in: tenantIDs } },
  ]

  return { or: visibleMedia }
}

export const mediaOwnerWrite: Access = ({ req }) => {
  const user = req.user as UserWithRole | null
  if (isSuperAdmin(user)) return true

  const tenantIDs = userTenantIDs(user)
  return tenantIDs.length ? { tenant: { in: tenantIDs } } : false
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['mediaPreview', 'alt', 'searchTags', 'tenant', 'updatedAt'],
    group: 'Content',
    useAsTitle: 'alt',
  },
  access: {
    create: adminsOnly,
    delete: mediaOwnerWrite,
    read: mediaRead,
    update: mediaOwnerWrite,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        const user = req.user as UserWithRole | null
        const nextTenant = relationID(data?.tenant ?? originalDoc?.tenant)

        if (user && !isSuperAdmin(user)) {
          const allowed = new Set(userTenantIDs(user).map(String))
          if (!nextTenant || !allowed.has(String(nextTenant))) {
            throw new Error('Website sở hữu media phải được gán cho tài khoản đang đăng nhập.')
          }
          const nextSharedWithTenants = data?.sharedWithTenants
          const changesSharedWithTenants = Array.isArray(nextSharedWithTenants)
            ? nextSharedWithTenants.length > 0
            : nextSharedWithTenants !== undefined && nextSharedWithTenants !== null

          if (changesSharedWithTenants) {
            throw new Error('Chỉ quản trị hệ thống mới có thể thay đổi việc chia sẻ media giữa các website.')
          }
        }

        const sharedTenantIDs = Array.isArray(data?.sharedWithTenants)
          ? data.sharedWithTenants
              .map(relationID)
              .filter((id): id is number | string => id !== undefined)
          : []

        if (nextTenant && sharedTenantIDs.length > 0) {
          const tenants = await req.payload.find({
            collection: 'tenants',
            depth: 0,
            limit: sharedTenantIDs.length + 1,
            overrideAccess: true,
            req,
            where: {
              id: {
                in: [nextTenant, ...sharedTenantIDs],
              },
            },
          })
          const ownerCustomer = tenants.docs.find((tenant) => String(tenant.id) === String(nextTenant))?.customer
          const ownerCustomerID = relationID(ownerCustomer)

          if (!ownerCustomerID) {
            throw new Error('Website sở hữu media phải thuộc một customer trước khi chia sẻ media.')
          }

          const crossCustomerShare = tenants.docs.some((tenant) => {
            if (String(tenant.id) === String(nextTenant)) return false
            return String(relationID(tenant.customer)) !== String(ownerCustomerID)
          })

          if (crossCustomerShare) {
            throw new Error('Media chỉ được chia sẻ giữa các website thuộc cùng customer.')
          }
        }

        return {
          ...data,
          ...buildTenantIdentity({ data, originalDoc }),
        }
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const tenant = data?.tenant || originalDoc?.tenant
        const storage = await resolveCustomerR2Storage({ req, tenant })

        return {
          ...data,
          prefix: storage.tenantSlug,
          r2StorageBucket: storage.bucket,
          r2StorageEndpoint: storage.endpoint,
          r2StoragePublicBaseUrl: storage.publicBaseUrl,
          storageCustomer: storage.customerID,
        }
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const references = await req.payload.find({
          collection: 'products',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          req,
          where: { gallery: { contains: id } },
        })

        if (references.totalDocs > 0) {
          throw new Error(
            `Media ${id} is referenced by product ${references.docs[0]?.id}; remove every gallery reference before deleting it.`,
          )
        }
      },
    ],
  },
  fields: [
    { name: 'sourceSystem', type: 'text', admin: { hidden: true } },
    { name: 'sourceId', type: 'text', index: true, admin: { hidden: true } },
    { name: 'sourceUrl', type: 'text', admin: { hidden: true } },
    { name: 'sourceChecksum', type: 'text', admin: { hidden: true } },
    { name: 'tenantSourceKey', type: 'text', unique: true, admin: { hidden: true } },
    {
      name: 'storageCustomer',
      type: 'relationship',
      relationTo: 'customers',
      index: true,
      admin: { hidden: true },
      access: {
        read: superAdminFieldOnly,
      },
    },
    {
      name: 'r2StorageBucket',
      type: 'text',
      admin: { hidden: true },
      access: {
        read: superAdminFieldOnly,
      },
    },
    {
      name: 'r2StorageEndpoint',
      type: 'text',
      admin: { hidden: true },
      access: {
        read: superAdminFieldOnly,
      },
    },
    {
      name: 'r2StoragePublicBaseUrl',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'sharedWithTenants',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: true,
      label: 'Website được chia sẻ',
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        description:
          'Website khác được phép dùng chung media record và cùng file R2. Chỉ quản trị hệ thống được thay đổi.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'searchTags',
      type: 'array',
      admin: {
        components: {
          Cell: '/components/media/MediaSearchTagsCell#MediaSearchTagsCell',
          Field: '/components/media/MediaSearchTagsField#MediaSearchTagsField',
        },
        description: 'Internal search helpers for tone, gradient, pose, and sport.',
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
    {
      name: 'mediaPreview',
      type: 'ui',
      label: 'Ảnh',
      admin: {
        components: {
          Cell: '/components/media/MediaPreviewCell#MediaPreviewCell',
        },
      },
    },
  ],
  upload: {
    adminThumbnail: ({ doc }) => {
      if (typeof doc.thumbnailURL === 'string' && doc.thumbnailURL.trim()) return doc.thumbnailURL
      if (typeof doc.url === 'string' && doc.url.trim()) return doc.url
      return null
    },
  },
}
