import Link from 'next/link'
import Image from 'next/image'
import { Menu, Phone, Search, Sparkles } from 'lucide-react'

export const RYNO_PHONE = '0989371161'
export const RYNO_PHONE_LABEL = '098 937 11 61'

const links = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham/', label: 'Sản phẩm' },
  { href: '/lien-he/', label: 'Đặt áo đội' },
]

export function RynoBrand() {
  return <Link href="/" className="ryno-logo" aria-label="RynoSport - Trang chủ">
    <Image
      src="/images/rynosport/logo-banner.png"
      alt="RynoSport"
      width={300}
      height={100}
      priority
    />
  </Link>
}

export function RynoSiteHeader() {
  return <>
    <a className="ryno-skip" href="#noi-dung">Đi tới nội dung</a>
    <header className="ryno-site-header">
      <div className="ryno-header-inner">
        <RynoBrand />
        <nav className="ryno-desktop-nav" aria-label="Điều hướng chính">
          {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <div className="ryno-header-actions">
          <Link className="ryno-icon-link" href="/san-pham/" aria-label="Tìm sản phẩm">
            <Search size={19} />
          </Link>
          <a className="ryno-call" href={`tel:${RYNO_PHONE}`}>
            <Phone size={16} />
            Tư vấn nhanh
          </a>
        </div>
        <details className="ryno-mobile-menu">
          <summary aria-label="Mở menu">
            <Menu size={24} />
          </summary>
          <nav aria-label="Điều hướng trên điện thoại">
            {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
            <a href={`tel:${RYNO_PHONE}`}>Gọi {RYNO_PHONE_LABEL}</a>
          </nav>
        </details>
      </div>
    </header>
  </>
}

export function RynoSiteFooter() {
  return <footer className="ryno-site-footer">
    <div className="ryno-footer-grid">
      <section className="ryno-footer-intro" aria-label="Giới thiệu RynoSport">
        <RynoBrand />
        <p>Trang phục thể thao cho đội nhóm, câu lạc bộ và những người muốn ra sân với một bản sắc rõ ràng.</p>
      </section>
      <section>
        <h2>Khám phá</h2>
        <Link href="/san-pham/">Bộ sưu tập</Link>
        <Link href="/lien-he/">Đặt áo đội</Link>
        <Link href="/danh-muc/bong-chuyen/">Bóng chuyền</Link>
      </section>
      <section>
        <h2>Đặt áo cùng Ryno</h2>
        <p>Gửi môn chơi, số lượng, màu sắc và logo đội để được tư vấn mẫu phù hợp.</p>
        <a className="ryno-footer-phone" href={`tel:${RYNO_PHONE}`}>
          <Sparkles size={18} />
          {RYNO_PHONE_LABEL}
        </a>
      </section>
    </div>
    <div className="ryno-footer-bottom">
      <span>© {new Date().getFullYear()} RynoSport</span>
      <span>Trang phục cho đội hình có cá tính</span>
    </div>
  </footer>
}
