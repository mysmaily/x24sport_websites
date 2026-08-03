'use client'

import { Activity, ArrowUpRight, ChevronDown, Eye, Flag, Menu, MessageCircle, Palette, Phone, Search, Shirt, Sparkles, X, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { COLOR_LANDINGS, TYPE_LANDINGS } from '../lib/catalog-landings'
import { LOGO_URL, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'

const sampleLinks: Array<{ href: string; icon: LucideIcon; label: string }> = [
  { href: '/san-pham/', icon: Sparkles, label: 'Mẫu mới' },
  { href: '/mau-ao-chay-bo-duoc-xem-nhieu/', icon: Eye, label: 'Xem nhiều' },
  { href: '/may-ao-chay-bo-thiet-ke-rieng-x24/', icon: Palette, label: 'Áo chạy bộ thiết kế' },
  { href: '/ao-chay-bo-co-tay/', icon: Shirt, label: 'Áo chạy bộ có tay' },
  { href: '/ao-chay-bo-sat-nach/', icon: Activity, label: 'Áo chạy bộ sát nách' },
  { href: '/ao-chay-bo-co-do-sao-vang/', icon: Flag, label: 'Áo chạy bộ cờ đỏ sao vàng' },
]

const links = [
  { href: '/bang-gia-may-ao-chay-bo/', label: 'Bảng giá' },
  { href: '/logo-doi-chay/', label: 'Logo đội chạy' },
  { href: '/blog/', label: 'Kinh nghiệm' },
  { href: '/gioi-thieu/', label: 'Về chúng tôi' },
  { href: '/lien-he/', label: 'Liên hệ' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'samples' | 'colors' | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const productActive = pathname === '/san-pham/' || pathname.startsWith('/mau-ao-chay-bo-duoc-xem-nhieu/') || TYPE_LANDINGS.some((item) => pathname.startsWith(item.path))
  const colorActive = COLOR_LANDINGS.some((item) => pathname.startsWith(item.path))
  const showMenu = (menu: 'samples' | 'colors') => { if (closeTimer.current) clearTimeout(closeTimer.current); setActiveMenu(menu) }
  const hideMenuSoon = () => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setActiveMenu(null), 120) }
  useEffect(() => { setOpen(false); setActiveMenu(null); setSearchOpen(false) }, [pathname])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
              if (event.key === 'Escape') { setOpen(false); setActiveMenu(null); setSearchOpen(false) }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1220]/95 text-white backdrop-blur-xl">
      <div className="mx-auto grid min-h-16 w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[minmax(190px,.8fr)_auto_minmax(250px,.9fr)] lg:px-6 xl:px-8">
        <Link className="inline-flex w-fit items-center" href="/" aria-label="May Áo Chạy Bộ — Trang chủ">
          <img alt="May Áo Chạy Bộ" className="h-auto w-[228px] max-w-[calc(100vw-96px)]" height="58" src={LOGO_URL} width="372" />
        </Link>
        <nav className="hidden items-center justify-center gap-3 text-[13px] font-extrabold text-slate-300 lg:flex xl:gap-5 xl:text-sm" aria-label="Điều hướng chính">
          <div
            className="relative"
            onBlur={hideMenuSoon}
            onFocus={() => showMenu('samples')}
            onMouseEnter={() => showMenu('samples')}
            onMouseLeave={hideMenuSoon}
          >
            <button
              aria-controls="product-mega-menu"
              aria-expanded={activeMenu === 'samples'}
              className={`relative flex min-h-11 cursor-pointer items-center gap-1.5 py-5 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${productActive ? 'text-brand' : ''}`}
              onClick={() => setActiveMenu((value) => value === 'samples' ? null : 'samples')}
              type="button"
            >
              Mẫu áo <ChevronDown className={`transition-transform duration-200 ${activeMenu === 'samples' ? 'rotate-180' : ''}`} size={16} />
              {productActive ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}
            </button>
          </div>
          <div
            className="relative"
            onBlur={hideMenuSoon}
            onFocus={() => showMenu('colors')}
            onMouseEnter={() => showMenu('colors')}
            onMouseLeave={hideMenuSoon}
          >
            <button
              aria-controls="color-mega-menu"
              aria-expanded={activeMenu === 'colors'}
              className={`relative flex min-h-11 cursor-pointer items-center gap-1.5 py-5 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${colorActive ? 'text-brand' : ''}`}
              onClick={() => setActiveMenu((value) => value === 'colors' ? null : 'colors')}
              type="button"
            >
              Màu áo <ChevronDown className={`transition-transform duration-200 ${activeMenu === 'colors' ? 'rotate-180' : ''}`} size={16} />
              {colorActive ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}
            </button>
          </div>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href)
            return <Link aria-current={active ? 'page' : undefined} className={`relative whitespace-nowrap py-5 transition hover:text-white ${active ? 'text-brand' : ''}`} href={link.href} key={link.href}>{link.label}{active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}</Link>
          })}
        </nav>
        <div className="hidden min-w-0 items-center justify-end gap-2 lg:flex">
          <button aria-expanded={searchOpen} aria-label="Mở tìm kiếm" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg border border-white/20 transition hover:border-brand/50 hover:bg-white/5" onClick={() => setSearchOpen((value) => !value)} type="button"><Search size={17} /></button>
          <a className="inline-flex min-h-10 min-w-0 items-center gap-2 rounded-lg border border-white/20 px-3 text-[13px] font-black leading-tight transition hover:border-brand/50 hover:bg-white/5 xl:text-sm" href={`tel:${PHONE_VALUE}`}><Phone className="shrink-0" size={16} /> <span className="whitespace-nowrap tabular-nums">{PHONE_DISPLAY}</span></a>
          <a className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-brand px-3.5 text-[13px] font-black leading-tight text-white transition hover:bg-brand-dark xl:text-sm" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle className="shrink-0" size={16} /> <span className="whitespace-nowrap">Tư vấn mẫu</span></a>
        </div>
        <div className="flex items-center justify-end gap-2 lg:hidden">
          <button aria-expanded={searchOpen} aria-label="Mở tìm kiếm" className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/20" onClick={() => setSearchOpen((value) => !value)} type="button"><Search size={18} /></button>
          <button aria-controls="mobile-navigation" aria-expanded={open} aria-label={open ? 'Đóng menu' : 'Mở menu'} className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/20" onClick={() => setOpen(!open)} type="button">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {searchOpen ? <div className="absolute right-4 top-full z-[70] mt-2 w-[min(520px,calc(100vw-32px))] rounded-xl bg-white p-1.5 text-slate-950 shadow-[0_14px_40px_rgba(2,6,23,.24)]"><form action="/tim-kiem/" className="grid grid-cols-[1fr_auto_auto] gap-1.5" role="search"><label className="sr-only" htmlFor="header-search-q">Tìm mẫu áo</label><input autoComplete="off" className="min-h-11 min-w-0 rounded-lg bg-slate-50 px-3 text-sm outline-none" id="header-search-q" name="q" placeholder="Tên mẫu, màu áo, tag ảnh…" type="search" /><button className="rounded-lg bg-brand px-4 text-sm font-black text-white" type="submit">Tìm</button><button aria-label="Đóng tìm kiếm" className="grid size-11 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" onClick={() => setSearchOpen(false)} type="button"><X size={17} /></button></form></div> : null}
      <div
        aria-hidden={activeMenu !== 'samples'}
        className={`absolute left-1/2 top-full hidden w-[min(760px,calc(100vw-48px))] -translate-x-1/2 rounded-b-xl border border-t-0 border-slate-200 bg-[#f8f6f2] text-slate-950 shadow-[0_24px_64px_rgba(2,6,23,.28)] transition duration-200 lg:block ${activeMenu === 'samples' ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0'}`}
        id="product-mega-menu"
        onBlur={hideMenuSoon}
        onFocus={() => showMenu('samples')}
        onMouseEnter={() => showMenu('samples')}
        onMouseLeave={hideMenuSoon}
      >
        <div className="px-5 py-5">
          <section aria-labelledby="menu-types-title">
            <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-brand" id="menu-types-title"><Sparkles size={14} /> Mẫu áo</p>
            <div className="grid grid-cols-2 gap-2">
              {sampleLinks.map((item) => {
                const Icon = item.icon
                return <Link className="group grid min-h-14 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-black shadow-sm transition hover:border-brand hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href={item.href} key={item.href} tabIndex={activeMenu === 'samples' ? 0 : -1}><span className="grid size-8 place-items-center rounded-lg bg-orange-50 text-brand transition group-hover:bg-brand group-hover:text-white"><Icon size={17} /></span><span>{item.label}</span><ArrowUpRight className="text-slate-300 transition group-hover:text-brand" size={16} /></Link>
              })}
            </div>
          </section>
        </div>
      </div>
      <div
        aria-hidden={activeMenu !== 'colors'}
        className={`absolute left-1/2 top-full hidden w-[min(820px,calc(100vw-48px))] -translate-x-1/2 rounded-b-xl border border-t-0 border-slate-200 bg-[#f8f6f2] text-slate-950 shadow-[0_24px_64px_rgba(2,6,23,.28)] transition duration-200 lg:block ${activeMenu === 'colors' ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0'}`}
        id="color-mega-menu"
        onBlur={hideMenuSoon}
        onFocus={() => showMenu('colors')}
        onMouseEnter={() => showMenu('colors')}
        onMouseLeave={hideMenuSoon}
      >
        <section aria-labelledby="menu-colors-title" className="px-5 py-5">
          <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-brand" id="menu-colors-title"><Palette size={14} /> Màu áo</p>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_LANDINGS.map((item) => <Link className="group flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-extrabold shadow-sm transition hover:border-brand hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href={item.path} key={item.slug} tabIndex={activeMenu === 'colors' ? 0 : -1}><span aria-hidden="true" className="size-5 shrink-0 rounded-full border border-black/15 shadow-inner" style={{ background: item.swatch }} /><span>{item.navLabel}</span></Link>)}
          </div>
        </section>
      </div>
      <div aria-hidden={!open} className={`absolute inset-x-0 top-full max-h-[calc(100vh-72px)] overflow-y-auto border-b border-white/10 bg-[#0b1220] p-4 shadow-2xl transition duration-200 lg:hidden ${open ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`} id="mobile-navigation">
        <nav className="mx-auto grid max-w-2xl gap-3" aria-label="Điều hướng di động">
          <section className="rounded-xl border border-white/10 bg-white/[.04] p-3">
            <p className="mb-3 px-1 text-xs font-black uppercase tracking-[.16em] text-brand">Mẫu áo</p>
            <div className="grid gap-2 sm:grid-cols-2">{sampleLinks.map((item) => { const Icon = item.icon; return <Link className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-extrabold hover:border-brand/60" href={item.href} key={item.href} tabIndex={open ? 0 : -1}><Icon className="shrink-0 text-brand" size={17} />{item.label}</Link> })}</div>
          </section>
          <section className="rounded-xl border border-white/10 bg-white/[.04] p-3">
            <p className="mb-3 px-1 text-xs font-black uppercase tracking-[.16em] text-brand">Mẫu áo theo màu</p>
            <div className="grid grid-cols-2 gap-2">{COLOR_LANDINGS.map((item) => <Link className="flex min-h-12 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-extrabold hover:border-brand/60" href={item.path} key={item.slug} tabIndex={open ? 0 : -1}><span className="size-4 rounded-full border border-white/30" style={{ background: item.swatch }} />{item.navLabel}</Link>)}</div>
          </section>
          {links.map((link) => <Link className="flex min-h-12 items-center rounded-lg border border-white/10 px-4 font-extrabold hover:border-brand/50" href={link.href} key={link.href} tabIndex={open ? 0 : -1}>{link.label}</Link>)}
        </nav>
        <div className="mx-auto mt-3 grid max-w-2xl grid-cols-2 gap-2"><a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white text-sm font-black text-slate-950" href={`tel:${PHONE_VALUE}`} tabIndex={open ? 0 : -1}><Phone size={17} /> Gọi ngay</a><a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-black" href={ZALO_URL} rel="noreferrer" tabIndex={open ? 0 : -1} target="_blank"><MessageCircle size={17} /> Zalo</a></div>
      </div>
    </header>
  )
}
