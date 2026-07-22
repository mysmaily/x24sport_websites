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
    document.body.classList.add('has-fabric-lightbox')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('has-fabric-lightbox')
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
        <div className="fabric-lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh chất liệu ${title}`}>
          <button className="fabric-lightbox-backdrop" aria-label="Đóng ảnh" onClick={() => setOpen(false)} type="button" />
          <div className="fabric-lightbox-panel">
            <div className="fabric-lightbox-head">
              <div>
                <span>Ảnh mặt vải</span>
                <strong>{title}</strong>
              </div>
              <button aria-label="Đóng ảnh" onClick={() => setOpen(false)} type="button">
                <X size={20} />
              </button>
            </div>
            <div className="fabric-lightbox-stage">
              <img alt={alt} src={image} style={{ transform: `scale(${zoom})` }} />
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
