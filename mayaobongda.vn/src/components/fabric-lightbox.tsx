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
        <div className="fixed inset-0 z-[100] text-white" role="dialog" aria-modal="true" aria-label={`Ảnh chất liệu ${title}`}>
          <button className="absolute inset-0 cursor-zoom-out bg-slate-950/88 backdrop-blur-md" aria-label="Đóng ảnh" onClick={() => setOpen(false)} type="button" />
          <div className="absolute inset-x-3 top-1/2 mx-auto grid max-h-[92dvh] max-w-6xl -translate-y-1/2 overflow-hidden rounded-xl border border-white/15 bg-slate-950 shadow-2xl sm:inset-x-6">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[.18em] text-orange-300">Ảnh mặt vải</p>
                <h2 className="truncate font-display text-2xl font-bold">{title}</h2>
              </div>
              <button className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/10 transition hover:bg-white/15" aria-label="Đóng ảnh" onClick={() => setOpen(false)} type="button">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-auto bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,.12),transparent_32%),#020617] p-3 sm:p-5">
              <img alt={alt} className="mx-auto max-h-[68dvh] max-w-full origin-center rounded-lg object-contain transition duration-200" src={image} style={{ transform: `scale(${zoom})` }} />
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-slate-900 px-4 py-3">
              <button className="grid size-11 place-items-center rounded-lg border border-white/15 bg-white/10 transition hover:bg-white/15" aria-label="Thu nhỏ" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} type="button"><ZoomOut size={18} /></button>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-black transition hover:bg-white/15" aria-label="Kích thước gốc" onClick={() => setZoom(1)} type="button"><RotateCcw size={18} /> {Math.round(zoom * 100)}%</button>
              <button className="grid size-11 place-items-center rounded-lg border border-white/15 bg-white/10 transition hover:bg-white/15" aria-label="Phóng to" onClick={() => setZoom((value) => Math.min(3, value + 0.25))} type="button"><ZoomIn size={18} /></button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
