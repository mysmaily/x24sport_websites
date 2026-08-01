import { notFound } from 'next/navigation'

import MayaoCauLongPricingPage, { metadata } from '../_mayaocaulong/bang-gia-may-ao-cau-long/page'
import { X24PricingPage, x24PricingMetadata, x24PricingPages } from '../_x24sport/pricing-page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return x24PricingMetadata(x24PricingPages.badminton)
  if (tenant !== 'mayaocaulong') return {}
  return metadata
}

export default async function TenantPricingPage({ params }: Props) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24PricingPage page={x24PricingPages.badminton} />
  if (tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongPricingPage />
}
