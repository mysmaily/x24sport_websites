import { notFound } from 'next/navigation'

import Page from '../_mayaobongro/logo-team/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'

export { metadata } from '../_mayaobongro/logo-team/page'

export default async function TenantStaticPage({ params, searchParams }: { params: Promise<{ tenant: string }>; searchParams: Promise<{ page?: string; q?: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongro') notFound()
  return <MayaoBongRoShell><Page searchParams={searchParams} /></MayaoBongRoShell>
}
