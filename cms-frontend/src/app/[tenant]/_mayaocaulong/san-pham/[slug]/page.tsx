import Link from 'next/link'
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, BadgeCheck, Gift, MapPin, Phone, Search } from 'lucide-react'
import { JsonLd } from '../../../../_components/json-ld'
import { ProductViewTracker } from '../../_components/product-view-tracker'
import { SiteFooter, SiteHeader, phoneHref, zaloHref } from '../../_components/info-pages'
import {
  formatPrice,
  getProductCatalogLinks,
  getProductColorTags,
  getProductBySlug,
  getProductDescriptionParagraphs,
  hasProductInterestForm,
} from '../../lib/content'
import { ProductInterestForm } from '../../_components/product-interest-form'
import { ProductGallery } from './product-gallery'

const defaultOgImage = {
  url: '/images/mayaocaulong/badminton-team-hero.png?v=20260728b',
  width: 1672,
  height: 941,
  alt: 'Đội cầu lông mặc áo thi đấu đặt may MayaoCauLong',
}

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

const storeLocations = [
  'Số 168/47 Kim Giang, Định Công, Hà Nội',
  'Số 137 Tôn Đản, P. An Khê, TP Đà Nẵng',
  'Số 420 Hùng Vương, Phường Pleiku, Gia Lai',
  'Số 96E Đường số 12, KP.4, P. Tam Bình, TP Hồ Chí Minh',
]

