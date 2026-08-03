import type { Metadata } from 'next'

import { CatalogPageView } from '../components/catalog-page-view'

export const revalidate = 180

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
  const canonical = page > 1 ? `/san-pham/?page=${page}` : '/san-pham/'
  return {
    title: `Mẫu Áo Bóng Đá Thiết Kế${page > 1 ? ` - Trang ${page}` : ''}`,
    description: 'Xem mẫu áo bóng đá thiết kế sẵn, áo không logo và bộ đồ thi đấu có thể chỉnh màu, logo, tên số theo đội.',
    alternates: { canonical },
    robots: search ? { index: false, follow: true } : undefined,
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const q = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
  return <CatalogPageView canonicalPath="/san-pham/" page={page} search={q} />
}
