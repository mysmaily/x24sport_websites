import type { Metadata } from 'next'

import { CatalogPageView } from '../components/catalog-page-view'
import { DEFAULT_OG_IMAGE } from '../lib/site'

export const revalidate = 300
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
  const sort = String(Array.isArray(query.sort) ? query.sort[0] : query.sort || '')
  const canonical = page > 1 ? `/san-pham/?page=${page}` : '/san-pham/'
  const title = `Mẫu áo chạy bộ thiết kế riêng${page > 1 ? ` – Trang ${page}` : ''}`
  const description = 'Xem mẫu áo chạy bộ cho công ty, giải chạy và đội nhóm; lọc theo kiểu, màu sắc và gửi mẫu cần chỉnh qua Zalo.'
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, images: [DEFAULT_OG_IMAGE], url: canonical },
    robots: search || sort ? { index: false, follow: true } : undefined,
    twitter: { card: 'summary_large_image', title, description, images: [DEFAULT_OG_IMAGE.url] },
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const q = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
  const sort = String(Array.isArray(query.sort) ? query.sort[0] : query.sort || '')
  return <CatalogPageView canonicalPath="/san-pham/" page={page} search={q} sort={sort === 'xem-nhieu' ? 'popular' : 'newest'} />
}
