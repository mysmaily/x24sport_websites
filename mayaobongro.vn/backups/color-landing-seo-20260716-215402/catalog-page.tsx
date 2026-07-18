import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { ProductGrid } from '@/components/product-grid'
import { getProducts } from '@/lib/cms'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mẫu Áo Bóng Rổ',
  description: 'Khám phá bộ sưu tập mẫu đồng phục bóng rổ thiết kế theo yêu cầu.',
  alternates: { canonical: '/san-pham/' },
}

const popularKeywords = [
  { label: 'Áo bóng rổ học sinh', query: 'học sinh' },
  { label: 'Mẫu gradient', query: 'gradient' },
  { label: 'Mẫu chuyển màu', query: 'chuyển màu' },
]

const colorKeywords = [
  { label: 'Xanh', query: 'xanh', swatch: 'bg-gradient-to-br from-sky-400 to-blue-700' },
  { label: 'Đỏ', query: 'đỏ', swatch: 'bg-gradient-to-br from-red-400 to-red-700' },
  { label: 'Vàng', query: 'vàng', swatch: 'bg-gradient-to-br from-amber-300 to-yellow-500' },
  { label: 'Cam', query: 'cam', swatch: 'bg-gradient-to-br from-orange-300 to-orange-600' },
  { label: 'Tím', query: 'tím', swatch: 'bg-gradient-to-br from-violet-400 to-purple-700' },
  { label: 'Đen', query: 'đen', swatch: 'bg-gradient-to-br from-slate-600 to-black' },
  { label: 'Gradient', query: 'gradient', swatch: 'bg-gradient-to-br from-cyan-400 via-violet-500 to-orange-400' },
]

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, Number.parseInt(params.page || '1', 10) || 1)
  const search = params.q?.trim() || ''
  const result = await getProducts({ page, limit: 24, search, categorySlug: 'bo-quan-ao-bong-ro' })
  const pageHref = (nextPage: number) => `/san-pham/?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(nextPage) })}`
  const searchHref = (query: string) => `/san-pham/?${new URLSearchParams({ q: query })}`

  return (
    <div className="section-shell py-6 sm:py-8 lg:py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Mẫu áo bóng rổ', item: `${SITE_URL}/san-pham/` },
        ],
      }} />

      <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-slate-500" aria-label="Đường dẫn trang">
        <Link className="rounded-sm hover:text-brand" href="/">Trang chủ</Link>
        <ChevronRight aria-hidden="true" size={13} />
        <span aria-current="page" className="text-slate-800">Mẫu áo bóng rổ</span>
      </nav>

      <header className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.55fr)] lg:items-end">
        <div><p className="section-kicker">Bộ sưu tập bóng rổ</p><h1 className="section-title max-w-3xl text-[clamp(2rem,4vw,3.5rem)]">Chọn mẫu, đổi màu, thêm dấu ấn của đội.</h1></div>
        <p className="mb-0.5 max-w-xl text-sm leading-6 text-slate-600">Tìm một thiết kế làm điểm bắt đầu. Màu sắc, logo, tên và số có thể trao đổi theo nhu cầu thực tế.</p>
      </header>

      <form action="/san-pham/" className="mt-6 grid max-w-4xl grid-cols-[auto_1fr_auto] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm" role="search">
        <Search aria-hidden="true" className="ml-3 self-center text-slate-500" size={18} />
        <label className="sr-only" htmlFor="catalog-q">Tìm mẫu áo</label>
        <input className="min-h-11 min-w-0 px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400" defaultValue={search} id="catalog-q" name="q" placeholder="Tên mẫu, mã hoặc màu sắc…" type="search" />
        <button className="min-h-11 cursor-pointer bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-brand sm:px-5" type="submit">Tìm</button>
      </form>

      <div className="mt-3 grid gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-800">Tìm nhanh:</span>
          {popularKeywords.map((keyword) => (
            <Link aria-current={search === keyword.query ? 'true' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-3 font-semibold transition hover:border-brand/40 hover:bg-orange-50 hover:text-brand ${search === keyword.query ? 'border-brand/40 bg-orange-50 text-brand' : 'border-slate-200 bg-white'}`} href={searchHref(keyword.query)} key={keyword.query}>{keyword.label}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-800">Màu phổ biến:</span>
          {colorKeywords.map((keyword) => (
            <Link aria-current={search === keyword.query ? 'true' : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 font-semibold transition hover:border-brand/40 hover:bg-white hover:text-brand ${search === keyword.query ? 'border-brand/40 bg-white text-brand' : 'border-slate-200 bg-white/70'}`} href={searchHref(keyword.query)} key={keyword.label}>
              <span aria-hidden="true" className={`size-3 rounded-full ring-1 ring-black/10 ${keyword.swatch}`} />
              {keyword.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-600"><span><b className="text-brand">{result.totalDocs.toLocaleString('vi-VN')}</b> mẫu phù hợp</span><span>Trang {result.page}/{Math.max(result.totalPages, 1)}</span></div>
      <ProductGrid products={result.docs} />

      {result.totalPages > 1 ? (
        <nav className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center border-t border-slate-200 pt-5 text-sm font-black" aria-label="Phân trang sản phẩm">
          {page > 1 ? <Link className="inline-flex min-h-11 items-center gap-2 justify-self-start rounded-lg px-2 text-slate-900 hover:bg-white" href={pageHref(page - 1)}><ChevronLeft size={18} /> Trang trước</Link> : <span />}
          <span className="rounded-full bg-white px-4 py-2 text-slate-600">{page} / {result.totalPages}</span>
          {page < result.totalPages ? <Link className="inline-flex min-h-11 items-center gap-2 justify-self-end rounded-lg px-2 text-slate-900 hover:bg-white" href={pageHref(page + 1)}>Trang sau <ChevronRight size={18} /></Link> : <span />}
        </nav>
      ) : null}
    </div>
  )
}
