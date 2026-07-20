import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, ChevronRight, Clock3, Headphones, Layers3, MessageCircle, PackageCheck, Phone, Search, Shirt, Sparkles, Truck } from 'lucide-react'
import { ProductCard } from './_components/product-card'
import { JsonLd } from './_components/json-ld'
import { Logo, SiteHeader } from './_components/site-header'
import { ProcessVideoButton } from './_components/process-video-button'
import type { ProductPreview, SportCategory } from '../lib/catalog'
import { contactItems } from '../lib/contact'
import { getCatalogData } from '../lib/content'
import { absoluteUrl, siteLogoUrl } from '../lib/seo'

export const metadata: Metadata = { alternates: { canonical: '/' } }

function ProductShelf({ title, subtitle, category, products: items }: { title: string, subtitle: string, category: SportCategory, products: ProductPreview[] }) {
  return (
    <section className="product-shelf">
      <Link className="shelf-promo" href={`/danh-muc/${category.slug}`}>
        <Image src={category.image} alt={`Trang phục ${category.name} X24Sport`} fill sizes="(max-width: 760px) 100vw, 25vw" />
        <div className="shelf-promo-copy"><span>X24 COLLECTION</span><strong>{category.name}</strong><small>Xem bộ sưu tập <ArrowRight size={15} /></small></div>
      </Link>
      <div className="shelf-products">
        <div className="shelf-heading"><div><p>{subtitle}</p><h2>{title}</h2></div><Link href={`/danh-muc/${category.slug}`}>Xem tất cả <ChevronRight size={17} /></Link></div>
        {items.length
          ? <div className="product-grid">{items.map((product) => <ProductCard product={product} key={`${title}-${product.slug}`} />)}</div>
          : <div className="catalog-empty"><Shirt /><div><strong>Sản phẩm đang được cập nhật từ CMS</strong><p>Danh mục {category.name} đã sẵn sàng. Sản phẩm sẽ xuất hiện tại đây sau khi được xuất bản.</p></div><Link href={`/danh-muc/${category.slug}`}>Xem danh mục <ArrowRight size={16} /></Link></div>}
      </div>
    </section>
  )
}

function StoreFooter({ categories }: { categories: SportCategory[] }) {
  return (
    <footer className="store-footer" id="lien-he">
      <div className="site-container">
        <form className="footer-search" action="/san-pham" role="search"><input name="q" placeholder="Tìm kiếm sản phẩm…" aria-label="Tìm sản phẩm" autoComplete="off" /><button aria-label="Tìm kiếm"><Search size={22} /></button></form>
        <div className="footer-main">
          <div className="footer-about">
            <Logo />
            <p><strong>X24 Sport - Xưởng May Đồ Thể Thao</strong></p>
            <div className="footer-contact-list">
              {contactItems.map((item) => {
                const Icon = item.icon
                const content = <><Icon size={17} /><span><strong>{item.label}:</strong> {item.value}</span></>
                return item.href
                  ? <a href={item.href} key={`${item.label}-${item.value}`}>{content}</a>
                  : <p key={`${item.label}-${item.value}`}>{content}</p>
              })}
            </div>
          </div>
          <div><h3>Danh mục</h3>{categories.slice(0, 4).map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}>{category.name}</Link>)}</div>
          <div><h3>Khám phá</h3>{categories.slice(4).map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}>{category.name}</Link>)}<Link href="/san-pham">Tất cả sản phẩm</Link><Link href="/blog/">Blog thể thao</Link></div>
          <div><h3>Hỗ trợ</h3><a href="#quy-trinh">Cách đặt hàng</a><a href="tel:0989353247">Tư vấn thiết kế</a><Link href="/lien-he/">Kênh liên hệ</Link></div>
        </div>
        <div className="support-cards">
          <a href="tel:0989353247"><Phone /><span><small>Tư vấn nhanh</small><strong>0989 353 247</strong></span></a>
          <a href="tel:0989353247"><MessageCircle /><span><small>Trao đổi yêu cầu</small><strong>Tư vấn đội nhóm</strong></span></a>
          <a href="#bo-mon"><Shirt /><span><small>Khám phá</small><strong>9 nhóm sản phẩm</strong></span></a>
        </div>
        <div className="footer-bottom"><span>© 2026 X24Sport. All rights reserved.</span><span>Trang phục cho mọi chuyển động.</span></div>
      </div>
    </footer>
  )
}

