import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'

import { CatalogPageView } from '@/components/catalog-page-view'
import { getCatalogLandingByQuery } from '@/lib/catalog-colors'

export const dynamic = 'force-dynamic'

type CatalogSearchParams = Promise<{ page?: string; q?: string }>

function pageNumber(value?: string) {
  return Math.max(1, Number.parseInt(value || '1', 10) || 1)
}

export async function generateMetadata({ searchParams }: { searchParams: CatalogSearchParams }): Promise<Metadata> {
  const params = await searchParams
  const page = pageNumber(params.page)
  const search = params.q?.trim() || ''
  const canonical = page > 1 && !search ? `/san-pham/?page=${page}` : '/san-pham/'
  return {
    title: search ? `Tìm mẫu áo bóng rổ: ${search}` : `Mẫu Áo Bóng Rổ${page > 1 ? ` – Trang ${page}` : ''}`,
    description: search ? `Kết quả tìm mẫu áo bóng rổ theo từ khóa “${search}”.` : 'Khám phá bộ sưu tập mẫu đồng phục bóng rổ thiết kế theo yêu cầu.',
    alternates: { canonical },
    robots: search ? { index: false, follow: true } : undefined,
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: CatalogSearchParams }) {
  const params = await searchParams
  const page = pageNumber(params.page)
  const search = params.q?.trim() || ''
  const landing = search ? getCatalogLandingByQuery(search) : undefined
  if (landing) permanentRedirect(`${landing.path}${page > 1 ? `?page=${page}` : ''}`)
  return <CatalogPageView page={page} search={search} />
}
