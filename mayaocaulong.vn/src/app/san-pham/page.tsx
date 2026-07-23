import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, ChevronDown, Filter, Palette, Shirt, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { SiteHeader, phoneHref, zaloHref } from '../_components/info-pages'
import {
  catalogColorFilters,
  catalogTypeFilters,
  formatPrice,
  getProductsPage,
  getProductImageForFilter,
  type CatalogFilter,
  type Product,
} from '../../lib/content'

const defaultOgImage = {
  url: '/images/badminton-team-hero.png',
  width: 1672,
  height: 941,
  alt: 'Đội cầu lông mặc áo thi đấu đặt may MayaoCauLong',
}

type ProductsPageProps = {
  searchParams: Promise<{ page?: string | string[] }>
}

function parsePageNumber(value?: string | string[]) {
  const rawValue = Array.isArray(value) ? value[0] : value
  if (!rawValue || !/^\d+$/.test(rawValue)) return 1
  return Math.max(1, Number.parseInt(rawValue, 10))
}

function getProductsPageHref(page: number) {
  return page <= 1 ? '/san-pham' : `/san-pham?page=${page}`
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const visiblePages = new Set([1, totalPages])
  for (let page = Math.max(1, currentPage - 2); page <= Math.min(totalPages, currentPage + 2); page += 1) {
    visiblePages.add(page)
  }

  const pages = [...visiblePages].sort((a, b) => a - b)
  const items: Array<number | string> = []
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push(`ellipsis-${page}`)
    items.push(page)
  })
  return items
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { page } = await searchParams
  const currentPage = parsePageNumber(page)
  const pageSuffix = currentPage > 1 ? ` - Trang ${currentPage}` : ''
  const canonical = `https://mayaocaulong.vn${getProductsPageHref(currentPage)}`

  return {
    title: `Sản phẩm áo cầu lông${pageSuffix} | MayaoCauLong`,
    description: `Tổng hợp mẫu áo cầu lông đặt may, in tên số và logo cho CLB, đội phong trào, trường lớp${currentPage > 1 ? ` - trang ${currentPage}.` : '.'}`,
    alternates: { canonical },
    openGraph: {
      title: `Sản phẩm áo cầu lông${pageSuffix} | MayaoCauLong`,
      description: 'Chọn mẫu áo cầu lông đặt may, in tên số và logo theo màu đội.',
      images: [defaultOgImage],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Sản phẩm áo cầu lông${pageSuffix} | MayaoCauLong`,
      description: 'Chọn mẫu áo cầu lông đặt may, in tên số và logo theo màu đội.',
      images: [defaultOgImage.url],
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { page } = await searchParams
  const requestedPage = parsePageNumber(page)
  const catalogPage = await getProductsPage(requestedPage)

  if (requestedPage > catalogPage.totalPages) notFound()

  return (
    <CatalogPageContent
      pagination={{
        currentPage: catalogPage.page,
        totalPages: catalogPage.totalPages,
        totalProducts: catalogPage.totalProducts,
      }}
      products={catalogPage.products}
    />
  )
}

export function CatalogPageContent({
  activeFilter,
  pagination,
  products,
}: {
  activeFilter?: CatalogFilter | null
  pagination?: {
    currentPage: number
    totalPages: number
    totalProducts: number
  }
  products: Product[]
}) {
  const heroTitle = activeFilter ? activeFilter.label.replace(/^Áo /, 'Áo cầu lông ') : 'Toàn bộ mẫu áo cầu lông đang có trên MayaoCauLong'
  const heroSubtitle = activeFilter
    ? activeFilter.description
    : 'Xem nhanh mẫu đang có, mã sản phẩm và giá tham khảo để chọn hướng đặt may phù hợp cho đội của bạn.'

  return (
    <main className="site-page catalog-page">
      <SiteHeader />

      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <h1>{heroTitle}</h1>
          <h2>{heroSubtitle}</h2>
        </div>
      </section>

      <section className="catalog-toolbar" id="bo-loc" aria-label="Bộ lọc mẫu áo">
        <div className="catalog-filter-label">
          <Filter size={18} />
          <strong>Kiểu áo</strong>
        </div>
        <nav className="filter-chips" aria-label="Lọc theo kiểu áo">
          <Link className={!activeFilter ? 'active' : ''} href="/san-pham">
            Tất cả mẫu
          </Link>
          {catalogTypeFilters.map((filter) => (
            <Link className={activeFilter?.slug === filter.slug ? 'active' : ''} href={filter.href} key={filter.slug}>
              {filter.label}
            </Link>
          ))}
        </nav>
        <details className={`catalog-color-filter${activeFilter?.group === 'color' ? ' is-active' : ''}`}>
          <summary>
            <Palette aria-hidden="true" size={17} />
            <span>{activeFilter?.group === 'color' ? activeFilter.label : 'Màu áo'}</span>
            <ChevronDown aria-hidden="true" size={16} />
          </summary>
          <nav aria-label="Lọc theo màu áo">
            {catalogColorFilters.map((filter) => (
              <Link className={activeFilter?.slug === filter.slug ? 'active' : ''} href={filter.href} key={filter.slug}>
                {filter.label}
              </Link>
            ))}
          </nav>
        </details>
      </section>

      <section className="catalog-grid-section" id="danh-sach">
        <div className="catalog-grid">
          {products.map((product) => {
            const image = getProductImageForFilter(product, activeFilter)

            return (
              <article className="catalog-card" key={product.id}>
                <Link className="catalog-card-media" href={`/san-pham/${product.slug}`}>
                  {image?.url ? (
                    <img
                      alt={image.alt || product.name}
                      height={image.height || 1000}
                      src={image.url}
                      width={image.width || 1000}
                    />
                  ) : (
                    <span>
                      <Shirt size={64} strokeWidth={1.5} />
                    </span>
                  )}
                </Link>
                <div className="catalog-card-body">
                  <div className="catalog-card-topline">
                    <span>{product.sku}</span>
                    <span>
                      <Sparkles size={14} />
                      Đặt may
                    </span>
                  </div>
                  <h2>
                    <Link href={`/san-pham/${product.slug}`}>{product.name}</Link>
                  </h2>
                  <div className="catalog-price">
                    <strong>{formatPrice(product.price)}</strong>
                    {product.compareAtPrice ? <span>{formatPrice(product.compareAtPrice)}</span> : null}
                  </div>
                  <div className="catalog-card-actions">
                    <Link href={`/san-pham/${product.slug}`}>Xem chi tiết</Link>
                    <a href={zaloHref}>Gửi mẫu này</a>
                  </div>
                </div>
              </article>
            )
          })}
          {!products.length ? (
            <p className="catalog-empty-state">Chưa có mẫu phù hợp với bộ lọc này. Hãy xem tất cả mẫu hoặc gửi màu đội để được tư vấn.</p>
          ) : null}
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <nav className="catalog-pagination" aria-label="Phân trang sản phẩm">
            {pagination.currentPage > 1 ? (
              <Link className="pagination-direction" href={getProductsPageHref(pagination.currentPage - 1)} rel="prev">
                <ArrowLeft aria-hidden="true" size={16} />
                Trang trước
              </Link>
            ) : (
              <span aria-disabled="true" className="pagination-direction is-disabled">
                <ArrowLeft aria-hidden="true" size={16} />
                Trang trước
              </span>
            )}

            <div className="pagination-pages">
              {getPaginationItems(pagination.currentPage, pagination.totalPages).map((item) =>
                typeof item === 'number' ? (
                  <Link
                    aria-current={item === pagination.currentPage ? 'page' : undefined}
                    className={item === pagination.currentPage ? 'is-current' : ''}
                    href={getProductsPageHref(item)}
                    key={item}
                  >
                    <span className="sr-only">Trang </span>
                    {item}
                  </Link>
                ) : (
                  <span aria-hidden="true" className="pagination-ellipsis" key={item}>…</span>
                ),
              )}
            </div>

            {pagination.currentPage < pagination.totalPages ? (
              <Link className="pagination-direction" href={getProductsPageHref(pagination.currentPage + 1)} rel="next">
                Trang sau
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            ) : (
              <span aria-disabled="true" className="pagination-direction is-disabled">
                Trang sau
                <ArrowRight aria-hidden="true" size={16} />
              </span>
            )}
            <p>{pagination.totalProducts} mẫu · Trang {pagination.currentPage}/{pagination.totalPages}</p>
          </nav>
        ) : null}
      </section>

      <section className="catalog-bottom-cta">
        <h2>Chưa thấy mẫu đúng màu đội?</h2>
        <p>Gửi ảnh mẫu hoặc màu chủ đạo, chúng tôi có thể chỉnh phối màu và lên maket mới cho CLB.</p>
        <a className="primary-button" href={zaloHref}>
          Gửi yêu cầu thiết kế <ArrowRight size={18} />
        </a>
      </section>

      <div className="mobile-cta" aria-label="Liên hệ nhanh">
        <a href={phoneHref}>Gọi ngay</a>
        <a href={zaloHref}>Nhận báo giá</a>
      </div>
    </main>
  )
}
