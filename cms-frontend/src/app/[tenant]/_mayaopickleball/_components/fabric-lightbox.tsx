'use client'

import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'

export function FabricLightbox({
  alt,
  children,
  className,
  image,
  imageHeight,
  imageWidth,
  title,
}: {
  alt: string
  children: ReactNode
  className?: string
  image: string
  imageHeight: number
  imageWidth: number
  title: string
}) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const dialogTitleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.body.classList.add('has-fabric-lightbox')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('has-fabric-lightbox')
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [open])

  return (
    <>
      <button
        aria-label={`Phóng to ảnh ${title}`}
        className={className}
        onClick={() => {
          setZoom(1)
          setOpen(true)
        }}
        ref={triggerRef}
        type="button"
      >
        {children}
      </button>

      {open ? (
        <div aria-labelledby={dialogTitleId} className="fabric-lightbox" role="dialog" aria-modal="true">
          <button className="fabric-lightbox-backdrop" aria-label="Đóng ảnh" onClick={() => setOpen(false)} tabIndex={-1} type="button" />
          <div className="fabric-lightbox-panel" ref={panelRef}>
            <div className="fabric-lightbox-head">
              <div>
                <span>Ảnh mặt vải</span>
                <strong id={dialogTitleId}>{title}</strong>
              </div>
              <button aria-label="Đóng ảnh" onClick={() => setOpen(false)} ref={closeButtonRef} type="button">
                <X size={20} />
              </button>
            </div>
            <div className="fabric-lightbox-stage">
              <img alt={alt} height={imageHeight} src={image} style={{ transform: `scale(${zoom})` }} width={imageWidth} />
            </div>
            <div className="fabric-lightbox-tools" aria-label="Điều khiển phóng to ảnh">
              <button aria-label="Thu nhỏ" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} type="button">
                <ZoomOut size={18} />
              </button>
              <button aria-label="Kích thước gốc" onClick={() => setZoom(1)} type="button">
                <RotateCcw size={18} />
                <span>{Math.round(zoom * 100)}%</span>
              </button>
              <button aria-label="Phóng to" onClick={() => setZoom((value) => Math.min(3, value + 0.25))} type="button">
                <ZoomIn size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
