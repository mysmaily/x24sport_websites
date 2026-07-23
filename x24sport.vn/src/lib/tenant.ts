import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

export type TenantContext = {
  slug: 'x24sport' | 'rynosport'
  domain: string
  name: string
  description: string
}

const tenantsByHost: Record<string, TenantContext> = {
  'x24sport.vn': { slug: 'x24sport', domain: 'x24sport.vn', name: 'X24Sport', description: 'Khám phá trang phục bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.' },
  'www.x24sport.vn': { slug: 'x24sport', domain: 'x24sport.vn', name: 'X24Sport', description: 'Khám phá trang phục bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.' },
  'rynosport.vn': { slug: 'rynosport', domain: 'rynosport.vn', name: 'RynoSport', description: 'Khám phá trang phục thể thao tại RynoSport.' },
  'www.rynosport.vn': { slug: 'rynosport', domain: 'rynosport.vn', name: 'RynoSport', description: 'Khám phá trang phục thể thao tại RynoSport.' },
}

function hostname(value: string | null) {
  return (value || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '')
}

/**
 * Resolves the public tenant from the request Host header.  Keep this allow-list
 * in sync with the reverse-proxy server names; never select a tenant directly
 * from a client supplied query parameter or cookie.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const requestHeaders = await headers()
  const host = hostname(requestHeaders.get('host'))
  if (host === 'localhost' || host === '127.0.0.1' || !host) return tenantsByHost['x24sport.vn']

  const tenant = tenantsByHost[host]
  if (!tenant) notFound()
  return tenant
}

export async function getTenantSlug() {
  return (await getTenantContext()).slug
}

export async function getTenantBaseUrl() {
  return `https://${(await getTenantContext()).domain}`
}
