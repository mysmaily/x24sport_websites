import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { SiteHeader } from './site-header'
import { phone, phoneHref, zaloHref } from './contact'

export { phone, phoneHref, SiteHeader, zaloHref }

export function InfoHero({
  kicker,
  title,
  description,
  image,
  stats,
}: {
  kicker: string
  title: string
  description: string
  image: string
  stats: Array<{ value: string; label: string }>
}) {
  return (
    <section className="info-hero">
      <div className="info-hero-copy">
        <p className="hero-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="hero-actions">
          <a className="primary-button" href={zaloHref}>
            Tư vấn qua Zalo <ArrowRight size={18} />
          </a>
          <Link className="secondary-button" href="/san-pham">
            Xem mẫu áo
          </Link>
        </div>
      </div>
      <div className="info-hero-media">
        <img alt={title} height={960} src={image} width={1280} />
        <div className="info-hero-badge">
          <strong>Miễn phí thiết kế</strong>
          <span>theo yêu cầu</span>
        </div>
      </div>
      <div className="info-stat-row">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function InfoFooter() {
  return (
    <>
      <section className="final-cta info-final-cta">
        <div>
          <h2>Gửi logo, màu đội và số lượng. MayaoPickleball sẽ tư vấn hướng áo phù hợp.</h2>
          <p>Thiết kế theo yêu cầu được hỗ trợ miễn phí trước khi sản xuất để đội dễ duyệt mẫu.</p>
        </div>
        <a className="primary-button" href={zaloHref}>
          Nhận tư vấn <ArrowRight size={18} />
        </a>
      </section>

      <footer className="site-footer">
        <div>
          <Link className="brand-mark footer-brand" href="/">
            <img src="/images/logo.svg" alt="MayaoPickleball" style={{height: 36, width: 'auto'}} />
          </Link>
          <p>Đồng phục pickleball đặt may cho CLB, đội phong trào, trường lớp và doanh nghiệp.</p>
        </div>
        <div>
          <h3>Liên hệ</h3>
          <p>Hotline: {phone}</p>
          <p>Email: lienhe@mayaopickleball.vn</p>
          <p>Thời gian tư vấn: 08:00 - 17:00 hàng ngày</p>
        </div>
        <div>
          <h3>Trang chính</h3>
          <p>
            <Link href="/dat-may-ao-pickleball">Đặt may áo pickleball</Link>
          </p>
          <p>
            <Link href="/bang-gia-may-ao-pickleball">Bảng giá may áo pickleball</Link>
          </p>
          <p>
            <Link href="/chat-lieu-va-bang-size-ao-pickleball">Chất liệu & bảng size</Link>
          </p>
        </div>
      </footer>

      <div className="mobile-cta" aria-label="Liên hệ nhanh">
        <a href={phoneHref}>Gọi ngay</a>
        <a href={zaloHref}>Nhận báo giá</a>
      </div>
    </>
  )
}

export function InfoPage({
  children,
  description,
  image,
  kicker,
  stats,
  title,
}: {
  children: ReactNode
  description: string
  image: string
  kicker: string
  stats: Array<{ value: string; label: string }>
  title: string
}) {
  return (
    <main className="site-page info-page">
      <SiteHeader />
      <InfoHero
        description={description}
        image={image}
        kicker={kicker}
        stats={stats}
        title={title}
      />
      {children}
      <InfoFooter />
    </main>
  )
}
