import { notFound } from 'next/navigation'

import MayaoPickleballFabricPage, { metadata } from '../_mayaopickleball/chat-lieu-va-bang-size-ao-pickleball/page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaopickleball') return {}
  return metadata
}

export default async function TenantPickleballFabricPage({ params }: Props) {
  if ((await params).tenant !== 'mayaopickleball') notFound()
  return <MayaoPickleballFabricPage />
}
