import { NextResponse, type NextRequest } from 'next/server'
import { encodeTenantHeader, resolveTenantByHost } from './lib/tenant-registry'

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase() || ''
  const tenant = await resolveTenantByHost(hostname)
  if (!tenant) return NextResponse.next()
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
    '/((?!api|_next/static|_next/image|fonts|images|styles|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)',
  ],
}
