import type { Metadata } from 'next'
import X24ProductsPage, { getX24ProductsMetadata } from '../../san-pham/page'
import { RynoProductsPage } from '../ryno-catalog'
import MayaoCauLongProductsPage, { generateMetadata as getMayaoCauLongProductsMetadata } from '../_mayaocaulong/san-pham/page'
import MayaoPickleballProductsPage, { metadata as mayaoPickleballProductsMetadata } from '../_mayaopickleball/san-pham/page'
import MayaoBongRoProductsPage, { generateMetadata as getMayaoBongRoProductsMetadata } from '../_mayaobongro/san-pham/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'
import MayaoChayBoProductsPage, { generateMetadata as getMayaoChayBoProductsMetadata } from '../_mayaochaybo/san-pham/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'
import MayaoBongDaProductsPage, { generateMetadata as getMayaoBongDaProductsMetadata } from '../_mayaobongda/san-pham/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>
}): Promise<Metadata> {
  const { tenant } = await params
  if (tenant === 'mayaocaulong') return getMayaoCauLongProductsMetadata({ searchParams })
  if (tenant === 'mayaopickleball') return mayaoPickleballProductsMetadata
  if (tenant === 'mayaobongro') return getMayaoBongRoProductsMetadata({ searchParams })
  if (tenant === 'mayaochaybo') return getMayaoChayBoProductsMetadata({ searchParams })
  if (tenant === 'mayaobongda') return getMayaoBongDaProductsMetadata({ searchParams })
  if (tenant === 'x24sport') return getX24ProductsMetadata(searchParams)
  if (tenant !== 'rynosport') return {}

  return {
    title: 'Sản phẩm RynoSport',
    description: 'Khám phá các mẫu trang phục thể thao RynoSport dành cho đội nhóm, câu lạc bộ và nhu cầu đặt áo đồng bộ.',
    alternates: { canonical: 'https://rynosport.vn/san-pham/' },
    openGraph: {
      title: 'Sản phẩm RynoSport',
      description: 'Các mẫu trang phục thể thao dành cho đội nhóm tại RynoSport.',
      url: 'https://rynosport.vn/san-pham/',
    },
  }
}

export default async function TenantProductsPage(props: Parameters<typeof X24ProductsPage>[0] & { params: Promise<{ tenant: string }> }) {
  const { tenant } = await props.params
  if (tenant === 'mayaocaulong') return <MayaoCauLongProductsPage searchParams={props.searchParams} />
  if (tenant === 'mayaopickleball') return <MayaoPickleballProductsPage searchParams={props.searchParams as Promise<{ page?: string }>} />
  if (tenant === 'mayaobongro') return <MayaoBongRoShell><MayaoBongRoProductsPage searchParams={props.searchParams} /></MayaoBongRoShell>
  if (tenant === 'mayaochaybo') return <MayaoChayBoShell><MayaoChayBoProductsPage searchParams={props.searchParams} /></MayaoChayBoShell>
  if (tenant === 'mayaobongda') return <MayaoBongDaShell><MayaoBongDaProductsPage searchParams={props.searchParams} /></MayaoBongDaShell>
  if (tenant === 'rynosport') return <RynoProductsPage searchParams={props.searchParams} />
  return <X24ProductsPage searchParams={props.searchParams} />
}
