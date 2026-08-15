'use client'

import {
  Building2,
  CalendarDays,
  ChevronDown,
  Flag,
  Flame,
  GraduationCap,
  Grid2X2,
  Landmark,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Search,
  Shield,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { ProductCategory } from '../lib/cms'
import { LOGO_URL, PHONE_DISPLAY, PHONE_VALUE, SITE_NAME, ZALO_URL } from '../lib/site'

const links = [
  { href: '/bang-gia-may-ao-bong-da/', label: 'Bảng giá' },
  { href: '/chat-lieu-vai/', label: 'Chất liệu vải' },
  { href: '/cong-tac-vien/', label: 'Cộng tác viên' },
  { href: '/blog/', label: 'Tin tức' },
]

const categoryPaths: Record<string, string> = {
  'ao-bong-da-cong-ty': '/thiet-ke-ao-bong-da-cong-ty/',
  'ao-bong-da-cong-ty-ngan-hang': '/thiet-ke-ao-bong-da-ngan-hang/',
}

const audienceSpecs = [
  { slug: 'ao-bong-da-nu', href: '/ao-bong-da-nu/', label: 'Áo bóng đá nữ', description: 'Form áo, phối size và thiết kế dành cho đội nữ', icon: Users },
  { slug: 'ao-bong-da-doi-bong-cau-lac-bo', href: '/ao-bong-da-doi-bong-cau-lac-bo/', label: 'Đội bóng & CLB phong trào', description: 'Đội phủi, FC, nhóm bạn và CLB địa phương', icon: Users },
  { slug: 'ao-bong-da-truong-hoc-sinh-vien', href: '/ao-bong-da-truong-hoc-sinh-vien/', label: 'Trường học & sinh viên', description: 'Đội lớp, khoa, trường và CLB sinh viên', icon: GraduationCap },
  { slug: 'ao-bong-da-cong-ty', href: '/thiet-ke-ao-bong-da-cong-ty/', label: 'Công ty & doanh nghiệp', description: 'Đội nội bộ, team building và hội thao', icon: Building2 },
  { slug: 'ao-bong-da-cong-ty-ngan-hang', href: '/thiet-ke-ao-bong-da-ngan-hang/', label: 'Ngân hàng', description: 'Đội chi nhánh và giải bóng đá ngành', icon: Landmark },
  { slug: 'ao-bong-da-giai-phong-trao', href: '/ao-bong-da-giai-phong-trao/', label: 'Giải đấu & hội thao', description: 'Đồng phục thi đấu và áo ban tổ chức', icon: Trophy },
]

type MobileSection = 'types' | 'collections' | 'audiences' | null
type MenuItem = { description: string; featured?: boolean; href: string; icon: LucideIcon; label: string }

function categoryHref(category: ProductCategory) {
  return categoryPaths[category.slug] || category.legacyPath || `/${category.slug}/`
}

function collectionYear(category: ProductCategory) {
  const match = category.slug.match(/(?:thiet-ke-)(20\d{2})$/)
  return match ? Number(match[1]) : 0
}

function uniqueMenuItems(items: MenuItem[], seenHrefs: Set<string>) {
  return items.filter((item) => {
    if (seenHrefs.has(item.href)) return false
    seenHrefs.add(item.href)
    return true
  })
}

export function SiteHeader({ categories }: { categories: ProductCategory[] }) {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<MobileSection>('types')
  const [searchOpen, setSearchOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))
  const collections = categories
    .filter((category) => collectionYear(category) > 0 && (category.productCount || 0) > 0)
    .sort((left, right) => collectionYear(right) - collectionYear(left))
  const featuredCollection = collections[0]
  const menuHrefs = new Set<string>()
  const dynamicTypeItems = [
    { category: categoryBySlug.get('ao-thiet-ke'), label: 'Mẫu thiết kế', description: 'Mẫu riêng, dễ chỉnh màu, logo và tên số', icon: Palette },
    { category: categoryBySlug.get('cau-lac-bo'), label: 'Áo CLB nổi tiếng', description: 'Mẫu lấy cảm hứng từ các CLB hàng đầu', icon: Shield },
    { category: categoryBySlug.get('doi-tuyen'), label: 'Áo đội tuyển quốc gia', description: 'Mẫu áo các đội tuyển bóng đá quốc gia', icon: Flag },
  ].flatMap<MenuItem>((item) => {
    if (!item.category) return []
    return [{ href: categoryHref(item.category), label: item.label, description: item.description, icon: item.icon }]
  })
  const typeItems = uniqueMenuItems([
    { href: '/san-pham/', label: 'Tất cả mẫu áo', description: 'Xem toàn bộ mẫu áo đang có tại xưởng', icon: Grid2X2 },
    ...dynamicTypeItems,
  ], menuHrefs)
  const collectionItems = uniqueMenuItems([
    ...(featuredCollection ? [{ href: categoryHref(featuredCollection), label: `Mẫu thiết kế mới ${collectionYear(featuredCollection)}`, description: 'Bộ sưu tập mới nhất đang được ưu tiên', icon: Flame, featured: true }] : []),
    ...collections.filter((category) => category.id !== featuredCollection?.id).map((category) => ({
      href: categoryHref(category),
      label: `Mẫu thiết kế ${collectionYear(category)}`,
      description: `Bộ sưu tập thiết kế năm ${collectionYear(category)}`,
      icon: CalendarDays,
      featured: false,
    })),
  ], menuHrefs)
  const audienceItems = uniqueMenuItems(audienceSpecs
    .filter((item) => (categoryBySlug.get(item.slug)?.productCount || 0) > 0)
    .map(({ href, label, description, icon }) => ({ href, label, description, icon })), menuHrefs)
  const menuPaths = [...typeItems, ...collectionItems, ...audienceItems]
  const productActive = menuPaths.some((item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
  const showProducts = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setProductsOpen(true) }
  const hideProductsSoon = () => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setProductsOpen(false), 120) }
  const toggleMobileSection = (section: Exclude<MobileSection, null>) => setMobileSection((current) => current === section ? null : section)

  useEffect(() => { setOpen(false); setProductsOpen(false); setSearchOpen(false) }, [pathname])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setProductsOpen(false); setSearchOpen(false) }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1220]/95 text-white backdrop-blur-xl">
      <div className="mabd-header-shell mx-auto grid min-h-18 w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6">
        <Link aria-label={`${SITE_NAME} - Trang chủ`} className="inline-flex w-fit items-center" href="/">
          <img alt={SITE_NAME} className="h-auto w-[228px] max-w-[calc(100vw-96px)]" height="58" src={LOGO_URL} width="372" />
        </Link>
        <nav aria-label="Điều hướng chính" className="mabd-desktop-nav hidden items-center justify-center gap-4 text-sm font-extrabold text-slate-300">
          <div className="relative" onBlur={hideProductsSoon} onFocus={showProducts} onMouseEnter={showProducts} onMouseLeave={hideProductsSoon}>
            <button aria-controls="product-mega-menu" aria-expanded={productsOpen} className={`relative flex min-h-12 cursor-pointer items-center gap-1.5 py-6 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${productActive ? 'text-brand' : ''}`} onClick={showProducts} type="button">
              Sản phẩm <ChevronDown aria-hidden="true" className={`transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} size={16} />
              {productActive ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}
            </button>
          </div>
          {featuredCollection ? <Link className={`relative whitespace-nowrap py-6 transition hover:text-white ${pathname === categoryHref(featuredCollection) ? 'text-brand' : ''}`} href={categoryHref(featuredCollection)}>Mẫu thiết kế {collectionYear(featuredCollection)}{pathname === categoryHref(featuredCollection) ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}</Link> : null}
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href)
            return <Link aria-current={active ? 'page' : undefined} className={`relative whitespace-nowrap py-6 transition hover:text-white ${active ? 'text-brand' : ''}`} href={link.href} key={link.href}>{link.label}{active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}</Link>
          })}
        </nav>
        <div className="mabd-desktop-actions hidden items-center justify-end gap-2">
          <button aria-expanded={searchOpen} aria-label="Mở tìm kiếm" className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/20 hover:border-brand/50" onClick={() => setSearchOpen((value) => !value)} type="button"><Search size={18} /></button>
          <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-black hover:border-brand/50" href={`tel:${PHONE_VALUE}`}><Phone size={17} /> {PHONE_DISPLAY}</a>
        </div>
        <div className="mabd-mobile-actions flex items-center justify-end gap-2">
          <button aria-expanded={searchOpen} aria-label="Mở tìm kiếm" className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/20" onClick={() => setSearchOpen((value) => !value)} type="button"><Search size={18} /></button>
          <button aria-controls="mobile-navigation" aria-expanded={open} aria-label={open ? 'Đóng menu' : 'Mở menu'} className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/20" onClick={() => setOpen(!open)} type="button">{open ? <X /> : <Menu />}</button>
        </div>
      </div>

      {searchOpen ? <div className="absolute right-4 top-full z-[70] mt-2 w-[min(520px,calc(100vw-32px))] rounded-xl bg-white p-1.5 text-slate-950 shadow-[0_14px_40px_rgba(2,6,23,.24)]"><form action="/tim-kiem/" className="grid grid-cols-[1fr_auto_auto] gap-1.5" role="search"><label className="sr-only" htmlFor="header-search-q">Tìm mẫu áo</label><input autoComplete="off" className="min-h-11 min-w-0 rounded-lg bg-slate-50 px-3 text-sm outline-none" id="header-search-q" name="q" placeholder="Tên mẫu, mã áo hoặc màu sắc..." type="search" /><button className="rounded-lg bg-brand px-4 text-sm font-black text-white" type="submit">Tìm</button><button aria-label="Đóng tìm kiếm" className="grid size-11 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" onClick={() => setSearchOpen(false)} type="button"><X size={17} /></button></form></div> : null}

      <div aria-hidden={!productsOpen} className={`mabd-desktop-mega absolute inset-x-0 top-full hidden text-slate-950 transition duration-200 ${productsOpen ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0'}`} id="product-mega-menu" onBlur={hideProductsSoon} onFocus={showProducts} onMouseEnter={showProducts} onMouseLeave={hideProductsSoon}>
        <div className="mabd-mega-grid mx-auto grid max-w-[1240px]">
          <section aria-labelledby="menu-types-title">
            <p className="mabd-mega-heading" id="menu-types-title">Theo mẫu áo</p>
            <div>{typeItems.map((item) => <MegaMenuLink item={item} key={item.href} pathname={pathname} productsOpen={productsOpen} />)}</div>
          </section>
          <section aria-labelledby="menu-collections-title">
            <p className="mabd-mega-heading" id="menu-collections-title">Bộ sưu tập thiết kế</p>
            <div>{collectionItems.map((item) => <MegaMenuLink item={item} key={`${item.href}-${item.label}`} pathname={pathname} productsOpen={productsOpen} />)}</div>
          </section>
          <section aria-labelledby="menu-audiences-title">
            <p className="mabd-mega-heading" id="menu-audiences-title">Đặt may theo đối tượng</p>
            <div>{audienceItems.map((item) => <MegaMenuLink item={item} key={item.href} pathname={pathname} productsOpen={productsOpen} />)}</div>
          </section>
        </div>
      </div>

      <div aria-hidden={!open} className={`mabd-mobile-menu absolute inset-x-0 top-full max-h-[calc(100vh-72px)] overflow-y-auto border-b border-white/10 bg-[#0b1220] p-4 shadow-2xl transition duration-200 ${open ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`} id="mobile-navigation">
        <nav aria-label="Điều hướng di động" className="mx-auto grid max-w-2xl gap-3">
          <p className="px-1 text-xs font-black uppercase tracking-[.16em] text-brand">Sản phẩm</p>
          {[
            { id: 'types' as const, label: 'Theo mẫu áo', items: typeItems },
            { id: 'collections' as const, label: 'Bộ sưu tập thiết kế', items: collectionItems },
            { id: 'audiences' as const, label: 'Đặt may theo đối tượng', items: audienceItems },
          ].map((section) => {
            const expanded = mobileSection === section.id
            return <section className="mabd-mobile-section" key={section.id}><button aria-controls={`mobile-${section.id}`} aria-expanded={expanded} className="mabd-mobile-section-button" onClick={() => toggleMobileSection(section.id)} type="button">{section.label}<ChevronDown aria-hidden="true" className={`transition ${expanded ? 'rotate-180' : ''}`} size={17} /></button><div className={`mabd-mobile-section-links ${expanded ? '' : 'hidden'}`} id={`mobile-${section.id}`}>{section.items.map((item) => { const ItemIcon = item.icon; return <Link aria-current={pathname === item.href ? 'page' : undefined} className="mabd-mobile-menu-link" href={item.href} key={`${item.href}-${item.label}`} tabIndex={open && expanded ? 0 : -1}><ItemIcon aria-hidden="true" size={16} /><span>{item.label}</span></Link> })}</div></section>
          })}
          <div className="mabd-mobile-utility-links">
            {links.map((link) => <Link className="mabd-mobile-utility-link" href={link.href} key={link.href} tabIndex={open ? 0 : -1}>{link.label}</Link>)}
          </div>
        </nav>
        <div className="mx-auto mt-3 grid max-w-2xl grid-cols-2 gap-2"><a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white text-sm font-black text-slate-950" href={`tel:${PHONE_VALUE}`} tabIndex={open ? 0 : -1}><Phone size={17} /> Gọi ngay</a><a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-black" href={ZALO_URL} rel="noreferrer" tabIndex={open ? 0 : -1} target="_blank"><MessageCircle size={17} /> Zalo</a></div>
      </div>
    </header>
  )
}

function MegaMenuLink({ item, pathname, productsOpen }: { item: MenuItem; pathname: string; productsOpen: boolean }) {
  const Icon = item.icon
  const active = pathname === item.href
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={`mabd-mega-item ${item.featured ? 'is-featured' : ''} ${active ? 'is-active' : ''}`}
      href={item.href}
      tabIndex={productsOpen ? 0 : -1}
    >
      <span className="mabd-mega-item-icon"><Icon aria-hidden="true" size={23} strokeWidth={1.8} /></span>
      <span className="mabd-mega-item-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
    </Link>
  )
}
