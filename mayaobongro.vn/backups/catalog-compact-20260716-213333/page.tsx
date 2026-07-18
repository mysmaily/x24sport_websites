import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductGrid } from '@/components/product-grid'
import { getProducts } from '@/lib/cms'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mẫu Áo Bóng Rổ',
  description: 'Khám phá bộ sưu tập mẫu đồng phục bóng rổ thiết kế theo yêu cầu.',
  alternates: { canonical: '/san-pham/' },
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page || '1', 10) || 1)
  const search = params.q?.trim() || ''
  const result = await getProducts({ page, limit: 24, search, categorySlug: 'bo-quan-ao-bong-ro' })
  const pageHref = (nextPage: number) => `/san-pham/?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(nextPage) })}`

  return (
    <div className="section-shell py-12 sm:py-16 lg:py-20">
      <header className="grid gap-7 lg:grid-cols-[1fr_.65fr] lg:items-end">
        <div><p className="section-kicker">Bộ sưu tập bóng rổ</p><h1 className="section-title">Chọn mẫu, đổi màu, thêm dấu ấn của đội.</h1></div>
        <p className="mb-1 max-w-xl text-base leading-7 text-slate-600">Tìm một thiết kế làm điểm bắt đầu. Màu sắc, logo, tên và số có thể được trao đổi theo nhu cầu thực tế.</p>
      </header>

      <form action="/san-pham/" className="mt-10 grid overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm sm:grid-cols-[auto_1fr_auto]" role="search">
        <Search aria-hidden="true" className="ml-4 hidden self-center text-slate-500 sm:block" size={20} />
        <label className="sr-only" htmlFor="catalog-q">Tìm mẫu áo</label>
        <input className="min-h-13 min-w-0 px-4 text-base text-slate-950 outline-none placeholder:text-slate-400" defaultValue={search} id="catalog-q" name="q" placeholder="Tìm theo tên mẫu, màu sắc…" type="search" />
        <button className="min-h-13 cursor-pointer bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-brand" type="submit">Tìm mẫu</button>
      </form>

      <div className="mb-6 mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"><span><b className="text-brand">{result.totalDocs.toLocaleString('vi-VN')}</b> mẫu phù hợp</span><span>Trang {result.page}/{Math.max(result.totalPages, 1)}</span></div>
      <ProductGrid products={result.docs} />

      {result.totalPages > 1 ? (
        <nav className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center border-t border-slate-200 pt-6 text-sm font-black" aria-label="Phân trang sản phẩm">
          {page > 1 ? <Link className="inline-flex min-h-11 items-center gap-2 justify-self-start rounded-lg px-2 text-slate-900 hover:bg-white" href={pageHref(page - 1)}><ChevronLeft size={18} /> Trang trước</Link> : <span />}
          <span className="rounded-full bg-white px-4 py-2 text-slate-600">{page} / {result.totalPages}</span>
          {page < result.totalPages ? <Link className="inline-flex min-h-11 items-center gap-2 justify-self-end rounded-lg px-2 text-slate-900 hover:bg-white" href={pageHref(page + 1)}>Trang sau <ChevronRight size={18} /></Link> : <span />}
        </nav>
      ) : null}
    </div>
  )
}
