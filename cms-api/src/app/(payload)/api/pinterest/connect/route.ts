import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { isAdminRole } from '../../../../../access/roles'
import {
  buildPinterestOAuthState,
  buildPinterestOAuthURL,
  normalizePinterestEnvironment,
  sanitizeReturnTo,
} from '../../../../../pinterest/oauth'

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
  const tenantId = searchParams.get('tenantId')
  const productId = searchParams.get('productId')
  const environment = normalizePinterestEnvironment(searchParams.get('environment'))
  const returnTo = sanitizeReturnTo(searchParams.get('returnTo'))

  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenantId.' }, { status: 400 })
  }

  const state = buildPinterestOAuthState({
    environment,
    ...(productId ? { productId } : {}),
    returnTo,
    tenantId,
  })

  return NextResponse.redirect(buildPinterestOAuthURL(state))
}
