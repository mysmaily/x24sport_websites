import type { Metadata } from 'next'

import { CatalogPageView } from '../components/catalog-page-view'
import { DEFAULT_OG_IMAGE } from '../lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mẫu Áo Chạy Bộ Được Xem Nhiều',
  description: 'Các mẫu áo chạy bộ được nhiều khách tham khảo khi chọn thiết kế cho đội nhóm, câu lạc bộ, công ty và giải chạy.',
  alternates: { canonical: '/mau-ao-chay-bo-duoc-xem-nhieu/' },
  openGraph: {
    title: 'Mẫu Áo Chạy Bộ Được Xem Nhiều',
    description: 'Tham khảo những mẫu áo chạy bộ đang được quan tâm nhiều để chọn hướng thiết kế phù hợp cho đội hoặc sự kiện.',
    images: [DEFAULT_OG_IMAGE],
    url: '/mau-ao-chay-bo-duoc-xem-nhieu/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mẫu Áo Chạy Bộ Được Xem Nhiều',
    description: 'Tham khảo những mẫu áo chạy bộ đang được quan tâm nhiều tại MayAoChayBo.vn.',
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default async function PopularRunningShirtsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
  return <CatalogPageView
    breadcrumbLabel="Mẫu áo chạy bộ được xem nhiều"
    canonicalPath="/mau-ao-chay-bo-duoc-xem-nhieu/"
    description="Những mẫu áo chạy bộ được nhiều khách tham khảo khi chọn phối màu, kiểu áo và ý tưởng thiết kế cho đội hoặc sự kiện."
    heading="Mẫu áo chạy bộ được xem nhiều"
    page={page}
    search={search}
    searchAction="/mau-ao-chay-bo-duoc-xem-nhieu/"
    sort="popular"
  />
}
