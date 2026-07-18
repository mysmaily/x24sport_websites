import Link from 'next/link'
import { ChevronDown, Menu, Phone, Search, X } from 'lucide-react'
import { getCategories } from '../../lib/content'

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="X24Sport - Trang chủ">
      <span className="logo-mark">X</span>
      <span className="logo-type"><strong>X24SPORT</strong><small>SPORTWEAR</small></span>
    </Link>
  )
}

export async function SiteHeader() {
  const categories = await getCategories()
  return (
    <>
      <a className="skip-link" href="#noi-dung">Bỏ qua điều hướng</a>
      <div className="top-strip">X24SPORT — TRANG PHỤC THỂ THAO THIẾT KẾ</div>
      <header className="commerce-header">
        <div className="header-main site-container">
          <details className="mobile-nav">
            <summary aria-label="Mở menu"><Menu className="menu-open" size={24} /><X className="menu-close" size={24} /></summary>
            <div className="mobile-nav-panel">
              <Link href="/">Trang chủ</Link>
              {categories.map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}>{category.name}</Link>)}
              <a href="#quy-trinh">Cách đặt hàng</a>
              <a href="tel:0989353247">Liên hệ tư vấn</a>
            </div>
          </details>
          <Logo />
          <form className="header-search" action="/san-pham" role="search">
            <input name="q" type="search" placeholder="Bạn đang tìm kiếm sản phẩm gì?" aria-label="Tìm sản phẩm" />
            <button type="submit" aria-label="Tìm kiếm"><Search size={20} /></button>
          </form>
          <div className="header-contact">
            <span>Thứ 2 - Chủ nhật<small>08:00 - 22:00</small></span>
            <a href="tel:0989353247"><Phone size={20} /><span>Hotline<small>0989 353 247</small></span></a>
          </div>
          <Link className="mobile-search" href="/san-pham" aria-label="Tìm kiếm"><Search size={23} /></Link>
        </div>
        <nav className="nav-bar" aria-label="Điều hướng chính">
          <div className="site-container">
            <Link className="active" href="/">Trang chủ</Link>
            <a href="#bo-mon">Áo thể thao thiết kế <ChevronDown size={14} /></a>
            {categories.map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}>Áo {category.name}</Link>)}
            <a href="#quy-trinh">Cách đặt hàng</a>
            <a href="#lien-he">Liên hệ</a>
          </div>
        </nav>
      </header>
    </>
  )
}
