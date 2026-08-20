import { notFound } from 'next/navigation'

import X24SearchPage, { generateMetadata as generateX24SearchMetadata } from '../../tim-kiem/page'
import MayaoCauLongSearchPage, { generateMetadata as generateMayaoCauLongSearchMetadata } from '../_mayaocaulong/tim-kiem/page'
import MayaoPickleballSearchPage, { generateMetadata as generateMayaoPickleballSearchMetadata } from '../_mayaopickleball/tim-kiem/page'
import MayaoBongChuyenSearchPage, { generateMetadata as generateMayaoBongChuyenSearchMetadata } from '../_mayaobongchuyen/tim-kiem/page'
import MayaoBongRoSearchPage, { generateMetadata as generateMayaoBongRoSearchMetadata } from '../_mayaobongro/tim-kiem/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'
import MayaoChayBoSearchPage, { generateMetadata as generateMayaoChayBoSearchMetadata } from '../_mayaochaybo/tim-kiem/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'
import MayaoBongDaSearchPage, { generateMetadata as generateMayaoBongDaSearchMetadata } from '../_mayaobongda/tim-kiem/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'
import { getMayAoDongPhucCatalogMetadata, MayAoDongPhucCatalogPage } from '../_mayaodongphuc/catalog-page'

type Props = Parameters<typeof X24SearchPage>[0] & {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const tenant = (await params).tenant
  if (tenant === 'x24sport') return generateX24SearchMetadata({ searchParams })
  if (tenant === 'mayaopickleball') return generateMayaoPickleballSearchMetadata({ searchParams })
  if (tenant === 'mayaobongchuyen') return generateMayaoBongChuyenSearchMetadata({ searchParams })
  if (tenant === 'mayaobongro') return generateMayaoBongRoSearchMetadata({ searchParams })
  if (tenant === 'mayaochaybo') return generateMayaoChayBoSearchMetadata({ searchParams })
  if (tenant === 'mayaobongda') return generateMayaoBongDaSearchMetadata({ searchParams })
  if (tenant === 'mayaodongphuc') return getMayAoDongPhucCatalogMetadata(undefined, await searchParams)
  if (tenant !== 'mayaocaulong') return {}
  return generateMayaoCauLongSearchMetadata({ searchParams })
}

export default async function TenantSearchPage({ params, searchParams }: Props) {
  const tenant = (await params).tenant
  if (tenant === 'x24sport') return <X24SearchPage searchParams={searchParams} />
  if (tenant === 'mayaopickleball') return <MayaoPickleballSearchPage searchParams={searchParams} />
  if (tenant === 'mayaobongchuyen') return <MayaoBongChuyenSearchPage searchParams={searchParams} />
  if (tenant === 'mayaobongro') return <MayaoBongRoShell><MayaoBongRoSearchPage searchParams={searchParams} /></MayaoBongRoShell>
  if (tenant === 'mayaochaybo') return <MayaoChayBoShell><MayaoChayBoSearchPage searchParams={searchParams} /></MayaoChayBoShell>
  if (tenant === 'mayaobongda') return <MayaoBongDaShell><MayaoBongDaSearchPage searchParams={searchParams} /></MayaoBongDaShell>
  if (tenant === 'mayaodongphuc') return <MayAoDongPhucCatalogPage search={await searchParams} />
  if (tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongSearchPage searchParams={searchParams} />
}
