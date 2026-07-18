import Image from 'next/image'
import Link from 'next/link'
import { Menu, Phone, Search, X } from 'lucide-react'
import { categoryMenu } from '../../lib/catalog'

export function Logo() {
  return (
    <Link className="logo" href="/" title="X24Sport – Trang chủ">
      <Image
        src="https://cdn.x24sport.vn/wp-content/uploads/2025/03/Asset-1-1200x158.png"
        alt="X24Sport"
        width={228}
        height={30}
        sizes="(max-width: 820px) 160px, 228px"
      />
    </Link>
  )
}

export function SiteHeader() {
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
              <Link href="/san-pham/">Tất cả sản phẩm</Link>
              {categoryMenu.map((group) => (
                group.children.length > 0
                  ? <details className="mobile-category-group" key={group.slug}>
                    <summary>{group.name}</summary>
                    <div>
                      <Link href={`/danh-muc/${group.slug}`}>Tất cả {group.name}</Link>
                      {group.children.map((child) => <Link href={`/danh-muc/${child.slug}`} key={child.slug}>{child.name}</Link>)}
                    </div>
                  </details>
                  : <Link href={`/danh-muc/${group.slug}`} key={group.slug}>{group.name}</Link>
              ))}
              <Link href="/blog/">Blog</Link>
              <a href="/#quy-trinh">Cách đặt hàng</a>
              <a href="tel:0989353247">Liên hệ tư vấn</a>
            </div>
          </details>
          <Logo />
          <form className="header-search" action="/san-pham" role="search">
            <input name="q" type="search" placeholder="Bạn đang tìm kiếm sản phẩm gì?" aria-label="Tìm sản phẩm" autoComplete="off" />
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
            <Link href="/">Trang chủ</Link>
            {categoryMenu.map((group) => (
              group.children.length > 0
                ? <div className="nav-dropdown nav-category-dropdown" key={group.slug}>
                  <Link className="nav-trigger" href={`/danh-muc/${group.slug}`}>{group.name}</Link>
                  <div className="nav-submenu" role="menu">
                    <Link href={`/danh-muc/${group.slug}`}><strong>Tất cả {group.name}</strong></Link>
                    {group.children.map((child) => <Link href={`/danh-muc/${child.slug}`} key={child.slug}>{child.name}</Link>)}
                  </div>
                </div>
                : <Link href={`/danh-muc/${group.slug}`} key={group.slug}>{group.name}</Link>
            ))}
            <Link href="/blog/">Blog</Link>
            <a href="/#lien-he">Liên hệ</a>
          </div>
        </nav>
      </header>
    </>
  )
}
