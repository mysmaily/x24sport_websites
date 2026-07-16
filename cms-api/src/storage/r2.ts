import type { CollectionConfig } from 'payload'

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')

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
