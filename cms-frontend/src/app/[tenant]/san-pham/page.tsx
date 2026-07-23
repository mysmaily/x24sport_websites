import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import X24ProductsPage from '../../san-pham/page'
import { RynoProductsPage } from '../ryno-catalog'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params
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
  if (tenant === 'rynosport') return <RynoProductsPage searchParams={props.searchParams} />
  if (tenant !== 'x24sport') notFound()
  return <X24ProductsPage searchParams={props.searchParams} />
}
