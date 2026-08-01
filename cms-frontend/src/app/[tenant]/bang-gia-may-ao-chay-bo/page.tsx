import { notFound } from 'next/navigation'

import Page, { metadata } from '../_mayaochaybo/bang-gia-may-ao-chay-bo/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'
import { X24PricingPage, x24PricingMetadata, x24PricingPages } from '../_x24sport/pricing-page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return x24PricingMetadata(x24PricingPages.running)
  if (tenant !== 'mayaochaybo') return {}
  return metadata
}

export default async function TenantRunningPricingPage({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24PricingPage page={x24PricingPages.running} />
  if (tenant !== 'mayaochaybo') notFound()
  return <MayaoChayBoShell><Page /></MayaoChayBoShell>
}
