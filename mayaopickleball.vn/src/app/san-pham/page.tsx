import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Filter, Shirt, Sparkles } from 'lucide-react'
import { SiteHeader, phoneHref, zaloHref } from '../_components/info-pages'
import { Pagination } from '../_components/pagination'
import {
  catalogFilters,
  formatPrice,
  getAllProducts,
  getProductImageForFilter,
  type CatalogFilter,
  type PaginatedProducts,
} from '../../lib/content'

export const metadata: Metadata = {
  title: 'Sản phẩm áo pickleball | MayaoPickleball',
  description: 'Tổng hợp mẫu áo pickleball đặt may, in tên số và logo cho CLB, đội phong trào, trường lớp.',
}

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

  const catalogStats = [
    { value: '135.000đ', label: 'giá tham khảo từ' },
    { value: `${paginated.totalDocs}+`, label: 'mẫu đang có trên CMS' },
    { value: '24h', label: 'phản hồi yêu cầu nhanh' },
  ] as const

  return (
    <main className="site-page catalog-page">
      <SiteHeader />

      <section className="catalog-hero">
        <div>
          <p className="hero-kicker">Danh mục sản phẩm</p>
          <h1>{activeFilter ? activeFilter.label.replace(/^Áo /, 'Áo pickleball ') : 'Toàn bộ mẫu áo pickleball đang có trên MayaoPickleball'}</h1>
          <p>
            {activeFilter
              ? activeFilter.description
              : 'Lọc nhanh mẫu đặt may, xem mã sản phẩm, giá tham khảo và gửi mẫu để nhận tư vấn theo số lượng.'}
          </p>
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
        <div>
          <Filter size={18} />
          <strong>Lọc theo nhu cầu</strong>
        </div>
        <div className="filter-chips">
          <Link className={!activeFilter ? 'active' : ''} href="/san-pham">
            Tất cả mẫu
          </Link>
          {catalogFilters.map((filter) => (
            <Link className={activeFilter?.slug === filter.slug ? 'active' : ''} href={filter.href} key={filter.slug}>
              {filter.label}
            </Link>
          ))}
        </div>
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
                  <p>{product.shortDescription}</p>
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
        </div>
      </section>

      <Pagination page={page} totalPages={totalPages} baseHref={baseHref} />

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
