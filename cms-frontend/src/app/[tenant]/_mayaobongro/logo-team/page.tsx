import { Search } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Pagination } from '../../../_components/pagination'
import { ProductGrid } from '../components/product-grid'
import { getProducts } from '../lib/cms'
import { pageMetadata } from '../lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Logo Team Bóng Rổ',
  description: 'Tham khảo các mẫu logo team bóng rổ để phát triển nhận diện riêng cho đội và câu lạc bộ.',
  path: '/logo-team/',
})

export default async function LogoTeamPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page || '1', 10) || 1)
  const search = params.q?.trim() || ''
  const result = await getProducts({ page, limit: 24, search, categorySlug: 'logo-doi-bong-ro' })
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams(search ? { q: search } : {})
    if (nextPage > 1) query.set('page', String(nextPage))
    return `/logo-team/${query.size ? `?${query}` : ''}`
  }

  return (
    <div className="section-shell py-12 sm:py-16 lg:py-20">
      <header className="grid gap-7 lg:grid-cols-[1fr_.65fr] lg:items-end">
        <div><p className="section-kicker">Nhận diện đội bóng rổ</p><h1 className="section-title">Chọn logo làm điểm bắt đầu cho team.</h1></div>
        <p className="mb-1 max-w-xl text-base leading-7 text-slate-600">Tham khảo các mẫu logo dành riêng cho đội bóng rổ, câu lạc bộ và trường học trước khi trao đổi màu sắc hoặc chi tiết nhận diện.</p>
      </header>

      <form action="/logo-team/" className="mt-10 grid overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm sm:grid-cols-[auto_1fr_auto]" role="search">
        <Search aria-hidden="true" className="ml-4 hidden self-center text-slate-500 sm:block" size={20} />
        <label className="sr-only" htmlFor="logo-team-q">Tìm mẫu logo team</label>
        <input className="min-h-13 min-w-0 px-4 text-base text-slate-950 outline-none placeholder:text-slate-400" defaultValue={search} id="logo-team-q" name="q" placeholder="Tìm theo tên logo…" type="search" />
        <button className="min-h-13 cursor-pointer bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-brand" type="submit">Tìm logo</button>
      </form>

      <div className="mb-6 mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"><span><b className="text-brand">{result.totalDocs.toLocaleString('vi-VN')}</b> mẫu logo phù hợp</span><span>Trang {result.page}/{Math.max(result.totalPages, 1)}</span></div>
      <ProductGrid products={result.docs} />

      <Pagination ariaLabel="Phân trang logo team" hrefForPage={pageHref} page={page} totalPages={result.totalPages} />
    </div>
  )
}
