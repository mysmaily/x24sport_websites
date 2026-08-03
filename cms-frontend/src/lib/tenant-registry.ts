export type TenantContext = {
  slug: string
  domain: string
  name: string
  description: string
}

type TenantApiDocument = {
  slug?: unknown
  name?: unknown
  domains?: Array<{ domain?: unknown }>
  brand?: { headline?: unknown; subheadline?: unknown }
}

type TenantApiResponse = { docs?: TenantApiDocument[] }

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
const CACHE_TTL_MS = 60_000
const tenantCache = new Map<string, { expiresAt: number; tenant: TenantContext | null }>()

// Existing production tenants remain available during a short CMS outage. New
// tenants are discovered from Payload and do not need a frontend code change.
const currentTenantFallbacks: Record<string, TenantContext> = {
  'x24sport.vn': { slug: 'x24sport', domain: 'x24sport.vn', name: 'X24Sport', description: 'Trang phục thể thao thiết kế theo yêu cầu cho nhiều bộ môn.' },
  'rynosport.vn': { slug: 'rynosport', domain: 'rynosport.vn', name: 'RynoSport', description: 'Trang phục thể thao cho đội nhóm và câu lạc bộ.' },
  'mayaocaulong.vn': { slug: 'mayaocaulong', domain: 'mayaocaulong.vn', name: 'MayaoCauLong', description: 'Đồng phục cầu lông thiết kế theo yêu cầu.' },
  'mayaopickleball.vn': { slug: 'mayaopickleball', domain: 'mayaopickleball.vn', name: 'MayaoPickleball', description: 'Đồng phục pickleball thiết kế theo yêu cầu.' },
  'mayaobongchuyen.vn': { slug: 'mayaobongchuyen', domain: 'mayaobongchuyen.vn', name: 'MayaoBongChuyen', description: 'Đồng phục bóng chuyền thiết kế theo yêu cầu.' },
  'mayaobongro.vn': { slug: 'mayaobongro', domain: 'mayaobongro.vn', name: 'MayaoBongRo', description: 'Đồng phục bóng rổ thiết kế theo yêu cầu.' },
  'mayaochaybo.vn': { slug: 'mayaochaybo', domain: 'mayaochaybo.vn', name: 'MayaoChayBo', description: 'Áo chạy bộ thiết kế theo yêu cầu.' },
  'mayaobongda.vn': { slug: 'mayaobongda', domain: 'mayaobongda.vn', name: 'MayaoBongDa', description: 'Áo bóng đá và đồng phục thi đấu thiết kế theo yêu cầu.' },
}

for (const [domain, tenant] of Object.entries(currentTenantFallbacks)) {
  currentTenantFallbacks[`www.${domain}`] = tenant
}

export function normalizeTenantHost(value: string | null | undefined) {
  return (value || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '')
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function tenantFromDocument(document: TenantApiDocument, requestedHost: string): TenantContext | null {
  const slug = text(document.slug)
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null

  const domains = (document.domains || []).map((item) => normalizeTenantHost(text(item.domain))).filter(Boolean)
  const domain = domains.find((item) => item === requestedHost)
    || domains.find((item) => !item.startsWith('www.'))
    || domains[0]
  if (!domain) return null

  const name = text(document.name) || text(document.brand?.headline) || slug
  const description = text(document.brand?.subheadline) || text(document.brand?.headline) || name
  return { slug, domain: domain.replace(/^www\./, ''), name, description }
}

async function fetchTenant(host: string) {
  const queryHost = host === 'www.localhost' ? 'localhost' : host
  const params = new URLSearchParams({
    'where[domains.domain][equals]': queryHost,
    depth: '0',
    limit: '1',
  })
  const response = await fetch(`${API_URL}/api/tenants?${params.toString()}`, {
    next: { revalidate: 60 },
  })
  if (!response.ok) return null
  const data = (await response.json()) as TenantApiResponse
  return data.docs?.[0] ? tenantFromDocument(data.docs[0], host) : null
}

export async function resolveTenantByHost(value: string | null | undefined) {
  const host = normalizeTenantHost(value)
  if (!host) return null
  if (host === 'localhost' || host === '127.0.0.1' || host === '10.10.0.58') {
    return currentTenantFallbacks['x24sport.vn']
  }

  const cached = tenantCache.get(host)
  if (cached && cached.expiresAt > Date.now()) return cached.tenant

  let tenant: TenantContext | null = null
  try {
    tenant = await fetchTenant(host)
    if (!tenant && host.startsWith('www.')) tenant = await fetchTenant(host.slice(4))
  } catch {
    tenant = null
  }
  tenant ||= currentTenantFallbacks[host] || null
  tenantCache.set(host, { expiresAt: Date.now() + CACHE_TTL_MS, tenant })
  return tenant
}

export function encodeTenantHeader(value: string) {
  return encodeURIComponent(value)
}

export function decodeTenantHeader(value: string | null) {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return ''
  }
}
