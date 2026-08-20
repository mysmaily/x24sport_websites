const MAYAODONGPHUC_DOMAIN = 'mayaodongphuc.com.vn'

function requestHostname(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || request.headers.get('host') || new URL(request.url).host

  return host.split(':')[0].toLowerCase().replace(/^www\./, '')
}

export function GET(request: Request) {
  const iconPath = requestHostname(request) === MAYAODONGPHUC_DOMAIN
    ? '/images/mayaodongphuc/favicon.svg'
    : '/icon.png'

  return new Response(null, {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=3600',
      Location: iconPath,
    },
  })
}
