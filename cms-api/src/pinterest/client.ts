import type { Product, Tenant, TenantPinterestConnection } from '../payload-types'
import { pinterestConfig, type PinterestEnvironment } from './config'

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

type PinterestBoardListResponse = {
  bookmark?: string | null
  items?: PinterestBoard[]
}

type PinterestPin = {
  board_id?: string
  created_at?: string
  id: string
}

type PinterestConnectionTokenState = {
  accessToken?: string | null
  refreshToken?: string | null
  scope?: string | null
  tokenExpiresAt?: string | null
  refreshTokenExpiresAt?: string | null
}

const basicAuthorizationHeader = () =>
  `Basic ${Buffer.from(
    `${pinterestConfig.clientId()}:${pinterestConfig.clientSecret()}`,
  ).toString('base64')}`

const encodeForm = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

const getPinterestAPIBaseURL = (environment: PinterestEnvironment) =>
  environment === 'sandbox'
    ? 'https://api-sandbox.pinterest.com/v5'
    : 'https://api.pinterest.com/v5'

const callPinterest = async <T>({
  accessToken,
  body,
  environment = 'production',
  method = 'GET',
  path,
}: {
  accessToken?: string
  body?: Record<string, unknown>
  environment?: PinterestEnvironment
  method?: 'GET' | 'POST'
  path: string
}) => {
  const response = await fetch(`${getPinterestAPIBaseURL(environment)}${path}`, {
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

export const exchangePinterestCode = async ({
  code,
  environment = 'production',
}: {
  code: string
  environment?: PinterestEnvironment
}) => {
  const response = await fetch(`${getPinterestAPIBaseURL(environment)}/oauth/token`, {
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

export const refreshPinterestAccessToken = async ({
  environment = 'production',
  refreshToken,
}: {
  environment?: PinterestEnvironment
  refreshToken: string
}) => {
  const response = await fetch(`${getPinterestAPIBaseURL(environment)}/oauth/token`, {
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

export const getPinterestUserAccount = async ({
  accessToken,
  environment = 'production',
}: {
  accessToken: string
  environment?: PinterestEnvironment
}) =>
  callPinterest<PinterestUserAccount>({
    accessToken,
    environment,
    path: '/user_account',
  })

export const createPinterestBoard = async ({
  accessToken,
  description,
  environment = 'production',
  name,
}: {
  accessToken: string
  description?: string
  environment?: PinterestEnvironment
  name: string
}) =>
  callPinterest<PinterestBoard>({
    accessToken,
    body: {
      description,
      name,
    },
    environment,
    method: 'POST',
    path: '/boards',
  })

export const listPinterestBoards = async ({
  accessToken,
  bookmark,
  environment = 'production',
  pageSize = 100,
}: {
  accessToken: string
  bookmark?: string
  environment?: PinterestEnvironment
  pageSize?: number
}) => {
  const params = new URLSearchParams({
    page_size: String(pageSize),
  })

  if (bookmark) params.set('bookmark', bookmark)

  return callPinterest<PinterestBoardListResponse>({
    accessToken,
    environment,
    path: `/boards?${params.toString()}`,
  })
}

export const createPinterestPin = async ({
  accessToken,
  boardId,
  description,
  environment = 'production',
  imageUrl,
  link,
  title,
}: {
  accessToken: string
  boardId: string
  description: string
  environment?: PinterestEnvironment
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
    environment,
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

export const mapTokenFieldsForEnvironment = (
  environment: PinterestEnvironment,
  tokens: ReturnType<typeof mapTokenFields>,
) =>
  environment === 'sandbox'
    ? {
        ...(tokens.accessToken ? { sandboxAccessToken: tokens.accessToken } : {}),
        ...(tokens.refreshToken ? { sandboxRefreshToken: tokens.refreshToken } : {}),
        ...(tokens.scope ? { sandboxScope: tokens.scope } : {}),
        ...(tokens.tokenExpiresAt ? { sandboxTokenExpiresAt: tokens.tokenExpiresAt } : {}),
        ...(tokens.refreshTokenExpiresAt
          ? { sandboxRefreshTokenExpiresAt: tokens.refreshTokenExpiresAt }
          : {}),
      }
    : tokens

const getConnectionTokenState = (
  connection: TenantPinterestConnection,
  environment: PinterestEnvironment,
): PinterestConnectionTokenState =>
  environment === 'sandbox'
    ? {
        accessToken: connection.sandboxAccessToken,
        refreshToken: connection.sandboxRefreshToken,
        refreshTokenExpiresAt: connection.sandboxRefreshTokenExpiresAt,
        scope: connection.sandboxScope,
        tokenExpiresAt: connection.sandboxTokenExpiresAt,
      }
    : {
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
        refreshTokenExpiresAt: connection.refreshTokenExpiresAt,
        scope: connection.scope,
        tokenExpiresAt: connection.tokenExpiresAt,
      }

export const ensureFreshPinterestToken = async ({
  connection,
  environment = 'production',
  updateConnection,
}: {
  connection: TenantPinterestConnection
  environment?: PinterestEnvironment
  updateConnection: (data: Partial<TenantPinterestConnection>) => Promise<void>
}) => {
  const tokenState = getConnectionTokenState(connection, environment)
  const expiresAt = tokenState.tokenExpiresAt ? new Date(tokenState.tokenExpiresAt).getTime() : 0
  const shouldRefresh = Boolean(
    tokenState.refreshToken &&
      (!tokenState.accessToken || !expiresAt || expiresAt - Date.now() < 1000 * 60 * 5),
  )

  if (shouldRefresh && tokenState.refreshToken) {
    const refreshed = await refreshPinterestAccessToken({
      environment,
      refreshToken: tokenState.refreshToken,
    })
    const tokenFields = mapTokenFieldsForEnvironment(environment, mapTokenFields(refreshed))
    await updateConnection(tokenFields)
    const refreshedState = {
      ...tokenState,
      ...getConnectionTokenState({ ...connection, ...tokenFields } as TenantPinterestConnection, environment),
    }
    return refreshedState.accessToken || ''
  }

  if (!tokenState.accessToken) {
    throw new Error('Tenant chưa có Pinterest access token.')
  }

  return tokenState.accessToken
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
  environment = 'production',
  tenant,
  updateConnection,
}: {
  accessToken: string
  connection: TenantPinterestConnection
  environment?: PinterestEnvironment
  tenant: Tenant
  updateConnection: (data: Partial<TenantPinterestConnection>) => Promise<void>
}) => {
  const defaultBoardId =
    environment === 'sandbox' ? connection.sandboxDefaultBoardId : connection.defaultBoardId
  const defaultBoardName =
    environment === 'sandbox' ? connection.sandboxDefaultBoardName : connection.defaultBoardName

  if (defaultBoardId) {
    return {
      boardId: defaultBoardId,
      boardName: defaultBoardName || `${tenant.name} Products`,
    }
  }

  if (environment === 'sandbox') {
    const sandboxBoardName = `${tenant.name} Sandbox`
    let bookmark: string | undefined

    do {
      const response = await listPinterestBoards({
        accessToken,
        bookmark,
        environment,
      })

      const matchedBoard = (response.items || []).find((board) => board.name === sandboxBoardName)

      if (matchedBoard) {
        await updateConnection({
          sandboxDefaultBoardId: matchedBoard.id,
          sandboxDefaultBoardName: matchedBoard.name || sandboxBoardName,
        })

        return {
          boardId: matchedBoard.id,
          boardName: matchedBoard.name || sandboxBoardName,
        }
      }

      bookmark = response.bookmark || undefined
    } while (bookmark)

    const board = await createPinterestBoard({
      accessToken,
      description: `Board sandbox đồng bộ sản phẩm từ tenant ${tenant.slug}.`,
      environment,
      name: sandboxBoardName,
    })

    await updateConnection({
      sandboxDefaultBoardId: board.id,
      sandboxDefaultBoardName: board.name || sandboxBoardName,
    })

    return {
      boardId: board.id,
      boardName: board.name || sandboxBoardName,
    }
  }

  const desiredBoardName = `${tenant.name} Products`
  let bookmark: string | undefined

  do {
    const response = await listPinterestBoards({
      accessToken,
      bookmark,
      environment,
    })

    const matchedBoard = (response.items || []).find((board) => board.name === desiredBoardName)

    if (matchedBoard) {
      await updateConnection({
        defaultBoardId: matchedBoard.id,
        defaultBoardName: matchedBoard.name || desiredBoardName,
      })

      return {
        boardId: matchedBoard.id,
        boardName: matchedBoard.name || desiredBoardName,
      }
    }

    bookmark = response.bookmark || undefined
  } while (bookmark)

  const board = await createPinterestBoard({
    accessToken,
    description: `Board đồng bộ sản phẩm từ tenant ${tenant.slug}.`,
    environment,
    name: desiredBoardName,
  })

  await updateConnection({
    defaultBoardId: board.id,
    defaultBoardName: board.name || desiredBoardName,
  })

  return {
    boardId: board.id,
    boardName: board.name || desiredBoardName,
  }
}
