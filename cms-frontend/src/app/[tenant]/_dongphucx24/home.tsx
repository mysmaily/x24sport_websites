import { ArrowRight, Building2, Check, ChevronRight, ClipboardCheck, Flag, GraduationCap, Layers3, Palette, Ruler, ShieldCheck, Sparkles, SwatchBook } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { TenantPromoHero, type TenantPromoHeroSlide } from '../../_components/tenant-promo-hero'
import { getPublicStoreSettings } from '../../../lib/store-settings'
import { categories, products } from './data'
import { QuoteForm } from './quote-form'
import { DongPhucX24Shell } from './shell'
import styles from './dongphucx24.module.css'

const heroSlides: TenantPromoHeroSlide[] = [
  {
    alt: 'Đội ngũ nhân viên Việt Nam mặc đồng phục polo xanh navy và trắng trong văn phòng',
    height: 941,
    mobileSrc: '/images/dongphucx24/home/uniform-corporate-team-mobile.webp',
    src: '/images/dongphucx24/home/uniform-corporate-team.webp',
    width: 1672,
  },
  {
    alt: 'Đội ngũ công ty Việt Nam mặc áo polo cam xanh tham gia team building ngoài trời',
    height: 941,
    mobileSrc: '/images/dongphucx24/home/uniform-team-building-mobile.webp',
    src: '/images/dongphucx24/home/uniform-team-building.webp',
    width: 1672,
  },
  {
    alt: 'Nhóm học sinh sinh viên Việt Nam mặc áo polo đồng phục lớp tại sân trường',
    height: 941,
    mobileSrc: '/images/dongphucx24/home/uniform-school-class-mobile.webp',
    src: '/images/dongphucx24/home/uniform-school-class.webp',
    width: 1672,
  },
]

function ProductCard({ product, priority = false }: { product: (typeof products)[number]; priority?: boolean }) {
  return <article className={styles.productCard}>
    <Link className={styles.productImage} href={`/san-pham/${product.slug}/`}>
      <Image alt={product.alt} fill loading={priority ? 'eager' : 'lazy'} priority={priority} sizes="(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 25vw" src={product.image} />
      {(product.category === 'ao-lop-truong-hoc' || product.category === 'team-building-su-kien') && <b aria-hidden="true" className={styles.sourceBrandMask}>X24</b>}
    </Link>
    <div className={styles.productInfo}><small>{product.useCase}</small><h3><Link href={`/san-pham/${product.slug}/`}>{product.name}</Link></h3><div className={styles.productMeta}><strong>Báo giá theo yêu cầu</strong><span aria-label="Màu gợi ý" className={styles.productSwatch} style={{ background: product.accent }} /></div></div>
  </article>
}

