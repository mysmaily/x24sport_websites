import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Palette, Shirt, Sparkles } from 'lucide-react'

import { Pagination } from '../../../_components/pagination'
import { SiteFooter, SiteHeader, phoneHref, zaloHref } from '../_components/info-pages'
import {
  formatPrice,
  getAllProducts,
  getFinishedSamplePostsPage,
  getPostHref,
  getProductImageForFilter,
  getValidCompareAtPrice,
} from '../lib/content'
import { breadcrumbJsonLd, pageMetadata } from '../lib/seo'
import { JsonLd } from '../_components/json-ld'

type SearchParams = Promise<{ page?: string | string[] }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)

  return pageMetadata({
    title: `Mẫu áo pickleball đã làm${page > 1 ? ` – Trang ${page}` : ''} | MayaoPickleball`,
    description: 'Tham khảo các mẫu áo pickleball đã làm cho đội nhóm, câu lạc bộ, trường học và doanh nghiệp.',
    path: page > 1 ? `/mau-da-lam/?page=${page}` : '/mau-da-lam/',
  })
}

export default async function FinishedSamplesPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams
  const requestedPage = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const [posts, featuredProducts] = await Promise.all([
    getFinishedSamplePostsPage(requestedPage),
    getAllProducts(1, 10),
  ])

  const productSamples = featuredProducts.products.slice(0, 10)
  const sampleSteps = [
    'Chọn form áo và màu đội thích',
    'Gửi logo, tên số và số lượng',
    'Duyệt phối màu trước khi may',
  ] as const

  return (
    <main className="site-page finished-samples-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Trang chủ', path: '/' },
          { name: 'Mẫu đã làm', path: '/mau-da-lam/' },
        ])}
      />
      <SiteHeader />

      <section className="finished-samples-hero">
        <div className="finished-samples-copy">
          <p className="hero-kicker">Hình ảnh thực tế</p>
          <h1>Mẫu áo pickleball đã làm cho đội nhóm</h1>
          <p>
            Xem nhanh các hướng phối màu, form cổ áo, vị trí logo và tên số để đội dễ chốt mẫu trước khi đặt may.
          </p>
          <div className="finished-samples-actions">
            <a className="primary-button" href={zaloHref}>
              Gửi mẫu cần may <ArrowRight size={18} />
            </a>
            <Link className="secondary-button" href="/san-pham">
              Xem catalog áo
            </Link>
          </div>
        </div>
        <aside className="finished-samples-panel" aria-label="Tóm tắt tư vấn mẫu áo">
          {sampleSteps.map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </aside>
      </section>

      <section className="finished-samples-strip" aria-label="Lợi ích khi tham khảo mẫu đã làm">
        <div>
          <CheckCircle2 size={18} />
          <span>Dễ chọn màu hợp sân và logo</span>
        </div>
        <div>
          <Palette size={18} />
          <span>Có thể phối lại theo nhận diện đội</span>
        </div>
        <div>
          <Sparkles size={18} />
          <span>Hỗ trợ thiết kế trước khi sản xuất</span>
        </div>
      </section>

      <section className="finished-samples-section">
        <div className="finished-samples-heading">
          <div>
            <p className="section-eyebrow">Mẫu tham khảo</p>
            <h2>Các mẫu đang có thể đặt may</h2>
          </div>
          <Link href="/san-pham">Xem tất cả mẫu</Link>
        </div>
        <div className="catalog-grid finished-product-grid">
          {productSamples.map((product) => {
            const image = getProductImageForFilter(product)
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
                  <div className="catalog-price">
                    <strong>{formatPrice(product.price)}</strong>
                    {compareAtPrice ? <span>{formatPrice(compareAtPrice)}</span> : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="finished-samples-section finished-post-section">
        {posts.docs.length ? (
          <>
            <div className="finished-samples-heading">
              <div>
                <p className="section-eyebrow">Dự án thực tế</p>
                <h2>Hình ảnh đội đã đặt may</h2>
              </div>
            </div>
            <div className="blog-card-grid">
              {posts.docs.map((post) => (
                <article className="blog-card" key={post.id}>
                  <p>Mẫu đã làm</p>
                  <h2><Link href={getPostHref(post)}>{post.title}</Link></h2>
                  <span>{post.excerpt}</span>
                  <Link href={getPostHref(post)}>Xem chi tiết →</Link>
                </article>
              ))}
            </div>
            <Pagination ariaLabel="Phân trang mẫu đã làm" basePath="/mau-da-lam/" page={posts.page} totalPages={posts.totalPages} />
          </>
        ) : (
          <div className="finished-empty-state">
            <div>
              <p className="section-eyebrow">Cần mẫu riêng?</p>
              <h2>Gửi ảnh tham khảo, đội sẽ được phối lại theo logo và màu nhận diện.</h2>
            </div>
            <a className="primary-button" href={zaloHref}>
              Nhắn Zalo tư vấn <ArrowRight size={18} />
            </a>
          </div>
        )}
      </section>

      <SiteFooter />

      <div className="mobile-cta" aria-label="Liên hệ nhanh">
        <a href={phoneHref}>Gọi ngay</a>
        <a href={zaloHref}>Nhắn Zalo</a>
      </div>
    </main>
  )
}
