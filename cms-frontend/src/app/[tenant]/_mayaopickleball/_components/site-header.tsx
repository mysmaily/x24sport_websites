'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import {
  BadgeCheck,
  ChevronDown,
  Circle,
  CircleDot,
  Flame,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Rows3,
  Shirt,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { catalogColorFilters, catalogTypeFilters, type CatalogFilter } from '../lib/catalog-filters'
import { phone, phoneHref, zaloHref } from './contact'
import { SearchDialog } from '../../../_components/search-dialog'
import { useTenantNavigation } from '../../../_components/navigation-provider'

type MenuIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
type MobileSection = 'types' | 'colors' | null

const legacyNavigation = [
  { label: 'Mẫu áo', href: '/san-pham', icon: Shirt },
  { label: 'Đặt may', href: '/dat-may-ao-pickleball', icon: BadgeCheck },
  { label: 'Bảng giá', href: '/bang-gia-may-ao-pickleball', icon: CircleDot },
  { label: 'Vải & Size', href: '/chat-lieu-va-bang-size-ao-pickleball', icon: Rows3 },
  { label: 'Mẫu đã làm', href: '/mau-da-lam', icon: Palette },
  { label: 'Blog', href: '/blog', icon: Sparkles },
] as const

const filterIconMap: Record<string, { icon: MenuIcon; tone?: string; ink?: string; note: string }> = {
  'ao-pickleball-sat-nach': { icon: Shirt, note: 'Thoáng vai, dễ di chuyển' },
  'ao-pickleball-co-tru': { icon: BadgeCheck, note: 'Chỉn chu cho đội/CLB' },
  'ao-pickleball-co-tron': { icon: Circle, note: 'Nhẹ, trẻ, dễ mặc' },
  'ao-pickleball-mau-do': { icon: Flame, tone: '#df3f32', note: 'Tông mạnh, nổi bật sân' },
  'ao-pickleball-mau-xanh': { icon: CircleDot, tone: '#2e7d32', note: 'Dễ phối logo đội' },
  'ao-pickleball-mau-den': { icon: CircleDot, tone: '#11151d', note: 'Gọn, khỏe, ít bám bẩn' },
  'ao-pickleball-mau-trang': { icon: Circle, tone: '#f8faf6', ink: '#11151d', note: 'Sạch, sáng, tinh giản' },
  'ao-pickleball-mau-vang': { icon: Sun, tone: '#f2c94c', note: 'Dễ nhận diện từ xa' },
  'ao-pickleball-mau-hong': { icon: CircleDot, tone: '#f38ab4', note: 'Trẻ trung, mềm tông' },
  'ao-pickleball-mau-cam': { icon: Flame, tone: '#f57b2a', note: 'Năng lượng, bắt mắt' },
  'ao-pickleball-mau-tim': { icon: CircleDot, tone: '#8157c7', note: 'Khác biệt, hiện đại' },
  'ao-pickleball-gradient': { icon: Sparkles, tone: 'linear-gradient(135deg, #2e7d32, #f2c94c 48%, #116a5c)', note: 'Chuyển sắc thi đấu' },
}

function CatalogMenuLink({ filter }: { filter: CatalogFilter }) {
  const meta = filterIconMap[filter.slug] || { icon: Shirt, note: filter.group === 'color' ? 'Lọc theo màu áo' : 'Lọc theo kiểu áo' }
  const Icon = meta.icon

  return (
    <Link className="catalog-menu-link" href={filter.href}>
      <span className="catalog-menu-icon" style={(meta.tone || meta.ink) ? { '--menu-tone': meta.tone, '--menu-ink': meta.ink } as CSSProperties : undefined}>
        <Icon size={17} strokeWidth={2.1} />
      </span>
      <span>
        <strong>{filter.label}</strong>
        <small>{meta.note}</small>
      </span>
    </Link>
  )
}

