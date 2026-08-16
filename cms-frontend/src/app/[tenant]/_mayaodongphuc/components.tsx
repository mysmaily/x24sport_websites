import { ArrowRight, ChevronDown, ClipboardCheck, Menu, Search, ShieldCheck, X } from 'lucide-react'
import { Be_Vietnam_Pro, Noto_Sans } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { UniformCategory, UniformProduct } from './lib'
import { productBadge, productCategory, productColors, productImages, productMaterial } from './lib'
import styles from './mayaodongphuc.module.css'

const heading = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['500', '600', '700', '800'], variable: '--v2-heading', display: 'swap' })
const body = Noto_Sans({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'], variable: '--v2-body', display: 'swap' })

export function UniformLogo() {
  return <Link className={styles.logo} href="/" aria-label="May Áo Đồng Phục — Trang chủ"><span>M</span><div><strong>MAY ÁO</strong><small>ĐỒNG PHỤC</small></div></Link>
}

export function UniformShell({ categories, children, consultationEnabled }: { categories: UniformCategory[]; children: ReactNode; consultationEnabled: boolean }) {
  const actionHref = consultationEnabled ? '/#bao-gia' : '/san-pham/'
  return <div className={`${styles.site} ${heading.variable} ${body.variable}`}>
    <a className={styles.skip} href="#main-content">Đi đến nội dung chính</a>
    <header className={styles.header}><div className={styles.headerInner}>
      <UniformLogo />
      <nav className={styles.nav} aria-label="Điều hướng chính">
        <details><summary>Giải pháp <ChevronDown /></summary><div className={styles.mega}><div className={styles.megaLead}><span>CHỌN THEO BỐI CẢNH</span><h2>Mỗi đội ngũ cần một hệ đồng phục khác nhau.</h2><p>Từ môi trường làm việc đến vai trò và tần suất sử dụng.</p></div><div>{categories.map((item, index) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}><span>{String(index + 1).padStart(2, '0')}</span><b>{item.name}</b><small>{item.description}</small></Link>)}</div><aside><h3>Đi nhanh</h3><Link href="/san-pham/">Tất cả mẫu <ArrowRight /></Link><Link href="/#quy-trinh">Quy trình đặt may <ArrowRight /></Link><Link href="/#vat-lieu">Vật liệu <ArrowRight /></Link></aside></div></details>
        <Link href="/#quy-trinh">Quy trình</Link><Link href="/#vat-lieu">Vật liệu</Link><Link href="/#tieu-chuan">Tiêu chuẩn</Link>
      </nav>
      <div className={styles.actions}><Link aria-label="Tìm mẫu" className={styles.searchAction} href="/san-pham/"><Search /></Link><Link href={actionHref}>{consultationEnabled ? 'Tạo yêu cầu' : 'Xem catalog'} <ArrowRight /></Link><details className={styles.mobile}><summary aria-label="Mở menu"><Menu /></summary><div className={styles.mobilePanel}><div><UniformLogo /><span><X /></span></div><p>Chọn giải pháp theo bối cảnh</p>{categories.map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}<ArrowRight /></Link>)}<Link className={styles.mobileCta} href={actionHref}>{consultationEnabled ? 'Tạo yêu cầu tư vấn' : 'Xem tất cả mẫu'}</Link></div></details></div>
    </div></header>
    <main id="main-content">{children}</main>
    <footer className={styles.footer}><div className={styles.footerTop}><div><UniformLogo /><p>Hệ thống đặt may rõ ràng cho tổ chức đang xây dựng một hình ảnh đồng nhất.</p></div><div><h2>Khám phá</h2>{categories.slice(0, 4).map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}</div><div><h2>Hỗ trợ lựa chọn</h2><Link href="/#quy-trinh">Quy trình đặt may</Link><Link href="/#vat-lieu">Vật liệu & size</Link><Link href={actionHref}>{consultationEnabled ? 'Yêu cầu tư vấn' : 'Xem catalog'}</Link></div><div className={styles.footerBadge}><ShieldCheck /><strong>SPEC<br />READY</strong><small>MDP / 2026</small></div></div><div className={styles.footerBottom}><span>© May Áo Đồng Phục</span><span>Cấu hình theo nhu cầu của từng tổ chức.</span></div></footer>
  </div>
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className={styles.breadcrumbs} aria-label="Đường dẫn"><Link href="/">Trang chủ</Link>{items.map((item) => <span key={item.label}>/ {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>
}

export function UniformProductCard({ product, eager = false }: { product: UniformProduct; eager?: boolean }) {
  const image = productImages(product)[0]
  const category = productCategory(product)
  const badge = productBadge(product)
  return <article className={styles.productCard}><Link className={styles.productImage} href={`/san-pham/${product.slug}/`}>{image?.url ? <Image alt={image.alt || product.name} fill loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" src={image.url} /> : null}{badge ? <span>{badge}</span> : null}<i><ArrowRight /></i></Link><div className={styles.productMeta}><p><span>{product.sku || 'MẪU ĐỒNG PHỤC'}</span><span>{productMaterial(product)}</span></p><h3><Link href={`/san-pham/${product.slug}/`}>{product.name}</Link></h3><div><b>Báo giá theo cấu hình</b><span className={styles.swatches} aria-label="Bảng màu gợi ý">{productColors(product).map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span></div>{category ? <Link className={styles.cardCategoryLink} href={`/danh-muc/${category.slug}/`}>{category.name}</Link> : null}</div></article>
}

export function TrustPill() { return <span className={styles.trustPill}><ClipboardCheck /> Brief rõ trước khi báo giá</span> }
