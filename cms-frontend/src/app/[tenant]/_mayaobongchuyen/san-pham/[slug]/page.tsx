import type { Metadata } from 'next'
import { ArrowLeft, CheckCircle2, MessageCircle, Palette, Ruler, Shirt, Users } from 'lucide-react'
import { notFound } from 'next/navigation'

import { ProductInterestForm } from '../../../../_components/product-interest-form'
import { ProductViewTracker } from '../../../../_components/product-view-tracker'
import { SiteFooter } from '../../_components/site-footer'
import { SiteHeader } from '../../_components/site-header'
import { fallbackNavigation, formatPrice, getProductBreadcrumbCategory, getProductBySlug, hasProductInterestForm } from '../../lib/content'
import { ProductGallery } from './product-gallery'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm | MayaoBongChuyen' }

  return {
    title: `${product.name} | MayaoBongChuyen`,
    description: product.shortDescription,
    alternates: { canonical: `/san-pham/${slug}/` },
    openGraph: {
      title: `${product.name} | MayaoBongChuyen`,
      description: product.shortDescription,
      images: product.gallery?.[0]?.url ? [{ url: product.gallery[0].url }] : undefined,
      type: 'website',
      url: `/san-pham/${slug}/`,
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, showInterestForm] = await Promise.all([getProductBySlug(slug), hasProductInterestForm()])
  if (!product) notFound()

  const images = product.gallery || []
  const productPath = `/san-pham/${product.slug || slug}/`
  const canonicalUrl = `https://mayaobongchuyen.vn${productPath}`
  const breadcrumbCategory = getProductBreadcrumbCategory(product)
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://mayaobongchuyen.vn/' },
    { '@type': 'ListItem', position: 2, name: 'Sản Phẩm', item: 'https://mayaobongchuyen.vn/tim-kiem/' },
    ...(breadcrumbCategory ? [{ '@type': 'ListItem', position: 3, name: breadcrumbCategory.name, item: `https://mayaobongchuyen.vn/${breadcrumbCategory.slug}/` }] : []),
    { '@type': 'ListItem', position: breadcrumbCategory ? 4 : 3, name: product.name, item: canonicalUrl },
  ]
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }
  const productImages = images
    .filter((image) => image.url)
    .map((image) => image.url!.startsWith('http') ? image.url : `https://mayaobongchuyen.vn${image.url}`)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    image: productImages,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      url: canonicalUrl,
    },
  }
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)
  const discountPercent = hasDiscount ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0
  const productHighlights = [
    { icon: Shirt, label: 'Form thi đấu', text: 'Cổ tim, dáng gọn cho vận động liên tục trên sân.' },
    { icon: Palette, label: 'Màu đội', text: 'Có thể đổi màu, logo, tên đội, tên số theo brief.' },
    { icon: Ruler, label: 'Gom size', text: 'Tư vấn size nam, nữ và libero theo danh sách đội.' },
    { icon: Users, label: 'Đơn đội', text: 'Phù hợp CLB, trường lớp, công ty và giải phong trào.' },
  ]
  const orderSteps = ['Gửi mẫu hoặc ý tưởng', 'Chốt màu, logo, tên số', 'Gom size và số lượng', 'Sản xuất sau khi duyệt mẫu']

  return (
    <main className="mbc-product-page">
      <ProductViewTracker
        itemCategory="volleyball"
        name={product.name}
        price={product.price}
        productId={product.id}
        sku={product.sku}
        tenantSlug="mayaobongchuyen"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <SiteHeader legacyNavigation={fallbackNavigation} />

      <article className="mbc-product-shell">
        <nav className="mbc-product-breadcrumb" aria-label="Đường dẫn">
          <a className="mbc-product-breadcrumb-home" href="/">
            <ArrowLeft aria-hidden="true" size={16} />
            Trang chủ
          </a>
          <span>/</span>
          <a href="/tim-kiem/">Sản phẩm</a>
          <span>/</span>
          {breadcrumbCategory ? <><a href={`/${breadcrumbCategory.slug}/`}>{breadcrumbCategory.name}</a><span>/</span></> : null}
          <span>{product.name}</span>
        </nav>

        <h1 className="mbc-product-title">{product.name}</h1>

        <div className="mbc-product-layout">
          <div className="mbc-product-gallery-card">
            {hasDiscount ? <div className="mbc-product-discount-badge">-{discountPercent}%</div> : null}
            <ProductGallery images={images} productName={product.name} />
          </div>

          <section className="mbc-product-buybox" aria-label="Thông tin đặt may">
            <div className="mbc-product-kicker">
              <span>{product.sku}</span>
              <span>May áo bóng chuyền</span>
            </div>
            <p className="mbc-product-summary">{product.shortDescription}</p>
            <div className="mbc-product-price-card">
              <span className="mbc-product-price-label">Giá tham khảo</span>
              <div className="mbc-product-price-row">
                {hasDiscount ? <del className="mbc-product-original-price">{formatPrice(product.compareAtPrice!)}</del> : null}
                <strong className="mbc-product-sale-price">{formatPrice(product.price)}</strong>
              </div>
              <p>Giá có thể thay đổi theo chất liệu, số lượng, kiểu in và mức tuỳ biến.</p>
            </div>
            <div className="mbc-product-cta-row">
              <a className="mbc-product-primary-cta" href="#nhan-tu-van">
                <MessageCircle aria-hidden="true" size={18} />
                Nhận tư vấn mẫu này
              </a>
              <a className="mbc-product-secondary-cta" href="/bang-gia-may-ao-bong-chuyen/">Xem bảng giá</a>
            </div>
            <div className="mbc-product-custom-note">
              <CheckCircle2 aria-hidden="true" size={20} />
              <div>
                <b>Có thể chỉnh theo yêu cầu đội bóng</b>
                <p>Trao đổi màu sắc, logo, tên số và số lượng trước khi chốt sản xuất.</p>
              </div>
            </div>
            <div className="mbc-product-highlight-grid">
              {productHighlights.map((item) => {
                const Icon = item.icon
                return (
                  <div className="mbc-product-highlight" key={item.label}>
                    <Icon aria-hidden="true" size={20} />
                    <b>{item.label}</b>
                    <p>{item.text}</p>
                  </div>
                )
              })}
            </div>
            <section className="mbc-product-process" aria-labelledby="mbc-product-process-title">
              <h2 id="mbc-product-process-title">Quy trình đặt may</h2>
              <ol>
                {orderSteps.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
            {showInterestForm ? <ProductInterestForm productName={product.name} productUrl={`https://mayaobongchuyen.vn/san-pham/${product.slug || slug}/`} variant="accent" /> : null}
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  )
}