export function SiteHeader() {
  const navigationState = useTenantNavigation()
  const pathname = usePathname() || '/'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<MobileSection>('types')
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cmsRoots = navigationState.mode === 'cms' && navigationState.ready ? navigationState.cmsNodes : []
  const catalogRoot = cmsRoots.find((item) => item.key === 'catalog')
  const typeGroup = catalogRoot?.children.find((item) => item.key === 'catalog-types')
  const colorGroup = catalogRoot?.children.find((item) => item.key === 'catalog-colors')
  const normalizedHref = (href: string) => href === '/' ? href : href.replace(/\/$/, '')
  const mapFilters = (nodes: typeof navigationState.cmsNodes, fallback: CatalogFilter[]) => nodes
    .flatMap((item) => {
      const existing = fallback.find((filter) => normalizedHref(filter.href) === normalizedHref(item.href || ''))
      return existing ? [{ ...existing, label: item.label }] : []
    })
  const typeFilters = typeGroup ? mapFilters(typeGroup.children, catalogTypeFilters) : catalogTypeFilters
  const colorFilters = colorGroup ? mapFilters(colorGroup.children, catalogColorFilters) : catalogColorFilters
  const iconByHref = new Map<string, MenuIcon>(legacyNavigation.map((item) => [item.href, item.icon]))
  const navigation = cmsRoots.length
    ? cmsRoots.filter((item) => item.href).map((item) => ({ href: item.href!, icon: iconByHref.get(item.href!) || Shirt, label: item.label }))
    : legacyNavigation
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
  const catalogPaths = new Set(['/san-pham', ...typeFilters.map((filter) => filter.href), ...colorFilters.map((filter) => filter.href)])
  const catalogActive = catalogPaths.has(normalizedPath)
  const showCatalog = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setCatalogOpen(true)
  }
  const hideCatalogSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setCatalogOpen(false), 120)
  }
  const toggleMobileSection = (section: Exclude<MobileSection, null>) => {
    setMobileSection((current) => current === section ? null : section)
  }

  useEffect(() => {
    setMobileOpen(false)
    setCatalogOpen(false)
  }, [pathname])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setCatalogOpen(false)
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="site-header">
      <div className="site-header-shell">
        <Link className="brand-mark" href="/" aria-label="MayaoPickleball.vn">
          <img src="/images/mayaopickleball/logo.svg" alt="MayaoPickleball" style={{ height: 40, width: 'auto' }} />
        </Link>

        <nav className="site-nav" aria-label="Điều hướng chính">
          {navigation.map((item) =>
            item.label === 'Mẫu áo' ? (
              <div className="nav-dropdown" key={item.label} onBlur={hideCatalogSoon} onFocus={showCatalog} onMouseEnter={showCatalog} onMouseLeave={hideCatalogSoon}>
                <button
                  aria-controls="catalog-mega-menu"
                  aria-expanded={catalogOpen}
                  className={catalogActive ? 'nav-dropdown-trigger is-active' : 'nav-dropdown-trigger'}
                  onClick={showCatalog}
                  type="button"
                >
                {item.label}
                  <ChevronDown aria-hidden="true" className={catalogOpen ? 'is-open' : undefined} size={16} strokeWidth={2.4} />
                </button>
              </div>
            ) : (
              <Link aria-current={normalizedPath === item.href ? 'page' : undefined} className={normalizedPath === item.href ? 'is-active' : undefined} key={item.label} href={item.href}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="header-actions">
          <a className="header-phone" href={phoneHref}>
            <Phone size={17} />
            <span>{phone}</span>
          </a>
          <SearchDialog iconSize={18} triggerClassName="icon-button" />
          <button
            aria-controls="mobile-site-menu"
            aria-expanded={mobileOpen}
            className="icon-button menu-button"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div aria-hidden={!catalogOpen} className={catalogOpen ? 'nav-dropdown-panel is-open' : 'nav-dropdown-panel'} id="catalog-mega-menu" onBlur={hideCatalogSoon} onFocus={showCatalog} onMouseEnter={showCatalog} onMouseLeave={hideCatalogSoon}>
        <div className="catalog-mega-grid">
          <section aria-labelledby="catalog-types-title">
            <p className="nav-dropdown-title" id="catalog-types-title">Kiểu áo</p>
            <div>
              {typeFilters.map((filter) => (
                <CatalogMenuLink filter={filter} key={filter.slug} />
              ))}
            </div>
          </section>
          <section aria-labelledby="catalog-colors-title">
            <p className="nav-dropdown-title" id="catalog-colors-title">Màu phổ biến</p>
            <div>
              {colorFilters.map((filter) => (
                <CatalogMenuLink filter={filter} key={filter.slug} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div aria-hidden={!mobileOpen} className={mobileOpen ? 'mobile-menu is-open' : 'mobile-menu'} id="mobile-site-menu">
        <nav aria-label="Điều hướng di động">
          <section className="mobile-menu-section">
            <button aria-controls="mobile-catalog-types" aria-expanded={mobileSection === 'types'} className="mobile-section-button" onClick={() => toggleMobileSection('types')} type="button">
              Kiểu áo
              <ChevronDown aria-hidden="true" className={mobileSection === 'types' ? 'is-open' : undefined} size={17} />
            </button>
            <div className={mobileSection === 'types' ? 'mobile-section-links' : 'mobile-section-links is-collapsed'} id="mobile-catalog-types">
              <Link href="/san-pham" onClick={() => setMobileOpen(false)} tabIndex={mobileOpen && mobileSection === 'types' ? 0 : -1}>
                <Shirt size={18} strokeWidth={2.1} />
                <span>Tất cả mẫu áo</span>
              </Link>
              {typeFilters.map((filter) => {
                const meta = filterIconMap[filter.slug] || { icon: Shirt }
                const Icon = meta.icon
                return (
                  <Link href={filter.href} key={filter.slug} onClick={() => setMobileOpen(false)} tabIndex={mobileOpen && mobileSection === 'types' ? 0 : -1}>
                    <Icon size={18} strokeWidth={2.1} />
                    <span>{filter.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>
          <section className="mobile-menu-section">
            <button aria-controls="mobile-catalog-colors" aria-expanded={mobileSection === 'colors'} className="mobile-section-button" onClick={() => toggleMobileSection('colors')} type="button">
              Màu phổ biến
              <ChevronDown aria-hidden="true" className={mobileSection === 'colors' ? 'is-open' : undefined} size={17} />
            </button>
            <div className={mobileSection === 'colors' ? 'mobile-section-links' : 'mobile-section-links is-collapsed'} id="mobile-catalog-colors">
              {colorFilters.map((filter) => {
                const meta = filterIconMap[filter.slug] || { icon: CircleDot }
                const Icon = meta.icon
                return (
                  <Link href={filter.href} key={filter.slug} onClick={() => setMobileOpen(false)} tabIndex={mobileOpen && mobileSection === 'colors' ? 0 : -1}>
                    <Icon size={18} strokeWidth={2.1} />
                    <span>{filter.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>
          <div className="mobile-utility-links">
            {navigation.slice(1).map(({ href, icon: Icon, label }) => (
              <Link href={href} key={label} onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1}>
                <Icon size={18} strokeWidth={2.1} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
        <div className="mobile-menu-actions">
          <a href={phoneHref} onClick={() => setMobileOpen(false)}>
            <Phone size={17} />
            Gọi ngay
          </a>
          <a href={zaloHref} onClick={() => setMobileOpen(false)}>
            <MessageCircle size={17} />
            Zalo
          </a>
        </div>
      </div>
    </header>
  )
}
