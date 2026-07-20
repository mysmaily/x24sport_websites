'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'

import type { MediaImage } from '@/lib/cms'

export function ProductGallery({ images, productName }: { images: MediaImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const imageCount = images.length

  const showPrevious = () => setActiveIndex((current) => (current - 1 + imageCount) % imageCount)
  const showNext = () => setActiveIndex((current) => (current + 1) % imageCount)

  if (!imageCount) {
    return <div className="grid min-h-[480px] place-items-center bg-slate-100 font-display text-8xl font-bold text-slate-300 sm:min-h-[620px] lg:min-h-[720px]">24</div>
  }

  const activeImage = images[activeIndex]

  return (
    <section
      aria-label={`Ảnh sản phẩm ${productName}`}
      className="overflow-hidden bg-white"
      onKeyDown={(event) => {
        if (imageCount < 2) return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          showPrevious()
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          showNext()
        }
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current
        const endX = event.changedTouches[0]?.clientX
        touchStartX.current = null
        if (startX === null || endX === undefined || Math.abs(startX - endX) < 48 || imageCount < 2) return
        if (startX > endX) showNext()
        else showPrevious()
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          alt={activeImage.alt || `${productName} - ảnh ${activeIndex + 1}`}
          className="object-contain"
          fill
          key={activeImage.url}
          preload={activeIndex === 0}
          sizes="(max-width: 1023px) 100vw, 58vw"
          src={activeImage.url}
        />

        <span className="absolute bottom-4 left-4 rounded-full bg-slate-950/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur">X24 / Running</span>
        {imageCount > 1 ? (
          <>
            <span className="absolute right-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-black text-slate-950 shadow-sm backdrop-blur">{activeIndex + 1} / {imageCount}</span>
            <button aria-label="Xem ảnh trước" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-slate-950 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:left-5 sm:size-12" onClick={showPrevious} type="button"><ChevronLeft aria-hidden="true" size={23} /></button>
            <button aria-label="Xem ảnh tiếp theo" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-slate-950 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:right-5 sm:size-12" onClick={showNext} type="button"><ChevronRight aria-hidden="true" size={23} /></button>
          </>
        ) : null}
        <span aria-live="polite" className="sr-only">Đang xem ảnh {activeIndex + 1} trên {imageCount}</span>
      </div>

      {imageCount > 1 ? (
        <div aria-label="Chọn ảnh sản phẩm" className="flex gap-3 overflow-x-auto border-t border-slate-200 bg-white p-3 sm:p-4" role="group">
          {images.map((image, index) => {
            const selected = index === activeIndex
            return (
              <button
                aria-label={`Xem ảnh ${index + 1} của ${productName}`}
                aria-pressed={selected}
                className={`relative size-18 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition sm:size-20 ${selected ? 'border-brand ring-2 ring-brand/15' : 'border-transparent opacity-70 hover:opacity-100'}`}
                key={`${image.url}-${index}`}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <Image alt="" className="object-cover" fill sizes="80px" src={image.url} />
                <span className={`absolute bottom-1 right-1 grid size-5 place-items-center rounded-full text-[10px] font-black ${selected ? 'bg-brand text-white' : 'bg-white/90 text-slate-700'}`}>{index + 1}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
