import { notFound } from 'next/navigation'

import MayaoPickleballOrderPage, { metadata } from '../_mayaopickleball/dat-may-ao-pickleball/page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaopickleball') return {}
  return metadata
}

export default async function TenantPickleballOrderPage({ params }: Props) {
  if ((await params).tenant !== 'mayaopickleball') notFound()
  return <MayaoPickleballOrderPage />
}
