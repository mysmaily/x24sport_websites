import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, MessageCircle, PackageCheck, Phone, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ProductCard } from '../_components/product-card'
import { ProductGallery } from '../_components/product-gallery'
import { SiteHeader } from '../_components/site-header'
import {
  getCategoryByLegacyPath, getProductBySlug, getProductsPage,
  getRelatedProducts, productImages, type CmsCategory, type CmsProduct,
} from '../../lib/content'

const money = (value?: number | null, currency = 'VND') =>
  typeof value === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    : 'Liên hệ'
const categoryObjects = (product: CmsProduct) =>
  (product.categories || []).filter((item): item is CmsCategory => typeof item === 'object')

async function resolve(segments: string[]) {
  if (segments.length === 1) {
    const product = await getProductBySlug(segments[0])
    if (product) return { product }
  }
  const path = `/${segments.join('/')}/`
  const category = await getCategoryByLegacyPath(path)
  return category ? { category } : {}
}

export async function generateMetadata({ params }: {
  params: Promise<{ legacy: string[] }>
}): Promise<Metadata> {
  const result = await resolve((await params).legacy)
  if (result.product) return {
    title: result.product.seoTitle || result.product.name,
    description: result.product.metaDescription || result.product.shortDescription,
    alternates: { canonical: result.product.legacyPath || `/${result.product.slug}/` },
  }
  if (result.category) return {
    title: result.category.name, description: result.category.description,
    alternates: { canonical: result.category.legacyPath },
  }
  return { title: 'Không tìm thấy trang' }
}

function ProductDetail({ product, related }: { product: CmsProduct; related: Awaited<ReturnType<typeof getRelatedProducts>> }) {
  const categories = categoryObjects(product)
  const currency = product.currency || 'VND'
  const inStock = product.stockStatus !== 'outofstock'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://x24sport.vn'
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    image: productImages(product).map((item) => item.url),
    description: product.shortDescription, sku: product.sku,
    offers: typeof product.price === 'number' ? {
      '@type': 'Offer', priceCurrency: currency, price: product.price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${siteUrl}${product.legacyPath || `/${product.slug}/`}`,
    } : undefined,
  }
  return (
    <>
      <div className="detail-breadcrumb site-container">
        <Link href="/">Trang chủ</Link><span>/</span><Link href="/san-pham">Sản phẩm</Link><span>/</span><b>{product.name}</b>
      </div>
      <main id="noi-dung" className="product-detail site-container">
        <ProductGallery images={productImages(product)} name={product.name} />
        <section className="detail-summary">
          <p className="detail-category">{categories.map((item) => item.name).slice(0, 2).join(' · ') || 'X24Sport'}</p>
          <h1>{product.name}</h1>
          <div className="detail-prices">
            {product.compareAtPrice && <del>{money(product.compareAtPrice, currency)}</del>}
            <strong>{money(product.price, currency)}</strong>
          </div>
          {product.shortDescription && <p className="detail-excerpt">{product.shortDescription}</p>}
          <ul className="detail-facts">
            {product.sku && <li><span>Mã sản phẩm</span><b>{product.sku}</b></li>}
            <li><span>Tình trạng</span><b className={inStock ? 'in-stock' : 'out-stock'}>{inStock ? 'Còn hàng' : 'Tạm hết hàng'}</b></li>
            {categories.length > 0 && <li><span>Danh mục</span><b>{categories.map((item) => item.name).join(', ')}</b></li>}
          </ul>
          <div className="detail-actions">
            <a className="detail-primary" href="tel:0989353247"><Phone size={18} /> Gọi 0989 353 247</a>
            <a className="detail-secondary" href="https://zalo.me/0989353247" target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Tư vấn Zalo</a>
          </div>
        </section>
        <aside className="detail-assurance">
          <h2>Thông tin mua hàng</h2>
          <div><PackageCheck /><span><b>Sản phẩm từ X24Sport</b><small>Thông tin và hình ảnh được đồng bộ từ catalog chính.</small></span></div>
          <div><ShieldCheck /><span><b>Tư vấn trực tiếp</b><small>Xác nhận mẫu, size và thời gian thực hiện qua hotline.</small></span></div>
          <div><Check /><span><b>Dữ liệu giá minh bạch</b><small>Giá hiển thị lấy trực tiếp từ hệ thống quản lý sản phẩm.</small></span></div>
        </aside>
      </main>
      {product.contentHtml && <section className="product-description site-container">
        <h2>Thông tin sản phẩm</h2>
        <div dangerouslySetInnerHTML={{ __html: product.contentHtml }} />
      </section>}
      {related.length > 0 && <section className="related-products site-container">
        <div className="section-heading"><div><p className="eyebrow"><span /> Gợi ý thêm</p><h2>Sản phẩm liên quan</h2></div></div>
        <div className="product-grid">{related.map((item) => <ProductCard product={item} key={item.slug} />)}</div>
      </section>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  )
}

export default async function LegacyPage({ params, searchParams }: {
  params: Promise<{ legacy: string[] }>
  searchParams: Promise<{ page?: string }>
}) {
  const result = await resolve((await params).legacy)
  if (result.product) {
    const related = await getRelatedProducts(result.product)
    return <div className="page-shell"><SiteHeader /><ProductDetail product={result.product} related={related} /></div>
  }
  if (result.category) {
    const page = Math.max(1, Number((await searchParams).page) || 1)
    const products = await getProductsPage({ categorySlug: result.category.slug, page, limit: 20 })
    return <div className="page-shell"><SiteHeader /><main id="noi-dung" className="catalog-page">
      <section className="catalog-banner"><div><p>Trang chủ / Danh mục</p><h1>{result.category.name}</h1></div></section>
      <div className="catalog-body site-container"><div className="catalog-count"><span>{result.category.description}</span><strong>{products.totalDocs} sản phẩm</strong></div>
        <div className="product-grid catalog-grid">{products.products.map((item) => <ProductCard product={item} key={item.slug} />)}</div>
      </div>
    </main></div>
  }
  notFound()
}
