'use client'

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CDN = 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07'

const slides = [
  {
    id: 1,
    kicker: 'Đồng phục bóng rổ học sinh',
    title: 'May áo bóng rổ cho lớp & CLB trường',
    description: 'Form dễ mặc cho tiểu học, THCS, THPT; hỗ trợ chọn size theo chiều cao và độ tuổi.',
    tags: ['Tư vấn size', 'Duyệt mẫu trước', 'Giao toàn quốc'],
    href: '/san-pham/',
    cta: 'Xem mẫu học sinh',
    alt: 'Đồng phục bóng rổ học sinh MayAoBongRo.vn',
  },
  {
    id: 2,
    kicker: 'Thiết kế theo màu lớp',
    title: 'Áo bóng rổ đội lớp đẹp, bền, dễ vận động',
    description: 'Lên phối màu, tên số, logo lớp và maket để đội duyệt trước khi đặt may.',
    tags: ['Đổi màu theo đội', 'In tên số', 'May đồng bộ áo quần'],
    href: '/dat-may-ao-bong-ro/',
    cta: 'Bắt đầu đặt may',
    alt: 'Đội học sinh mặc đồng phục bóng rổ thiết kế riêng',
  },
  {
    id: 3,
    kicker: 'Số lượng càng lớn, phương án càng tối ưu',
    title: 'Đồng phục bóng rổ cho trường & giải đấu',
    description: 'Phù hợp đội lớp, câu lạc bộ trường, giải phong trào và đội tuyển học sinh.',
    tags: ['Theo số lượng', 'Chốt tiến độ', 'Tư vấn form'],
    href: '/bang-gia-may-ao-bong-ro/',
    cta: 'Xem bảng giá',
    alt: 'Đồng phục bóng rổ cho trường học và giải đấu',
  },
]

export function LegacyHomeBanner() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = slides[active]

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 6500)
    return () => window.clearInterval(timer)
  }, [paused])

  const move = (direction: number) => setActive((value) => (value + direction + slides.length) % slides.length)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Bộ sưu tập đồng phục bóng rổ"
      className="group relative isolate min-h-[560px] overflow-hidden bg-slate-950 text-white lg:min-h-[min(720px,calc(100dvh-72px))]"
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <picture className="absolute inset-0 -z-20">
        <source media="(max-width: 640px)" srcSet={`${CDN}/mayaobongro-student-hero-${slide.id}-mobile-20260712.webp`} />
        <source media="(max-width: 1100px)" srcSet={`${CDN}/mayaobongro-student-hero-${slide.id}-tablet-20260712.webp`} />
        <img
          alt={slide.alt}
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority={active === 0 ? 'high' : 'auto'}
          height="560"
          key={slide.id}
          src={`${CDN}/mayaobongro-student-hero-${slide.id}-desktop-20260712.webp`}
          width="1920"
        />
      </picture>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,8,13,.94)_0%,rgba(5,8,13,.82)_34%,rgba(5,8,13,.18)_70%,rgba(5,8,13,.38)_100%)] max-md:bg-[linear-gradient(180deg,rgba(5,8,13,.28)_0%,rgba(5,8,13,.92)_64%,rgba(5,8,13,.98)_100%)]" />

      <div className="section-shell flex min-h-[560px] items-end pb-22 pt-20 lg:min-h-[min(720px,calc(100dvh-72px))] lg:items-center lg:pb-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold text-orange-200">{slide.kicker}</p>
          <h1 className="max-w-[800px] font-display text-[clamp(3.2rem,7vw,6.7rem)] font-bold leading-[0.9] tracking-[-0.035em] text-balance">{slide.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{slide.description}</p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Thông tin nổi bật">
            {slide.tags.map((tag) => <li className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold backdrop-blur" key={tag}>{tag}</li>)}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={slide.href}>{slide.cta} <ArrowRight size={18} /></Link>
            <Link className="inline-flex min-h-12 items-center rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20" href="/san-pham/">Xem toàn bộ mẫu</Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-3">
        <button aria-label="Banner trước" className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition hover:bg-black/50" onClick={() => move(-1)} type="button"><ChevronLeft aria-hidden="true" size={20} /></button>
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-2 backdrop-blur">
          {slides.map((item, index) => <button aria-label={`Xem banner ${index + 1}: ${item.title}`} aria-current={index === active ? 'true' : undefined} className={`h-2.5 cursor-pointer rounded-full transition-all ${index === active ? 'w-7 bg-brand' : 'w-2.5 bg-white/70 hover:bg-white'}`} key={item.id} onClick={() => setActive(index)} type="button" />)}
        </div>
        <button aria-label="Banner tiếp theo" className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition hover:bg-black/50" onClick={() => move(1)} type="button"><ChevronRight aria-hidden="true" size={20} /></button>
      </div>
    </section>
  )
}
