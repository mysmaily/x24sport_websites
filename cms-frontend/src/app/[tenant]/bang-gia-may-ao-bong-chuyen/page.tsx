import { notFound } from 'next/navigation'

import Page, { metadata } from '../_mayaobongchuyen/bang-gia-may-ao-bong-chuyen/page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaobongchuyen') return {}
  return metadata
}

export default async function TenantVolleyballPricingPage({ params }: Props) {
  if ((await params).tenant !== 'mayaobongchuyen') notFound()
  return <Page />
}
