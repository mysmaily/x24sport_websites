import { notFound } from 'next/navigation'

import MayaoCauLongFabricPage, { metadata } from '../_mayaocaulong/chat-lieu-va-bang-size-ao-cau-long/page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaocaulong') return {}
  return metadata
}

export default async function TenantFabricPage({ params }: Props) {
  if ((await params).tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongFabricPage />
}
