import { ArrowRight, ClipboardCheck, Compass, Layers3, Menu, Ruler, Shirt, Sparkles, SwatchBook, X } from 'lucide-react'
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
  const actionHref = '/#nhan-tu-van'
  const actionLabel = consultationEnabled ? 'Nhận tư vấn' : 'Chuẩn bị yêu cầu'
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
        <Link className={styles.headerCta} href={actionHref}>{actionLabel} <ArrowRight aria-hidden="true" /></Link>
        <details className={styles.mobileMenu}>
          <summary aria-label="Mở menu"><Menu aria-hidden="true" /><X aria-hidden="true" /></summary>
          <nav aria-label="Điều hướng mobile">
            <Logo />
            <p>Chọn nhanh theo nhu cầu</p>
            {categories.map((category) => <Link href={`/danh-muc/${category.slug}/`} key={category.slug}>{category.name}<ArrowRight aria-hidden="true" /></Link>)}
            <Link className={styles.mobileCta} href={actionHref}>{consultationEnabled ? 'Nhận tư vấn đặt may' : 'Chuẩn bị yêu cầu'}</Link>
          </nav>
        </details>
      </div>
    </header>
    {children}
    <footer className={styles.footer}>
      <div className={styles.footerCta}>
        <div><span><Sparkles aria-hidden="true" /> BẮT ĐẦU TỪ MẪU GẦN ĐÚNG</span><h2>Chọn mẫu hôm nay.<br />Duyệt thiết kế trước khi may.</h2><p>Lưu mẫu bạn thích, sau đó cùng X24 phối màu, chọn chất liệu, in thêu logo, form và dải size.</p></div>
        <div className={styles.footerActions}><Link className={styles.primaryButton} href={actionHref}>{consultationEnabled ? 'Nhận tư vấn' : 'Chuẩn bị yêu cầu'} <ArrowRight aria-hidden="true" /></Link><Link className={styles.footerSecondary} href="/#quy-trinh">Xem quy trình</Link></div>
      </div>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}><Logo /><p>Giúp tổ chức chọn mẫu đồng phục, phối màu, in thêu logo, gom size và đặt may theo yêu cầu.</p><div className={styles.footerSignals}><span><SwatchBook aria-hidden="true" /> Chọn mẫu</span><span><Ruler aria-hidden="true" /> Gom size</span><span><ClipboardCheck aria-hidden="true" /> Duyệt thiết kế</span></div></div>
        <nav aria-label="Nhóm sản phẩm" className={styles.footerCard}><h2><Shirt aria-hidden="true" /> Sản phẩm</h2>{categories.slice(0, 4).map((category) => <Link href={`/danh-muc/${category.slug}/`} key={category.slug}>{category.name}<ArrowRight aria-hidden="true" /></Link>)}</nav>
        <nav aria-label="Hỗ trợ lựa chọn" className={styles.footerCard}><h2><Compass aria-hidden="true" /> Hỗ trợ lựa chọn</h2><Link href="/#quy-trinh">Quy trình đặt may<ArrowRight aria-hidden="true" /></Link><Link href="/#vat-lieu">Vật liệu & size<ArrowRight aria-hidden="true" /></Link><Link href={actionHref}>{consultationEnabled ? 'Gửi yêu cầu tư vấn' : 'Chuẩn bị yêu cầu'}<ArrowRight aria-hidden="true" /></Link><Link href="/san-pham/">Xem toàn bộ mẫu<ArrowRight aria-hidden="true" /></Link></nav>
        <div className={styles.footerStamp}><Layers3 aria-hidden="true" /><b>X24</b><span>UNIFORM<br />SYSTEM</span><small>THIẾT KẾ THEO ĐỘI NGŨ · VIỆT NAM</small></div>
      </div>
      <div className={styles.footerBottom}><p className={styles.copyright}>© Đồng Phục X24 · Thiết kế theo nhu cầu của từng tổ chức.</p><span>Màu sắc · Logo · Vật liệu · Form & size</span></div>
    </footer>
  </div>
}
