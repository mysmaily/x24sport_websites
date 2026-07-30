import { notFound } from 'next/navigation'

import MayaoCauLongOrderPage, { metadata } from '../_mayaocaulong/dat-may-ao-cau-long/page'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaocaulong') return {}
  return metadata
}

export default async function TenantOrderPage({ params }: Props) {
  if ((await params).tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongOrderPage />
}