const orderOffers = [
  'Nhận đơn từ 5 áo',
  'Miễn phí in tên, số, logo theo yêu cầu',
  'Miễn phí giao hàng tận nơi cho đơn đội',
  'Bảo hành hình in, không bong tróc',
  'Sản xuất tại xưởng, không qua trung gian',
]

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | MayaoCauLong',
    }
  }

  return {
    title: `${product.name} | MayaoCauLong`,
    description: product.shortDescription,
    alternates: { canonical: `/san-pham/${product.slug}/` },
    openGraph: {
      title: `${product.name} | MayaoCauLong`,
      description: product.shortDescription,
      images: product.gallery?.[0]?.url ? [{ url: product.gallery[0].url }] : [defaultOgImage],
      type: 'website',
      url: `/san-pham/${product.slug}/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | MayaoCauLong`,
      description: product.shortDescription,
      images: [product.gallery?.[0]?.url || defaultOgImage.url],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const paragraphs = getProductDescriptionParagraphs(product)
  const showInterestForm = await hasProductInterestForm()
  const badges = product.badges?.map((badge) => badge.label).filter((badge) => badge && badge.toLowerCase() !== 'mới') || []
  const colorTags = getProductColorTags(product)
  const productCatalogLinks = getProductCatalogLinks(product)
  const breadcrumbCategory = productCatalogLinks.find((link) => link.group === 'type') || productCatalogLinks[0]
  const discountPercent = product.compareAtPrice
    ? Math.max(1, Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100))
    : 0
  const savings = product.compareAtPrice ? Math.max(0, product.compareAtPrice - product.price) : 0
  const colorSummary = colorTags.length ? colorTags.map((tag) => tag.label).join(', ') : 'Thiết kế theo màu đội'

  const productSpecs = [
    ['Thương hiệu', 'MAYAOCAULONG'],
    ['Dòng sản phẩm', 'Áo cầu lông thiết kế đặt may'],
    ['Chất liệu vải', 'Chất vải co giãn chuẩn thi đấu'],
    ['Form áo', 'Form thể thao gọn, dễ vung vợt'],
    ['Màu sắc', colorSummary],
    ['Kích thước', 'Có đủ size S - 4XL, thoải mái'],
  ]
  const canonicalProductUrl = `https://mayaocaulong.vn/san-pham/${product.slug}/`
  const productImage = product.gallery?.find((image) => image.url)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'MayaoCauLong' },
    image: productImage?.url ? [productImage.url] : undefined,
    url: canonicalProductUrl,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      url: canonicalProductUrl,
    },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://mayaocaulong.vn/' },
      { '@type': 'ListItem', position: 2, name: 'Sản Phẩm', item: 'https://mayaocaulong.vn/san-pham/' },
      ...(breadcrumbCategory ? [{ '@type': 'ListItem', position: 3, name: breadcrumbCategory.label, item: `https://mayaocaulong.vn${breadcrumbCategory.href}` }] : []),
      { '@type': 'ListItem', position: breadcrumbCategory ? 4 : 3, name: product.name, item: canonicalProductUrl },
    ],
  }

  return (
    <main className="product-page">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductViewTracker
        itemCategory={product.sport || 'badminton'}
        name={product.name}
        price={product.price}
        productId={product.id}
        sku={product.sku}
        tenantSlug="mayaocaulong"
      />
      <SiteHeader />

      <section className="product-detail-shell">
        <div className="product-crumbs">
          <Link className="inline-flex items-center gap-2" href="/">
            <ArrowLeft size={16} />
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/san-pham/">Sản Phẩm</Link>
          <span>/</span>
          {breadcrumbCategory ? <><Link href={breadcrumbCategory.href}>{breadcrumbCategory.label}</Link><span>/</span></> : null}
          <strong>{product.name}</strong>
        </div>

        <h1 className="product-page-title">{product.name}</h1>

        <div className="product-detail-grid">
          <ProductGallery
            discountPercent={discountPercent}
            images={product.gallery || []}
            productName={product.name}
          />

          <section className="product-buy-panel">
            <p className="product-brand-line">
              Thương hiệu: <strong>MayaoCauLong</strong> | Áo cầu lông thiết kế
            </p>

            <p className="product-order-note">Đặt may theo yêu cầu · nhận đơn từ 5 áo</p>

            <div className="product-deal-box">
              <div className="product-deal-price">
                <span>Giá ưu đãi</span>
                <strong>{formatPrice(product.price)}</strong>
              </div>
              <div className="product-deal-meta">
                {product.compareAtPrice ? (
                  <p>
                    <del>{formatPrice(product.compareAtPrice)}</del>
                    {discountPercent ? <span>Giảm {discountPercent}%</span> : null}
                  </p>
                ) : null}
                <small>Đã gồm VAT</small>
              </div>
              {savings ? <p className="product-deal-saving">Tiết kiệm {formatPrice(savings)} trên mỗi áo</p> : null}
            </div>

            {badges.length ? (
              <div className="product-badges">
                {badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            ) : null}

            <div className="product-offer-table">
              <h2>
                <Gift size={18} />
                Ưu đãi đặt hàng tại MayaoCauLong
              </h2>
              <ol>
                {orderOffers.map((offer) => (
                  <li key={offer}>
                    <span>{orderOffers.indexOf(offer) + 1}</span>
                    {offer}
                  </li>
                ))}
              </ol>
            </div>

            {colorTags.length ? (
              <div className="product-color-tags" aria-label="Màu sản phẩm">
                <span>Màu sản phẩm</span>
                <div>
                  {colorTags.map((tag) => (
                    <strong key={tag.label} style={tag.color ? ({ '--swatch': tag.color } as CSSProperties) : undefined}>
                      {tag.label}
                    </strong>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="product-detail-actions" id="tu-van">
              <a className="product-sample-action" href={zaloHref}>
                Đặt may mẫu
              </a>
              <a className="product-call-action" href={phoneHref}>
                Gọi cho MayaoCauLong
              </a>
            </div>

            {showInterestForm ? (
              <ProductInterestForm
                productName={product.name}
                productUrl={canonicalProductUrl}
              />
            ) : null}

            <p className="product-support-line">
              <Phone size={17} />
              Hỗ trợ 24/7, luôn sẵn sàng tư vấn cho bạn
            </p>
          </section>

          <aside className="product-right-column">
            <section className="product-store-card">
              <h2>Hệ thống cửa hàng</h2>
              <ul>
                {storeLocations.map((location) => (
                  <li key={location}>
                    <MapPin size={17} />
                    <span>
                      {location}
                      <strong>Đang mở cửa</strong>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="product-spec-card">
              <h2>Thông số sản phẩm</h2>
              <dl>
                {productSpecs.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/chat-lieu-va-bang-size-ao-cau-long">
                <Search size={16} />
                Xem chi tiết
              </Link>
            </section>
          </aside>
        </div>

        <section className="product-content-grid">
          <article className="product-copy-card">
            <p className="section-label">Mô tả sản phẩm</p>
            <div className="product-copy-flow">
              {(paragraphs.length ? paragraphs : [product.shortDescription]).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="product-side-card">
            <p className="section-label">Phù hợp với</p>
            <ul>
              <li>Đồng phục cầu lông cho câu lạc bộ</li>
              <li>Áo thi đấu phong trào, giao lưu doanh nghiệp</li>
              <li>Đơn đặt may cần tên, số và logo riêng</li>
            </ul>
            <ul className="product-trust-list">
              <li>
                <BadgeCheck size={16} />
                Tư vấn tên, số, logo cho đội và câu lạc bộ
              </li>
              <li>
                <BadgeCheck size={16} />
                Nhận lên mẫu theo bảng màu và chất vải thực tế
              </li>
              <li>
                <BadgeCheck size={16} />
                Hỗ trợ đơn phong trào, giao lưu và giải đấu
              </li>
            </ul>
          </aside>
        </section>
      </section>
      <SiteFooter />
    </main>
  )
}
