import { notFound } from 'next/navigation'

import Page from '../_mayaobongro/ao-bong-ro-giai-dau-su-kien/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'

export { metadata } from '../_mayaobongro/ao-bong-ro-giai-dau-su-kien/page'

export default async function TenantStaticPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongro') notFound()
  return <MayaoBongRoShell><Page /></MayaoBongRoShell>
}
