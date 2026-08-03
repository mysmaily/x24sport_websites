import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import {
  decodeTenantHeader,
  resolveTenantByHost,
  type TenantContext,
} from './tenant-registry'

export type { TenantContext } from './tenant-registry'

function hostname(value: string | null) {
  return (value || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '')
}

export async function getTenantContext(): Promise<TenantContext> {
  const requestHeaders = await headers()
  const slug = decodeTenantHeader(requestHeaders.get('x-x24-tenant-slug'))
  const domain = decodeTenantHeader(requestHeaders.get('x-x24-tenant-domain'))
  const name = decodeTenantHeader(requestHeaders.get('x-x24-tenant-name'))
  const description = decodeTenantHeader(requestHeaders.get('x-x24-tenant-description'))
  if (slug && domain && name) return { slug, domain, name, description: description || name }

  const host = hostname(requestHeaders.get('x-x24-public-host') || requestHeaders.get('host'))
  const tenant = await resolveTenantByHost(host || 'localhost')
  if (!tenant) notFound()
  return tenant
}

export async function getTenantSlug() {
  return (await getTenantContext()).slug
}

export async function getTenantBaseUrl() {
  return `https://${(await getTenantContext()).domain}`
}
