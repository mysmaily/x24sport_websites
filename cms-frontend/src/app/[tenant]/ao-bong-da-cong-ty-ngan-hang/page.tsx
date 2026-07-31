import { notFound } from 'next/navigation'

import Page from '../_mayaobongda/ao-bong-da-cong-ty-ngan-hang/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

export { metadata } from '../_mayaobongda/ao-bong-da-cong-ty-ngan-hang/page'

export default async function TenantStaticPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongda') notFound()
  return <MayaoBongDaShell><Page /></MayaoBongDaShell>
}
