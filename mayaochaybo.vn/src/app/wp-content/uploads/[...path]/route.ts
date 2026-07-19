import { legacyMediaTarget } from '@/lib/legacy-content'

export const dynamic = 'force-dynamic'
async function redirectMedia(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const target = legacyMediaTarget(`/wp-content/uploads/${path.join('/')}`)
  return target ? Response.redirect(target, 308) : new Response('Not found', { status: 404 })
}
export const GET = redirectMedia
export const HEAD = redirectMedia
