import { ArrowDownRight, ArrowRight, Menu, Scissors, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { industries, type PreviewProduct } from '../mayaodongphuc-preview/data'
import styles from './v3.module.css'

export const v3Base = '/mayaodongphuc-preview-v3'

export function V3Logo() { return <Link className={styles.logo} href={v3Base} aria-label="May Áo Đồng Phục V3 — Trang chủ"><Scissors /><span>May Áo<br /><i>Đồng Phục</i></span></Link> }

export function V3Shell({ children }: { children: ReactNode }) {
  return <div className={styles.site}>
    <a className={styles.skip} href="#main-content">Đi đến nội dung</a>
    <div className={styles.preview}><span>V3 · BELONGING STUDIO</span><p>Bản thiết kế trải nghiệm — chưa nhận đơn thật</p><span>ISSUE 01 / 2026</span></div>
    <header className={styles.header}><V3Logo /><nav aria-label="Điều hướng chính"><Link href={`${v3Base}/danh-muc/dong-phuc-doanh-nghiep`}>Bộ sưu tập</Link><Link href={`${v3Base}/#cach-lam`}>Cách chúng tôi làm</Link><Link href={`${v3Base}/#vat-lieu`}>Vật liệu</Link><Link href={`${v3Base}/#ghi-chu`}>Ghi chú xưởng</Link></nav><Link className={styles.headerCta} href={`${v3Base}/#brief`}>Gửi một brief <ArrowDownRight /></Link><details className={styles.mobile}><summary aria-label="Mở menu"><Menu /></summary><div className={styles.mobilePanel}><div><V3Logo /><X /></div>{industries.map((item) => <Link href={`${v3Base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}<ArrowRight /></Link>)}<Link href={`${v3Base}/#brief`}>Gửi một brief</Link></div></details></header>
    <main id="main-content">{children}</main>
    <footer className={styles.footer}><div className={styles.footerStatement}><span>MAY ÁO ĐỒNG PHỤC / 2026</span><p>Mặc cùng một tinh thần,<br /><i>không chỉ cùng một chiếc áo.</i></p></div><div className={styles.footerGrid}><V3Logo /><div><h2>Bộ sưu tập</h2>{industries.slice(0, 4).map((item) => <Link href={`${v3Base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}</div><div><h2>Studio</h2><Link href={`${v3Base}/#cach-lam`}>Quy trình đặt may</Link><Link href={`${v3Base}/#vat-lieu`}>Vật liệu & size</Link><Link href={`${v3Base}/#brief`}>Gửi yêu cầu</Link></div><p>Bản thiết kế chờ dữ liệu doanh nghiệp xác thực.</p></div></footer>
  </div>
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) { return <nav className={styles.breadcrumbs} aria-label="Đường dẫn"><Link href={v3Base}>Trang chủ</Link>{items.map((item) => <span key={item.label}>— {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav> }

export function ProductCard({ product, eager = false, large = false }: { product: PreviewProduct; eager?: boolean; large?: boolean }) {
  return <article className={`${styles.productCard} ${large ? styles.productCardLarge : ''}`}><Link className={styles.productVisual} href={`${v3Base}/san-pham/${product.slug}`}><Image alt={product.name} fill loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} sizes={large ? '(max-width: 740px) 100vw, 55vw' : '(max-width: 740px) 50vw, 30vw'} src={product.image} /><span>{product.code}</span><i><ArrowDownRight /></i></Link><div className={styles.productInfo}><p>{product.category}</p><h3><Link href={`${v3Base}/san-pham/${product.slug}`}>{product.name}</Link></h3><div><span>{product.material}</span><b>Báo giá theo cấu hình</b></div></div></article>
}
