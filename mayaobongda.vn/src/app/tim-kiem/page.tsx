import type { Metadata } from 'next'

import { CatalogPageView } from '@/components/catalog-page-view'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams
  const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
  return {
    title: search ? `Tìm mẫu áo bóng đá: ${search}` : 'Tìm kiếm mẫu áo bóng đá',
    description: 'Tìm mẫu áo bóng đá theo tên sản phẩm, màu sắc và tag ảnh sản phẩm.',
    alternates: { canonical: '/tim-kiem/' },
    robots: search ? { index: false, follow: true } : undefined,
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const q = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
  return <CatalogPageView breadcrumbLabel="Tìm kiếm" canonicalPath="/tim-kiem/" description="Kết quả được lọc theo tên sản phẩm, tag sản phẩm và tag của ảnh trong gallery." heading={q.trim() ? `Kết quả tìm kiếm: ${q.trim()}` : 'Tìm kiếm mẫu áo bóng đá'} page={page} search={q} searchAction="/tim-kiem/" />
}
