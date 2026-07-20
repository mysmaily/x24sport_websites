import type { Access, CollectionConfig, Where } from 'payload'

import {
  adminsOnly,
  isSuperAdmin,
  superAdminFieldOnly,
  userTenantIDs,
  type UserWithRole,
} from '../access/roles'
import { resolveTenantUploadPrefix } from '../storage/r2'
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
    group: 'Content',
  },
  access: {
    create: adminsOnly,
    delete: mediaOwnerWrite,
    read: mediaRead,
    update: mediaOwnerWrite,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, req }) => {
        const user = req.user as UserWithRole | null
        const nextTenant = relationID(data?.tenant ?? originalDoc?.tenant)

        if (user && !isSuperAdmin(user)) {
          const allowed = new Set(userTenantIDs(user).map(String))
          if (!nextTenant || !allowed.has(String(nextTenant))) {
            throw new Error('Website sở hữu media phải được gán cho tài khoản đang đăng nhập.')
          }
          if (data && Object.prototype.hasOwnProperty.call(data, 'sharedWithTenants')) {
            throw new Error('Chỉ quản trị hệ thống mới có thể thay đổi việc chia sẻ media giữa các website.')
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

        return {
          ...data,
          prefix: await resolveTenantUploadPrefix({ req, tenant }),
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
        description: 'Internal search helpers for tone, gradient, pose, and sport.',
      },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
  ],
  upload: true,
}
