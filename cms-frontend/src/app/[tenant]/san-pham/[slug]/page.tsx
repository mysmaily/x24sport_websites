import X24ProductPage, { generateMetadata as generateX24ProductMetadata } from '../../../san-pham/[slug]/page'
import MayaoCauLongProductPage, { generateMetadata as generateMayaoCauLongProductMetadata } from '../../_mayaocaulong/san-pham/[slug]/page'
import MayaoPickleballProductPage, { generateMetadata as generateMayaoPickleballProductMetadata } from '../../_mayaopickleball/san-pham/[slug]/page'
import MayaoBongRoProductPage, { generateMetadata as generateMayaoBongRoProductMetadata } from '../../_mayaobongro/san-pham/[slug]/page'
import { MayaoBongRoShell } from '../../_mayaobongro/shell'
import MayaoChayBoProductPage, { generateMetadata as generateMayaoChayBoProductMetadata } from '../../_mayaochaybo/san-pham/[slug]/page'
import { MayaoChayBoShell } from '../../_mayaochaybo/shell'
import MayaoBongDaProductPage, { generateMetadata as generateMayaoBongDaProductMetadata } from '../../_mayaobongda/san-pham/[slug]/page'
import { MayaoBongDaShell } from '../../_mayaobongda/shell'
import MayaoBongChuyenProductPage, { generateMetadata as generateMayaoBongChuyenProductMetadata } from '../../_mayaobongchuyen/san-pham/[slug]/page'

type Props = {
  params: Promise<{ tenant: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'mayaodongphuc') {
    const { getMayAoDongPhucProductMetadata } = await import('../../_mayaodongphuc/product-page')
    return getMayAoDongPhucProductMetadata(slug)
  }
  if (tenant === 'pndsport') {
    const { getPndProductMetadata } = await import('../../_pndsport/product-page')
    return getPndProductMetadata(slug)
  }
  if (tenant === 'mayaocaulong') return generateMayaoCauLongProductMetadata({ params: Promise.resolve({ slug }) })
  if (tenant === 'mayaopickleball') return generateMayaoPickleballProductMetadata({ params: Promise.resolve({ slug }) })
  if (tenant === 'mayaobongro') return generateMayaoBongRoProductMetadata({ params: Promise.resolve({ slug }), searchParams })
  if (tenant === 'mayaochaybo') return generateMayaoChayBoProductMetadata({ params: Promise.resolve({ slug }) })
  if (tenant === 'mayaobongda') return generateMayaoBongDaProductMetadata({ params: Promise.resolve({ slug }) })
  if (tenant === 'mayaobongchuyen') return generateMayaoBongChuyenProductMetadata({ params: Promise.resolve({ slug }) })
  return generateX24ProductMetadata({ params: Promise.resolve({ slug }) })
}

export default async function TenantProductPage({ params, searchParams }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'mayaodongphuc') {
    const { MayAoDongPhucProductPage } = await import('../../_mayaodongphuc/product-page')
    return <MayAoDongPhucProductPage slug={slug} />
  }
  if (tenant === 'pndsport') {
    const { PndProductPage } = await import('../../_pndsport/product-page')
    return <PndProductPage slug={slug} />
  }
  if (tenant === 'mayaocaulong') return <MayaoCauLongProductPage params={Promise.resolve({ slug })} />
  if (tenant === 'mayaopickleball') return <MayaoPickleballProductPage params={Promise.resolve({ slug })} />
  if (tenant === 'mayaobongro') return <MayaoBongRoShell><MayaoBongRoProductPage params={Promise.resolve({ slug })} searchParams={searchParams} /></MayaoBongRoShell>
  if (tenant === 'mayaochaybo') return <MayaoChayBoShell><MayaoChayBoProductPage params={Promise.resolve({ slug })} /></MayaoChayBoShell>
  if (tenant === 'mayaobongda') return <MayaoBongDaShell><MayaoBongDaProductPage params={Promise.resolve({ slug })} /></MayaoBongDaShell>
  if (tenant === 'mayaobongchuyen') return <MayaoBongChuyenProductPage params={Promise.resolve({ slug })} />
  return <X24ProductPage params={Promise.resolve({ slug })} searchParams={searchParams} />
}
