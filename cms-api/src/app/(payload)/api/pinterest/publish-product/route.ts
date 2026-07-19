import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isAdminRole } from '../../../../../access/roles'
import { sanitizeReturnTo } from '../../../../../pinterest/oauth'
import { publishProductToPinterest } from '../../../../../pinterest/publish'

type PublishRequestBody = {
  productId?: number | string
  returnTo?: string
}

export async function POST(request: Request) {
  const payload = await getPayload({
    config: configPromise,
  })

  const auth = await payload.auth({
    canSetHeaders: false,
    headers: request.headers,
  })

  if (!isAdminRole(auth.user as never)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const body = (await request.json()) as PublishRequestBody
  const productId = body.productId

  if (!productId) {
    return NextResponse.json({ error: 'Missing productId.' }, { status: 400 })
  }

  const product = await payload.findByID({
    collection: 'products',
    depth: 2,
    id: productId,
    overrideAccess: true,
  })

  const tenantValue = product.tenant
  const tenantId =
    typeof tenantValue === 'object' && tenantValue && 'id' in tenantValue
      ? tenantValue.id
      : tenantValue

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Sản phẩm chưa được gắn tenant nên không thể đăng Pinterest.' },
      { status: 400 },
    )
  }

  const tenant = await payload.findByID({
    collection: 'tenants',
    depth: 0,
    id: tenantId,
    overrideAccess: true,
  })

  const connections = await payload.find({
    collection: 'tenant-pinterest-connections',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      tenantConnectionKey: {
        equals: String(tenantId),
      },
    },
  })

  const connection = connections.docs[0]
  const returnTo = sanitizeReturnTo(body.returnTo)

  if (!connection?.accessToken) {
    const connectURL = new URL('/api/pinterest/connect', request.url)
    connectURL.searchParams.set('productId', String(productId))
    connectURL.searchParams.set('returnTo', returnTo)
    connectURL.searchParams.set('tenantId', String(tenantId))

    return NextResponse.json(
      {
        connectUrl: connectURL.toString(),
        needsConnection: true,
        success: false,
      },
      { status: 409 },
    )
  }

  try {
    const result = await publishProductToPinterest({
      connection,
      payload,
      product,
      tenant,
    })

    return NextResponse.json({
      ...result,
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Không thể đăng Pinterest.',
        success: false,
      },
      { status: 500 },
    )
  }
}
