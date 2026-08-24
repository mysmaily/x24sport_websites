'use client'

import { Menu, Phone } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { SearchDialog } from '../_components/search-dialog'
import styles from './pnd.module.css'

export type NavigationCategory = {
  children?: readonly NavigationCategory[]
  name: string
  slug: string
}

type CompactHeaderProps = {
  base: string
  navigationCategories: readonly NavigationCategory[]
}

function DesktopNavigation({ base, items }: { base: string; items: readonly NavigationCategory[] }) {
  return <nav className={styles.compactNav} aria-label="Menu nhanh">
    {items.map((item) => item.children?.length ? <div className={styles.navDropdown} key={item.slug}><Link className={styles.navItem} href={`${base}/danh-muc/${item.slug}`}>{item.name}</Link><div className={styles.navSubmenu}>{item.children.map((child) => <Link href={`${base}/danh-muc/${child.slug}`} key={child.slug}>{child.name}</Link>)}</div></div> : <Link href={`${base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}
    <Link href={`${base}/blog`}>Góc tư vấn</Link>
  </nav>
}

function MobileNavigation({ base, items }: { base: string; items: readonly NavigationCategory[] }) {
  return <details className={styles.compactMobileMenu}><summary aria-label="Mở menu"><Menu aria-hidden="true" size={21} /></summary><nav>{items.map((item) => item.children?.length ? <details className={styles.mobileCategoryGroup} key={item.slug}><summary>{item.name}</summary><div><Link href={`${base}/danh-muc/${item.slug}`}>Tất cả {item.name}</Link>{item.children.map((child) => <Link href={`${base}/danh-muc/${child.slug}`} key={child.slug}>{child.name}</Link>)}</div></details> : <Link href={`${base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}<Link href={`${base}/blog`}>Góc tư vấn</Link></nav></details>
}

export function CompactHeader({ base, navigationCategories }: CompactHeaderProps) {
  const sentinelRef = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.boundingClientRect.top < 0 && !entry.isIntersecting)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return <>
    <span aria-hidden="true" className={styles.compactSentinel} ref={sentinelRef} />
    <header aria-hidden={!visible} className={`${styles.compactHeader} ${visible ? styles.compactHeaderVisible : ''}`} inert={!visible}>
      <div className={styles.compactInner}>
        <DesktopNavigation base={base} items={navigationCategories} />
        <MobileNavigation base={base} items={navigationCategories} />
        <SearchDialog action={`${base}/san-pham`} iconSize={20} overlayClassName={styles.searchDialogTheme} placeholder="Tên mẫu, mã áo hoặc môn thể thao…" triggerClassName={styles.compactSearchTrigger} />
        <a className={styles.compactHotline} href="tel:0989353247"><Phone aria-hidden="true" size={18} /><span>Hotline</span><strong>0989 353 247</strong></a>
      </div>
    </header>
  </>
}
