import { ArrowRight, ChevronDown, ClipboardCheck, Menu, Search, ShieldCheck, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { industries, productTypes, type PreviewProduct } from '../mayaodongphuc-preview/data'
import styles from '../[tenant]/_mayaodongphuc/mayaodongphuc.module.css'

export const v2Base = '/mayaodongphuc-preview-v2'

export function V2Logo() {
  return <Link className={styles.logo} href={v2Base} aria-label="May Áo Đồng Phục V2 — Trang chủ"><span>M</span><div><strong>MAY ÁO</strong><small>ĐỒNG PHỤC</small></div></Link>
}

export function V2Shell({ children }: { children: ReactNode }) {
  return <div className={styles.site}>
    <a className={styles.skip} href="#main-content">Đi đến nội dung chính</a>
    <div className={styles.previewBar}><span>V2 / UNIFORM OS</span><p>Bản thiết kế trải nghiệm — không nhận đơn thật</p><b>DEMO 2026</b></div>
    <header className={styles.header}><div className={styles.headerInner}>
      <V2Logo />
      <nav className={styles.nav} aria-label="Điều hướng chính">
        <details><summary>Giải pháp <ChevronDown /></summary><div className={styles.mega}><div className={styles.megaLead}><span>CHỌN THEO BỐI CẢNH</span><h2>Mỗi đội ngũ cần một hệ đồng phục khác nhau.</h2><p>Từ môi trường làm việc đến vai trò và tần suất sử dụng.</p></div><div>{industries.map((item) => <Link href={`${v2Base}/danh-muc/${item.slug}`} key={item.slug}><span>{item.code}</span><b>{item.name}</b><small>{item.note}</small></Link>)}</div><aside><h3>Theo loại sản phẩm</h3>{productTypes.map((item) => <Link href={`${v2Base}/danh-muc/dong-phuc-doanh-nghiep`} key={item}>{item}<ArrowRight /></Link>)}</aside></div></details>
        <Link href={`${v2Base}/#quy-trinh`}>Quy trình</Link><Link href={`${v2Base}/#vat-lieu`}>Vật liệu</Link><Link href={`${v2Base}/#tieu-chuan`}>Tiêu chuẩn</Link>
      </nav>
      <div className={styles.actions}><button aria-label="Tìm kiếm" type="button"><Search /></button><Link href={`${v2Base}/#bao-gia`}>Tạo yêu cầu <ArrowRight /></Link><details className={styles.mobile}><summary aria-label="Mở menu"><Menu /></summary><div className={styles.mobilePanel}><div><V2Logo /><span><X /></span></div><p>Chọn giải pháp theo ngành</p>{industries.map((item) => <Link href={`${v2Base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}<ArrowRight /></Link>)}<Link className={styles.mobileCta} href={`${v2Base}/#bao-gia`}>Tạo yêu cầu báo giá</Link></div></details></div>
    </div></header>
    <main id="main-content">{children}</main>
    <footer className={styles.footer}><div className={styles.footerTop}><div><V2Logo /><p>Một hệ thống đặt may rõ ràng cho doanh nghiệp đang xây dựng hình ảnh đồng nhất.</p></div><div><h2>Khám phá</h2>{industries.slice(0, 4).map((item) => <Link href={`${v2Base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}</div><div><h2>Hỗ trợ</h2><Link href={`${v2Base}/#quy-trinh`}>Quy trình đặt may</Link><Link href={`${v2Base}/#vat-lieu`}>Chất liệu & size</Link><Link href={`${v2Base}/#bao-gia`}>Yêu cầu báo giá</Link></div><div className={styles.footerBadge}><ShieldCheck /><strong>SPEC<br />READY</strong><small>MDP / V2</small></div></div><div className={styles.footerBottom}><span>© May Áo Đồng Phục</span><span>Bản demo đang chờ thông tin doanh nghiệp xác thực.</span></div></footer>
  </div>
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className={styles.breadcrumbs} aria-label="Đường dẫn"><Link href={v2Base}>Trang chủ</Link>{items.map((item) => <span key={item.label}>/ {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>
}

export function ProductCard({ product, eager = false }: { product: PreviewProduct; eager?: boolean }) {
  return <article className={styles.productCard}><Link className={styles.productImage} href={`${v2Base}/san-pham/${product.slug}`}><Image alt={product.name} fill loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" src={product.image} />{product.badge ? <span>{product.badge}</span> : null}<i><ArrowRight /></i></Link><div className={styles.productMeta}><p><span>{product.code}</span><span>{product.material}</span></p><h3><Link href={`${v2Base}/san-pham/${product.slug}`}>{product.name}</Link></h3><div><b>Báo giá theo cấu hình</b><span className={styles.swatches}>{product.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span></div></div></article>
}

export function TrustPill() { return <span className={styles.trustPill}><ClipboardCheck /> Brief rõ trước khi báo giá</span> }
