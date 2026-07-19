const requiredEnv = (name: string) => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Pinterest environment variable: ${name}`)
  }

  return value
}

export const pinterestConfig = {
  clientId: () => requiredEnv('PINTEREST_CLIENT_ID'),
  clientSecret: () => requiredEnv('PINTEREST_CLIENT_SECRET'),
  redirectURI: () => requiredEnv('PINTEREST_REDIRECT_URI'),
  scopes: ['boards:read', 'boards:write', 'pins:read', 'pins:write', 'user_accounts:read'],
}
