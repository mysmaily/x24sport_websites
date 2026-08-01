import { notFound } from 'next/navigation'

import Page from '../_mayaobongro/bang-gia-may-ao-bong-ro/page'
import { metadata as basketballMetadata } from '../_mayaobongro/bang-gia-may-ao-bong-ro/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'
import { X24PricingPage, x24PricingMetadata, x24PricingPages } from '../_x24sport/pricing-page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return x24PricingMetadata(x24PricingPages.basketball)
  if (tenant !== 'mayaobongro') return {}
  return basketballMetadata
}

export default async function TenantStaticPage({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24PricingPage page={x24PricingPages.basketball} />
  if (tenant !== 'mayaobongro') notFound()
  return <MayaoBongRoShell><Page /></MayaoBongRoShell>
}
