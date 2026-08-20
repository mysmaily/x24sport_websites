'use client'

import { ArrowRight, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import styles from './mayaodongphuc.module.css'

function HeaderLogo() {
  return <Link className={styles.logo} href="/" aria-label="May Áo Đồng Phục — Trang chủ"><img alt="" className={styles.logoImage} src="/images/mayaodongphuc/logo-horizontal.svg" /></Link>
}

export function UniformHeader({ consultationEnabled }: { consultationEnabled: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const actionHref = consultationEnabled ? '/#bao-gia' : '/san-pham/'

  function closeMenus() {
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return

    function closeOnPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (mobileOpen && !mobileMenuRef.current?.contains(target)) setMobileOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      mobileButtonRef.current?.focus()
      closeMenus()
    }

    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [mobileOpen])

  return <header className={styles.header}><div className={styles.headerInner}>
    <HeaderLogo />
    <nav className={styles.nav} aria-label="Điều hướng chính">
      <Link href="/#quy-trinh">Quy trình</Link><Link href="/#vat-lieu">Vật liệu</Link><Link href="/#tieu-chuan">Tiêu chuẩn</Link><Link href="/blog/">Tư vấn</Link>
    </nav>
    <div className={styles.actions}><Link aria-label="Tìm mẫu" className={styles.searchAction} href="/san-pham/"><Search aria-hidden="true" /></Link><Link href={actionHref}>{consultationEnabled ? 'Tạo yêu cầu' : 'Xem catalog'} <ArrowRight aria-hidden="true" /></Link><div className={styles.mobile} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMobileOpen(false) }} ref={mobileMenuRef}><button aria-controls="uniform-mobile-menu" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} className={styles.mobileToggle} onClick={() => setMobileOpen((open) => !open)} ref={mobileButtonRef} type="button">{mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>{mobileOpen ? <nav aria-label="Điều hướng mobile" className={styles.mobilePanel} id="uniform-mobile-menu"><div><HeaderLogo /><button aria-label="Đóng menu" className={styles.mobileClose} onClick={() => { setMobileOpen(false); mobileButtonRef.current?.focus() }} type="button"><X aria-hidden="true" /></button></div><Link href="/#quy-trinh" onClick={closeMenus}>Quy trình<ArrowRight aria-hidden="true" /></Link><Link href="/#vat-lieu" onClick={closeMenus}>Vật liệu<ArrowRight aria-hidden="true" /></Link><Link href="/#tieu-chuan" onClick={closeMenus}>Tiêu chuẩn<ArrowRight aria-hidden="true" /></Link><Link href="/blog/" onClick={closeMenus}>Tư vấn<ArrowRight aria-hidden="true" /></Link><Link className={styles.mobileCta} href={actionHref} onClick={closeMenus}>{consultationEnabled ? 'Tạo yêu cầu tư vấn' : 'Xem tất cả mẫu'}</Link></nav> : null}</div></div>
  </div></header>
}
