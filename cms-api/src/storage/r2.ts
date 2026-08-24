import type { CollectionConfig } from 'payload'

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')
const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const getR2Endpoint = () => {
  if (process.env.CLOUDFLARE_R2_ENDPOINT) {
    return process.env.CLOUDFLARE_R2_ENDPOINT
  }

  if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    return undefined
  }

  return `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
}

export const getR2PublicURL = () => {
  const configuredURL = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://static.x24sport.vn'
  return configuredURL.startsWith('http') ? trimSlashes(configuredURL) : `https://${trimSlashes(configuredURL)}`
}

export const isR2StorageEnabled = () =>
  Boolean(
    process.env.CLOUDFLARE_R2_BUCKET_NAME &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
      getR2Endpoint(),
  )

export const generateR2FileURL = ({
  filename,
  prefix,
}: {
  collection: CollectionConfig
  filename: string
  prefix?: string
}) => {
  const key = [prefix, filename]
    .filter((segment): segment is string => Boolean(segment))
    .map((segment) => trimSlashes(segment))
    .join('/')
  return `${getR2PublicURL()}/${key}`
}

type TenantValue =
  | number
  | string
  | {
      id?: number | string | null
      slug?: string | null
    }
  | null
  | undefined

export type ResolvedCustomerR2Storage = {
  accessKeyId: string
  bucket: string
  customerID: number | string
  endpoint: string
  publicBaseUrl: string
  secretAccessKey: string
  tenantSlug: string
}

const getTenantID = (tenant: TenantValue) => {
  if (!tenant) {
    return undefined
  }

  if (typeof tenant === 'number' || typeof tenant === 'string') {
    return tenant
  }

  return tenant.id || undefined
}

export const resolveTenantUploadPrefix = async ({
  req,
  tenant,
}: {
  req: any
  tenant: TenantValue
}) => {
  if (tenant && typeof tenant === 'object' && tenant.slug) {
    return tenant.slug
  }

  const tenantID = getTenantID(tenant)

  if (!tenantID) {
    throw new Error('Media uploads require a tenant so R2 objects can be stored under the tenant prefix.')
  }

  const tenantDoc = await req.payload.findByID({
    id: tenantID,
    collection: 'tenants',
    depth: 0,
    req,
  })

  if (!tenantDoc?.slug || typeof tenantDoc.slug !== 'string') {
    throw new Error(`Could not resolve tenant slug for media upload tenant "${tenantID}".`)
  }

  return tenantDoc.slug
}

const resolveCustomerID = (customer: TenantValue) => {
  if (typeof customer === 'number' || typeof customer === 'string') return customer
  return customer?.id || undefined
}

export const resolveCustomerR2Storage = async ({
  req,
  tenant,
}: {
  req: any
  tenant: TenantValue
}): Promise<ResolvedCustomerR2Storage> => {
  const tenantID = getTenantID(tenant)
  const tenantDoc =
    tenant && typeof tenant === 'object' && tenant.slug && 'customer' in tenant
      ? tenant
      : tenantID
        ? await req.payload.findByID({
            id: tenantID,
            collection: 'tenants',
            depth: 1,
            overrideAccess: true,
            req,
          })
        : null

  if (!tenantDoc?.slug || typeof tenantDoc.slug !== 'string') {
    throw new Error('Media uploads require a tenant with a slug so R2 objects can use the tenant prefix.')
  }

  const customerID = resolveCustomerID((tenantDoc as { customer?: TenantValue }).customer)
  if (!customerID) {
    throw new Error(`Tenant "${tenantDoc.slug}" does not have a customer assigned for R2 storage.`)
  }

  return resolveR2StorageForCustomer({
    customerID,
    req,
    tenantSlug: tenantDoc.slug,
  })
}

export const resolveR2StorageForCustomer = async ({
  customerID,
  req,
  tenantSlug,
}: {
  customerID: number | string
  req: any
  tenantSlug: string
}): Promise<ResolvedCustomerR2Storage> => {
  const customerDoc = await req.payload.findByID({
    id: customerID,
    collection: 'customers',
    depth: 0,
    overrideAccess: true,
    req,
  })

  const r2Storage = customerDoc?.r2Storage
  const bucket = trim(r2Storage?.bucket)
  const endpoint = trim(r2Storage?.endpoint)
  const publicBaseUrl = trim(r2Storage?.publicBaseUrl)
  const accessKeyId = trim(r2Storage?.accessKeyId)
  const secretAccessKey = trim(r2Storage?.secretAccessKey)

  if (!r2Storage?.enabled || !bucket || !endpoint || !publicBaseUrl || !accessKeyId || !secretAccessKey) {
    throw new Error(`Customer "${customerDoc?.slug || customerID}" does not have complete R2 storage config.`)
  }

  return {
    accessKeyId,
    bucket,
    customerID,
    endpoint,
    publicBaseUrl: getNormalizedPublicBaseURL(publicBaseUrl),
    secretAccessKey,
    tenantSlug,
  }
}

export const getNormalizedPublicBaseURL = (value: string) => {
  const configuredURL = value || 'https://static.x24sport.vn'
  return configuredURL.startsWith('http') ? trimSlashes(configuredURL) : `https://${trimSlashes(configuredURL)}`
}
