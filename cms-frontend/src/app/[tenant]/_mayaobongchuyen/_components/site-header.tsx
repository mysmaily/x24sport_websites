'use client'

import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { NavigationNode } from '../../../../lib/navigation'
import { useActiveNavigation } from '../../../_components/navigation-provider'
import { HeaderSearch } from './header-search'
import type { NavItem } from '../lib/content'

const PHONE_DISPLAY = '0989.353.247'
const PHONE_VALUE = '0989353247'

function legacyNodes(items: NavItem[]): NavigationNode[] {
  return items.map((item, rootIndex) => ({
    activePatterns: [item.href],
    children: (item.columns || []).map((column, columnIndex) => ({
      activePatterns: [],
      children: (column.items || []).map((child, childIndex) => ({
        activePatterns: [child.href],
        children: [],
        href: child.href,
        key: `legacy.${rootIndex}.${columnIndex}.${childIndex}`,
        kind: 'customUrl',
        label: child.label,
      })),
      key: `legacy.${rootIndex}.${columnIndex}`,
      kind: 'group',
      label: column.label,
    })),
    href: item.href,
    key: `legacy.${rootIndex}`,
    kind: 'customUrl',
    label: item.label,
  }))
}

export function SiteHeader({ legacyNavigation }: { legacyNavigation: NavItem[] }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const fallback = useMemo(() => legacyNodes(legacyNavigation), [legacyNavigation])
  const navigation = useActiveNavigation(fallback)

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMobileOpen(false)
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header className="mbc-site-header sticky top-0 z-40 flex h-[72px] items-center justify-between border-b-[3px] border-[var(--accent)] bg-[#080909] px-4 shadow-[0_10px_28px_rgba(0,0,0,.22)] md:h-[82px] md:px-[clamp(20px,5vw,92px)]">
      <a aria-label="MayaoBongChuyen.vn" className="flex min-w-0 items-center gap-3 uppercase md:min-w-[330px]" href="/">
        <span aria-hidden="true" className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--accent),#911410)] text-[13px] font-black text-white shadow-[14px_0_0_-7px_rgba(238,43,36,.32)] md:h-11 md:w-11">
          VB
        </span>
        <span className="inline-flex flex-col justify-center leading-[0.92]">
          <strong className="text-base font-black italic text-white md:text-[clamp(16px,1.25vw,22px)]">MAYAOBONGCHUYEN</strong>
          <small className="hidden text-[13px] font-black tracking-[0.08em] text-[var(--accent)] md:block">.VN</small>
        </span>
      </a>

      <nav aria-label="Điều hướng chính" className="hidden items-center gap-[clamp(14px,1.55vw,26px)] text-[12.5px] font-black uppercase tracking-[0.02em] text-[#b9b9b9] lg:flex">
        {navigation.map((item) => (
          <div className="group relative flex min-h-[82px] items-center" key={item.key}>
            <a className="whitespace-nowrap group-hover:text-[var(--ink)]" href={item.href || '/'}>
              {item.label}
            </a>
            {item.children.length ? (
              <div className="pointer-events-none absolute left-1/2 top-[82px] grid min-w-[480px] -translate-x-1/2 translate-y-2 grid-cols-2 gap-7 border border-white/12 border-t-2 border-t-[var(--accent)] bg-[rgba(9,10,10,.97)] p-[22px] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {item.children.map((column) => (
                  <div key={column.key}>
                    <strong className="mb-3 block text-xs uppercase text-[var(--accent)]">{column.label}</strong>
                    {column.children.map((child) => (
                      <a className="block py-2 text-[var(--ink)] hover:text-[var(--accent)]" href={child.href} key={child.key}>
                        {child.label}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="flex min-w-0 items-center justify-end gap-2.5 md:min-w-[210px] md:gap-4">
        <a className="inline-flex items-center gap-2.5 whitespace-nowrap text-sm font-extrabold text-[#c7c7c7]" href={`tel:${PHONE_VALUE}`}>
          <Phone aria-hidden="true" size={17} />
          <span className="hidden md:inline">{PHONE_DISPLAY}</span>
        </a>
        <HeaderSearch />
        <button
          aria-controls="mbc-mobile-navigation"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          className="mbc-mobile-menu-trigger"
          onClick={() => setMobileOpen((open) => !open)}
          ref={triggerRef}
          type="button"
        >
          {mobileOpen ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
        </button>
      </div>

      <nav aria-label="Điều hướng di động" className="mbc-mobile-navigation" hidden={!mobileOpen} id="mbc-mobile-navigation">
          {navigation.map((item) => (
            <div className="mbc-mobile-navigation-group" key={item.key}>
              {item.href ? <a href={item.href} onClick={closeMobileMenu}>{item.label}</a> : <strong>{item.label}</strong>}
              {item.children.map((column) => (
                <div className="mbc-mobile-navigation-column" key={column.key}>
                  <span>{column.label}</span>
                  {column.children.map((child) => (
                    <a href={child.href} key={child.key} onClick={closeMobileMenu}>{child.label}</a>
                  ))}
                </div>
              ))}
            </div>
          ))}
      </nav>
    </header>
  )
}
