import Link from 'next/link'
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { ArrowLeft, BadgeCheck, Gift, MapPin, Phone, Search } from 'lucide-react'
import { JsonLd } from '../../_components/json-ld'
import { SiteHeader, phoneHref, zaloHref } from '../../_components/info-pages'
import { ZaloIcon } from '../../_components/zalo-icon'
import {
  formatPrice,
  getDiscountPercent,
  getProductCatalogLinks,
  getProductColorTags,
  getProductBySlug,
  getProductDescriptionParagraphs,
  getValidCompareAtPrice,
} from '../../../lib/content'
import { absoluteUrl, breadcrumbJsonLd, productJsonLd } from '../../../lib/seo'
import { ProductGallery } from './product-gallery'
import { QuickOrderForm } from './quick-order-form'

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

const sizeRows = [
  ['S', '45 - 55 kg', '1m55 - 1m60'],
  ['M', '55 - 65 kg', '1m61 - 1m67'],
  ['L', '65 - 75 kg', '1m68 - 1m75'],
  ['XL', '75 - 85 kg', '1m76 - 1m81'],
  ['XXL', '85 - 95 kg', '1m82 - 1m87'],
]

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | MayaoPickleball',
    }
  }

  return {
    title: `${product.name} | MayaoPickleball`,
    description: product.shortDescription,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      title: `${product.name} | MayaoPickleball`,
      description: product.shortDescription,
      type: 'website',
      url: absoluteUrl(`/san-pham/${product.slug}`),
      images: product.gallery?.[0]?.url ? [{ url: product.gallery[0].url }] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const paragraphs = getProductDescriptionParagraphs(product)
  const badges = product.badges?.map((badge) => badge.label).filter((badge) => badge && badge.toLowerCase() !== 'mới') || []
  const colorTags = getProductColorTags(product)
  const compareAtPrice = getValidCompareAtPrice(product)
  const discountPercent = getDiscountPercent(product)
  const relatedCatalogLinks = getProductCatalogLinks(product)
  const colorSummary = colorTags.length ? colorTags.map((tag) => tag.label).join(', ') : 'Thiết kế theo màu đội'

  const productSpecs = [
    ['Thương hiệu', 'X24 SPORT'],
    ['Dòng sản phẩm', 'Áo pickleball thiết kế đặt may'],
    ['Chất liệu vải', 'Chất vải co giãn chuẩn thi đấu'],
    ['Form áo', 'Form thể thao gọn, dễ di chuyển'],
    ['Màu sắc', colorSummary],
    ['Kích thước', 'Có đủ size S - 4XL, thoải mái'],
  ]

  return (
    <main className="product-page">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Trang chủ', path: '/' },
            { name: 'Sản phẩm', path: '/san-pham' },
            { name: product.name, path: `/san-pham/${product.slug}` },
          ]),
          productJsonLd(product),
        ]}
      />
      <SiteHeader />

      <section className="product-detail-shell">
        <div className="product-crumbs">
          <Link className="inline-flex items-center gap-2" href="/">
            <ArrowLeft size={16} />
            Về trang chủ
          </Link>
          <span>/</span>
          <Link href="/san-pham">Sản phẩm</Link>
          <span>/</span>
          <strong>{product.sku}</strong>
        </div>

        <h1 className="product-title-heading">{product.name}</h1>

        <div className="product-detail-grid">
          <ProductGallery
            discountPercent={discountPercent}
            images={product.gallery || []}
            productName={product.name}
          />

          <section className="product-buy-panel">
            <p className="product-brand-line">
              Thương hiệu: <strong>X24 Sport</strong> | Áo pickleball thiết kế
            </p>

            <div className="product-rating-line" aria-label="Trạng thái đặt may">
              <em className="product-stock-inline">
                Trạng thái: <strong>Còn nhận đặt may</strong>
              </em>
            </div>

            <div className="product-deal-box">
              <div>
                <strong>{formatPrice(product.price)}</strong>
                <p>
                  {discountPercent ? <span>-{discountPercent}%</span> : null}
                  {compareAtPrice ? <del>{formatPrice(compareAtPrice)}</del> : null}
                  Giá tham khảo theo mẫu
                </p>
              </div>
              <div>
                <span>Đặt may theo đội</span>
                <strong>tư vấn size, màu, logo</strong>
              </div>
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
                Ưu đãi đặt hàng tại MayaoPickleball
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
              <a className="product-sample-action" href={zaloHref} rel="noreferrer" target="_blank">
                <ZaloIcon size={20} />
                Chat Zalo
              </a>
              <a className="product-call-action" href={phoneHref}>
                <Phone size={18} />
                Gọi hotline 0989353247
              </a>
            </div>

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
              <Link href="/chat-lieu-va-bang-size-ao-pickleball">
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
              {(paragraphs.length ? paragraphs : [product.shortDescription]).map((paragraph, i) =>
                paragraph.startsWith('<') ? (
                  <div key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ) : (
                  <p key={i}>{paragraph}</p>
                )
              )}
            </div>
          </article>

          <aside className="product-side-card">
            <p className="section-label">Bảng size tham khảo</p>
            <div className="product-size-table-wrap">
              <table className="product-size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Cân nặng</th>
                    <th>Chiều cao</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeRows.map(([size, weight, height]) => (
                    <tr key={size}>
                      <th scope="row">{size}</th>
                      <td>{weight}</td>
                      <td>{height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="product-size-note">Size 3XL - 4XL và form đặc biệt sẽ được tư vấn theo số đo.</p>
          </aside>
        </section>

        <QuickOrderForm
          productName={product.name}
          productUrl={`https://mayaopickleball.vn/san-pham/${product.slug}`}
        />

        <section className="product-fit-card">
          <div>
            <p className="section-label">Phù hợp với</p>
            <ul>
              <li>Đồng phục pickleball cho câu lạc bộ</li>
              <li>Áo thi đấu phong trào, giao lưu doanh nghiệp</li>
              <li>Đơn đặt may cần tên, số và logo riêng</li>
            </ul>
          </div>
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
        </section>

        <section className="product-related-links" aria-labelledby="product-related-links-title">
          <div>
            <p className="section-label">Xem thêm mẫu liên quan</p>
            <h2 id="product-related-links-title">Tìm nhanh theo màu, kiểu áo và hướng đặt may</h2>
          </div>
          <div className="product-related-link-row">
            {relatedCatalogLinks.map((filter) => (
              <Link href={filter.href} key={filter.slug}>
                {filter.label}
              </Link>
            ))}
            <Link href="/chat-lieu-va-bang-size-ao-pickleball">Chất liệu & bảng size</Link>
            <Link href="/dat-may-ao-pickleball">Đặt may theo yêu cầu</Link>
          </div>
        </section>

        <div className="product-mobile-cta" aria-label="Liên hệ nhanh">
          <a href={zaloHref} rel="noreferrer" target="_blank">
            <ZaloIcon size={22} />
            <span>Chat Zalo</span>
          </a>
          <a href={phoneHref}>
            <Phone size={21} />
            <span>Gọi hotline</span>
          </a>
        </div>
      </section>
    </main>
  )
}
