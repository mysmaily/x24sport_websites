import { notFound } from 'next/navigation'

import Page, { metadata } from '../_mayaobongda/bang-gia-may-ao-bong-da/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'
import { X24PricingPage, x24PricingMetadata, x24PricingPages } from '../_x24sport/pricing-page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return x24PricingMetadata(x24PricingPages.football)
  if (tenant !== 'mayaobongda') return {}
  return metadata
}

export default async function TenantFootballPricingPage({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24PricingPage page={x24PricingPages.football} />
  if (tenant !== 'mayaobongda') notFound()
  return <MayaoBongDaShell><Page /></MayaoBongDaShell>
}
