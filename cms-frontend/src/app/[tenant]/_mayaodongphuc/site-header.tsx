'use client'

import { ArrowRight, ChevronDown, Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { UniformCategory } from './lib'
import styles from './mayaodongphuc.module.css'

function HeaderLogo() {
  return <Link className={styles.logo} href="/" aria-label="May Áo Đồng Phục — Trang chủ"><span>M</span><div><strong>MAY ÁO</strong><small>ĐỒNG PHỤC</small></div></Link>
}

export function UniformHeader({ categories, consultationEnabled }: { categories: UniformCategory[]; consultationEnabled: boolean }) {
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const desktopButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const actionHref = consultationEnabled ? '/#bao-gia' : '/san-pham/'

  function closeMenus() {
    setDesktopOpen(false)
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!desktopOpen && !mobileOpen) return

    function closeOnPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (desktopOpen && !desktopMenuRef.current?.contains(target)) setDesktopOpen(false)
      if (mobileOpen && !mobileMenuRef.current?.contains(target)) setMobileOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (mobileOpen) mobileButtonRef.current?.focus()
      else if (desktopOpen) desktopButtonRef.current?.focus()
      closeMenus()
    }

    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [desktopOpen, mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [mobileOpen])

  return <header className={styles.header}><div className={styles.headerInner}>
    <HeaderLogo />
    <nav className={styles.nav} aria-label="Điều hướng chính">
      <div className={styles.navMenu} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDesktopOpen(false) }} onPointerLeave={() => setDesktopOpen(false)} ref={desktopMenuRef}>
        <button aria-controls="uniform-solutions-menu" aria-expanded={desktopOpen} className={styles.navMenuButton} onClick={() => setDesktopOpen((open) => !open)} ref={desktopButtonRef} type="button">Giải pháp <ChevronDown aria-hidden="true" /></button>
        {desktopOpen ? <div className={styles.mega} id="uniform-solutions-menu"><div className={styles.megaLead}><span>CHỌN THEO BỐI CẢNH</span><h2>Mỗi đội ngũ cần một hệ đồng phục khác nhau.</h2><p>Từ môi trường làm việc đến vai trò và tần suất sử dụng.</p></div><div>{categories.map((item, index) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug} onClick={closeMenus}><span>{String(index + 1).padStart(2, '0')}</span><b>{item.name}</b><small>{item.description}</small></Link>)}</div><aside><h3>Đi nhanh</h3><Link href="/san-pham/" onClick={closeMenus}>Tất cả mẫu <ArrowRight aria-hidden="true" /></Link><Link href="/#quy-trinh" onClick={closeMenus}>Quy trình đặt may <ArrowRight aria-hidden="true" /></Link><Link href="/#vat-lieu" onClick={closeMenus}>Vật liệu <ArrowRight aria-hidden="true" /></Link></aside></div> : null}
      </div>
      <Link href="/#quy-trinh">Quy trình</Link><Link href="/#vat-lieu">Vật liệu</Link><Link href="/#tieu-chuan">Tiêu chuẩn</Link>
    </nav>
    <div className={styles.actions}><Link aria-label="Tìm mẫu" className={styles.searchAction} href="/san-pham/"><Search aria-hidden="true" /></Link><Link href={actionHref}>{consultationEnabled ? 'Tạo yêu cầu' : 'Xem catalog'} <ArrowRight aria-hidden="true" /></Link><div className={styles.mobile} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMobileOpen(false) }} ref={mobileMenuRef}><button aria-controls="uniform-mobile-menu" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} className={styles.mobileToggle} onClick={() => setMobileOpen((open) => !open)} ref={mobileButtonRef} type="button">{mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>{mobileOpen ? <nav aria-label="Điều hướng mobile" className={styles.mobilePanel} id="uniform-mobile-menu"><div><HeaderLogo /><button aria-label="Đóng menu" className={styles.mobileClose} onClick={() => { setMobileOpen(false); mobileButtonRef.current?.focus() }} type="button"><X aria-hidden="true" /></button></div><p>Chọn giải pháp theo bối cảnh</p>{categories.map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug} onClick={closeMenus}>{item.name}<ArrowRight aria-hidden="true" /></Link>)}<Link className={styles.mobileCta} href={actionHref} onClick={closeMenus}>{consultationEnabled ? 'Tạo yêu cầu tư vấn' : 'Xem tất cả mẫu'}</Link></nav> : null}</div></div>
  </div></header>
}
