import { notFound } from 'next/navigation'

import MayaoCauLongPricingPage, { metadata } from '../_mayaocaulong/bang-gia-may-ao-cau-long/page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaocaulong') return {}
  return metadata
}

export default async function TenantPricingPage({ params }: Props) {
  if ((await params).tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongPricingPage />
}
