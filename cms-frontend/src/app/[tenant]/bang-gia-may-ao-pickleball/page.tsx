import { notFound } from 'next/navigation'

import MayaoPickleballPricingPage, { metadata } from '../_mayaopickleball/bang-gia-may-ao-pickleball/page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaopickleball') return {}
  return metadata
}

export default async function TenantPickleballPricingPage({ params }: Props) {
  if ((await params).tenant !== 'mayaopickleball') notFound()
  return <MayaoPickleballPricingPage />
}
