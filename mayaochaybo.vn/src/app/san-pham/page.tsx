import type { Metadata } from 'next'

import { CatalogPageView } from '@/components/catalog-page-view'
import { DEFAULT_OG_IMAGE } from '@/lib/site'

export const dynamic = 'force-dynamic'
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
  const canonical = page > 1 ? `/san-pham/?page=${page}` : '/san-pham/'
  const title = `603 Mẫu Áo Chạy Bộ Thiết Kế Riêng${page > 1 ? ` – Trang ${page}` : ''}`
  const description = 'Khám phá mẫu áo chạy bộ cho công ty, giải chạy, event và đội nhóm; lọc theo kiểu áo, màu sắc và tùy chỉnh thiết kế theo yêu cầu.'
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, images: [DEFAULT_OG_IMAGE], url: canonical },
    robots: search ? { index: false, follow: true } : undefined,
    twitter: { card: 'summary_large_image', title, description, images: [DEFAULT_OG_IMAGE.url] },
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const q = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
  return <CatalogPageView canonicalPath="/san-pham/" page={page} search={q} />
}
