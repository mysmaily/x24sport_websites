import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { COLOR_LANDINGS, TYPE_LANDINGS } from '../lib/catalog-landings'
import { getCategories, getProducts } from '../lib/cms'
import { canonical, SITE_URL } from '../lib/site'
import { JsonLd } from './json-ld'
import { ProductGrid } from './product-grid'

export async function CatalogPageView({ page, search = '', sort = 'popular', heading = 'Toàn bộ mẫu áo chạy bộ.', description = 'Chọn một thiết kế làm điểm bắt đầu. Màu sắc, logo và nội dung có thể điều chỉnh theo nhu cầu thực tế.', canonicalPath = '/san-pham/', breadcrumbLabel = 'Mẫu áo chạy bộ', categorySlug, searchAction = '/san-pham/' }: { page: number; search?: string; sort?: 'newest' | 'popular'; heading?: string; description?: string; canonicalPath?: string; breadcrumbLabel?: string; categorySlug?: string; searchAction?: string }) {
  const [result, categoryResult] = await Promise.all([getProducts({ page, limit: 24, search, categorySlug, sort }), getCategories()])
  const categoryMap = new Map(categoryResult.docs.map((item) => [item.slug, item]))
  const activeType = TYPE_LANDINGS.find((item) => item.slug === categorySlug)
  const activeColor = COLOR_LANDINGS.find((item) => item.slug === categorySlug)
  const includeSortQuery = sort === 'popular' && canonicalPath === '/san-pham/'
  const pageHref = (nextPage: number) => { const params = new URLSearchParams({ ...(search ? { q: search } : {}), ...(includeSortQuery ? { sort: 'xem-nhieu' } : {}), page: String(nextPage) }); return `${canonicalPath}?${params}` }
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: result.docs.map((product, index) => ({
      '@type': 'ListItem',
      position: (result.page - 1) * 24 + index + 1,
      url: canonical(`/san-pham/${product.slug}/`),
      name: product.name,
    })),
    numberOfItems: result.totalDocs,
    url: canonical(canonicalPath),
  }
  return <div className="section-shell mcb-catalog-page">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` }, { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: `${SITE_URL}${canonicalPath}` }] }} />
    <JsonLd data={itemListSchema} />
    <nav className="mcb-catalog-breadcrumb" aria-label="Đường dẫn trang">
      <Link href="/">Trang chủ</Link>
      <ChevronRight aria-hidden="true" size={13} />
      <span>{breadcrumbLabel}</span>
    </nav>

    <header className="mcb-catalog-hero">
      <div className="mcb-catalog-copy">
        <p className="mcb-catalog-kicker">Bộ sưu tập theo yêu cầu</p>
        <h1>{heading}</h1>
        <p className="mcb-catalog-description">{description}</p>
      </div>

      <form action={searchAction} className="mcb-catalog-search" role="search">
        <label htmlFor="catalog-q">Tìm nhanh trong bộ sưu tập</label>
        <div className="mcb-catalog-search-control">
          <Search aria-hidden="true" size={19} />
          <input defaultValue={search} id="catalog-q" name="q" placeholder="Tên mẫu, mã hoặc màu sắc" type="search" />
          {includeSortQuery ? <input name="sort" type="hidden" value="xem-nhieu" /> : null}
          <button type="submit">Tìm mẫu</button>
        </div>
      </form>
    </header>

    <nav className="mcb-catalog-filter" aria-label="Lọc mẫu áo theo kiểu và màu sắc">
      <span className="mcb-catalog-filter-label">Kiểu áo</span>
      <div className="mcb-catalog-type-strip" data-catalog-type-strip>
        <Link aria-current={!activeType ? 'page' : undefined} className="mcb-catalog-type-chip" href="/san-pham/">Tất cả kiểu</Link>
        {TYPE_LANDINGS.map((item) => {
          const count = categoryMap.get(item.slug)?.productCount
          return <Link aria-current={categorySlug === item.slug ? 'page' : undefined} className="mcb-catalog-type-chip" href={item.path} key={item.slug}>
            <span>{item.navLabel}</span>
            {typeof count === 'number' ? <span className="mcb-catalog-chip-count">{count}</span> : null}
          </Link>
        })}
      </div>
      <details className="mcb-catalog-color-filter" data-catalog-color-filter>
        <summary className="mcb-catalog-color-trigger">
          {activeColor ? <span aria-hidden="true" className="size-3.5 rounded-full border border-black/15" style={{ background: activeColor.swatch }} /> : null}
          <span>{activeColor ? activeColor.navLabel.replace('Áo màu ', '') : 'Màu sắc'}</span>
          <ChevronDown aria-hidden="true" size={14} />
        </summary>
        <div className="mcb-catalog-color-menu">
          <Link className="mcb-catalog-color-all" href={activeType?.path || '/san-pham/'}>Tất cả màu</Link>
          {COLOR_LANDINGS.map((item) => {
            const count = categoryMap.get(item.slug)?.productCount
            return <Link aria-current={categorySlug === item.slug ? 'page' : undefined} className="mcb-catalog-color-option" href={item.path} key={item.slug}>
              <span aria-hidden="true" className="mcb-catalog-swatch" style={{ background: item.swatch }} />
              <span>{item.navLabel.replace('Áo màu ', '')}</span>
              {typeof count === 'number' ? <span className="mcb-catalog-color-count">{count}</span> : null}
            </Link>
          })}
        </div>
      </details>
    </nav>
    <div className="mcb-catalog-result-bar"><span><b>{result.totalDocs.toLocaleString('vi-VN')}</b> mẫu phù hợp</span><span>Trang {result.page}/{Math.max(result.totalPages, 1)}</span></div>
    <ProductGrid products={result.docs} />
    {result.totalPages > 1 ? <nav className="mt-9 grid grid-cols-[1fr_auto_1fr] items-center border-t border-slate-200 pt-5 text-sm font-black" aria-label="Phân trang">{page > 1 ? <Link className="inline-flex min-h-11 items-center gap-2" href={pageHref(page - 1)}><ChevronLeft size={18} /> Trang trước</Link> : <span />}<span>{page} / {result.totalPages}</span>{page < result.totalPages ? <Link className="inline-flex min-h-11 items-center gap-2 justify-self-end" href={pageHref(page + 1)}>Trang sau <ChevronRight size={18} /></Link> : <span />}</nav> : null}
  </div>
}
