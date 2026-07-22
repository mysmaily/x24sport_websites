import { ArrowLeftRight, ArrowRight, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { FabricLightbox } from '@/components/fabric-lightbox'
import { PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'

export const fabrics = [
  {
    name: 'Thun lạnh',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-thun-lanh-ao-bong-ro-20260711-112610.jpg',
    alt: 'Vải thun lạnh may áo bóng rổ',
    description: 'Bề mặt mịn, mát tay, ít nhăn và dễ mặc trong điều kiện vận động thường xuyên.',
    tags: ['Giá tốt', 'Mát tay', 'Dễ mặc'],
  },
  {
    name: 'Mè Thái',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-me-thai-ao-bong-ro-20260711-112613.jpg',
    alt: 'Vải mè Thái may áo bóng rổ',
    description: 'Chất vải nhẹ, thoáng khí, bề mặt lỗ mè nhỏ giúp thoát mồ hôi tốt khi thi đấu.',
    tags: ['Đề xuất', 'Thoáng khí', 'Nhanh khô'],
  },
  {
    name: 'Mè Texa',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-me-texa-ao-bong-ro-20260711-112616.jpg',
    alt: 'Vải mè Texa may áo bóng rổ',
    description: 'Bề mặt dệt nổi dạng ô nhỏ, tạo cảm giác chắc vải, đứng form và bền khi sử dụng lâu dài.',
    tags: ['Đứng form', 'Bền bỉ', 'Dệt nổi'],
  },
  {
    name: 'Mè Lava',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-me-lava-ao-bong-ro-20260711-112620.jpg',
    alt: 'Vải mè Lava may áo bóng rổ',
    description: 'Kiểu dệt lưới thoáng, phù hợp áo bóng rổ cần độ thoải mái và khả năng thoát nhiệt tốt.',
    tags: ['Lưới thoáng', 'Thoát nhiệt', 'Thể thao'],
  },
]

export function ServicePageHero({
  kicker,
  title,
  description,
  actions,
  aside,
  compact = false,
}: {
  kicker: string
  title: string
  description: string
  actions: ReactNode
  aside: ReactNode
  compact?: boolean
}) {
  return (
    <section className="border-b border-white/10 bg-slate-950 text-white">
      <div className={`section-shell ${compact ? 'py-4 sm:py-5' : 'py-6 sm:py-8'}`}>
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400" aria-label="Đường dẫn">
          <Link className="min-h-11 content-center transition hover:text-white" href="/">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-slate-200">{kicker}</span>
        </nav>
      </div>
      <div className={`section-shell grid ${compact ? 'gap-5 pb-7 pt-1 sm:pb-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)] lg:items-end lg:gap-8 lg:pb-10' : 'gap-10 pb-14 pt-4 sm:pb-18 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)] lg:items-end lg:gap-16 lg:pb-22'}`}>
        <div>
          <p className="section-kicker text-orange-300">{kicker}</p>
          <h1 className={`max-w-4xl font-display font-bold text-balance ${compact ? 'text-4xl leading-none sm:text-5xl lg:text-6xl' : 'text-[clamp(3.4rem,7vw,7.4rem)] leading-[.88] tracking-[-.03em]'}`}>{title}</h1>
          <p className={`${compact ? 'mt-3 max-w-2xl text-sm leading-7 sm:text-base' : 'mt-6 max-w-3xl text-base leading-8 sm:text-lg'} text-slate-300`}>{description}</p>
          <div className={`${compact ? 'mt-5' : 'mt-8'} flex flex-col gap-3 sm:flex-row`}>{actions}</div>
        </div>
        {aside}
      </div>
    </section>
  )
}

export function PrimaryZaloButton({ children = 'Nhận tư vấn qua Zalo' }: { children?: ReactNode }) {
  return (
    <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
      <MessageCircle aria-hidden="true" size={19} /> {children}
    </a>
  )
}

export function SecondaryLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10" href={href}>{children} <ArrowRight aria-hidden="true" size={18} /></Link>
}

export function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return (
    <header className="max-w-4xl">
      <p className="section-kicker">{kicker}</p>
      <h2 className="section-title">{title}</h2>
      <p className="section-lead">{description}</p>
    </header>
  )
}

export function FabricGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mt-9 grid gap-5 md:grid-cols-2">
      {fabrics.map((fabric, index) => (
        <article className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white sm:grid-cols-[minmax(180px,.9fr)_1.1fr]" key={fabric.name}>
          <FabricLightbox
            alt={fabric.alt}
            className={`group relative block cursor-zoom-in overflow-hidden bg-slate-100 text-left ${compact ? 'min-h-56' : 'min-h-72'}`}
            image={fabric.image}
            title={fabric.name}
          >
            <Image alt={fabric.alt} className="object-cover transition duration-300 group-hover:scale-[1.025]" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 42vw, 280px" src={fabric.image} />
            {index === 1 ? <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white">Lựa chọn cân bằng</span> : null}
          </FabricLightbox>
          <div className="flex flex-col p-6 sm:p-7">
            <span className="text-xs font-black uppercase tracking-[.16em] text-brand">Chất liệu 0{index + 1}</span>
            <h3 className="mt-2 font-display text-4xl font-bold leading-none text-slate-950">{fabric.name}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{fabric.description}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              {fabric.tags.map((tag) => <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700" key={tag}>{tag}</span>)}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function TableScroll({ label, children, minWidth = 'min-w-[820px]' }: { label: string; children: ReactNode; minWidth?: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500 sm:hidden"><ArrowLeftRight aria-hidden="true" size={16} /> Vuốt ngang để xem đầy đủ bảng</p>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm" role="region" aria-label={label} tabIndex={0}>
        <div className={minWidth}>{children}</div>
      </div>
    </div>
  )
}

export function ContactPanel({ title, description, secondaryHref, secondaryLabel }: { title: string; description: string; secondaryHref: string; secondaryLabel: string }) {
  return (
    <section className="section-shell py-16 sm:py-22">
      <div className="grid overflow-hidden rounded-3xl bg-brand text-white lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="p-7 sm:p-10 lg:p-12">
          <p className="text-sm font-bold text-orange-100">Cần tư vấn theo đội?</p>
          <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-[.95] tracking-tight text-balance sm:text-6xl">{title}</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-orange-50 sm:text-base">{description}</p>
        </div>
        <div className="grid gap-3 border-t border-white/20 bg-black/10 p-7 sm:grid-cols-2 lg:min-w-[330px] lg:grid-cols-1 lg:border-l lg:border-t-0 lg:p-10">
          <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-brand transition hover:bg-orange-50" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={18} /> Nhắn Zalo</a>
          <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/30 px-5 text-sm font-black text-white transition hover:bg-white/10" href={secondaryHref}>{secondaryLabel} <ArrowRight aria-hidden="true" size={18} /></Link>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-white/90 hover:text-white" href={`tel:${PHONE_VALUE}`}><Phone aria-hidden="true" size={17} /> {PHONE_DISPLAY}</a>
        </div>
      </div>
    </section>
  )
}
