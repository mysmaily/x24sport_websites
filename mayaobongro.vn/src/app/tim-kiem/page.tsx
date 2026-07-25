import type { Metadata } from 'next'

import { CatalogPageView } from '@/components/catalog-page-view'
import { DEFAULT_OG_IMAGE } from '@/lib/site'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ page?: string; q?: string }>

function pageNumber(value?: string) {
  return Math.max(1, Number.parseInt(value || '1', 10) || 1)
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams
  const search = params.q?.trim() || ''
  const title = search ? `Tìm mẫu áo bóng rổ: ${search}` : 'Tìm kiếm mẫu áo bóng rổ'
  const description = 'Tìm mẫu áo bóng rổ theo tên sản phẩm, màu sắc và tag ảnh sản phẩm.'
  return {
    title,
    description,
    alternates: { canonical: '/tim-kiem/' },
    robots: search ? { index: false, follow: true } : undefined,
    openGraph: { title, description, images: [DEFAULT_OG_IMAGE], url: '/tim-kiem/' },
  }
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const search = params.q?.trim() || ''
  return <CatalogPageView breadcrumbLabel="Tìm kiếm" canonicalPath="/tim-kiem/" description="Kết quả được lọc theo tên sản phẩm, tag sản phẩm và tag của ảnh trong gallery." heading={search ? `Kết quả tìm kiếm: ${search}` : 'Tìm kiếm mẫu áo bóng rổ'} page={pageNumber(params.page)} search={search} searchAction="/tim-kiem/" />
}
