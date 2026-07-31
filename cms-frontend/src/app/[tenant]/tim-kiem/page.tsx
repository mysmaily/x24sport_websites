import { notFound } from 'next/navigation'

import X24SearchPage, { generateMetadata as generateX24SearchMetadata } from '../../tim-kiem/page'
import MayaoCauLongSearchPage, { generateMetadata as generateMayaoCauLongSearchMetadata } from '../_mayaocaulong/tim-kiem/page'
import MayaoPickleballSearchPage, { generateMetadata as generateMayaoPickleballSearchMetadata } from '../_mayaopickleball/tim-kiem/page'

type Props = Parameters<typeof X24SearchPage>[0] & {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const tenant = (await params).tenant
  if (tenant === 'x24sport') return generateX24SearchMetadata({ searchParams })
  if (tenant === 'mayaopickleball') return generateMayaoPickleballSearchMetadata({ searchParams })
  if (tenant !== 'mayaocaulong') return {}
  return generateMayaoCauLongSearchMetadata({ searchParams })
}

export default async function TenantSearchPage({ params, searchParams }: Props) {
  const tenant = (await params).tenant
  if (tenant === 'x24sport') return <X24SearchPage searchParams={searchParams} />
  if (tenant === 'mayaopickleball') return <MayaoPickleballSearchPage searchParams={searchParams} />
  if (tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongSearchPage searchParams={searchParams} />
}
