'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

type ColorFilterOption = {
  href: string
  name: string
  productCount?: number | null
  slug: string
}

type ColorFilterDropdownProps = {
  activeSlug?: string
  options: ColorFilterOption[]
}

export function ColorFilterDropdown({ activeSlug, options }: ColorFilterDropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const activeOption = options.find((option) => option.slug === activeSlug)

  const closeDropdown = () => {
    if (detailsRef.current) detailsRef.current.open = false
  }

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) closeDropdown()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !detailsRef.current?.open) return
      closeDropdown()
      detailsRef.current.querySelector('summary')?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <details className="mabd-catalog-more" data-catalog-color-filter ref={detailsRef}>
      <summary>
        <span>{activeOption ? activeOption.name : 'Lọc theo màu'}</span>
        <ChevronDown aria-hidden="true" size={15} />
      </summary>
      <div>
        <Link className="mabd-catalog-more-all" href="/san-pham/" onClick={closeDropdown}>Tất cả màu</Link>
        {options.map((option) => (
          <Link
            aria-current={activeSlug === option.slug ? 'page' : undefined}
            href={option.href}
            key={option.slug}
            onClick={closeDropdown}
          >
            <span>{option.name}</span>
            {typeof option.productCount === 'number' ? <small>{option.productCount}</small> : null}
          </Link>
        ))}
      </div>
    </details>
  )
}
