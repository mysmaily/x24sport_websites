import { notFound } from 'next/navigation'

import MayaoPickleballPricingPage, { metadata } from '../_mayaopickleball/bang-gia-may-ao-pickleball/page'
import { X24PricingPage, x24PricingMetadata, x24PricingPages } from '../_x24sport/pricing-page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return x24PricingMetadata(x24PricingPages.pickleball)
  if (tenant !== 'mayaopickleball') return {}
  return metadata
}

export default async function TenantPickleballPricingPage({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24PricingPage page={x24PricingPages.pickleball} />
  if (tenant !== 'mayaopickleball') notFound()
  return <MayaoPickleballPricingPage />
}
