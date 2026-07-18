import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'

import { CATALOG_COLOR_LANDINGS, STUDENT_CATALOG_LANDING, type CatalogLanding } from '@/lib/catalog-colors'
import { getProducts } from '@/lib/cms'
import { SITE_URL } from '@/lib/site'

import { JsonLd } from './json-ld'
import { ProductGrid } from './product-grid'

const popularKeywords = [
  { label: 'Áo bóng rổ học sinh', href: STUDENT_CATALOG_LANDING.path, landingSlug: STUDENT_CATALOG_LANDING.slug },
  { label: 'Mẫu gradient', href: '/san-pham/ao-bong-ro-gradient/', landingSlug: 'ao-bong-ro-gradient' },
]

export async function CatalogPageView({
  page,
  search = '',
  heading = 'Chọn mẫu, đổi màu, thêm dấu ấn của đội.',
  description = 'Tìm một thiết kế làm điểm bắt đầu. Màu sắc, logo, tên và số có thể trao đổi theo nhu cầu thực tế.',
  canonicalPath = '/san-pham/',
  breadcrumbLabel = 'Mẫu áo bóng rổ',
  activeLanding,
}: {
  page: number
  search?: string
  heading?: string
  description?: string
  canonicalPath?: string
  breadcrumbLabel?: string
  activeLanding?: CatalogLanding
}) {
  const result = await getProducts({ page, limit: 24, search, categorySlug: 'bo-quan-ao-bong-ro' })
  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams({ ...(activeLanding || !search ? {} : { q: search }), page: String(nextPage) })
    return `${canonicalPath}?${params}`
  }
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` },
    ...(activeLanding ? [{ '@type': 'ListItem', position: 2, name: 'Mẫu áo bóng rổ', item: `${SITE_URL}/san-pham/` }] : []),
    { '@type': 'ListItem', position: activeLanding ? 3 : 2, name: breadcrumbLabel, item: `${SITE_URL}${canonicalPath}` },
  ]

  return (
    <div className="section-shell py-6 sm:py-8 lg:py-10">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems }} />

      <nav className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-slate-500" aria-label="Đường dẫn trang">
        <Link className="rounded-sm hover:text-brand" href="/">Trang chủ</Link>
        <ChevronRight aria-hidden="true" size={13} />
        {activeLanding ? (
          <>
            <Link className="rounded-sm hover:text-brand" href="/san-pham/">Mẫu áo bóng rổ</Link>
            <ChevronRight aria-hidden="true" size={13} />
          </>
        ) : null}
        <span aria-current="page" className="text-slate-800">{breadcrumbLabel}</span>
      </nav>

      <header className={description ? 'grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.55fr)] lg:items-end' : ''}>
        <h1 className="section-title max-w-3xl text-[clamp(2rem,4vw,3.5rem)]">{heading}</h1>
        {description ? <p className="mb-0.5 max-w-xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </header>

      <form action="/san-pham/" className="mt-6 grid max-w-4xl grid-cols-[auto_1fr_auto] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm" role="search">
        <Search aria-hidden="true" className="ml-3 self-center text-slate-500" size={18} />
        <label className="sr-only" htmlFor="catalog-q">Tìm mẫu áo</label>
        <input className="min-h-11 min-w-0 px-3 text-sm text-slate-950 outline-none placeholder:text-slate-400" defaultValue={activeLanding ? '' : search} id="catalog-q" name="q" placeholder="Tên mẫu, mã hoặc màu sắc…" type="search" />
        <button className="min-h-11 cursor-pointer bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-brand sm:px-5" type="submit">Tìm</button>
      </form>

      <div className="mt-3 grid gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-800">Tìm nhanh:</span>
          {popularKeywords.map((keyword) => (
            <Link aria-current={keyword.landingSlug === activeLanding?.slug ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-3 font-semibold transition hover:border-brand/40 hover:bg-orange-50 hover:text-brand ${keyword.landingSlug === activeLanding?.slug ? 'border-brand/40 bg-orange-50 text-brand' : 'border-slate-200 bg-white'}`} href={keyword.href} key={keyword.label}>{keyword.label}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-800">Màu phổ biến:</span>
          {CATALOG_COLOR_LANDINGS.map((color) => (
            <Link aria-current={color.slug === activeLanding?.slug ? 'page' : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 font-semibold transition hover:border-brand/40 hover:bg-white hover:text-brand ${color.slug === activeLanding?.slug ? 'border-brand/40 bg-white text-brand' : 'border-slate-200 bg-white/70'}`} href={color.path} key={color.slug}>
              <span aria-hidden="true" className={`size-3 rounded-full ring-1 ring-black/10 ${color.swatch}`} />
              {color.label}
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