export default async function HomePage() {
  const { categories, shelves } = await getCatalogData()
  const shelfData = shelves.map((shelf) => ({
    title: `Sản phẩm ${shelf.category.name}`,
    subtitle: shelf.category.eyebrow,
    category: shelf.category, products: shelf.products,
  }))
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${absoluteUrl('/')}#organization`,
        name: 'X24Sport', url: absoluteUrl('/'),
        logo: siteLogoUrl(),
        contactPoint: { '@type': 'ContactPoint', telephone: '+84-989-353-247', contactType: 'customer service', availableLanguage: 'Vietnamese' },
      },
      {
        '@type': 'WebSite', '@id': `${absoluteUrl('/')}#website`,
        name: 'X24Sport', url: absoluteUrl('/'), publisher: { '@id': `${absoluteUrl('/')}#organization` },
        inLanguage: 'vi-VN',
      },
    ],
  }
  return (
    <div className="storefront-page">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main id="noi-dung" className="site-container">
        <section className="hero-directory" id="bo-mon">
          <div className="promo-hero">
            <Image preload fetchPriority="high" quality={70} src="/images/brand/hero-teamwear.webp" alt="Đội ngũ vận động viên mặc trang phục thể thao thiết kế" fill sizes="(max-width: 760px) 100vw, 65vw" />
            <div className="promo-shade" />
            <div className="promo-copy"><span>X24SPORT / CUSTOM TEAMWEAR</span><h1><span>TRANG PHỤC</span><span>CHO MỌI</span><span>CHUYỂN ĐỘNG</span></h1><p>Thiết kế đồng phục thể thao theo màu sắc và tinh thần riêng của đội bạn.</p><a href="#san-pham">Khám phá ngay <ArrowRight size={18} /></a></div>
          </div>
          <div className="directory-panel">
            <div className="directory-heading"><span>CHỌN THEO BỘ MÔN</span><h2>BẠN ĐANG TÌM KIẾM GÌ?</h2></div>
            <div className="category-grid">
              {categories.map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}><Image src={category.image} alt="" fill sizes="(max-width: 760px) 31vw, 12vw" /><span>{category.name.toUpperCase()}</span></Link>)}
            </div>
          </div>
        </section>

        <section className="brand-story" aria-labelledby="gioi-thieu-x24sport">
          <div className="brand-story-media">
            <Image src="/images/categories/dong-phuc.webp" alt="Đội nhóm trong bộ đồng phục thể thao thiết kế đồng bộ" fill sizes="(max-width: 820px) 100vw, 48vw" />
            <div><span>X24SPORT CUSTOM TEAMWEAR</span><strong>THIẾT KẾ · IN ẤN · SẢN XUẤT</strong></div>
          </div>
          <div className="brand-story-copy">
            <p className="eyebrow"><span />GIỚI THIỆU THƯƠNG HIỆU</p>
            <h2 id="gioi-thieu-x24sport">X24Sport — Đồng hành cùng bản sắc của mỗi đội</h2>
            <p>X24Sport xây dựng trang phục thể thao theo yêu cầu, từ màu sắc, họa tiết đến logo, tên và số áo. Mỗi thiết kế hướng tới sự đồng bộ, thoải mái khi vận động và khả năng nhận diện rõ ràng cho đội nhóm.</p>
            <div className="brand-facts">
              <div><Layers3 /><strong>9</strong><span>Nhóm sản phẩm</span></div>
              <div><Shirt /><strong>694+</strong><span>Mẫu tham khảo</span></div>
              <div><Sparkles /><strong>Riêng</strong><span>Thiết kế theo yêu cầu</span></div>
              <div><Clock3 /><strong>08–22h</strong><span>Tư vấn mỗi ngày</span></div>
            </div>
            <ProcessVideoButton />
          </div>
        </section>

        <section className="service-strip" aria-label="Dịch vụ X24Sport">
          <div><Truck /><span><strong>Giao hàng toàn quốc</strong><small>Tư vấn lịch nhận theo đơn</small></span></div>
          <div><PackageCheck /><span><strong>Đóng gói theo đội</strong><small>Sắp xếp rõ ràng, dễ kiểm tra</small></span></div>
          <div><Shirt /><span><strong>Thiết kế theo yêu cầu</strong><small>Màu sắc, logo, tên và số áo</small></span></div>
          <div><Headphones /><span><strong>Hỗ trợ trực tiếp</strong><small>Hotline 0989 353 247</small></span></div>
        </section>

        <div id="san-pham">{shelfData.map((shelf) => <ProductShelf {...shelf} key={shelf.title} />)}</div>

        <section className="process-highlight" id="quy-trinh">
          <span>X24SPORT CUSTOM TEAMWEAR</span>
          <h2>TỪ Ý TƯỞNG CỦA ĐỘI<br />ĐẾN BỘ TRANG PHỤC HOÀN CHỈNH</h2>
          <p>Chọn bộ môn — gửi màu sắc và logo — duyệt thiết kế — chốt size và sản xuất.</p>
          <a href="tel:0989353247">Bắt đầu với X24Sport <ArrowRight size={18} /></a>
        </section>
      </main>
      <StoreFooter categories={categories} />
      <div className="floating-contact" aria-label="Liên hệ nhanh"><a href="tel:0989353247" aria-label="Gọi X24Sport"><Phone /></a><Link href="/lien-he/" aria-label="Xem kênh liên hệ X24Sport"><MessageCircle /></Link></div>
    </div>
  )
}
