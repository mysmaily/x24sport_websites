import { notFound } from 'next/navigation'

import MayaoCauLongSamplesPage, { generateMetadata as generateMayaoCauLongSamplesMetadata } from '../_mayaocaulong/mau-da-lam/page'

type Props = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

export async function generateMetadata({ params, searchParams }: Props) {
  if ((await params).tenant !== 'mayaocaulong') return {}
  return generateMayaoCauLongSamplesMetadata({ searchParams })
}

export default async function TenantSamplesPage({ params, searchParams }: Props) {
  if ((await params).tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongSamplesPage searchParams={searchParams} />
}
