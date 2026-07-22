import { ArrowRight, Building2, CalendarDays, GraduationCap, ShieldCheck, Trophy, UsersRound } from 'lucide-react'
import Link from 'next/link'

import { BASKETBALL_AUDIENCES } from '@/lib/basketball-audiences'
import { ZALO_URL } from '@/lib/site'

const iconBySlug = {
  'lop-truong-hoc': GraduationCap,
  'clb-doi-bong-phong-trao': UsersRound,
  'giai-dau-su-kien': CalendarDays,
  'doi-tuyen-chuyen-nghiep': Trophy,
} as const

export function LegacyHomeBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-[#050b14] text-white">
      <picture className="absolute inset-0 -z-30">
        <img
          alt="Nhóm cầu thủ mặc áo bóng rổ thiết kế riêng trong nhà thi đấu"
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
          height="1080"
          src="/images/basketball-audience-hero-20260722.webp"
          width="1920"
        />
      </picture>
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(4,9,18,.96)_0%,rgba(4,9,18,.9)_38%,rgba(4,9,18,.42)_70%,rgba(4,9,18,.2)_100%)] max-md:bg-[linear-gradient(180deg,rgba(4,9,18,.54)_0%,rgba(4,9,18,.94)_58%,rgba(4,9,18,.98)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] bg-[size:96px_96px] opacity-35" />

      <div className="section-shell flex min-h-[calc(100svh-72px)] flex-col justify-end py-8 sm:min-h-[680px] sm:py-14 lg:min-h-[min(760px,calc(100svh-72px))] lg:justify-center">
        <div className="max-w-5xl">
          <p className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-[11px] font-black uppercase tracking-[.18em] text-orange-200 backdrop-blur">
            <ShieldCheck aria-hidden="true" size={17} /> May theo nhận diện riêng · Duyệt maket trước
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.25rem,8vw,7.7rem)] font-extrabold leading-[.86] tracking-tight text-balance">
            Áo bóng rổ thiết kế riêng cho từng đội.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Chọn đúng nhóm khách hàng để xem gợi ý mẫu, thông tin cần chuẩn bị và cách đặt may phù hợp với lớp, CLB, giải đấu hoặc đội tuyển.
          </p>
        </div>

        <div className="-mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
          {BASKETBALL_AUDIENCES.map((audience) => {
            const Icon = iconBySlug[audience.slug]
            return (
              <Link
                className="group min-h-[168px] w-[280px] shrink-0 snap-start rounded-2xl border border-white/15 bg-white/[.075] p-5 text-white shadow-2xl shadow-black/15 backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-orange-300/60 hover:bg-white/[.12] sm:w-auto"
                href={audience.path}
                key={audience.slug}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-brand text-white transition group-hover:bg-white group-hover:text-brand">
                  <Icon aria-hidden="true" size={21} />
                </span>
                <h2 className="mt-5 font-display text-3xl font-bold leading-none">{audience.shortTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{audience.description}</p>
                <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-black text-orange-200">
                  Xem landing page <ArrowRight aria-hidden="true" size={17} />
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href="/san-pham/">
            Khám phá mẫu áo <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 text-sm font-black text-white backdrop-blur transition hover:border-white/45 hover:bg-white/15" href={ZALO_URL} rel="noreferrer" target="_blank">
            Nhận tư vấn thiết kế
          </a>
        </div>

        <div className="mt-8 hidden max-w-3xl gap-3 border-t border-white/10 pt-6 text-sm text-slate-300 sm:grid sm:grid-cols-3">
          {[
            ['Thiết kế', 'Theo màu, logo và tinh thần đội'],
            ['Cá nhân hóa', 'Tên số, logo, size từng thành viên'],
            ['Bàn giao', 'Giao toàn quốc theo thông tin đã chốt'],
          ].map(([title, text]) => (
            <div className="flex gap-3" key={title}>
              <Building2 aria-hidden="true" className="mt-0.5 shrink-0 text-orange-300" size={18} />
              <p><strong className="block text-white">{title}</strong>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
