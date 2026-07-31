import { notFound } from 'next/navigation'

import Page from '../_mayaobongro/chat-lieu-va-bang-size-ao-bong-ro/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'

export { metadata } from '../_mayaobongro/chat-lieu-va-bang-size-ao-bong-ro/page'

export default async function TenantStaticPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongro') notFound()
  return <MayaoBongRoShell><Page /></MayaoBongRoShell>
}
