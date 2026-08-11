import { notFound } from 'next/navigation'

import Page from '../_mayaobongda/thiet-ke-ao-bong-da-cong-ty/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

export { generateMetadata } from '../_mayaobongda/thiet-ke-ao-bong-da-cong-ty/page'

export default async function TenantStaticPage({ params, searchParams }: { params: Promise<{ tenant: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongda') notFound()
  return <MayaoBongDaShell><Page searchParams={searchParams} /></MayaoBongDaShell>
}
