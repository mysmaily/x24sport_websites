import Image from 'next/image'
import Link from 'next/link'
import { Menu, Phone, X } from 'lucide-react'
import { categoryMenu } from '../../lib/catalog'
import { getCategoryNavigation } from '../../lib/content'
import { SearchDialog } from './search-dialog'
import { StickyNavigation } from './sticky-navigation'
import { getTenantNavigationState } from '../../lib/navigation'

const HEADER_LOGO_SRC = 'https://cdn.x24sport.vn/wp-content/uploads/2025/03/Asset-1-1200x158.png'
const pricingLinks: Record<string, string> = {
  'bong-da': '/bang-gia-may-ao-bong-da/',
  'bong-chuyen': '/bang-gia-may-ao-bong-chuyen/',
  'bong-ro': '/bang-gia-may-ao-bong-ro/',
  'cau-long': '/bang-gia-may-ao-cau-long/',
  pickleball: '/bang-gia-may-ao-pickleball/',
  'chay-bo': '/bang-gia-may-ao-chay-bo/',
}

export function Logo() {
  return (
    <Link className="logo" href="/" title="X24Sport - Trang chủ">
      <Image
        src={HEADER_LOGO_SRC}
        alt="X24Sport"
        width={1200}
        height={158}
        sizes="(max-width: 820px) 160px, 228px"
      />
    </Link>
  )
}

export async function SiteHeader() {
  const [cmsMenu, navigationState] = await Promise.all([getCategoryNavigation(), getTenantNavigationState()])
  const legacyMenu = cmsMenu.some((group) => group.children.length > 0) ? cmsMenu : categoryMenu
  const cmsActive = navigationState.mode === 'cms' && navigationState.ready
  const cmsCategoryHref = (item: (typeof navigationState.cmsNodes)[number]) => {
    const slug = item.key.startsWith('category-') ? item.key.slice('category-'.length) : ''
    return slug ? `/danh-muc/${slug}/` : item.href || ''
  }
  const navigationMenu = cmsActive
    ? navigationState.cmsNodes.filter((item) => item.kind === 'category').map((item) => ({
        children: item.children.filter((child) => child.href).map((child) => ({ href: cmsCategoryHref(child), label: child.label })),
        href: cmsCategoryHref(item),
        label: item.label,
        slug: item.key.startsWith('category-') ? item.key.slice('category-'.length) : item.key,
      }))
    : legacyMenu.map((item) => ({
        children: item.children.map((child) => ({ href: `/danh-muc/${child.slug}`, label: child.name })),
        href: `/danh-muc/${item.slug}`,
        label: item.name,
        slug: item.slug,
      }))
  const utilityLinks = cmsActive
    ? navigationState.cmsNodes.filter((item) => item.kind !== 'category' && item.href)
    : []
  const desktopUtilityLinks = utilityLinks
    .filter((item) => item.key !== 'process')
    .map((item) => item.key === 'contact' ? { ...item, label: 'Liên hệ' } : item)

  return (
    <>
      <a className="skip-link" href="#noi-dung">Bỏ qua điều hướng</a>
      <div className="top-strip">X24SPORT - TRANG PHỤC THỂ THAO THIẾT KẾ</div>
      <header className="commerce-header">
        <div className="header-main site-container">
          <details className="mobile-nav">
            <summary aria-label="Mở menu"><Menu className="menu-open" size={24} /><X className="menu-close" size={24} /></summary>
            <div className="mobile-nav-panel">
              <Link href="/">Trang chủ</Link>
              <Link href="/san-pham/">Tất cả sản phẩm</Link>
              <Link href="/mau-logo/">Mẫu logo</Link>
              {navigationMenu.map((group) => (
                group.children.length > 0
                  ? <details className="mobile-category-group" key={group.slug}>
                    <summary>{group.label}</summary>
                    <div>
                      {group.children.map((child) => <Link href={child.href} key={child.href}>{child.label}</Link>)}
                      {pricingLinks[group.slug] ? <a href={pricingLinks[group.slug]}>Bảng giá</a> : null}
                    </div>
                  </details>
                  : <Link href={group.href} key={group.slug}>{group.label}</Link>
              ))}
              {utilityLinks.length ? utilityLinks.map((item) => <Link href={item.href!} key={item.key}>{item.label}</Link>) : <><Link href="/blog/">Blog</Link><a href="/#quy-trinh">Cách đặt hàng</a><Link href="/lien-he/">Liên hệ tư vấn</Link></>}
            </div>
          </details>
          <Logo />
          <div className="header-search">
            <span className="min-w-0 flex-1 self-center overflow-hidden pl-5 text-[13px] text-[#666] text-ellipsis whitespace-nowrap">Tìm mẫu áo, mã áo hoặc màu sắc</span>
            <SearchDialog action="/tim-kiem" iconSize={20} triggerClassName="header-search-trigger" />
          </div>
          <div className="header-contact">
            <span>Thứ 2 - Chủ nhật<small>08:00 - 22:00</small></span>
            <a href="tel:0989353247"><Phone size={20} /><span>Hotline<small>0989 353 247</small></span></a>
          </div>
          <div className="mobile-search"><SearchDialog action="/tim-kiem" iconSize={23} triggerClassName="h-[42px] w-[35px] border-0 bg-transparent text-current" /></div>
        </div>
      </header>
      <StickyNavigation>
        <Link className="nav-home-link" href="/">Trang chủ</Link>
        {navigationMenu.map((group) => (
          group.children.length > 0
            ? <div className="nav-dropdown nav-category-dropdown" key={group.slug}>
              <Link className="nav-trigger" href={group.href}>{group.label}</Link>
              <div className="nav-submenu" role="menu">
                {group.children.map((child) => <Link href={child.href} key={child.href}>{child.label}</Link>)}
                {pricingLinks[group.slug] ? <a href={pricingLinks[group.slug]}>Bảng giá</a> : null}
              </div>
            </div>
            : <Link href={group.href} key={group.slug}>{group.label}</Link>
        ))}
        {desktopUtilityLinks.length ? desktopUtilityLinks.map((item) => <Link href={item.href!} key={item.key}>{item.label}</Link>) : <><Link href="/blog/">Blog</Link><Link href="/lien-he/">Liên hệ</Link></>}
      </StickyNavigation>
    </>
  )
}
