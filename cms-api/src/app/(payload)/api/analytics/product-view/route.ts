import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isAdminRole, isSuperAdmin, userTenantIDs, type UserWithRole } from '../../../../../access/roles'
import {
  getProductViewStats,
  recordProductView,
} from '../../../../../analytics/productViews'
import {
  isAllowedTenantOrigin,
  parseProductViewInput,
} from '../../../../../analytics/productViewValidation'

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {}
  return {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  }
}

function relationId(value: unknown) {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: number | string }).id
    return typeof id === 'number' || typeof id === 'string' ? id : undefined
  }
  return undefined
}

function boundedInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || '', 10)
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback
}

export function OPTIONS(request: Request) {
  return new NextResponse(null, {
    headers: corsHeaders(request.headers.get('origin')),
    status: 204,
  })
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const headers = corsHeaders(origin)
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { headers, status: 400 })
  }

  const input = parseProductViewInput(body)
  if (!input || !origin) {
    return NextResponse.json({ error: 'Invalid product view event.' }, { headers, status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const tenants = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: input.tenantSlug } },
  })
  const tenant = tenants.docs[0]
  const domains = tenant?.domains?.map((item) => item.domain).filter(Boolean) || []

  if (!tenant || !isAllowedTenantOrigin({ domains, origin })) {
    return NextResponse.json({ error: 'Origin is not allowed for this tenant.' }, { headers, status: 403 })
  }

  let product
  try {
    product = await payload.findByID({
      collection: 'products',
      depth: 0,
      id: input.productId,
      overrideAccess: true,
    })
  } catch {
    return NextResponse.json({ error: 'Product was not found.' }, { headers, status: 404 })
  }

  if (
    String(relationId(product.tenant)) !== String(tenant.id) ||
    product.publicationStatus !== 'publish'
  ) {
    return NextResponse.json({ error: 'Product was not found.' }, { headers, status: 404 })
  }

  const recorded = await recordProductView({
    path: input.path,
    payload,
    productId: product.id,
    sessionId: input.sessionId,
    tenantId: tenant.id,
    visitorId: input.visitorId,
  })

  return NextResponse.json({ recorded }, { headers, status: recorded ? 201 : 200 })
}

export async function GET(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const auth = await payload.auth({ canSetHeaders: false, headers: request.headers })
  const user = auth.user as UserWithRole | null

  if (!isAdminRole(user)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const url = new URL(request.url)
  const tenantSlug = url.searchParams.get('tenantSlug')?.trim()
  if (!tenantSlug) {
    return NextResponse.json({ error: 'tenantSlug is required.' }, { status: 400 })
  }

  const tenants = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: tenantSlug } },
  })
  const tenant = tenants.docs[0]
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant was not found.' }, { status: 404 })
  }

  const allowedTenantIds = userTenantIDs(user).map(String)
  if (!isSuperAdmin(user) && !allowedTenantIds.includes(String(tenant.id))) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const days = boundedInteger(url.searchParams.get('days'), 30, 1, 365)
  const limit = boundedInteger(url.searchParams.get('limit'), 50, 1, 100)
  const products = await getProductViewStats({ days, limit, payload, tenantId: tenant.id })

  return NextResponse.json({ days, products, tenantSlug })
}
