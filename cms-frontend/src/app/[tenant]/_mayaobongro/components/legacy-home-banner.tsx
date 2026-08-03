import { ArrowRight, Building2, CalendarDays, GraduationCap, ShieldCheck, Trophy, UsersRound } from 'lucide-react'
import Link from 'next/link'

import { BASKETBALL_AUDIENCES } from '../lib/basketball-audiences'
import { ZALO_URL } from '../lib/site'
import { PromoHeroSlider } from './promo-hero-slider'

const iconBySlug: Record<string, typeof GraduationCap> = {
  'lop-truong-hoc': GraduationCap,
  'clb-doi-bong-phong-trao': UsersRound,
  'giai-dau-su-kien': CalendarDays,
  'doi-tuyen-chuyen-nghiep': Trophy,
}

const bannerAudienceSlugs = new Set([
  'lop-truong-hoc',
  'clb-doi-bong-phong-trao',
  'giai-dau-su-kien',
  'doi-tuyen-chuyen-nghiep',
])

export function LegacyHomeBanner() {
  return (
    <section className="relative overflow-hidden bg-[#0b1220] text-white">
      <PromoHeroSlider />

      <div className="section-shell relative z-10 flex min-h-[calc(100svh-72px)] flex-col justify-end py-8 sm:min-h-[660px] sm:py-12 lg:min-h-[min(720px,calc(100svh-72px))] lg:justify-center">
        <div className="max-w-4xl">
          <p className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-[11px] font-black uppercase tracking-[.16em] text-orange-200 backdrop-blur">
            <ShieldCheck aria-hidden="true" size={17} /> May theo nhận diện riêng · Duyệt maket trước
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.55rem,5.4vw,5.55rem)] font-extrabold leading-[.94] tracking-tight text-white text-balance">
            Áo bóng rổ thiết kế riêng cho đội của bạn.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
            Chọn nhóm phù hợp để xem mẫu, checklist đặt may và cách chuẩn bị logo, tên số, size cho lớp, CLB, giải đấu hoặc đội tuyển.
          </p>
        </div>

        <div className="-mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
          {BASKETBALL_AUDIENCES.filter((audience) => bannerAudienceSlugs.has(audience.slug)).map((audience) => {
            const Icon = iconBySlug[audience.slug]
            return (
              <Link
                className="group min-h-[158px] w-[280px] shrink-0 snap-start rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,.2)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-brand/55 hover:bg-slate-950/75 sm:w-auto"
                href={audience.path}
                key={audience.slug}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand text-white transition group-hover:bg-slate-950">
                  <Icon aria-hidden="true" size={21} />
                </span>
                <h2 className="mt-5 font-display text-[1.75rem] font-bold leading-none">{audience.shortTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{audience.description}</p>
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
          <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-6 text-sm font-black text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10" href={ZALO_URL} rel="noreferrer" target="_blank">
            Nhắn tư vấn thiết kế
          </a>
        </div>

        <div className="mt-8 hidden max-w-3xl gap-3 border-t border-white/15 pt-6 text-sm text-slate-300 sm:grid sm:grid-cols-3">
          {[
            ['Thiết kế', 'Theo màu, logo và tinh thần đội'],
            ['Cá nhân hóa', 'Tên số, logo, size từng thành viên'],
            ['Bàn giao', 'Giao toàn quốc theo thông tin đã chốt'],
          ].map(([title, text]) => (
            <div className="flex gap-3" key={title}>
              <Building2 aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={18} />
              <p><strong className="block text-white">{title}</strong>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
