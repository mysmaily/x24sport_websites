import { notFound } from 'next/navigation'

import { GET as getMayaoChayBoMedia, HEAD as headMayaoChayBoMedia } from '../../../_mayaochaybo/wp-content/uploads/[...path]/route'

type Context = { params: Promise<{ tenant: string; path: string[] }> }

async function withTenant(handler: (request: Request, context: { params: Promise<{ path: string[] }> }) => Promise<Response>, request: Request, context: Context) {
  const { tenant, path } = await context.params
  if (tenant !== 'mayaochaybo') notFound()
  return handler(request, { params: Promise.resolve({ path }) })
}

export function GET(request: Request, context: Context) {
  return withTenant(getMayaoChayBoMedia, request, context)
}

export function HEAD(request: Request, context: Context) {
  return withTenant(headMayaoChayBoMedia, request, context)
}
