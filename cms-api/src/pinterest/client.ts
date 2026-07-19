import type { Product, Tenant, TenantPinterestConnection } from '../payload-types'
import { pinterestConfig } from './config'

type TokenResponse = {
  access_token: string
  expires_in?: number
  refresh_token?: string
  refresh_token_expires_at?: number
  refresh_token_expires_in?: number
  scope?: string
}

type PinterestUserAccount = {
  account_type?: string
  id?: string
  username?: string
}

type PinterestBoard = {
  description?: string | null
  id: string
  name?: string
}

type PinterestPin = {
  board_id?: string
  created_at?: string
  id: string
}

const basicAuthorizationHeader = () =>
  `Basic ${Buffer.from(
    `${pinterestConfig.clientId()}:${pinterestConfig.clientSecret()}`,
  ).toString('base64')}`

const encodeForm = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

const callPinterest = async <T>({
  accessToken,
  body,
  method = 'GET',
  path,
}: {
  accessToken?: string
  body?: Record<string, unknown>
  method?: 'GET' | 'POST'
  path: string
}) => {
  const response = await fetch(`https://api.pinterest.com/v5${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    method,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Pinterest API error (${response.status}): ${text}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const exchangePinterestCode = async (code: string) => {
  const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
    body: encodeForm({
      code,
      grant_type: 'authorization_code',
      redirect_uri: pinterestConfig.redirectURI(),
    }),
    headers: {
      Authorization: basicAuthorizationHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Pinterest token exchange failed: ${await response.text()}`)
  }

  return (await response.json()) as TokenResponse
}

export const refreshPinterestAccessToken = async (refreshToken: string) => {
  const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
    body: encodeForm({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: pinterestConfig.scopes.join(','),
    }),
    headers: {
      Authorization: basicAuthorizationHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Pinterest token refresh failed: ${await response.text()}`)
  }

  return (await response.json()) as TokenResponse
}

export const getPinterestUserAccount = async (accessToken: string) =>
  callPinterest<PinterestUserAccount>({
    accessToken,
    path: '/user_account',
  })

export const createPinterestBoard = async ({
  accessToken,
  description,
  name,
}: {
  accessToken: string
  description?: string
  name: string
}) =>
  callPinterest<PinterestBoard>({
    accessToken,
    body: {
      description,
      name,
    },
    method: 'POST',
    path: '/boards',
  })

export const createPinterestPin = async ({
  accessToken,
  boardId,
  description,
  imageUrl,
  link,
  title,
}: {
  accessToken: string
  boardId: string
  description: string
  imageUrl: string
  link: string
  title: string
}) =>
  callPinterest<PinterestPin>({
    accessToken,
    body: {
      board_id: boardId,
      description,
      link,
      media_source: {
        is_standard: true,
        source_type: 'image_url',
        url: imageUrl,
      },
      title,
    },
    method: 'POST',
    path: '/pins',
  })

const addSeconds = (seconds?: number) =>
  typeof seconds === 'number' ? new Date(Date.now() + seconds * 1000).toISOString() : undefined

const unixSecondsToISOString = (seconds?: number) =>
  typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : undefined

export const mapTokenFields = (tokens: TokenResponse) => ({
  ...(tokens.access_token ? { accessToken: tokens.access_token } : {}),
  ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
  ...(tokens.scope ? { scope: tokens.scope } : {}),
  ...(tokens.expires_in ? { tokenExpiresAt: addSeconds(tokens.expires_in) } : {}),
  ...(tokens.refresh_token_expires_at
    ? { refreshTokenExpiresAt: unixSecondsToISOString(tokens.refresh_token_expires_at) }
    : tokens.refresh_token_expires_in
      ? { refreshTokenExpiresAt: addSeconds(tokens.refresh_token_expires_in) }
      : {}),
})

export const ensureFreshPinterestToken = async ({
  connection,
  updateConnection,
}: {
  connection: TenantPinterestConnection
  updateConnection: (data: Partial<TenantPinterestConnection>) => Promise<void>
}) => {
  const expiresAt = connection.tokenExpiresAt ? new Date(connection.tokenExpiresAt).getTime() : 0
  const shouldRefresh = Boolean(
    connection.refreshToken &&
      (!connection.accessToken || !expiresAt || expiresAt - Date.now() < 1000 * 60 * 5),
  )

  if (shouldRefresh && connection.refreshToken) {
    const refreshed = await refreshPinterestAccessToken(connection.refreshToken)
    const tokenFields = mapTokenFields(refreshed)
    await updateConnection(tokenFields)
    return tokenFields.accessToken || connection.accessToken || ''
  }

  if (!connection.accessToken) {
    throw new Error('Tenant chưa có Pinterest access token.')
  }

  return connection.accessToken
}

const trimAndLimit = (value: string, maxLength: number) =>
  value.replace(/\s+/g, ' ').trim().slice(0, maxLength)

export const buildPinterestProductDescription = (product: Product, tenant: Tenant) => {
  const base =
    product.metaDescription ||
    product.shortDescription ||
    `Khám phá mẫu ${product.name} trên ${tenant.name}.`

  return trimAndLimit(base, 500)
}

export const getPrimaryProductImageURL = (product: Product) => {
  const gallery = (product.gallery || []).filter(
    (item): item is NonNullable<typeof item> & { url: string } =>
      Boolean(item && typeof item === 'object' && 'url' in item && item.url),
  )

  if (gallery[0]?.url) return gallery[0].url

  const legacyImage = (product.legacyImages || []).find((item) => item?.url)
  if (legacyImage?.url) return legacyImage.url

  return undefined
}

export const buildTenantProductPath = ({
  product,
  tenant,
}: {
  product: Product
  tenant: Tenant
}) => {
  const legacyPath = product.legacyPath?.trim()
  if (legacyPath?.startsWith('/')) return legacyPath

  if (tenant.slug === 'x24sport' || tenant.slug === 'mayaochaybo') {
    return `/${product.slug}/`
  }

  return `/san-pham/${product.slug}/`
}

export const buildTenantProductURL = ({
  product,
  tenant,
}: {
  product: Product
  tenant: Tenant
}) => {
  const rawDomain = tenant.domains?.[0]?.domain?.trim()
  if (!rawDomain) {
    throw new Error(`Tenant ${tenant.slug} chưa có domain để tạo link sản phẩm.`)
  }

  const domain = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`
  return new URL(buildTenantProductPath({ product, tenant }), domain).toString()
}

export const ensureTenantBoard = async ({
  accessToken,
  connection,
  tenant,
  updateConnection,
}: {
  accessToken: string
  connection: TenantPinterestConnection
  tenant: Tenant
  updateConnection: (data: Partial<TenantPinterestConnection>) => Promise<void>
}) => {
  if (connection.defaultBoardId) {
    return {
      boardId: connection.defaultBoardId,
      boardName: connection.defaultBoardName || `${tenant.name} Products`,
    }
  }

  const board = await createPinterestBoard({
    accessToken,
    description: `Board đồng bộ sản phẩm từ tenant ${tenant.slug}.`,
    name: `${tenant.name} Products`,
  })

  await updateConnection({
    defaultBoardId: board.id,
    defaultBoardName: board.name || `${tenant.name} Products`,
  })

  return {
    boardId: board.id,
    boardName: board.name || `${tenant.name} Products`,
  }
}
