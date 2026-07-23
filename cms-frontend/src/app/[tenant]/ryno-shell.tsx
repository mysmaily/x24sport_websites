import Link from 'next/link'
import { Menu, Phone, Search } from 'lucide-react'

export const RYNO_PHONE = '0989371161'
export const RYNO_PHONE_LABEL = '098 937 11 61'

export function RynoBrand() {
  return <Link href="/" className="ryno-logo" aria-label="RynoSport - Trang chủ">RYNO<span>SPORT</span></Link>
}

const links = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham/', label: 'Sản phẩm' },
  { href: '/lien-he/', label: 'Liên hệ' },
]

export function RynoSiteHeader() {
  return <>
    <a className="ryno-skip" href="#noi-dung">Đi tới nội dung</a>
    <header className="ryno-site-header">
      <div className="ryno-header-inner">
        <RynoBrand />
        <nav aria-label="Điều hướng chính">{links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
        <div className="ryno-header-actions">
          <Link className="ryno-search-link" href="/san-pham/" aria-label="Tìm sản phẩm"><Search size={19} /></Link>
          <a className="ryno-call" href={`tel:${RYNO_PHONE}`}><Phone size={16} />Tư vấn nhanh</a>
        </div>
        <details className="ryno-mobile-menu">
          <summary aria-label="Mở menu"><Menu size={23} /></summary>
          <nav aria-label="Điều hướng trên điện thoại">{links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}<a href={`tel:${RYNO_PHONE}`}>Gọi {RYNO_PHONE_LABEL}</a></nav>
        </details>
      </div>
    </header>
  </>
}

export function RynoSiteFooter() {
  return <footer className="ryno-site-footer">
    <div className="ryno-footer-grid">
      <div className="ryno-footer-intro"><RynoBrand /><p>Trang phục thể thao cho đội nhóm, câu lạc bộ và những người nghiêm túc với cuộc chơi.</p></div>
      <div><h2>Khám phá</h2><Link href="/san-pham/">Sản phẩm</Link><Link href="/lien-he/">Đặt áo đội</Link><Link href="/lien-he/">Liên hệ</Link></div>
      <div><h2>Đặt áo đội</h2><p>Trao đổi về môn chơi, số lượng và ý tưởng thiết kế để nhận tư vấn phù hợp.</p><a className="ryno-footer-phone" href={`tel:${RYNO_PHONE}`}>{RYNO_PHONE_LABEL}</a></div>
    </div>
    <div className="ryno-footer-bottom"><span>© {new Date().getFullYear()} RynoSport</span><span>Thiết kế cho tinh thần đồng đội</span></div>
  </footer>
}
