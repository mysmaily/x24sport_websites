import { ArrowRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

import { getPublicStoreSettings } from '../../../lib/store-settings'
import { categories } from './data'
import styles from './dongphucx24.module.css'

function Logo() {
  return <Link aria-label="Đồng Phục X24 — Trang chủ" className={styles.logo} href="/"><span aria-hidden="true">X24</span><strong>ĐỒNG PHỤC<small>Thiết kế theo đội ngũ</small></strong></Link>
}

export async function DongPhucX24Shell({ children }: { children: ReactNode }) {
  const consultationEnabled = Boolean((await getPublicStoreSettings()).telegramChatId)
  const actionHref = consultationEnabled ? '/#nhan-tu-van' : '/san-pham/'
  return <div className={styles.site}>
    <a className={styles.skipLink} href="#main-content">Đi đến nội dung chính</a>
    <header className={styles.header}>
      <Logo />
      <nav aria-label="Điều hướng chính" className={styles.desktopNav}>
        <Link href="/san-pham/">Sản phẩm</Link>
        <Link href="/#giai-phap">Giải pháp</Link>
        <Link href="/#quy-trinh">Quy trình</Link>
        <Link href="/#vat-lieu">Vật liệu & size</Link>
        <Link href="/#cam-hung">Mẫu đã chọn</Link>
      </nav>
      <div className={styles.headerActions}>
        <Link className={styles.headerCta} href={actionHref}>{consultationEnabled ? 'Nhận tư vấn' : 'Xem catalog'} <ArrowRight aria-hidden="true" /></Link>
        <details className={styles.mobileMenu}>
          <summary aria-label="Mở menu"><Menu aria-hidden="true" /><X aria-hidden="true" /></summary>
          <nav aria-label="Điều hướng mobile">
            <Logo />
            <p>Chọn nhanh theo nhu cầu</p>
            {categories.map((category) => <Link href={`/danh-muc/${category.slug}/`} key={category.slug}>{category.name}<ArrowRight aria-hidden="true" /></Link>)}
            <Link className={styles.mobileCta} href={actionHref}>{consultationEnabled ? 'Nhận tư vấn cấu hình' : 'Xem toàn bộ catalog'}</Link>
          </nav>
        </details>
      </div>
    </header>
    {children}
    <footer className={styles.footer}>
      <div className={styles.footerBrand}><Logo /><p>Giúp tổ chức đi từ mẫu tham khảo đến một bộ đồng phục có cấu hình rõ ràng, dễ duyệt và dễ đặt lại.</p></div>
      <div><h2>Sản phẩm</h2>{categories.slice(0, 4).map((category) => <Link href={`/danh-muc/${category.slug}/`} key={category.slug}>{category.name}</Link>)}</div>
      <div><h2>Hỗ trợ lựa chọn</h2><Link href="/#quy-trinh">Quy trình đặt may</Link><Link href="/#vat-lieu">Vật liệu & size</Link><Link href="/#nhan-tu-van">Chuẩn bị yêu cầu</Link><Link href="/san-pham/">Xem toàn bộ mẫu</Link></div>
      <div className={styles.footerStamp}><b>X24</b><span>UNIFORM<br />SYSTEM</span><small>VIỆT NAM</small></div>
      <p className={styles.copyright}>© Đồng Phục X24 · Thiết kế theo nhu cầu của từng tổ chức.</p>
    </footer>
  </div>
}
