const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const getPublicServerURL = () => {
  const configured =
    process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_SERVER_URL?.trim()

  if (configured) return trimTrailingSlash(configured)

  return 'https://cms.x24sport.vn'
}

export const buildPublicURL = (path: string) => new URL(path, `${getPublicServerURL()}/`)
