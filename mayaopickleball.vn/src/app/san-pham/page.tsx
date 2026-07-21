import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, CheckCircle2, ChevronDown, Filter, Palette, Shirt, Sparkles } from 'lucide-react'
import { JsonLd } from '../_components/json-ld'
import { SiteHeader, phoneHref, zaloHref } from '../_components/info-pages'
import { Pagination } from '../_components/pagination'
import {
  catalogColorFilters,
  catalogTypeFilters,
  formatPrice,
  getAllProducts,
  getProductImageForFilter,
  getValidCompareAtPrice,
  type CatalogFilter,
  type PaginatedProducts,
} from '../../lib/content'
import { breadcrumbJsonLd, pageMetadata } from '../../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Sản phẩm áo pickleball | MayaoPickleball',
  description: 'Tổng hợp mẫu áo pickleball đặt may, in tên số và logo cho CLB, đội phong trào, trường lớp.',
  path: '/san-pham',
})

type SearchParams = Promise<{ page?: string }>

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const paginated = await getAllProducts(page)

  return <CatalogPageContent activeFilter={null} paginated={paginated} />
}

export function CatalogPageContent({
  activeFilter,
  paginated,
}: {
  activeFilter?: CatalogFilter | null
  paginated: PaginatedProducts
}) {
  const { products, page, totalPages } = paginated
  const baseHref = activeFilter ? activeFilter.href : '/san-pham'
  const activeColorFilter = activeFilter?.group === 'color' ? activeFilter : null
  const activeTypeFilter = activeFilter?.group === 'type' ? activeFilter : null

  const catalogStats = [
    { value: '135.000đ', label: 'giá tham khảo từ' },
    { value: `${paginated.totalDocs}+`, label: activeFilter ? 'mẫu phù hợp bộ lọc' : 'mẫu có thể đặt may' },
    { value: 'Tên số', label: 'logo đội in theo yêu cầu' },
  ] as const

  const heroTitle = activeFilter
    ? activeFilter.label.replace(/^Áo /, 'Áo pickleball ')
    : 'Chọn mẫu áo pickleball cho đội rồi gửi yêu cầu may ngay'

  const heroDescription = activeFilter
    ? activeFilter.description
    : 'Xem nhanh form áo, màu chủ đạo, mã sản phẩm và giá tham khảo. Khi đã thích một mẫu, gửi mã qua Zalo để được tư vấn chất vải, size và phối logo cho CLB.'

  const orderHighlights = [
    'Chọn mẫu hoặc gửi màu đội',
    'Chốt logo, tên số và size',
    'Nhận tư vấn báo giá theo số lượng',
  ] as const

  return (
    <main className="site-page catalog-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Trang chủ', path: '/' },
          { name: activeFilter ? activeFilter.label : 'Sản phẩm', path: baseHref },
        ])}
      />
      <SiteHeader />

      <section className="catalog-hero">
        <div>
          <p className="hero-kicker">Catalog áo pickleball đặt may</p>
          <h1>{heroTitle}</h1>
          <p>{heroDescription}</p>
          {activeFilter ? (
            <ul className="catalog-guidance-list">
              {activeFilter.guidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <div className="catalog-actions">
            <a className="primary-button" href={zaloHref}>
              Nhận báo giá theo mẫu <ArrowRight size={18} />
            </a>
            <Link className="secondary-button" href="/">
              Về trang chủ
            </Link>
          </div>
        </div>
        <aside>
          {catalogStats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </aside>
      </section>

      <section className="catalog-toolbar" id="bo-loc" aria-label="Bộ lọc mẫu áo">
        <div className="catalog-toolbar-label">
          <Filter size={18} />
          <strong>Lọc mẫu</strong>
        </div>
        <div className="filter-chips">
          <Link className={!activeFilter ? 'active' : ''} href="/san-pham">
            Tất cả mẫu
          </Link>
          {catalogTypeFilters.map((filter) => (
            <Link className={activeFilter?.slug === filter.slug ? 'active' : ''} href={filter.href} key={filter.slug}>
              {filter.label}
            </Link>
          ))}
        </div>
        <details className="catalog-color-dropdown">
          <summary>
            <Palette size={17} />
            <span>{activeColorFilter ? activeColorFilter.label.replace('Áo ', '') : 'Chọn màu'}</span>
            <ChevronDown size={16} />
          </summary>
          <div className="catalog-color-panel">
            {catalogColorFilters.map((filter) => (
              <Link className={activeFilter?.slug === filter.slug ? 'active' : ''} href={filter.href} key={filter.slug}>
                {filter.label.replace('Áo ', '')}
              </Link>
            ))}
          </div>
        </details>
      </section>

      <section className="catalog-grid-section" id="danh-sach">
        <div className="catalog-results-bar">
          <div>
            <span>{activeFilter ? activeFilter.label : 'Tất cả mẫu áo'}</span>
            <strong>{paginated.totalDocs} mẫu đang hiển thị</strong>
          </div>
          <p>{activeTypeFilter ? 'Đổi màu ở menu bên cạnh để giữ form áo và xem phối màu khác.' : 'Lọc theo form áo hoặc màu chủ đạo để tìm mẫu đội dễ hơn.'}</p>
        </div>
        <div className="catalog-grid">
          {products.map((product) => {
            const image = getProductImageForFilter(product, activeFilter)
            const compareAtPrice = getValidCompareAtPrice(product)

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
                  <p>{product.shortDescription}</p>
                  <div className="catalog-price">
                    <strong>{formatPrice(product.price)}</strong>
                    {compareAtPrice ? <span>{formatPrice(compareAtPrice)}</span> : null}
                  </div>
                  <div className="catalog-card-actions">
                    <Link href={`/san-pham/${product.slug}`}>Xem chi tiết</Link>
                    <a href={zaloHref}>Báo giá mẫu này</a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <Pagination page={page} totalPages={totalPages} baseHref={baseHref} />

      <section className="catalog-order-strip" aria-label="Quy trình đặt may nhanh">
        {orderHighlights.map((item) => (
          <div key={item}>
            <CheckCircle2 size={18} />
            <span>{item}</span>
          </div>
        ))}
      </section>

      <section className="catalog-bottom-cta">
        <h2>Chưa thấy mẫu đúng màu đội?</h2>
        <p>Gửi ảnh mẫu, logo hoặc màu chủ đạo. Đội ngũ tư vấn sẽ gợi ý phối màu, chất vải và cách đặt tên số rõ trên sân.</p>
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
