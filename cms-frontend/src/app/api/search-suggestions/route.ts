import { NextRequest, NextResponse } from 'next/server'

import { resolveTenantByHost } from '../../../lib/tenant-registry'

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

type Media = { url?: string }
type Product = {
  gallery?: Array<number | string | Media>
  legacyPath?: string
  name?: string
  slug?: string
  viewCount?: number
}
type ApiList<T> = { docs?: T[] }

const tenantKeywords: Record<string, string[]> = {
  mayaobongda: ['áo bóng đá 2026', 'áo đội tuyển', 'áo câu lạc bộ', 'áo bóng đá màu xanh', 'áo bóng đá nữ'],
  mayaocaulong: ['áo cầu lông nam', 'áo cầu lông nữ', 'áo cầu lông cổ trụ', 'áo cầu lông màu xanh', 'áo cầu lông sát nách'],
  mayaopickleball: ['áo pickleball nam', 'áo pickleball nữ', 'áo pickleball cổ trụ', 'áo pickleball màu xanh', 'áo đội nhóm'],
  mayaobongchuyen: ['áo bóng chuyền nam', 'áo bóng chuyền nữ', 'áo bóng chuyền tay dài', 'áo đội tuyển', 'áo thi đấu'],
  mayaobongro: ['áo bóng rổ nam', 'áo bóng rổ nữ', 'áo bóng rổ hai mặt', 'áo đội nhóm', 'áo thi đấu'],
  mayaochaybo: ['áo chạy bộ nam', 'áo chạy bộ nữ', 'áo chạy bộ sát nách', 'áo chạy bộ sự kiện', 'áo cờ đỏ sao vàng'],
  pndsport: ['áo bóng đá', 'áo cầu lông', 'áo pickleball', 'áo bóng chuyền', 'áo chạy bộ'],
  rynosport: ['áo bóng đá', 'áo bóng chuyền', 'áo cầu lông', 'áo pickleball', 'áo đội nhóm'],
  x24sport: ['áo bóng đá', 'áo cầu lông', 'áo pickleball', 'áo bóng chuyền', 'áo chạy bộ'],
}

function requestHost(request: NextRequest) {
  return request.headers.get('x-forwarded-host')?.split(',')[0]
    || request.headers.get('host')
    || request.nextUrl.hostname
}

function mediaUrl(product: Product) {
  const first = product.gallery?.find((item): item is Media => typeof item === 'object' && Boolean(item?.url))
  return first?.url || ''
}

function productHref(product: Product) {
  const legacyPath = product.legacyPath?.trim()
  if (legacyPath?.startsWith('/') && !legacyPath.startsWith('//')) return legacyPath
  return product.slug ? `/san-pham/${encodeURIComponent(product.slug)}/` : ''
}

export async function GET(request: NextRequest) {
  const tenant = await resolveTenantByHost(requestHost(request))
  if (!tenant) return NextResponse.json({ keywords: [], products: [] }, { status: 404 })

  const params = new URLSearchParams({
    'where[tenant.slug][equals]': tenant.slug,
    'where[publicationStatus][equals]': 'publish',
    depth: '1',
    limit: '12',
    sort: '-viewCount',
  })

  try {
    const response = await fetch(`${API_URL}/api/products?${params}`, { next: { revalidate: 300 } })
    if (!response.ok) throw new Error(`Payload products returned ${response.status}`)
    const data = await response.json() as ApiList<Product>
    const products = (data.docs || []).filter((product) => !/\blogo\b/i.test(product.name || '')).flatMap((product) => {
      const href = productHref(product)
      const name = product.name?.trim()
      if (!href || !name) return []
      return [{ href, image: mediaUrl(product), name, viewCount: product.viewCount || 0 }]
    }).slice(0, 4)
    return NextResponse.json(
      { keywords: tenantKeywords[tenant.slug] || tenantKeywords.x24sport, products },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    )
  } catch (error) {
    console.error(`Unable to load search suggestions for ${tenant.slug}.`, error)
    return NextResponse.json({ keywords: tenantKeywords[tenant.slug] || tenantKeywords.x24sport, products: [] })
  }
}
