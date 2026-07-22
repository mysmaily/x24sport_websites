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
    <section className="relative isolate overflow-hidden bg-[#fff4e6] text-slate-950">
      <picture className="absolute inset-0 -z-30">
        <img
          alt="Nhóm cầu thủ mặc áo bóng rổ thiết kế riêng trong sân bóng rổ sáng"
          className="h-full w-full object-cover object-center"
          decoding="async"
          fetchPriority="high"
          height="1080"
          src="/images/basketball-audience-hero-bright-20260722.webp"
          width="1920"
        />
      </picture>
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(255,248,235,.96)_0%,rgba(255,248,235,.91)_37%,rgba(255,248,235,.42)_68%,rgba(255,248,235,.08)_100%)] max-md:bg-[linear-gradient(180deg,rgba(255,248,235,.88)_0%,rgba(255,248,235,.82)_50%,rgba(255,248,235,.96)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,23,42,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.06)_1px,transparent_1px)] bg-[size:96px_96px] opacity-35" />

      <div className="section-shell flex min-h-[calc(100svh-72px)] flex-col justify-end py-8 sm:min-h-[660px] sm:py-12 lg:min-h-[min(720px,calc(100svh-72px))] lg:justify-center">
        <div className="max-w-4xl">
          <p className="inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 text-[11px] font-black uppercase tracking-[.16em] text-brand shadow-sm backdrop-blur">
            <ShieldCheck aria-hidden="true" size={17} /> May theo nhận diện riêng · Duyệt maket trước
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.55rem,5.4vw,5.55rem)] font-extrabold leading-[.94] tracking-tight text-balance">
            Áo bóng rổ thiết kế riêng cho đội của bạn.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-700 sm:text-lg">
            Chọn nhóm phù hợp để xem mẫu, checklist đặt may và cách chuẩn bị logo, tên số, size cho lớp, CLB, giải đấu hoặc đội tuyển.
          </p>
        </div>

        <div className="-mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
          {BASKETBALL_AUDIENCES.map((audience) => {
            const Icon = iconBySlug[audience.slug]
            return (
              <Link
                className="group min-h-[158px] w-[280px] shrink-0 snap-start rounded-2xl border border-orange-100 bg-white/88 p-5 text-slate-950 shadow-[0_18px_45px_rgba(88,45,12,.13)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-brand/35 hover:bg-white sm:w-auto"
                href={audience.path}
                key={audience.slug}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand text-white transition group-hover:bg-slate-950">
                  <Icon aria-hidden="true" size={21} />
                </span>
                <h2 className="mt-5 font-display text-[1.75rem] font-bold leading-none">{audience.shortTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{audience.description}</p>
                <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-black text-brand">
                  Xem gợi ý đặt may <ArrowRight aria-hidden="true" size={17} />
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white shadow-lg shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-brand-dark" href="/san-pham/">
            Xem mẫu áo bóng rổ <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-6 text-sm font-black text-slate-950 backdrop-blur transition hover:border-brand/40 hover:bg-white" href={ZALO_URL} rel="noreferrer" target="_blank">
            Nhắn tư vấn thiết kế
          </a>
        </div>

        <div className="mt-8 hidden max-w-3xl gap-3 border-t border-orange-200 pt-6 text-sm text-slate-700 sm:grid sm:grid-cols-3">
          {[
            ['Thiết kế', 'Theo màu, logo và tinh thần đội'],
            ['Cá nhân hóa', 'Tên số, logo, size từng thành viên'],
            ['Bàn giao', 'Giao toàn quốc theo thông tin đã chốt'],
          ].map(([title, text]) => (
            <div className="flex gap-3" key={title}>
              <Building2 aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={18} />
              <p><strong className="block text-slate-950">{title}</strong>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
