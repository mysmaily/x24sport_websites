'use client'

import { Menu, MessageCircle, Phone, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'

const links = [
  { href: '/san-pham/', label: 'Mẫu áo' },
  { href: '/logo-team/', label: 'Logo team' },
  { href: '/dat-may-ao-bong-ro/', label: 'Đặt may' },
  { href: '/bang-gia-may-ao-bong-ro/', label: 'Bảng giá' },
  { href: '/chat-lieu-va-bang-size-ao-bong-ro/', label: 'Vải & size' },
  { href: '/lien-he/', label: 'Liên hệ' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur-xl">
      <div className="mx-auto grid min-h-18 w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] lg:px-8">
        <Link className="inline-flex w-fit min-w-0 items-center py-2" href="/" aria-label="May Áo Bóng Rổ — Trang chủ">
          <img
            alt="May Áo Bóng Rổ"
            className="h-7 w-auto max-w-[180px] sm:h-8 sm:max-w-[215px]"
            height="44"
            src="https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/may-ao-bong-ro-logo.svg"
            width="287"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-6 text-sm font-extrabold text-slate-300 lg:flex xl:gap-8" aria-label="Điều hướng chính">
          {links.map((link) => {
            const active = pathname === link.href.replace(/\/$/, '') || pathname.startsWith(link.href)
            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className={`relative py-6 transition-colors hover:text-white ${active ? 'text-brand' : ''}`}
                key={link.href}
                href={link.href}
              >
                {link.label}
                {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand" /> : null}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <a className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-brand/50 hover:bg-white/10" href={`tel:${PHONE_VALUE}`}>
            <Phone aria-hidden="true" size={17} /> {PHONE_DISPLAY}
          </a>
          <a className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
            <MessageCircle aria-hidden="true" size={17} /> Nhận tư vấn
          </a>
        </div>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={open}
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:border-brand/50 hover:bg-white/10 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-white/10 bg-black p-4 shadow-2xl shadow-black/40 lg:hidden" id="mobile-navigation">
          <nav className="mx-auto grid max-w-2xl gap-2" aria-label="Điều hướng di động">
            {links.map((link) => {
              const active = pathname === link.href.replace(/\/$/, '') || pathname.startsWith(link.href)
              return (
                <Link aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center rounded-lg border px-4 text-base font-extrabold transition hover:border-brand/50 hover:bg-white/10 ${active ? 'border-brand/50 bg-white/10 text-brand' : 'border-white/10 text-white'}`} key={link.href} href={link.href}>
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="mx-auto mt-3 grid max-w-2xl grid-cols-2 gap-2">
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-black text-black transition hover:bg-slate-100" href={`tel:${PHONE_VALUE}`}><Phone size={17} /> Gọi ngay</a>
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-sm font-black text-white" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={17} /> Nhận báo giá</a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
