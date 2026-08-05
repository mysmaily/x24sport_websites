import { notFound } from 'next/navigation'

import Page from '../_mayaobongda/ao-bong-da-doi-bong-cau-lac-bo/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

export { generateMetadata } from '../_mayaobongda/ao-bong-da-doi-bong-cau-lac-bo/page'

export default async function TenantStaticPage({ params, searchParams }: { params: Promise<{ tenant: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongda') notFound()
  return <MayaoBongDaShell><Page searchParams={searchParams} /></MayaoBongDaShell>
}