export async function DongPhucX24Home() {
  const consultationEnabled = Boolean((await getPublicStoreSettings()).telegramChatId)
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://dongphucx24.vn/#organization', name: 'Đồng Phục X24', url: 'https://dongphucx24.vn/' },
      { '@type': 'WebSite', '@id': 'https://dongphucx24.vn/#website', name: 'Đồng Phục X24', url: 'https://dongphucx24.vn/', publisher: { '@id': 'https://dongphucx24.vn/#organization' }, inLanguage: 'vi-VN' },
    ],
  }
  return <DongPhucX24Shell>
    <main id="main-content">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c') }} type="application/ld+json" />
      <TenantPromoHero ariaLabel="Ba giải pháp đồng phục nổi bật" className={styles.promoHero} slides={heroSlides}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> Đồng phục cho tổ chức & đội nhóm</p>
          <h1>May đồng phục theo yêu cầu.<br /><em>Đẹp riêng cho từng tập thể.</em></h1>
          <p className={styles.heroLead}>Chọn mẫu áo đồng phục cho công ty, team building hoặc trường lớp; sau đó phối màu, chọn chất liệu, in thêu logo và tư vấn size trước khi báo giá.</p>
          <div className={styles.heroActions}><Link className={styles.primaryButton} href="/san-pham/">Xem catalog <ArrowRight aria-hidden="true" /></Link><Link className={styles.secondaryButton} href="#nhan-tu-van">{consultationEnabled ? 'Gửi yêu cầu tư vấn' : 'Chuẩn bị yêu cầu'}</Link></div>
          <nav aria-label="Giải pháp đồng phục theo nhóm khách hàng" className={styles.heroAudiences}>
            <Link href="/danh-muc/dong-phuc-cong-ty/"><Building2 aria-hidden="true" /><span><b>Công ty & doanh nghiệp</b><small>Chỉn chu nhận diện · phù hợp từng bộ phận</small></span></Link>
            <Link href="/danh-muc/team-building-su-kien/"><Flag aria-hidden="true" /><span><b>Dã ngoại & team building</b><small>Thoáng nhẹ · nổi bật tinh thần tập thể</small></span></Link>
            <Link href="/danh-muc/ao-lop-truong-hoc/"><GraduationCap aria-hidden="true" /><span><b>Lớp học & trường học</b><small>Thiết kế riêng · dễ gom size và số lượng</small></span></Link>
          </nav>
        </div>
      </TenantPromoHero>

      <section aria-label="Điểm bắt đầu" className={styles.quickBar}>
        <p>Bắt đầu từ điều bạn đang cần</p>
        <div><Link href="/danh-muc/dong-phuc-cong-ty/">May cho công ty <ChevronRight aria-hidden="true" /></Link><Link href="/danh-muc/dong-phuc-nha-hang-fnb/">Mở quán / nhà hàng <ChevronRight aria-hidden="true" /></Link><Link href="/danh-muc/ao-lop-truong-hoc/">Làm áo lớp <ChevronRight aria-hidden="true" /></Link><Link href="/danh-muc/team-building-su-kien/">Chuẩn bị sự kiện <ChevronRight aria-hidden="true" /></Link></div>
      </section>

      <section className={styles.section} id="giai-phap">
        <div className={styles.sectionHeading}><div><span><Layers3 aria-hidden="true" /> CHỌN THEO NHU CẦU</span><h2>Tìm mẫu đồng phục<br />đúng mục đích sử dụng.</h2></div><p>Chọn theo công ty, nhà hàng, trường học, team building hoặc ngành nghề; X24 sẽ tư vấn chất liệu và cách hoàn thiện phù hợp.</p></div>
        <div className={styles.categoryGrid}>{categories.map((category, index) => <Link className={`${styles.categoryCard} ${index < 2 ? styles.categoryWide : ''}`} href={`/danh-muc/${category.slug}/`} key={category.slug}>
          <Image alt={`Khám phá ${category.name.toLowerCase()}`} fill loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" src={category.image} />
          <i aria-hidden="true" />
          {(category.slug === 'ao-lop-truong-hoc' || category.slug === 'team-building-su-kien') && <b aria-hidden="true" className={styles.sourceBrandMask}>X24</b>}
          <div><small>{category.eyebrow}</small><h3>{category.name}</h3><p>{category.description}</p><span>Xem giải pháp <ArrowRight aria-hidden="true" /></span></div>
        </Link>)}</div>
      </section>

      <section className={`${styles.section} ${styles.catalogSection}`} id="cam-hung">
        <div className={styles.catalogHeading}><div><span><Sparkles aria-hidden="true" /> CATALOG NỔI BẬT</span><h2>Mẫu đủ nhiều để chọn.<br />Đủ mở để chỉnh.</h2></div><Link href="/san-pham/">Xem toàn bộ catalog <ArrowRight aria-hidden="true" /></Link></div>
        <div className={styles.productGrid}>{products.map((product, index) => <ProductCard key={product.slug} priority={index < 4} product={product} />)}</div>
      </section>

      <section className={styles.materialSection} id="vat-lieu">
        <div className={styles.materialIntro}><span><SwatchBook aria-hidden="true" /> TÙY CHỈNH THEO YÊU CẦU</span><h2>Một mẫu áo, nhiều cách hoàn thiện.</h2><p>X24 tư vấn chất liệu, phối màu, in thêu logo, form áo và dải size theo nhu cầu sử dụng thực tế.</p><Link href="#nhan-tu-van">Gửi yêu cầu đặt may <ArrowRight aria-hidden="true" /></Link></div>
        <div className={styles.materialGrid}>
          <article><SwatchBook aria-hidden="true" /><b>Vật liệu & cảm giác mặc</b><p>Chọn bề mặt, độ dày và độ thoáng theo tần suất sử dụng.</p></article>
          <article><Palette aria-hidden="true" /><b>Màu & nhận diện</b><p>Điều chỉnh phối màu, vị trí logo và thông điệp của đội ngũ.</p></article>
          <article><Ruler aria-hidden="true" /><b>Form & dải size</b><p>Thống nhất form, cách gom size và các trường hợp ngoại lệ.</p></article>
          <article><Layers3 aria-hidden="true" /><b>Bộ phận & số lượng</b><p>Tách mẫu khi các bộ phận cần màu sắc, công việc hoặc cách nhận diện khác nhau.</p></article>
        </div>
      </section>

      <section className={styles.processSection} id="quy-trinh">
        <div className={styles.processVisual}>
          <Image alt="Bàn làm việc với bản thiết kế áo polo, bảng màu vải và thông tin đặt may" fill loading="lazy" sizes="(max-width: 760px) 100vw, 42vw" src="/images/mayaodongphuc/blog/process-checklist-guide.webp" />
          <div aria-hidden="true" className={styles.processVisualShade} />
          <div className={styles.processVisualCopy}><span><ClipboardCheck aria-hidden="true" /> THÔNG TIN ĐẶT MAY</span><strong>Mẫu áo, bảng màu, logo và size cùng nằm trong một bản duyệt.</strong><small>Người đặt hàng và người duyệt cùng kiểm tra trước khi đưa vào sản xuất.</small></div>
        </div>
        <div className={styles.processContent}>
          <header className={styles.processHeading}><span><Layers3 aria-hidden="true" /> QUY TRÌNH ĐẶT MAY</span><h2>Từ mẫu tham khảo<br />đến thiết kế duyệt sản xuất.</h2><p>Bốn bước giúp thống nhất mẫu áo, màu sắc, logo, số lượng và size trước khi may.</p></header>
          <ol>{[
            { title: 'Chọn dòng sản phẩm', text: 'Công ty, team building, lớp học hoặc ngành nghề.', Icon: SwatchBook },
            { title: 'Gửi yêu cầu', text: 'Mẫu, màu, logo, số lượng và dải size.', Icon: Layers3 },
            { title: 'Duyệt mẫu thiết kế', text: 'Phối màu, chất liệu và kỹ thuật in thêu.', Icon: Check },
            { title: 'Chốt đơn sản xuất', text: 'Danh sách size, số lượng và yêu cầu đóng gói.', Icon: ClipboardCheck },
          ].map(({ title, text, Icon }) => <li key={title}><div><Icon aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></li>)}</ol>
          <div className={styles.processTrust}><span><ShieldCheck aria-hidden="true" /> Xác nhận trước báo giá</span><span><Sparkles aria-hidden="true" /> Thiết kế theo nhận diện</span><span><Check aria-hidden="true" /> Duyệt mẫu trước sản xuất</span><span><Ruler aria-hidden="true" /> Thống nhất form & size</span></div>
        </div>
      </section>

      <section className={styles.quoteSection} id="nhan-tu-van">
        <div className={styles.quoteVisual}>
          <Image alt="Đội ngũ Việt Nam mặc nhiều dòng đồng phục trong không gian thiết kế" fill loading="lazy" sizes="(max-width: 760px) 100vw, 45vw" src="/images/mayaodongphuc/hero-atelier.webp" />
          <div aria-hidden="true" className={styles.quoteVisualShade} />
          <div className={styles.quoteVisualBadge}><Palette aria-hidden="true" /><span><b>MÀU · LOGO · VẬT LIỆU</b><small>Phát triển từ mẫu gần đúng</small></span></div>
        </div>
        <div className={styles.quotePanel}>
          <div className={styles.quoteCopy}><span><Sparkles aria-hidden="true" /> {consultationEnabled ? 'NHẬN TƯ VẤN' : 'CHUẨN BỊ YÊU CẦU'}</span><h2>Bạn chọn mẫu gần đúng.<br />X24 tư vấn cách hoàn thiện.</h2><p>Gửi mẫu bạn thích và số lượng dự kiến để được tư vấn chất liệu, phối màu, in thêu logo, size và báo giá.</p><ul><li><SwatchBook aria-hidden="true" /> Loại đồng phục cần may</li><li><Palette aria-hidden="true" /> Logo & màu nhận diện</li><li><Ruler aria-hidden="true" /> Số lượng, size, thời điểm cần nhận</li></ul></div>
          {consultationEnabled ? <QuoteForm /> : <div className={styles.quoteFallback}><div><b>Bắt đầu từ catalog</b><p>Lưu mẫu gần đúng trước khi trao đổi về màu, logo, vật liệu và size.</p></div><Link className={styles.primaryButton} href="/san-pham/">Chọn mẫu ngay <ArrowRight aria-hidden="true" /></Link></div>}
        </div>
      </section>
    </main>
  </DongPhucX24Shell>
}

export { ProductCard }
