import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { COLOR_LANDINGS, TYPE_LANDINGS } from '@/lib/catalog-landings'
import { getCategories, getProducts } from '@/lib/cms'
import { SITE_URL } from '@/lib/site'
import { JsonLd } from './json-ld'
import { ProductGrid } from './product-grid'

export async function CatalogPageView({ page, search = '', heading = 'Toàn bộ mẫu áo chạy bộ.', description = 'Chọn một thiết kế làm điểm bắt đầu. Màu sắc, logo và nội dung có thể điều chỉnh theo nhu cầu thực tế.', canonicalPath = '/san-pham/', breadcrumbLabel = 'Mẫu áo chạy bộ', categorySlug }: { page: number; search?: string; heading?: string; description?: string; canonicalPath?: string; breadcrumbLabel?: string; categorySlug?: string }) {
  const [result, categoryResult] = await Promise.all([getProducts({ page, limit: 24, search, categorySlug }), getCategories()])
  const categoryMap = new Map(categoryResult.docs.map((item) => [item.slug, item]))
  const activeType = TYPE_LANDINGS.find((item) => item.slug === categorySlug)
  const activeColor = COLOR_LANDINGS.find((item) => item.slug === categorySlug)
  const pageHref = (nextPage: number) => { const params = new URLSearchParams({ ...(search ? { q: search } : {}), page: String(nextPage) }); return `${canonicalPath}?${params}` }
  return <div className="section-shell py-4 sm:py-8">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` }, { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: `${SITE_URL}${canonicalPath}` }] }} />
    <nav className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><Link href="/">Trang chủ</Link><ChevronRight size={13} /><span className="truncate text-slate-800">{breadcrumbLabel}</span></nav>
    <header className="grid gap-2 border-b border-slate-200 pb-4 sm:gap-3 sm:pb-5 lg:grid-cols-[1fr_.8fr] lg:items-end"><div><p className="section-kicker hidden sm:block">Bộ sưu tập theo yêu cầu</p><h1 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-.02em] text-slate-950 sm:text-[34px] lg:text-[42px]">{heading}</h1></div><p className="max-w-2xl text-sm leading-5 text-slate-600">{description}</p></header>
    <form action="/san-pham/" className="mt-4 grid max-w-3xl grid-cols-[auto_1fr_auto] overflow-hidden rounded-lg border border-slate-300 bg-white" role="search"><Search className="ml-3 self-center text-slate-500" size={17} /><label className="sr-only" htmlFor="catalog-q">Tìm mẫu áo</label><input className="min-h-11 min-w-0 px-3 text-sm outline-none" defaultValue={search} id="catalog-q" name="q" placeholder="Tên mẫu, mã hoặc màu sắc…" type="search" /><button className="bg-[#0b1220] px-4 text-sm font-black text-white hover:bg-brand">Tìm</button></form>
    <nav className="relative mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8f6f2] p-2" aria-label="Lọc mẫu áo theo kiểu và màu sắc">
      <span className="hidden shrink-0 pl-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-500 sm:block">Kiểu áo</span>
      <div className="flex min-w-0 flex-1 snap-x gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-catalog-type-strip>
        <Link aria-current={!activeType ? 'page' : undefined} className={`inline-flex min-h-10 shrink-0 snap-start items-center rounded-full border px-3 text-xs font-black transition ${!activeType ? 'border-[#0b1220] bg-[#0b1220] text-white' : 'border-slate-200 bg-white hover:border-brand hover:text-brand'}`} href="/san-pham/">Tất cả kiểu</Link>
        {TYPE_LANDINGS.map((item) => { const count = categoryMap.get(item.slug)?.productCount; return <Link aria-current={categorySlug === item.slug ? 'page' : undefined} className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 text-xs font-black transition ${categorySlug === item.slug ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white hover:border-brand hover:text-brand'}`} href={item.path} key={item.slug}>{item.navLabel}{typeof count === 'number' ? <span className="text-[10px] opacity-60">{count}</span> : null}</Link> })}
      </div>
      <details className="group relative shrink-0" data-catalog-color-filter>
        <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-black text-slate-800 transition hover:border-brand hover:text-brand [&::-webkit-details-marker]:hidden">
          {activeColor ? <span aria-hidden="true" className="size-3.5 rounded-full border border-black/15" style={{ background: activeColor.swatch }} /> : null}
          <span>{activeColor ? activeColor.navLabel.replace('Áo màu ', '') : 'Màu sắc'}</span>
          <ChevronDown className="transition group-open:rotate-180" size={14} />
        </summary>
        <div className="absolute right-0 top-full z-30 mt-2 grid w-[min(320px,calc(100vw-32px))] grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,.18)]">
          <Link className="col-span-2 flex min-h-10 items-center rounded-lg px-3 text-xs font-black text-slate-700 hover:bg-slate-100" href={activeType?.path || '/san-pham/'}>Tất cả màu</Link>
          {COLOR_LANDINGS.map((item) => { const count = categoryMap.get(item.slug)?.productCount; return <Link aria-current={categorySlug === item.slug ? 'page' : undefined} className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-black transition ${categorySlug === item.slug ? 'bg-orange-50 text-brand' : 'text-slate-700 hover:bg-slate-100'}`} href={item.path} key={item.slug}><span aria-hidden="true" className="size-4 shrink-0 rounded-full border border-black/15" style={{ background: item.swatch }} /><span className="truncate">{item.navLabel.replace('Áo màu ', '')}</span>{typeof count === 'number' ? <span className="ml-auto text-[10px] opacity-50">{count}</span> : null}</Link> })}
        </div>
      </details>
    </nav>
    <div className="mb-3 mt-4 flex justify-between border-t border-slate-200 pt-3 text-xs text-slate-600"><span><b className="text-brand">{result.totalDocs.toLocaleString('vi-VN')}</b> mẫu phù hợp</span><span>Trang {result.page}/{Math.max(result.totalPages, 1)}</span></div>
    <ProductGrid products={result.docs} />
    {result.totalPages > 1 ? <nav className="mt-9 grid grid-cols-[1fr_auto_1fr] items-center border-t border-slate-200 pt-5 text-sm font-black" aria-label="Phân trang">{page > 1 ? <Link className="inline-flex min-h-11 items-center gap-2" href={pageHref(page - 1)}><ChevronLeft size={18} /> Trang trước</Link> : <span />}<span>{page} / {result.totalPages}</span>{page < result.totalPages ? <Link className="inline-flex min-h-11 items-center gap-2 justify-self-end" href={pageHref(page + 1)}>Trang sau <ChevronRight size={18} /></Link> : <span />}</nav> : null}
  </div>
}
