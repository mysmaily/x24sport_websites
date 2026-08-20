import { NextResponse, type NextRequest } from 'next/server'
import { FOOTBALL_PERMANENT_REDIRECTS } from './app/[tenant]/_mayaobongda/lib/permanent-redirects'
import { encodeTenantHeader, resolveTenantByHost } from './lib/tenant-registry'

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

async function mayaodongphucRecordExists(collection: 'product-categories' | 'products' | 'web-content', slug: string) {
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': 'mayaodongphuc',
    'where[slug][equals]': slug,
    depth: '0',
    limit: '1',
  })
  if (collection === 'products') params.set('where[publicationStatus][equals]', 'publish')
  if (collection === 'product-categories') params.set('where[group][equals]', 'audience')
  if (collection === 'web-content') {
    params.set('where[kind][equals]', 'post')
    params.set('where[publicationStatus][equals]', 'publish')
  }

  try {
    const response = await fetch(`${API_URL}/api/${collection}?${params.toString()}`, {
      next: { revalidate: 60 },
    })
    if (!response.ok) return true
    const data = await response.json() as { totalDocs?: number }
    return Boolean(data.totalDocs)
  } catch {
    return true
  }
}

async function shouldUseMayAoDongPhuc404(pathname: string) {
  if (pathname === '/' || pathname === '/san-pham/' || pathname === '/tim-kiem/' || pathname === '/blog/') return false
  const productMatch = pathname.match(/^\/san-pham\/([^/]+)\/$/)
  if (productMatch) return !(await mayaodongphucRecordExists('products', productMatch[1]))

  const categoryMatch = pathname.match(/^\/danh-muc\/([^/]+)(?:\/[^/]+)?\/$/)
  if (categoryMatch) return !(await mayaodongphucRecordExists('product-categories', categoryMatch[1]))

  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/$/)
  if (blogMatch) return !(await mayaodongphucRecordExists('web-content', blogMatch[1]))

  return true
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase() || ''
  const tenant = await resolveTenantByHost(hostname)
  if (!tenant) return NextResponse.next()
  if (request.nextUrl.pathname.startsWith('/mayaodongphuc-404')) return NextResponse.next()
  const footballRedirect = tenant.slug === 'mayaobongda'
    ? FOOTBALL_PERMANENT_REDIRECTS[request.nextUrl.pathname as keyof typeof FOOTBALL_PERMANENT_REDIRECTS]
    : undefined
  if (footballRedirect) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = footballRedirect
    return NextResponse.redirect(redirectUrl, 301)
  }
  if (tenant.slug === 'mayaodongphuc' && await shouldUseMayAoDongPhuc404(request.nextUrl.pathname)) {
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = `/${tenant.slug}/mayaodongphuc-404`
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-x24-public-host', hostname)
    requestHeaders.set('x-x24-tenant-slug', encodeTenantHeader(tenant.slug))
    requestHeaders.set('x-x24-tenant-domain', encodeTenantHeader(tenant.domain))
    requestHeaders.set('x-x24-tenant-name', encodeTenantHeader(tenant.name))
    requestHeaders.set('x-x24-tenant-description', encodeTenantHeader(tenant.description))
    return NextResponse.rewrite(notFoundUrl, {
      headers: { 'x-robots-tag': 'noindex' },
      request: { headers: requestHeaders },
      status: 404,
    })
  }
  const url = request.nextUrl.clone()
  url.pathname = `/${tenant.slug}${request.nextUrl.pathname}`
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-x24-public-host', hostname)
  requestHeaders.set('x-x24-tenant-slug', encodeTenantHeader(tenant.slug))
  requestHeaders.set('x-x24-tenant-domain', encodeTenantHeader(tenant.domain))
  requestHeaders.set('x-x24-tenant-name', encodeTenantHeader(tenant.name))
  requestHeaders.set('x-x24-tenant-description', encodeTenantHeader(tenant.description))
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|fonts|icons|images|styles|pndsport-preview|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)',
  ],
}
