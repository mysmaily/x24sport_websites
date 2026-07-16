'use client'

import Link from 'next/link'
import { useState, type ComponentType, type CSSProperties } from 'react'
import {
  BadgeCheck,
  ChevronDown,
  Circle,
  CircleDot,
  Flame,
  Menu,
  Palette,
  Phone,
  Rows3,
  Search,
  Shirt,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { catalogColorFilters, catalogTypeFilters, type CatalogFilter } from '../../lib/catalog-filters'
import { phone, phoneHref, zaloHref } from './contact'

type MenuIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

const navigation = [
  { label: 'Mẫu áo', href: '/san-pham', icon: Shirt },
  { label: 'Đặt may', href: '/dat-may-ao-cau-long', icon: BadgeCheck },
  { label: 'Bảng giá', href: '/bang-gia-may-ao-cau-long', icon: CircleDot },
  { label: 'Vải & Size', href: '/chat-lieu-va-bang-size-ao-cau-long', icon: Rows3 },
  { label: 'Mẫu đã làm', href: '/mau-ao-cau-long-da-lam', icon: Palette },
] as const

const filterIconMap: Record<string, { icon: MenuIcon; tone?: string; note: string }> = {
  'ao-cau-long-sat-nach': { icon: Shirt, note: 'Thoáng vai, dễ vung vợt' },
  'ao-cau-long-co-tru': { icon: BadgeCheck, note: 'Chỉn chu cho đội/CLB' },
  'ao-cau-long-co-tron': { icon: Circle, note: 'Nhẹ, trẻ, dễ mặc' },
  'ao-cau-long-mau-do': { icon: Flame, tone: '#df3f32', note: 'Tông mạnh, nổi bật sân' },
  'ao-cau-long-mau-xanh': { icon: CircleDot, tone: '#116a5c', note: 'Dễ phối logo đội' },
  'ao-cau-long-mau-den': { icon: CircleDot, tone: '#11151d', note: 'Gọn, khỏe, ít bám bẩn' },
  'ao-cau-long-mau-trang': { icon: Circle, tone: '#f8faf6', note: 'Sạch, sáng, tinh giản' },
  'ao-cau-long-mau-vang': { icon: Sun, tone: '#f2c94c', note: 'Dễ nhận diện từ xa' },
  'ao-cau-long-mau-hong': { icon: CircleDot, tone: '#f38ab4', note: 'Trẻ trung, mềm tông' },
  'ao-cau-long-mau-cam': { icon: Flame, tone: '#f57b2a', note: 'Năng lượng, bắt mắt' },
  'ao-cau-long-mau-tim': { icon: CircleDot, tone: '#8157c7', note: 'Khác biệt, hiện đại' },
  'ao-cau-long-gradient': { icon: Sparkles, tone: 'linear-gradient(135deg, #df3f32, #f2c94c 48%, #116a5c)', note: 'Chuyển sắc thi đấu' },
}

function CatalogMenuLink({ filter }: { filter: CatalogFilter }) {
  const meta = filterIconMap[filter.slug] || { icon: Shirt, note: filter.group === 'color' ? 'Lọc theo màu áo' : 'Lọc theo kiểu áo' }
  const Icon = meta.icon

  return (
    <Link className="catalog-menu-link" href={filter.href}>
      <span className="catalog-menu-icon" style={meta.tone ? { '--menu-tone': meta.tone } as CSSProperties : undefined}>
        <Icon size={17} strokeWidth={2.1} />
      </span>
      <span>
        <strong>{filter.label}</strong>
        <small>{meta.note}</small>
      </span>
    </Link>
  )
}

function CatalogMenuContent() {
  return (
    <>
      <div>
        <span className="nav-dropdown-title">Kiểu áo</span>
        {catalogTypeFilters.map((filter) => (
          <CatalogMenuLink filter={filter} key={filter.slug} />
        ))}
      </div>
      <div>
        <span className="nav-dropdown-title">Màu phổ biến</span>
        {catalogColorFilters.map((filter) => (
          <CatalogMenuLink filter={filter} key={filter.slug} />
        ))}
      </div>
    </>
  )
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="site-header">
      <Link className="brand-mark" href="/" aria-label="MayaoCauLong.vn">
        <span>MC</span>
        <strong>MayaoCauLong</strong>
      </Link>

      <nav className="site-nav" aria-label="Điều hướng chính">
        {navigation.map((item) =>
          item.label === 'Mẫu áo' ? (
            <div className="nav-dropdown" key={item.label}>
              <Link className="nav-dropdown-trigger" href={item.href}>
                {item.label}
                <ChevronDown size={14} strokeWidth={2.4} />
              </Link>
              <div className="nav-dropdown-panel" aria-label="Danh mục mẫu áo">
                <CatalogMenuContent />
              </div>
            </div>
          ) : (
            <Link key={item.label} href={item.href}>
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
        <Link className="icon-button" href="/san-pham" aria-label="Tìm mẫu áo">
          <Search size={18} />
        </Link>
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

      <div className={mobileOpen ? 'mobile-menu is-open' : 'mobile-menu'} id="mobile-site-menu">
        <nav aria-label="Điều hướng di động">
          {navigation.map(({ href, icon: Icon, label }) => (
            <Link href={href} key={label} onClick={() => setMobileOpen(false)}>
              <Icon size={18} strokeWidth={2.1} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-catalog-menu" aria-label="Danh mục mẫu áo di động">
          <CatalogMenuContent />
        </div>
        <div className="mobile-menu-actions">
          <a href={phoneHref} onClick={() => setMobileOpen(false)}>
            Gọi tư vấn
          </a>
          <a href={zaloHref} onClick={() => setMobileOpen(false)}>
            Nhận báo giá
          </a>
        </div>
      </div>
    </header>
  )
}
