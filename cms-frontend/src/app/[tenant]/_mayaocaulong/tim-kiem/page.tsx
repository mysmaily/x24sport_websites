import type { Metadata } from 'next'
import { CatalogPageContent } from '../san-pham/page'
import { getSearchProductsPage } from '../lib/content'

type SearchParams = { page?: string | string[]; q?: string | string[] }

function paramValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function parsePageNumber(value?: string | string[]) {
  const rawValue = paramValue(value)
  if (!rawValue || !/^\d+$/.test(rawValue)) return 1
  return Math.max(1, Number.parseInt(rawValue, 10))
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  const query = paramValue(params.q)?.trim() || ''
  return {
    title: query ? `Tìm mẫu áo cầu lông: ${query} | MayaoCauLong` : 'Tìm kiếm mẫu áo cầu lông | MayaoCauLong',
    description: 'Tìm mẫu áo cầu lông theo tên sản phẩm, màu sắc và chi tiết thiết kế.',
    alternates: { canonical: 'https://mayaocaulong.vn/tim-kiem' },
    robots: query ? { index: false, follow: true } : undefined,
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const query = paramValue(params.q)?.trim() || ''
  const requestedPage = parsePageNumber(params.page)
  const catalogPage = await getSearchProductsPage(requestedPage, query)

  return (
    <CatalogPageContent
      pagination={{ currentPage: catalogPage.page, totalPages: catalogPage.totalPages, totalProducts: catalogPage.totalProducts }}
      products={catalogPage.products}
      searchQuery={query}
      titleOverride={query ? `Kết quả tìm kiếm: ${query}` : 'Tìm kiếm mẫu áo cầu lông'}
      subtitleOverride="Kết quả được lọc theo tên sản phẩm, màu áo và chi tiết thiết kế trong dữ liệu sản phẩm."
    />
  )
}
