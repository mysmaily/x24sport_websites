import { NextResponse, type NextRequest } from 'next/server'

const hosts: Record<string, string> = {
  'x24sport.vn': 'x24sport',
  'www.x24sport.vn': 'x24sport',
  '10.10.0.58': 'x24sport',
  'rynosport.vn': 'rynosport',
  'www.rynosport.vn': 'rynosport',
}

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase() || ''
  const tenant = hosts[hostname]
  if (!tenant) return NextResponse.next()
  return NextResponse.rewrite(new URL(`/${tenant}${request.nextUrl.pathname}`, request.url))
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)'],
}
