import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import X24ProductsPage, { getX24ProductsMetadata } from '../../san-pham/page'
import { RynoProductsPage } from '../ryno-catalog'
import MayaoCauLongProductsPage, { generateMetadata as getMayaoCauLongProductsMetadata } from '../_mayaocaulong/san-pham/page'

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>
}): Promise<Metadata> {
  const { tenant } = await params
  if (tenant === 'mayaocaulong') return getMayaoCauLongProductsMetadata({ searchParams })
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
  if (tenant === 'rynosport') return <RynoProductsPage searchParams={props.searchParams} />
  if (tenant !== 'x24sport') notFound()
  return <X24ProductsPage searchParams={props.searchParams} />
}
