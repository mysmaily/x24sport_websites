import type { Payload, PayloadRequest } from 'payload'

import { relationID } from './tenantIdentity'

export const CUSTOMER_TENANTS_ACCESS_MODE = 'customer_tenants'

type Data = Record<string, unknown> | null | undefined

const tenantRowsForCustomer = async (payload: Payload, customerID: number | string) => {
  const tenants = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    sort: 'name',
    where: {
      customer: {
        equals: customerID,
      },
    },
  })

  return tenants.docs.map((tenant) => ({ tenant: tenant.id }))
}

export const applyCustomerTenantAccess = async ({
  data,
  originalDoc,
  req,
}: {
  data?: Data
  originalDoc?: Data
  req: PayloadRequest
}) => {
  if (!data) return data

  const role = data.role ?? originalDoc?.role ?? 'editor'
  const customerID = relationID((data.customer ?? originalDoc?.customer) as Parameters<typeof relationID>[0])
  const tenantAccessMode = data.tenantAccessMode ?? originalDoc?.tenantAccessMode ?? 'assigned_tenants'

  if (role !== 'super_admin' && !customerID) {
    throw new Error('User quản trị website phải được gán customer.')
  }

  if (tenantAccessMode !== CUSTOMER_TENANTS_ACCESS_MODE) {
    return data
  }

  if (!customerID) {
    throw new Error('Chế độ quản lý toàn bộ website của customer cần một customer.')
  }

  return {
    ...data,
    customer: customerID,
    tenants: await tenantRowsForCustomer(req.payload, customerID),
  }
}

export const syncCustomerTenantUsers = async ({
  customer,
  payload,
}: {
  customer: unknown
  payload: Payload
}) => {
  const customerID = relationID(customer as Parameters<typeof relationID>[0])
  if (!customerID) return

  const [tenantRows, users] = await Promise.all([
    tenantRowsForCustomer(payload, customerID),
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 0,
      overrideAccess: true,
      where: {
        and: [
          {
            customer: {
              equals: customerID,
            },
          },
          {
            tenantAccessMode: {
              equals: CUSTOMER_TENANTS_ACCESS_MODE,
            },
          },
        ],
      },
    }),
  ])

  await Promise.all(
    users.docs.map((user) =>
      payload.update({
        collection: 'users',
        data: {
          tenants: tenantRows,
        },
        id: user.id,
        overrideAccess: true,
      }),
    ),
  )
}

export const syncCustomerTenantUsersForTenantChange = async ({
  doc,
  previousDoc,
  req,
}: {
  doc?: Data
  previousDoc?: Data
  req: PayloadRequest
}) => {
  const customerIDs = new Set(
    [
      relationID(doc?.customer as Parameters<typeof relationID>[0]),
      relationID(previousDoc?.customer as Parameters<typeof relationID>[0]),
    ]
      .filter((id): id is number | string => id !== undefined),
  )

  for (const customerID of customerIDs) {
    await syncCustomerTenantUsers({ customer: customerID, payload: req.payload })
  }
}
