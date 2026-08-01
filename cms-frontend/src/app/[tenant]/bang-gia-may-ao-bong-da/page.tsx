import { notFound } from 'next/navigation'

import Page, { metadata } from '../_mayaobongda/bang-gia-may-ao-bong-da/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaobongda') return {}
  return metadata
}

export default async function TenantFootballPricingPage({ params }: Props) {
  if ((await params).tenant !== 'mayaobongda') notFound()
  return <MayaoBongDaShell><Page /></MayaoBongDaShell>
}
