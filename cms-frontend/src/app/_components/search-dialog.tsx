'use client'

import { ArrowUpRight, Search, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import styles from './search-dialog.module.css'

type SuggestionProduct = {
  href: string
  image?: string
  name: string
  viewCount?: number
}

type SuggestionResponse = {
  keywords?: string[]
  products?: SuggestionProduct[]
}

type SearchDialogProps = {
  action?: string
  iconSize?: number
  overlayClassName?: string
  placeholder?: string
  triggerClassName?: string
  triggerText?: string
}

export function SearchDialog({
  action = '/tim-kiem/',
  iconSize = 19,
  overlayClassName = '',
  placeholder = 'Tên mẫu, mã áo hoặc màu sắc…',
  triggerClassName = '',
  triggerText,
}: SearchDialogProps) {
  const pathname = usePathname()
  const dialogId = useId()
  const titleId = `${dialogId}-title`
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => inputRef.current?.focus())

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      triggerRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open || suggestions) return
    const controller = new AbortController()
    setLoading(true)
    fetch('/api/search-suggestions/', { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<SuggestionResponse> : Promise.reject(new Error('suggestions unavailable')))
      .then((data) => setSuggestions(data))
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) setSuggestions({ keywords: [], products: [] })
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [open, suggestions])

  const close = () => setOpen(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    const query = new FormData(event.currentTarget).get('q')?.toString().trim() || ''
    if (query) return
    event.preventDefault()
    setError('Nhập tên mẫu, mã áo hoặc màu bạn muốn tìm.')
    inputRef.current?.focus()
  }
  const suggestionsPending = open && (!suggestions || loading)

  const dialog = open ? (
    <div className={`${styles.overlay} ${overlayClassName}`} onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <div aria-labelledby={titleId} aria-modal="true" className={styles.dialog} id={dialogId} ref={panelRef} role="dialog">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Tìm nhanh mẫu phù hợp</p>
            <h2 className={styles.title} id={titleId}>Bạn đang tìm mẫu áo nào?</h2>
          </div>
          <button aria-label="Đóng tìm kiếm" className={styles.close} onClick={close} type="button"><X aria-hidden="true" size={20} /></button>
        </div>

        <form action={action} className={styles.form} onSubmit={submit} role="search">
          <Search aria-hidden="true" className={styles.searchIcon} size={20} />
          <label className={styles.srOnly} htmlFor={`${titleId}-query`}>Từ khóa tìm kiếm</label>
          <input aria-describedby={error ? `${titleId}-error` : undefined} aria-invalid={Boolean(error)} autoComplete="off" className={styles.input} id={`${titleId}-query`} name="q" onChange={() => setError('')} placeholder={placeholder} ref={inputRef} type="search" />
          <button className={styles.submit} type="submit">Tìm kiếm</button>
        </form>
        {error ? <p className={styles.error} id={`${titleId}-error`} role="alert">{error}</p> : null}

        <div className={styles.content}>
          <section className={styles.section} aria-labelledby={`${titleId}-keywords`}>
            <h3 className={styles.sectionHeading} id={`${titleId}-keywords`}>Tìm kiếm phổ biến <span>Chạm để tìm ngay</span></h3>
            {suggestionsPending ? <div className={styles.keywords} aria-label="Đang tải từ khóa gợi ý"><span className={styles.keywordSkeleton} /><span className={styles.keywordSkeleton} /><span className={styles.keywordSkeleton} /><span className={styles.keywordSkeleton} /><span className={styles.keywordSkeleton} /></div> : null}
            {!suggestionsPending && suggestions?.keywords?.length ? <div className={styles.keywords}>{suggestions.keywords.map((keyword) => <a className={styles.keyword} href={`${action}?q=${encodeURIComponent(keyword)}`} key={keyword}>{keyword}</a>)}</div> : null}
            {!suggestionsPending && suggestions && !suggestions.keywords?.length ? <p className={styles.status}>Chưa có từ khóa nổi bật để gợi ý.</p> : null}
          </section>

          <section className={styles.section} aria-labelledby={`${titleId}-products`}>
            <h3 className={styles.sectionHeading} id={`${titleId}-products`}>Sản phẩm được xem nhiều <span>Trên website này</span></h3>
            {suggestionsPending ? <div className={styles.products} aria-label="Đang tải sản phẩm"><span className={styles.skeleton} /><span className={styles.skeleton} /><span className={styles.skeleton} /><span className={styles.skeleton} /></div> : null}
            {!suggestionsPending && suggestions?.products?.length ? <div className={styles.products}>{suggestions.products.map((product) => <a className={styles.product} href={product.href} key={product.href}>
              {product.image ? <img alt="" className={styles.thumb} height="58" loading="lazy" src={product.image} width="58" /> : <span aria-hidden="true" className={styles.thumb} />}
              <span><strong className={styles.productName}>{product.name}</strong><small className={styles.productMeta}>Xem chi tiết sản phẩm</small></span>
              <ArrowUpRight aria-hidden="true" className={styles.arrow} size={17} />
            </a>)}</div> : null}
            {!suggestionsPending && suggestions && !suggestions.products?.length ? <p className={styles.status}>Chưa có sản phẩm nổi bật để gợi ý.</p> : null}
          </section>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button aria-controls={dialogId} aria-expanded={open} aria-haspopup="dialog" aria-label="Mở tìm kiếm" className={`${styles.trigger} ${triggerClassName}`} onClick={() => setOpen(true)} ref={triggerRef} type="button"><Search aria-hidden="true" size={iconSize} />{triggerText ? <span>{triggerText}</span> : null}</button>
      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  )
}
