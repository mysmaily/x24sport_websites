'use client'

import { ArrowUpRight, ChevronDown, Menu, MessageCircle, Phone, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { COLOR_LANDINGS, TYPE_LANDINGS } from '@/lib/catalog-landings'
import { LOGO_URL, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'

const links = [
  { href: '/logo-doi-chay/', label: 'Logo đội chạy' },
  { href: '/blog/', label: 'Kinh nghiệm' },
  { href: '/gioi-thieu/', label: 'Về chúng tôi' },
  { href: '/lien-he/', label: 'Liên hệ' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const productActive = pathname === '/san-pham/' || [...TYPE_LANDINGS, ...COLOR_LANDINGS].some((item) => pathname.startsWith(item.path))
  const showProducts = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setProductsOpen(true) }
  const hideProductsSoon = () => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setProductsOpen(false), 120) }
  useEffect(() => { setOpen(false); setProductsOpen(false) }, [pathname])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); setProductsOpen(false) }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1220]/95 text-white backdrop-blur-xl">
      <div className="mx-auto grid min-h-18 w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] lg:px-8">
        <Link className="inline-flex w-fit items-center" href="/" aria-label="May Áo Chạy Bộ — Trang chủ">
          <img alt="May Áo Chạy Bộ" className="h-auto w-[228px] max-w-[calc(100vw-96px)]" height="58" src={LOGO_URL} width="372" />
        </Link>
        <nav className="hidden items-center justify-center gap-5 text-sm font-extrabold text-slate-300 lg:flex xl:gap-7" aria-label="Điều hướng chính">
          <div
            className="relative"
            onBlur={hideProductsSoon}
            onFocus={showProducts}
            onMouseEnter={showProducts}
            onMouseLeave={hideProductsSoon}
          >
            <button
              aria-controls="product-mega-menu"
              aria-expanded={productsOpen}
              className={`relative flex min-h-12 cursor-pointer items-center gap-1.5 py-6 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${productActive ? 'text-brand' : ''}`}
              onClick={() => setProductsOpen((value) => !value)}
              type="button"
            >
              Mẫu áo <ChevronDown className={`transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} size={16} />
              {productActive ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}
            </button>
          </div>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href)
            return <Link aria-current={active ? 'page' : undefined} className={`relative py-6 transition hover:text-white ${active ? 'text-brand' : ''}`} href={link.href} key={link.href}>{link.label}{active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}</Link>
          })}
        </nav>
        <div className="hidden items-center justify-end gap-2 lg:flex">
          <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-3.5 text-sm font-black hover:border-brand/50" href={`tel:${PHONE_VALUE}`}><Phone size={17} /> {PHONE_DISPLAY}</a>
          <a className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-black hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={17} /> Tư vấn mẫu</a>
        </div>
        <button aria-controls="mobile-navigation" aria-expanded={open} aria-label={open ? 'Đóng menu' : 'Mở menu'} className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/20 lg:hidden" onClick={() => setOpen(!open)} type="button">{open ? <X /> : <Menu />}</button>
      </div>
      <div
        aria-hidden={!productsOpen}
        className={`absolute inset-x-0 top-full hidden border-t border-slate-200 bg-[#f8f6f2] text-slate-950 shadow-[0_28px_70px_rgba(2,6,23,.32)] transition duration-200 lg:block ${productsOpen ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0'}`}
        id="product-mega-menu"
        onBlur={hideProductsSoon}
        onFocus={showProducts}
        onMouseEnter={showProducts}
        onMouseLeave={hideProductsSoon}
      >
        <div className="mx-auto grid max-w-[1240px] grid-cols-[.9fr_1.35fr] gap-12 px-8 py-9">
          <section aria-labelledby="menu-types-title">
            <p className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-brand" id="menu-types-title"><span className="size-2 rounded-full bg-brand" /> Theo kiểu áo</p>
            <div className="grid grid-cols-2 gap-2.5">
              {TYPE_LANDINGS.map((item, index) => <Link className="group flex min-h-16 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-black shadow-sm transition hover:border-brand hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href={item.path} key={item.slug} tabIndex={productsOpen ? 0 : -1}><span><span className="mb-1 block text-[10px] font-black tracking-[.16em] text-slate-400">0{index + 1}</span>{item.navLabel}</span><ArrowUpRight className="text-slate-300 transition group-hover:text-brand" size={17} /></Link>)}
            </div>
            <Link className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-black text-brand hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href="/san-pham/" tabIndex={productsOpen ? 0 : -1}>Xem toàn bộ 603 mẫu áo <ArrowUpRight size={17} /></Link>
          </section>
          <section aria-labelledby="menu-colors-title">
            <p className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-slate-600" id="menu-colors-title"><span className="size-2 rounded-full bg-brand" /> Theo màu sắc</p>
            <div className="grid grid-cols-3 gap-2.5">
              {COLOR_LANDINGS.map((item) => <Link className="group flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold shadow-sm transition hover:border-brand hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" href={item.path} key={item.slug} tabIndex={productsOpen ? 0 : -1}><span aria-hidden="true" className="size-5 shrink-0 rounded-full border border-black/15 shadow-inner" style={{ background: item.swatch }} /><span>{item.navLabel}</span></Link>)}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Chọn màu để xem đúng bộ sưu tập. Mỗi trang có URL riêng, nội dung riêng và có thể chia sẻ trực tiếp.</p>
          </section>
        </div>
      </div>
      <div aria-hidden={!open} className={`absolute inset-x-0 top-full max-h-[calc(100vh-72px)] overflow-y-auto border-b border-white/10 bg-[#0b1220] p-4 shadow-2xl transition duration-200 lg:hidden ${open ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'}`} id="mobile-navigation">
        <nav className="mx-auto grid max-w-2xl gap-3" aria-label="Điều hướng di động">
          <section className="rounded-xl border border-white/10 bg-white/[.04] p-3">
            <div className="mb-3 flex items-center justify-between px-1"><p className="text-xs font-black uppercase tracking-[.16em] text-brand">Mẫu áo theo kiểu</p><Link className="text-xs font-bold text-white underline decoration-white/30 underline-offset-4" href="/san-pham/" tabIndex={open ? 0 : -1}>Xem tất cả</Link></div>
            <div className="grid gap-2 sm:grid-cols-2">{TYPE_LANDINGS.map((item) => <Link className="flex min-h-12 items-center rounded-lg border border-white/10 px-3 text-sm font-extrabold hover:border-brand/60" href={item.path} key={item.slug} tabIndex={open ? 0 : -1}>{item.navLabel}</Link>)}</div>
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
