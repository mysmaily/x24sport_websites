'use client'

import { ArrowRight, Baby, BriefcaseBusiness, CalendarDays, ChefHat, ChevronDown, Menu, School, ShieldCheck, Shirt, Stethoscope, TentTree, X, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { SearchDialog } from '../../_components/search-dialog'
import { useTenantNavigation } from '../../_components/navigation-provider'
import type { UniformCategory } from './lib'
import styles from './mayaodongphuc.module.css'

function HeaderLogo() {
  return <Link className={styles.logo} href="/" aria-label="May Áo Đồng Phục — Trang chủ"><img alt="" className={styles.logoImage} height={469} src="/images/mayaodongphuc/logo-horizontal.svg" width={1886} /></Link>
}

const categoryIcons: Record<string, LucideIcon> = {
  'dong-phuc-bao-ho': ShieldCheck,
  'dong-phuc-da-ngoai-team-building': TentTree,
  'dong-phuc-doanh-nghiep': BriefcaseBusiness,
  'dong-phuc-fnb': ChefHat,
  'dong-phuc-su-kien-doi-nhom': CalendarDays,
  'dong-phuc-tre-em': Baby,
  'dong-phuc-truong-hoc': School,
  'dong-phuc-y-te-dich-vu': Stethoscope,
  'su-kien-doi-nhom': CalendarDays,
  'y-te-dich-vu': Stethoscope,
}

function categoryIcon(slug: string) {
  return categoryIcons[slug] || Shirt
}

export function UniformHeader({ categories, consultationEnabled }: { categories: UniformCategory[]; consultationEnabled: boolean }) {
  const navigationState = useTenantNavigation()
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const desktopButtonRef = useRef<HTMLButtonElement>(null)
  const desktopCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const actionHref = consultationEnabled ? '/#bao-gia' : '/san-pham/'
  const cmsRoots = navigationState.mode === 'cms' && navigationState.ready ? navigationState.cmsNodes : []
  const solutions = cmsRoots.find((item) => item.key === 'solutions')
  const navigationCategories = solutions
    ? solutions.children.filter((item) => item.href).map((item, index) => ({
        description: item.description || '',
        href: item.href!,
        id: item.key,
        name: item.label,
        order: index,
        slug: item.href!.split('/').filter(Boolean).at(-1) || item.key,
      }))
    : []
  const activeCategories = solutions
    ? navigationCategories
    : categories.map((item) => ({ ...item, href: `/danh-muc/${item.slug}/` }))
  const utilityLinks = cmsRoots.length
    ? cmsRoots.filter((item) => item.href && item.key !== 'solutions').map((item) => ({ href: item.href!, label: item.label }))
    : [
        { href: '/#quy-trinh', label: 'Quy trình' },
        { href: '/#vat-lieu', label: 'Vật liệu' },
        { href: '/#tieu-chuan', label: 'Tiêu chuẩn' },
        { href: '/blog/', label: 'Tư vấn' },
      ]

  function cancelDesktopClose() {
    if (!desktopCloseTimerRef.current) return
    clearTimeout(desktopCloseTimerRef.current)
    desktopCloseTimerRef.current = null
  }

  function openDesktopMenu() {
    cancelDesktopClose()
    setDesktopOpen(true)
  }

  function scheduleDesktopClose() {
    cancelDesktopClose()
    desktopCloseTimerRef.current = setTimeout(() => {
      setDesktopOpen(false)
      desktopCloseTimerRef.current = null
    }, 240)
  }

  function closeMenus() {
    cancelDesktopClose()
    setDesktopOpen(false)
    setMobileOpen(false)
  }

  useEffect(() => () => cancelDesktopClose(), [])

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
      <div className={styles.navMenu} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeMenus() }} onFocus={openDesktopMenu} onPointerEnter={openDesktopMenu} onPointerLeave={scheduleDesktopClose} ref={desktopMenuRef}>
        <button aria-controls="uniform-solutions-menu" aria-expanded={desktopOpen} className={styles.navMenuButton} onClick={openDesktopMenu} ref={desktopButtonRef} type="button">Giải pháp <ChevronDown aria-hidden="true" /></button>
        {desktopOpen ? <div className={`${styles.mega} ${styles.megaCompact}`} id="uniform-solutions-menu" onPointerEnter={openDesktopMenu}>
          <div className={styles.megaCategories}>
            {activeCategories.map((item) => {
              const Icon = categoryIcon(item.slug)
              return <Link href={item.href} key={item.slug} onClick={closeMenus}>
                <span className={styles.megaCategoryIconWrap}><Icon aria-hidden="true" className={styles.megaCategoryIcon} /></span>
                <b>{item.name}</b>
                {item.description ? <small>{item.description}</small> : null}
                <ArrowRight aria-hidden="true" className={styles.megaCategoryArrow} />
              </Link>
            })}
          </div>
          <aside className={styles.megaQuickLinks}>
            <span>Khám phá</span>
            <h3>Đi nhanh</h3>
            <Link href="/san-pham/" onClick={closeMenus}>Tất cả mẫu <ArrowRight aria-hidden="true" /></Link>
            <Link href="/#quy-trinh" onClick={closeMenus}>Quy trình đặt may <ArrowRight aria-hidden="true" /></Link>
            <Link href="/#vat-lieu" onClick={closeMenus}>Vật liệu <ArrowRight aria-hidden="true" /></Link>
          </aside>
        </div> : null}
      </div>
      {utilityLinks.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
    </nav>
    <div className={styles.actions}><SearchDialog action="/tim-kiem/" iconSize={18} placeholder="Tên mẫu, ngành nghề hoặc màu đồng phục…" triggerClassName={styles.searchAction} /><Link href={actionHref}>{consultationEnabled ? 'Tạo yêu cầu' : 'Xem catalog'} <ArrowRight aria-hidden="true" /></Link><div className={styles.mobile} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMobileOpen(false) }} ref={mobileMenuRef}><button aria-controls="uniform-mobile-menu" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} className={styles.mobileToggle} onClick={() => setMobileOpen((open) => !open)} ref={mobileButtonRef} type="button">{mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>{mobileOpen ? <nav aria-label="Điều hướng mobile" className={styles.mobilePanel} id="uniform-mobile-menu"><div><HeaderLogo /><button aria-label="Đóng menu" className={styles.mobileClose} onClick={() => { setMobileOpen(false); mobileButtonRef.current?.focus() }} type="button"><X aria-hidden="true" /></button></div><p>Chọn giải pháp theo bối cảnh</p>{activeCategories.map((item) => <Link href={item.href} key={item.slug} onClick={closeMenus}>{item.name}<ArrowRight aria-hidden="true" /></Link>)}<Link className={styles.mobileCta} href={actionHref} onClick={closeMenus}>{consultationEnabled ? 'Tạo yêu cầu tư vấn' : 'Xem tất cả mẫu'}</Link></nav> : null}</div></div>
  </div></header>
}
