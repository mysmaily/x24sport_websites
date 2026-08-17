import { ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

import { Pagination } from '../../../_components/pagination'
import { footballCategoryPath, footballColorPath, isIndexableFootballColor } from '../lib/category-paths'
import { getCategories, getProducts } from '../lib/cms'
import { excerpt, SITE_URL } from '../lib/site'

import { ColorFilterDropdown } from './color-filter-dropdown'
import { JsonLd } from './json-ld'
import { ProductGrid } from './product-grid'

type CatalogPageViewProps = {
  breadcrumbLabel?: string
  canonicalPath?: string
  categorySlug?: string
  description?: string
  heading?: string
  page: number
  search?: string
  searchAction?: string
  sort?: 'latest' | 'popular'
}

export async function CatalogPageView({
  page,
  search = '',
  heading = 'Toàn bộ mẫu áo bóng đá.',
  description = 'Chọn một mẫu làm điểm xuất phát rồi điều chỉnh màu sắc, logo, tên số và nội dung theo nhu cầu thực tế.',
  canonicalPath = '/san-pham/',
  breadcrumbLabel = 'Sản phẩm',
  categorySlug,
  searchAction = '/san-pham/',
  sort = 'latest',
}: CatalogPageViewProps) {
  const [result, categoryResult] = await Promise.all([
    getProducts({ page, limit: 24, search, categorySlug, sort }),
    getCategories(),
  ])
  const primaryCategories = categoryResult.docs.filter((item) => item.group === 'type' && (item.productCount || 0) > 0)
  const secondaryCategories = categoryResult.docs
    .filter((item) => (
      item.group === 'tag'
      && (item.productCount || 0) > 0
      && /^màu\b/i.test(item.name.trim())
    ))
    .sort((a, b) => (
      Number(isIndexableFootballColor(b)) - Number(isIndexableFootballColor(a))
      || (b.productCount || 0) - (a.productCount || 0)
      || a.name.localeCompare(b.name, 'vi')
    ))
  const activeSecondary = secondaryCategories.find((item) => item.slug === categorySlug)
  const cleanDescription = description.replace(/\s+/g, ' ').trim()
  const shortDescription = excerpt(cleanDescription, 180)
  const hasLongDescription = cleanDescription.length > 180
  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams(search ? { q: search } : {})
    if (nextPage > 1) params.set('page', String(nextPage))
    return `${canonicalPath}${params.size ? `?${params}` : ''}`
  }

  return (
    <div className="mabd-catalog">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${SITE_URL}/` }, { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: `${SITE_URL}${canonicalPath}` }] }} />

      <section className="mabd-catalog-intro">
        <div className="section-shell">
          <nav aria-label="Đường dẫn" className="mabd-catalog-breadcrumb">
            <Link href="/">Trang chủ</Link>
            <ChevronRight aria-hidden="true" size={13} />
            <span>{breadcrumbLabel}</span>
          </nav>

          <div className="mabd-catalog-intro-grid">
            <header>
              <p className="mabd-catalog-kicker"><span aria-hidden="true">26</span> Bộ sưu tập áo đấu</p>
              <h1>{heading}</h1>
              {cleanDescription ? <p className="mabd-catalog-description">{shortDescription}</p> : null}
            </header>

            <form action={searchAction} className="mabd-catalog-search" role="search">
              <label htmlFor="catalog-q">Tìm nhanh trong bộ sưu tập</label>
              <div>
                <Search aria-hidden="true" size={18} />
                <input defaultValue={search} id="catalog-q" name="q" placeholder="Tên mẫu, mã áo, màu sắc…" type="search" />
                <button type="submit">Tìm mẫu</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="section-shell mabd-catalog-body">
        <nav aria-label="Lọc mẫu áo theo nhóm và màu sắc" className="mabd-catalog-filter">
          <span className="mabd-catalog-filter-label"><SlidersHorizontal aria-hidden="true" size={15} /> Bộ lọc</span>
          <div className="mabd-catalog-filter-strip" data-catalog-type-strip>
            <Link aria-current={!categorySlug ? 'page' : undefined} href="/san-pham/">Tất cả mẫu</Link>
            {primaryCategories.map((item) => (
              <Link aria-current={categorySlug === item.slug ? 'page' : undefined} href={footballCategoryPath(item)} key={item.slug}>
                {item.name}
                {typeof item.productCount === 'number' ? <span>{item.productCount}</span> : null}
              </Link>
            ))}
          </div>

          <ColorFilterDropdown
            activeSlug={activeSecondary?.slug}
            options={secondaryCategories.map((item) => ({
              href: footballColorPath(item),
              name: item.name,
              productCount: item.productCount,
              slug: item.slug,
            }))}
          />
        </nav>

        <div className="mabd-catalog-results" role="status">
          <p><strong>{result.totalDocs.toLocaleString('vi-VN')}</strong> mẫu áo</p>
          <span aria-hidden="true" />
          <p>Trang {result.page} / {Math.max(result.totalPages, 1)}</p>
        </div>

        <ProductGrid products={result.docs} />

        {hasLongDescription ? (
          <details className="mabd-catalog-note">
            <summary>Thông tin về {heading.toLocaleLowerCase('vi-VN')}</summary>
            <p>{cleanDescription}</p>
          </details>
        ) : null}
        <Pagination ariaLabel="Phân trang sản phẩm" hrefForPage={pageHref} page={page} totalPages={result.totalPages} />
      </div>
    </div>
  )
}
