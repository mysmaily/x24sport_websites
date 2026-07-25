import type { Metadata } from 'next'
import { CatalogPageContent } from '../san-pham/page'
import { searchProducts } from '../../lib/content'

type SearchParams = { page?: string; q?: string }

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  const query = params.q?.trim() || ''
  return {
    title: query ? `Tìm mẫu áo pickleball: ${query}` : 'Tìm kiếm mẫu áo pickleball',
    description: 'Tìm mẫu áo pickleball theo tên sản phẩm, màu sắc và tag ảnh sản phẩm.',
    alternates: { canonical: '/tim-kiem' },
    robots: query ? { index: false, follow: true } : undefined,
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const query = params.q?.trim() || ''
  const page = Math.max(1, Number(params.page) || 1)
  const paginated = await searchProducts(query, page)

  return (
    <CatalogPageContent
      paginated={paginated}
      searchQuery={query}
      titleOverride={query ? `Kết quả tìm kiếm: ${query}` : 'Tìm kiếm mẫu áo pickleball'}
      descriptionOverride="Kết quả được lọc theo tên sản phẩm, tag sản phẩm và tag của ảnh trong gallery."
    />
  )
}
