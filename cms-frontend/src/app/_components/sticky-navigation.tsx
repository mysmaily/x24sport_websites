'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type ReactNode, useEffect, useRef, useState } from 'react'

type StickyNavigationProps = {
  children: ReactNode
}

export function StickyNavigation({ children }: StickyNavigationProps) {
  const navRef = useRef<HTMLElement>(null)
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    const update = () => setCondensed((navRef.current?.getBoundingClientRect().top ?? 1) <= 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <nav className="nav-bar" data-condensed={condensed ? 'true' : 'false'} ref={navRef} aria-label="Điều hướng chính">
      <div className="site-container">
        <div className="nav-menu-links">
          <Link aria-label="X24Sport - Trang chủ" className="nav-mini-logo" href="/">
            <span>
              <Image alt="" aria-hidden="true" height={158} src="/images/brand/x24-logo.png" width={1200} />
            </span>
          </Link>
          {children}
        </div>
      </div>
    </nav>
  )
}
