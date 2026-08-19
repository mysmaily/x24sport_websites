import { ArrowRight, ClipboardCheck, Search } from 'lucide-react'
import Link from 'next/link'

import { Breadcrumbs, TrustPill } from './components'
import styles from './mayaodongphuc.module.css'

export function MayAoDongPhucNotFoundPage() {
  return <>
    <section className={styles.notFoundHero} aria-labelledby="not-found-title">
      <Breadcrumbs items={[{ label: 'Không tìm thấy trang' }]} />
      <div className={styles.notFoundGrid}>
        <div>
          <TrustPill />
          <p>404 / Không tìm thấy trang</p>
          <h1 id="not-found-title">Trang này không còn trong hệ thống mẫu đồng phục.</h1>
          <p>Liên kết có thể đã đổi tên hoặc mẫu đã được sắp xếp lại. Bạn có thể quay về catalog để chọn mẫu, xem quy trình, hoặc gửi nhu cầu để đội ngũ tư vấn tìm đúng hướng cho tổ chức của bạn.</p>
          <div className={styles.notFoundActions}>
            <Link className={styles.primaryCta} href="/">Về trang chủ <ArrowRight aria-hidden="true" /></Link>
            <Link href="/san-pham/"><Search aria-hidden="true" /> Mở catalog</Link>
          </div>
        </div>
        <aside aria-label="Gợi ý tiếp theo">
          <span>UNIFORM OS</span>
          <strong>404</strong>
          <p>Tìm lại theo bối cảnh sử dụng, màu nhận diện hoặc gửi brief để được gợi ý mẫu phù hợp.</p>
          <b><ClipboardCheck aria-hidden="true" /> SPEC READY</b>
        </aside>
      </div>
    </section>
    <nav className={styles.notFoundLinks} aria-label="Lối đi thay thế">
      <Link href="/san-pham/"><span>01</span><b>Xem catalog đồng phục</b><ArrowRight aria-hidden="true" /></Link>
      <Link href="/#quy-trinh"><span>02</span><b>Quy trình đặt may</b><ArrowRight aria-hidden="true" /></Link>
      <Link href="/#bao-gia"><span>03</span><b>Gửi brief báo giá</b><ArrowRight aria-hidden="true" /></Link>
    </nav>
  </>
}
