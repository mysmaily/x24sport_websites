import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import type { TenantPinterestConnection } from '../../../../../payload-types'
import {
  exchangePinterestCode,
  getPinterestUserAccount,
  mapTokenFields,
  mapTokenFieldsForEnvironment,
} from '../../../../../pinterest/client'
import { parsePinterestOAuthState, sanitizeReturnTo } from '../../../../../pinterest/oauth'
import { publishProductToPinterest } from '../../../../../pinterest/publish'
import { buildPublicURL } from '../../../../../pinterest/serverURL'

const redirectWithStatus = (path: string, params: Record<string, string>) => {
  const url = buildPublicURL(path)
  ;['pinterest', 'reason', 'pinId', 'pinURL', 'productId', 'boardId', 'boardName'].forEach(
    (key) => {
      url.searchParams.delete(key)
    },
  )

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const payload = await getPayload({
    config: configPromise,
  })

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
  const environment = state.environment || 'production'
  const normalizedTenantId = Number(state.tenantId)

  if (!Number.isFinite(normalizedTenantId)) {
    return NextResponse.json({ error: 'Invalid tenant ID in OAuth state.' }, { status: 400 })
  }

  try {
    const tokens = await exchangePinterestCode({
      code,
      environment,
    })
    const tokenFields = mapTokenFields(tokens)
    const environmentTokenFields = mapTokenFieldsForEnvironment(environment, tokenFields)
    const account = await getPinterestUserAccount({
      accessToken: tokenFields.accessToken || '',
      environment,
    })

    const connectionData = {
      ...environmentTokenFields,
      pinterestAccountId: account.id || '',
      pinterestUsername: account.username || '',
      tenant: normalizedTenantId,
    }

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
        environment,
        payload,
        product,
        tenant,
      })

      return redirectWithStatus(returnTo, {
        boardId: result.boardId,
        boardName: result.boardName,
        pinterest: environment === 'sandbox' ? 'sandbox-connected' : 'connected',
        pinId: result.pinId,
        pinURL: result.pinURL,
        productId: result.productId,
      })
    }

    return redirectWithStatus(returnTo, {
      pinterest: environment === 'sandbox' ? 'sandbox-connected' : 'connected',
    })
  } catch (error) {
    return redirectWithStatus(returnTo, {
      pinterest: 'error',
      reason: error instanceof Error ? error.message : 'Pinterest callback failed.',
    })
  }
}
