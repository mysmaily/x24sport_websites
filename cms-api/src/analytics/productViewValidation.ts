const identifierPattern = /^[A-Za-z0-9_-]{16,128}$/

export type ProductViewInput = {
  productId: number | string
  sessionId: string
  tenantSlug: string
  visitorId: string
  path?: string
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function parseProductViewInput(value: unknown): ProductViewInput | null {
  if (!value || typeof value !== 'object') return null

  const body = value as Record<string, unknown>
  const tenantSlug = cleanString(body.tenantSlug, 100)
  const sessionId = cleanString(body.sessionId, 128)
  const visitorId = cleanString(body.visitorId, 128)
  const productId =
    typeof body.productId === 'number' || typeof body.productId === 'string'
      ? body.productId
      : undefined
  const path = cleanString(body.path, 1024)

  if (
    !tenantSlug ||
    !productId ||
    !identifierPattern.test(sessionId) ||
    !identifierPattern.test(visitorId)
  ) {
    return null
  }

  return {
    productId,
    sessionId,
    tenantSlug,
    visitorId,
    ...(path.startsWith('/') ? { path } : {}),
  }
}

export function normalizeHostname(value: string) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function isAllowedTenantOrigin({
  domains,
  origin,
}: {
  domains: string[]
  origin: string
}) {
  const hostname = normalizeHostname(origin)
  if (!hostname) return false

  if (process.env.NODE_ENV !== 'production' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return true
  }

  return domains.some((domain) => domain.trim().toLowerCase().replace(/^www\./, '') === hostname)
}
