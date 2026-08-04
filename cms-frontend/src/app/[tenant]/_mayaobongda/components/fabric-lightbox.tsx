'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'

export function FabricLightbox({
  alt,
  children,
  className,
  image,
  title,
}: {
  alt: string
  children: ReactNode
  className?: string
  image: string
  title: string
}) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
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
        type="button"
      >
        {children}
      </button>

      {open ? (
        <div className="football-fabric-lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh chất liệu ${title}`}>
          <button className="football-fabric-lightbox-backdrop" aria-label="Đóng ảnh" onClick={() => setOpen(false)} type="button" />
          <div className="football-fabric-lightbox-panel">
            <div className="football-fabric-lightbox-head">
              <div>
                <p>Ảnh mặt vải</p>
                <h2>{title}</h2>
              </div>
              <button aria-label="Đóng ảnh" onClick={() => setOpen(false)} type="button">
                <X size={20} />
              </button>
            </div>
            <div className="football-fabric-lightbox-stage">
              <img alt={alt} src={image} style={{ transform: `scale(${zoom})` }} />
            </div>
            <div className="football-fabric-lightbox-tools">
              <button aria-label="Thu nhỏ" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} type="button"><ZoomOut size={18} /></button>
              <button aria-label="Kích thước gốc" onClick={() => setZoom(1)} type="button"><RotateCcw size={18} /> {Math.round(zoom * 100)}%</button>
              <button aria-label="Phóng to" onClick={() => setZoom((value) => Math.min(3, value + 0.25))} type="button"><ZoomIn size={18} /></button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
