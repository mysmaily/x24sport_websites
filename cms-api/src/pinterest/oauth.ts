import crypto from 'crypto'

import { pinterestConfig } from './config'

type PinterestOAuthState = {
  productId?: number | string
  returnTo: string
  tenantId: number | string
  ts: number
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url')

const sign = (payload: string) =>
  crypto
    .createHmac('sha256', process.env.PAYLOAD_SECRET || '')
    .update(payload)
    .digest('base64url')

export const buildPinterestOAuthState = (state: Omit<PinterestOAuthState, 'ts'>) => {
  const payload = JSON.stringify({
    ...state,
    ts: Date.now(),
  })

  return `${base64url(payload)}.${sign(payload)}`
}

export const parsePinterestOAuthState = (encodedState: string): PinterestOAuthState => {
  const [payloadPart, signaturePart] = encodedState.split('.')

  if (!payloadPart || !signaturePart) {
    throw new Error('Pinterest OAuth state is malformed.')
  }

  const payload = Buffer.from(payloadPart, 'base64url').toString('utf8')
  const expectedSignature = sign(payload)

  if (signaturePart.length !== expectedSignature.length) {
    throw new Error('Pinterest OAuth state signature is invalid.')
  }

  if (!crypto.timingSafeEqual(Buffer.from(signaturePart), Buffer.from(expectedSignature))) {
    throw new Error('Pinterest OAuth state signature is invalid.')
  }

  const parsed = JSON.parse(payload) as PinterestOAuthState

  if (!parsed.tenantId || !parsed.returnTo || !parsed.ts) {
    throw new Error('Pinterest OAuth state is incomplete.')
  }

  if (Date.now() - parsed.ts > 1000 * 60 * 15) {
    throw new Error('Pinterest OAuth state has expired.')
  }

  return parsed
}

export const sanitizeReturnTo = (returnTo?: string | null) => {
  if (!returnTo) return '/admin/collections/products'
  if (!returnTo.startsWith('/')) return '/admin/collections/products'
  if (returnTo.startsWith('//')) return '/admin/collections/products'
  return returnTo
}

export const buildPinterestOAuthURL = (state: string) => {
  const params = new URLSearchParams({
    client_id: pinterestConfig.clientId(),
    redirect_uri: pinterestConfig.redirectURI(),
    response_type: 'code',
    scope: pinterestConfig.scopes.join(','),
    state,
  })

  return `https://www.pinterest.com/oauth/?${params.toString()}`
}
