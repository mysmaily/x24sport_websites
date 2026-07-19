import type { Metadata } from 'next'

import { CatalogPageView } from '@/components/catalog-page-view'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
  const canonical = page > 1 ? `/san-pham/?page=${page}` : '/san-pham/'
  return {
    title: `Sản phẩm${page > 1 ? ` - Trang ${page}` : ''}`,
    description: 'Bộ sưu tập áo bóng đá thiết kế sẵn và có thể tùy chỉnh theo màu sắc, logo, tên số và nhóm sử dụng.',
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
