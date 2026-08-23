import type { Access, FieldAccess, Where } from 'payload'

import { relationID } from '../util/tenantIdentity'

type Role = 'super_admin' | 'tenant_admin' | 'editor'
type CustomerRelation = number | string | { id?: number | string } | null | undefined
type TenantAccessMode = 'assigned_tenants' | 'customer_tenants'

export type UserWithRole = {
  customer?: CustomerRelation
  id?: number | string
  role?: Role
  tenantAccessMode?: TenantAccessMode | null
  tenants?: Array<{ tenant?: number | string | { id?: number | string } }> | null
}

export const userTenantIDs = (user?: UserWithRole | null) =>
  (user?.tenants || [])
    .map((entry) => {
      const tenant = entry?.tenant
      if (typeof tenant === 'number' || typeof tenant === 'string') return tenant
      return tenant?.id
    })
    .filter((id): id is number | string => id !== undefined && id !== null)

export const isSuperAdmin = (user?: UserWithRole | null) => user?.role === 'super_admin'

export const userCustomerID = (user?: UserWithRole | null) => relationID(user?.customer)

export const isAdminRole = (user?: UserWithRole | null) =>
  user?.role === 'super_admin' || user?.role === 'tenant_admin'

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const publicRead: Access = () => true

export const publishedOrAuthenticatedRead: Access = ({ req }) =>
  req.user
    ? true
    : {
        _status: {
          equals: 'published',
        },
      }

export const superAdminsOnly: Access = ({ req }) => isSuperAdmin(req.user as UserWithRole)

export const customerRead: Access = ({ req }) => {
  const user = req.user as UserWithRole | null
  if (isSuperAdmin(user)) return true

  const customerID = userCustomerID(user)
  return customerID
    ? {
        id: {
          equals: customerID,
        },
      }
    : false
}

export const distributionRead: Access = ({ req }) => {
  const user = req.user as UserWithRole | null
  if (isSuperAdmin(user)) return true

  const tenantIDs = userTenantIDs(user)
  if (!tenantIDs.length) return false

  const where: Where = {
    or: [
      { sourceTenant: { in: tenantIDs } },
      { targetTenant: { in: tenantIDs } },
    ],
  }
  return where
}

export const adminsOnly: Access = ({ req }) => isAdminRole(req.user as UserWithRole)

export const superAdminFieldOnly: FieldAccess = ({ req }) =>
  isSuperAdmin(req.user as UserWithRole)
