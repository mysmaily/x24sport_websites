import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isAdminRole } from '../../../../../access/roles'
import {
  exchangePinterestCode,
  getPinterestUserAccount,
  mapTokenFields,
} from '../../../../../pinterest/client'
import { parsePinterestOAuthState, sanitizeReturnTo } from '../../../../../pinterest/oauth'
import { publishProductToPinterest } from '../../../../../pinterest/publish'

const redirectWithStatus = (requestURL: string, path: string, params: Record<string, string>) => {
  const url = new URL(path, requestURL)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const encodedState = searchParams.get('state')

  if (!code || !encodedState) {
    return NextResponse.json({ error: 'Missing Pinterest OAuth callback params.' }, { status: 400 })
  }

  let state

  try {
    state = parsePinterestOAuthState(encodedState)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid Pinterest OAuth state.' },
      { status: 400 },
    )
  }

  const returnTo = sanitizeReturnTo(state.returnTo)
  const normalizedTenantId = Number(state.tenantId)

  if (!Number.isFinite(normalizedTenantId)) {
    return NextResponse.json({ error: 'Invalid tenant ID in OAuth state.' }, { status: 400 })
  }

  try {
    const tokens = await exchangePinterestCode(code)
    const tokenFields = mapTokenFields(tokens)
    const account = await getPinterestUserAccount(tokenFields.accessToken || '')

    const existing = await payload.find({
      collection: 'tenant-pinterest-connections',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        tenantConnectionKey: {
          equals: String(normalizedTenantId),
        },
      },
    })

    const connectionData = {
      ...tokenFields,
      pinterestAccountId: account.id || '',
      pinterestUsername: account.username || '',
      tenant: normalizedTenantId,
    }

    const connection =
      existing.docs[0]
        ? await payload.update({
            collection: 'tenant-pinterest-connections',
            data: connectionData,
            id: existing.docs[0].id,
            overrideAccess: true,
          })
        : await payload.create({
            collection: 'tenant-pinterest-connections',
            data: connectionData,
            overrideAccess: true,
          })

    if (state.productId) {
      const product = await payload.findByID({
        collection: 'products',
        depth: 2,
        id: state.productId,
        overrideAccess: true,
      })

      const tenantValue = product.tenant
      const tenantId =
        typeof tenantValue === 'object' && tenantValue && 'id' in tenantValue
          ? tenantValue.id
          : tenantValue

      if (!tenantId) {
        throw new Error('Không tìm thấy tenant của sản phẩm sau khi kết nối Pinterest.')
      }

      const tenant = await payload.findByID({
        collection: 'tenants',
        depth: 0,
        id: tenantId,
        overrideAccess: true,
      })

      const result = await publishProductToPinterest({
        connection,
        payload,
        product,
        tenant,
      })

      return redirectWithStatus(request.url, returnTo, {
        pinterest: 'connected',
        pinId: result.pinId,
      })
    }

    return redirectWithStatus(request.url, returnTo, {
      pinterest: 'connected',
    })
  } catch (error) {
    return redirectWithStatus(request.url, returnTo, {
      pinterest: 'error',
      reason: error instanceof Error ? error.message : 'Pinterest callback failed.',
    })
  }
}
