import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  MessageCircle,
  Palette,
  Ruler,
  ShieldCheck,
  Trophy,
  Truck,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { JsonLd } from './json-ld'
import { ProductGrid } from './product-grid'
import { getProducts } from '../lib/cms'
import { FOOTBALL_AUDIENCE_LANDINGS, type FootballAudienceLanding } from '../lib/audience-landings'
import { canonical, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'

const audienceIcons = {
  'ao-bong-da-doi-bong-cau-lac-bo': UsersRound,
  'ao-bong-da-giai-phong-trao': Trophy,
  'ao-bong-da-cong-ty-ngan-hang': Building2,
}

const benefitIcons = [Palette, ClipboardCheck, BadgeCheck]

const commitments = [
  { icon: Palette, label: 'Phối màu theo nhận diện' },
  { icon: Ruler, label: 'Tư vấn size đội hình' },
  { icon: ShieldCheck, label: 'Duyệt maket trước' },
  { icon: Truck, label: 'Giao hàng toàn quốc' },
]

const process = [
  ['Gửi yêu cầu', 'Chia sẻ mẫu tham khảo, logo, màu sắc, số lượng và mục đích sử dụng.'],
  ['Trao đổi hướng áo', 'Làm rõ kiểu áo, cách phối màu và những nội dung cần ưu tiên.'],
  ['Duyệt maket & size', 'Kiểm tra bố cục, tên số và tổng hợp bảng size trước khi chốt.'],
  ['Xác nhận sản xuất', 'Rà soát lại phương án cùng toàn bộ thông tin đã thống nhất.'],
]

export async function FootballAudienceLandingPage({ landing }: { landing: FootballAudienceLanding }) {
  const catalog = await getProducts({ limit: 4 })
  const AudienceIcon = audienceIcons[landing.slug as keyof typeof audienceIcons]
  const related = FOOTBALL_AUDIENCE_LANDINGS.filter((item) => item.slug !== landing.slug)

  return <>
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') },
        { '@type': 'ListItem', position: 2, name: landing.navLabel, item: canonical(`/${landing.slug}/`) },
      ],
    }} />

    <section className="football-audience-dark relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="section-shell py-6 sm:py-8">
        <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href="/">Trang chủ</Link>
          <ChevronRight aria-hidden="true" size={14} />
          <span aria-current="page" className="truncate text-slate-200">{landing.navLabel}</span>
        </nav>
      </div>

      <div className="football-audience-hero-shell section-shell grid gap-8 pb-12 pt-3 sm:pb-16">
        <div className="football-audience-hero-copy relative z-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-4 py-2 text-[11px] font-black uppercase tracking-[.13em] text-orange-200 backdrop-blur sm:text-xs sm:tracking-[.16em]"><AudienceIcon aria-hidden="true" size={17} />{landing.eyebrow}</p>
          <h1 className="football-audience-title mt-7 max-w-[820px] text-balance font-display font-extrabold">{landing.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{landing.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={19} /> Nhận tư vấn mẫu áo</a>
            <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-black transition duration-200 hover:border-white/55 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href="#mau-ao">Xem mẫu để bắt đầu <ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
          <ul aria-label="Phù hợp với" className="mt-8 flex flex-wrap gap-2">
            {landing.contexts.map((item) => <li className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 bg-black/15 px-3.5 text-xs font-bold text-slate-200" key={item}><Check aria-hidden="true" className="text-brand" size={15} />{item}</li>)}
          </ul>
        </div>

        <div className="football-audience-hero-media relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-[0_28px_90px_rgba(0,0,0,.42)]">
          <Image alt={landing.heroAlt} className="football-audience-hero-image object-cover object-center" fill priority sizes="(max-width: 1023px) 100vw, 54vw" src={landing.heroImage} />
          <div aria-hidden="true" className="football-audience-hero-overlay absolute inset-0" />
          <div className="football-audience-hero-note absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 p-4 backdrop-blur-md sm:bottom-6 sm:left-auto sm:right-6">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Bắt đầu từ đội hình thật</p>
            <p className="mt-2 text-sm font-bold leading-6 text-white">Thiết kế, size và nội dung in được rà soát trước khi chốt sản xuất.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white">
      <div className="football-audience-commitments section-shell grid divide-y divide-slate-200 sm:grid-cols-2">
        {commitments.map(({ icon: Icon, label }) => <div className="flex min-h-20 items-center gap-3 py-5 sm:px-5 first:pl-0 last:pr-0" key={label}><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Icon aria-hidden="true" size={20} /></span><strong className="text-sm leading-5">{label}</strong></div>)}
      </div>
    </section>

    <section className="section-shell py-16 sm:py-22">
      <div className="football-audience-split grid gap-10">
        <div>
          <p className="section-kicker">Bắt đầu từ đúng vấn đề</p>
          <h2 className="section-title">{landing.problemTitle}</h2>
          <p className="section-lead">{landing.problemText}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {landing.challenges.map((item, index) => <article className="group rounded-2xl border border-slate-200 bg-[#f8f6f2] p-6 transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg" key={item.title}><span className="font-display text-4xl font-bold text-brand">0{index + 1}</span><h3 className="mt-8 font-display text-3xl font-bold leading-none">{item.title}</h3><p className="mt-4 text-sm leading-6 text-slate-600">{item.text}</p></article>)}
        </div>
      </div>
    </section>

    <section className="football-audience-dark py-16 text-white sm:py-22">
      <div className="section-shell">
        <div className="max-w-3xl"><p className="section-kicker text-orange-300">Từ yêu cầu đến kết quả</p><h2 className="section-title text-white">Rõ nhận diện. Dễ cùng duyệt. Gọn khi tổng hợp.</h2></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {landing.benefits.map((item, index) => { const Icon = benefitIcons[index]; return <article className="rounded-2xl border border-white/10 bg-white/[.055] p-7" key={item.title}><span className="grid size-12 place-items-center rounded-xl bg-brand/15 text-brand"><Icon aria-hidden="true" size={24} /></span><h3 className="mt-9 font-display text-3xl font-bold leading-none">{item.title}</h3><p className="mt-4 text-sm leading-6 text-slate-400">{item.text}</p></article> })}
        </div>
      </div>
    </section>

    <section className="bg-brand text-white">
      <div className="football-audience-brief section-shell grid gap-12 py-16 sm:py-22">
        <div className="lg:sticky lg:top-28"><p className="text-xs font-black uppercase tracking-[.16em] text-orange-100">Chuẩn bị yêu cầu</p><h2 className="mt-3 font-display text-5xl font-bold leading-[.95] sm:text-6xl">{landing.briefTitle}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-orange-50">{landing.processNote}</p></div>
        <ol className="grid gap-3 sm:grid-cols-2">{landing.briefItems.map((item, index) => <li className="flex min-h-28 items-center gap-5 rounded-2xl border border-white/20 bg-white/[.1] p-5" key={item}><span className="font-display text-3xl font-bold text-orange-100">0{index + 1}</span><strong className="text-base leading-6">{item}</strong></li>)}</ol>
      </div>
    </section>

    <section className="section-shell py-16 sm:py-22">
      <div className="football-audience-process grid gap-12">
        <div><p className="section-kicker">Quy trình phối hợp</p><h2 className="section-title">Bốn bước để đi từ ý tưởng đến phương án đã duyệt.</h2><p className="section-lead">Mỗi bước có nội dung rõ ràng để người phụ trách biết cần chuẩn bị và kiểm tra điều gì.</p></div>
        <ol className="relative grid gap-4 before:absolute before:bottom-8 before:left-[23px] before:top-8 before:w-px before:bg-slate-200">
          {process.map(([title, text], index) => <li className="relative grid grid-cols-[48px_1fr] gap-5 rounded-2xl border border-slate-200 bg-white p-5" key={title}><span className="z-10 grid size-12 place-items-center rounded-full bg-[#07101e] font-display text-xl font-bold text-white">{index + 1}</span><div><h3 className="font-display text-2xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div></li>)}
        </ol>
      </div>
    </section>

    <section className="bg-white py-16 sm:py-22" id="mau-ao">
      <div className="section-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker">Chọn điểm xuất phát</p><h2 className="section-title">Tìm một mẫu gần với ý tưởng của bạn.</h2><p className="section-lead">Màu sắc, logo, tên số và nội dung có thể tiếp tục được điều chỉnh theo nhu cầu thực tế.</p></div><Link className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg border border-slate-300 px-5 text-sm font-black transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href="/shop/">Xem toàn bộ mẫu áo <ArrowRight aria-hidden="true" size={18} /></Link></div>
        <div className="mt-10"><ProductGrid products={catalog.docs} /></div>
      </div>
    </section>

    <section className="section-shell py-16 sm:py-22">
      <div className="football-audience-split grid gap-12">
        <div><p className="section-kicker">Câu hỏi thường gặp</p><h2 className="section-title">Những điều nên làm rõ trước khi đặt áo.</h2></div>
        <dl className="grid gap-3">{landing.faq.map((item) => <div className="rounded-2xl border border-slate-200 bg-white p-6" key={item.question}><dt className="font-display text-2xl font-bold leading-tight">{item.question}</dt><dd className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</dd></div>)}</dl>
      </div>
    </section>

    <section className="football-audience-dark text-white">
      <div className="football-audience-final section-shell grid gap-10 py-16 sm:py-22">
        <div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Bắt đầu từ nhu cầu thật</p><h2 className="mt-3 max-w-4xl font-display text-5xl font-bold leading-[.94] sm:text-7xl">{landing.ctaTitle}</h2><p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{landing.ctaText}</p></div>
        <div className="flex flex-col gap-3 lg:items-end"><a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-7 text-sm font-black transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={19} /> Trao đổi qua Zalo</a><a className="inline-flex min-h-12 items-center justify-center gap-2 px-4 text-sm font-black text-slate-300 transition hover:text-white" href={`tel:${PHONE_VALUE}`}>Gọi {PHONE_DISPLAY} <ArrowRight aria-hidden="true" size={17} /></a></div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-[#f8f6f2] py-12">
      <div className="section-shell"><p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Khám phá theo nhu cầu khác</p><div className="mt-5 grid gap-3 md:grid-cols-2">{related.map((item) => <Link className="group flex min-h-24 items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-brand hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href={`/${item.slug}/`} key={item.slug}><span><strong className="font-display text-2xl">{item.navLabel}</strong><span className="mt-1 block text-xs text-slate-500">Xem giải pháp phù hợp</span></span><ArrowRight aria-hidden="true" className="text-brand transition group-hover:translate-x-1" /></Link>)}</div></div>
    </section>
  </>
}
