import { notFound } from 'next/navigation'

import Page, { metadata } from '../_mayaobongchuyen/bang-gia-may-ao-bong-chuyen/page'
import { X24PricingPage, x24PricingMetadata, x24PricingPages } from '../_x24sport/pricing-page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return x24PricingMetadata(x24PricingPages.volleyball)
  if (tenant !== 'mayaobongchuyen') return {}
  return metadata
}

export default async function TenantVolleyballPricingPage({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24PricingPage page={x24PricingPages.volleyball} />
  if (tenant !== 'mayaobongchuyen') notFound()
  return <Page />
}
