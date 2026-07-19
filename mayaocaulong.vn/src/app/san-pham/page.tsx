import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Filter, Shirt, Sparkles } from 'lucide-react'
import { SiteHeader, phoneHref, zaloHref } from '../_components/info-pages'
import {
  catalogFilters,
  formatPrice,
  getAllProducts,
  getProductImageForFilter,
  type CatalogFilter,
  type Product,
} from '../../lib/content'

export const metadata: Metadata = {
  title: 'Sản phẩm áo cầu lông | MayaoCauLong',
  description: 'Tổng hợp mẫu áo cầu lông đặt may, in tên số và logo cho CLB, đội phong trào, trường lớp.',
  alternates: {
    canonical: 'https://mayaocaulong.vn/san-pham',
  },
}

export default async function ProductsPage() {
  const products = await getAllProducts()

  return <CatalogPageContent products={products} />
}

export function CatalogPageContent({
  activeFilter,
  products,
}: {
  activeFilter?: CatalogFilter | null
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
