import type { Access, FieldAccess } from 'payload'

type Role = 'super_admin' | 'tenant_admin' | 'editor'

export type UserWithRole = {
  id?: number | string
  role?: Role
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

export const isAdminRole = (user?: UserWithRole | null) =>
  user?.role === 'super_admin' || user?.role === 'tenant_admin'

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const publicRead: Access = () => true

export const superAdminsOnly: Access = ({ req }) => isSuperAdmin(req.user as UserWithRole)

export const adminsOnly: Access = ({ req }) => isAdminRole(req.user as UserWithRole)

export const superAdminFieldOnly: FieldAccess = ({ req }) =>
  isSuperAdmin(req.user as UserWithRole)
