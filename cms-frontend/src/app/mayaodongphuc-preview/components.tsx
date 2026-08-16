import { ArrowRight, ChevronDown, Menu, Ruler, Search, Sparkles, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { industries, previewBase, productTypes, type PreviewProduct } from './data'
import styles from './studio.module.css'

export function Wordmark() {
  return <Link className={styles.wordmark} href={previewBase} aria-label="May Áo Đồng Phục - Trang chủ">
    <span className={styles.wordmarkNeedle} aria-hidden="true" />
    <strong>MAY ÁO</strong><b>ĐỒNG PHỤC</b>
  </Link>
}

function MegaMenu() {
  return <details className={styles.megaMenu}>
    <summary>Mẫu đồng phục <ChevronDown aria-hidden="true" /></summary>
    <div className={styles.megaPanel}>
      <div className={styles.megaIntro}><span>CATALOG / 2026</span><h2>Chọn theo công việc,<br />không chọn theo từ khóa.</h2><p>Bắt đầu từ môi trường sử dụng hoặc kiểu sản phẩm mà đội ngũ của bạn cần.</p><Link href={`${previewBase}/danh-muc/dong-phuc-doanh-nghiep`}>Xem toàn bộ mẫu <ArrowRight /></Link></div>
      <div className={styles.megaColumn}><h3>Theo môi trường</h3>{industries.map((item) => <Link href={`${previewBase}/danh-muc/${item.slug}`} key={item.slug}><span>{item.code}</span>{item.name}</Link>)}</div>
      <div className={styles.megaColumn}><h3>Theo sản phẩm</h3>{productTypes.map((item, index) => <Link href={`${previewBase}/danh-muc/dong-phuc-doanh-nghiep`} key={item}><span>0{index + 1}</span>{item}</Link>)}</div>
    </div>
  </details>
}

export function PreviewShell({ children }: { children: ReactNode }) {
  return <div className={styles.site}>
    <a className={styles.skipLink} href="#main-content">Bỏ qua đến nội dung</a>
    <div className={styles.draftBar}><span>BẢN THIẾT KẾ / 01</span><p>Giao diện thử nghiệm cho mayaodongphuc.com.vn</p><b>KHÔNG NHẬN ĐƠN THẬT</b></div>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Wordmark />
        <nav className={styles.desktopNav} aria-label="Điều hướng chính">
          <MegaMenu />
          <Link href={`${previewBase}/#quy-trinh`}>Thiết kế & đặt may</Link>
          <Link href={`${previewBase}/#du-an`}>Dự án</Link>
          <Link href={`${previewBase}/#chat-lieu`}>Chất liệu & size</Link>
          <Link href={`${previewBase}/#cam-nang`}>Cẩm nang</Link>
        </nav>
        <div className={styles.headerActions}>
          <button aria-label="Tìm kiếm" className={styles.iconButton} type="button"><Search /></button>
          <Link className={styles.headerCta} href={`${previewBase}/#bao-gia`}>Nhận báo giá <ArrowRight /></Link>
          <details className={styles.mobileMenu}>
            <summary aria-label="Mở menu"><Menu /></summary>
            <div className={styles.mobilePanel}>
              <div><Wordmark /><span className={styles.mobileClose}><X /></span></div>
              <p>Chọn nhanh theo môi trường sử dụng</p>
              <nav>{industries.map((item) => <Link href={`${previewBase}/danh-muc/${item.slug}`} key={item.slug}><span>{item.code}</span>{item.name}<ArrowRight /></Link>)}</nav>
              <Link className={styles.mobileQuote} href={`${previewBase}/#bao-gia`}>Nhận tư vấn & báo giá</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
    <main id="main-content">{children}</main>
    <footer className={styles.footer}>
      <div className={styles.footerHeadline}><span>Đồng phục không chỉ để giống nhau.</span><strong>Nó giúp mọi người cùng thuộc về một điều.</strong></div>
      <div className={styles.footerGrid}>
        <div><Wordmark /><p>Thiết kế và đặt may đồng phục theo môi trường sử dụng, vai trò công việc và nhận diện riêng.</p></div>
        <div><h2>Khám phá</h2>{industries.slice(0, 4).map((item) => <Link href={`${previewBase}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}</div>
        <div><h2>Hỗ trợ lựa chọn</h2><Link href={`${previewBase}/#quy-trinh`}>Quy trình đặt may</Link><Link href={`${previewBase}/#chat-lieu`}>Chất liệu & bảng size</Link><Link href={`${previewBase}/#bao-gia`}>Nhận báo giá</Link></div>
        <div className={styles.footerStamp}><Ruler /><span>DESIGNED<br />TO BELONG</span><small>MDP / 2026</small></div>
      </div>
      <div className={styles.footerBottom}><span>© May Áo Đồng Phục</span><span>Bản thiết kế đang chờ thông tin doanh nghiệp xác thực.</span></div>
    </footer>
  </div>
}

export function SectionTitle({ code, title, note, href }: { code: string; title: string; note?: string; href?: string }) {
  return <div className={styles.sectionTitle}><div><span>{code}</span><h2>{title}</h2></div>{note ? <p>{note}</p> : null}{href ? <Link href={href}>Xem tất cả <ArrowRight /></Link> : null}</div>
}

export function ProductCard({ product, eager = false }: { product: PreviewProduct; eager?: boolean }) {
  return <article className={styles.productCard}>
    <Link className={styles.productVisual} href={`${previewBase}/san-pham/${product.slug}`}>
      {product.badge ? <span className={styles.productBadge}>{product.badge}</span> : null}
      <Image alt={product.name} fetchPriority={eager ? 'high' : 'auto'} fill loading={eager ? 'eager' : 'lazy'} sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw" src={product.image} />
      <span className={styles.productArrow}><ArrowRight /></span>
    </Link>
    <div className={styles.productInfo}><div><span>{product.code}</span><span>{product.category}</span></div><h3><Link href={`${previewBase}/san-pham/${product.slug}`}>{product.name}</Link></h3><div className={styles.productBottom}><p>Giá theo cấu hình & số lượng</p><span className={styles.swatches} aria-label="Màu mẫu">{product.colors.map((color) => <i key={color} style={{ background: color }} />)}</span></div></div>
  </article>
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className={styles.breadcrumbs} aria-label="Đường dẫn"><Link href={previewBase}>Trang chủ</Link>{items.map((item) => <span key={item.label}><b>/</b>{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>
}

export function AtelierMark() {
  return <span className={styles.atelierMark}><Sparkles aria-hidden="true" /> Thiết kế theo nhận diện</span>
}
