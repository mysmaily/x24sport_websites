'use client'

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export type HeroSlide = {
  alt: string
  href: string
  name: string
  src: string
}

export function HeroGallery({ slides, totalProducts }: { slides: HeroSlide[]; totalProducts: number }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const slideCount = slides.length
  const activeSlide = slides[activeIndex]
  const previous = () => setActiveIndex((current) => (current - 1 + slideCount) % slideCount)
  const next = () => setActiveIndex((current) => (current + 1) % slideCount)

  if (!activeSlide) return <div className="grid min-h-[420px] place-items-center rounded-[2rem] border border-white/10 bg-white/5 font-display text-8xl font-bold text-white/15">RUN</div>

  return (
    <section
      aria-label="Bộ sưu tập mẫu áo chạy bộ nổi bật"
      className="relative min-h-[440px] min-w-0 lg:min-h-[590px]"
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); previous() }
        if (event.key === 'ArrowRight') { event.preventDefault(); next() }
      }}
    >
      <div aria-hidden="true" className="absolute inset-[7%_0_0_10%] rotate-3 rounded-[2.5rem] bg-gradient-to-br from-brand via-orange-500 to-amber-300" />
      <div className="absolute inset-[1%_4%_6%_3%] overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-900 shadow-[0_35px_90px_rgba(0,0,0,.42)] sm:inset-[1%_5%_5%_5%]">
        <Image
          alt={activeSlide.alt}
          className="hero-slide-enter object-cover"
          fill
          key={activeSlide.src}
          priority={activeIndex === 0}
          sizes="(max-width: 1023px) 92vw, 53vw"
          src={activeSlide.src}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#070c15] via-[#070c15]/75 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#0b1220]/80 px-3 py-2 text-xs font-black tabular-nums text-white backdrop-blur sm:left-5 sm:top-5">
          {String(activeIndex + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-orange-300">Mẫu nổi bật · {totalProducts.toLocaleString('vi-VN')} thiết kế</p>
            <Link className="mt-1 inline-flex max-w-full items-center gap-2 font-display text-2xl font-bold leading-none text-white hover:text-orange-200 sm:text-3xl" href={activeSlide.href}>
              <span className="truncate">{activeSlide.name}</span><ArrowRight className="shrink-0" size={19} />
            </Link>
          </div>
          <div className="flex shrink-0 gap-2">
            <button aria-label="Xem ảnh trước" className="grid size-12 cursor-pointer place-items-center rounded-full border border-white/25 bg-[#0b1220]/85 text-white backdrop-blur transition duration-200 hover:border-white/60 hover:bg-white hover:text-slate-950" onClick={previous} type="button"><ChevronLeft size={22} /></button>
            <button aria-label="Xem ảnh tiếp theo" className="grid size-12 cursor-pointer place-items-center rounded-full bg-brand text-white shadow-lg transition duration-200 hover:bg-brand-dark" onClick={next} type="button"><ChevronRight size={22} /></button>
          </div>
        </div>
      </div>

      <div aria-label="Chọn ảnh trong bộ sưu tập" className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 gap-2" role="group">
        {slides.map((slide, index) => <button aria-label={`Xem mẫu ${index + 1}: ${slide.name}`} aria-pressed={index === activeIndex} className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${index === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/35 hover:bg-white/70'}`} key={slide.src} onClick={() => setActiveIndex(index)} type="button" />)}
      </div>
    </section>
  )
}
