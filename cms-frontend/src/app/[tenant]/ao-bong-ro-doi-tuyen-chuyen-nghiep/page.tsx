import { notFound } from 'next/navigation'

import Page from '../_mayaobongro/ao-bong-ro-doi-tuyen-chuyen-nghiep/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'

export { metadata } from '../_mayaobongro/ao-bong-ro-doi-tuyen-chuyen-nghiep/page'

export default async function TenantStaticPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongro') notFound()
  return <MayaoBongRoShell><Page /></MayaoBongRoShell>
}
