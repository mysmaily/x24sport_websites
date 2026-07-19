import type { Metadata } from 'next'

import { CatalogPageView } from '@/components/catalog-page-view'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
  const canonical = page > 1 ? `/shop/?page=${page}` : '/shop/'
  return {
    title: `Shop${page > 1 ? ` - Trang ${page}` : ''}`,
    description: 'Tất cả mẫu áo bóng đá trên Mayaobongda.vn.',
    alternates: { canonical },
    robots: search ? { index: false, follow: true } : undefined,
  }
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const q = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
  return <CatalogPageView canonicalPath="/shop/" page={page} search={q} />
}
