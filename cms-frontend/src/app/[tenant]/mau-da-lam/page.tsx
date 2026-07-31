import { notFound } from 'next/navigation'

import MayaoCauLongSamplesPage, { generateMetadata as generateMayaoCauLongSamplesMetadata } from '../_mayaocaulong/mau-da-lam/page'
import MayaoPickleballSamplesPage, { generateMetadata as generateMayaoPickleballSamplesMetadata } from '../_mayaopickleball/mau-da-lam/page'
import MayaoBongChuyenContentPage, { generateMetadata as generateMayaoBongChuyenContentMetadata } from '../_mayaobongchuyen/[slug]/page'
import MayaoBongRoSamplesPage, { metadata as mayaoBongRoSamplesMetadata } from '../_mayaobongro/mau-da-lam/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'

type Props = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ page?: string | string[] }>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const tenant = (await params).tenant
  if (tenant === 'mayaopickleball') return generateMayaoPickleballSamplesMetadata({ searchParams })
  if (tenant === 'mayaobongchuyen') return generateMayaoBongChuyenContentMetadata({ params: Promise.resolve({ slug: 'mau-da-lam' }) })
  if (tenant === 'mayaobongro') return mayaoBongRoSamplesMetadata
  if (tenant !== 'mayaocaulong') return {}
  return generateMayaoCauLongSamplesMetadata({ searchParams })
}

export default async function TenantSamplesPage({ params, searchParams }: Props) {
  const tenant = (await params).tenant
  if (tenant === 'mayaopickleball') return <MayaoPickleballSamplesPage searchParams={searchParams} />
  if (tenant === 'mayaobongchuyen') return <MayaoBongChuyenContentPage params={Promise.resolve({ slug: 'mau-da-lam' })} />
  if (tenant === 'mayaobongro') return <MayaoBongRoShell><MayaoBongRoSamplesPage /></MayaoBongRoShell>
  if (tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongSamplesPage searchParams={searchParams} />
}
