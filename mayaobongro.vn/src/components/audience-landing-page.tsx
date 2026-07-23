import { ArrowRight, BadgeCheck, ClipboardList, MessageCircle, Palette, Ruler, Shirt, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactPanel } from '@/components/service-page'
import type { BasketballAudience } from '@/lib/basketball-audiences'
import { DEFAULT_OG_IMAGE, ZALO_URL, canonical } from '@/lib/site'

const benefitIcons = [Palette, Shirt, Ruler] as const

export function audienceMetadata(audience: BasketballAudience): Metadata {
  return {
    title: audience.metaTitle,
    description: audience.metaDescription,
    alternates: { canonical: audience.path },
    openGraph: {
      title: audience.metaTitle,
      description: audience.metaDescription,
      url: canonical(audience.path),
      images: [{ ...DEFAULT_OG_IMAGE, alt: audience.title }],
    },
    twitter: { card: 'summary_large_image', title: audience.metaTitle, description: audience.metaDescription, images: [DEFAULT_OG_IMAGE.url] },
  }
}

export function AudienceLandingPage({ audience }: { audience: BasketballAudience }) {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#fff4e6] text-slate-950">
        <picture className="absolute inset-0 -z-30">
          <img
            alt="Nhóm cầu thủ mặc đồng phục bóng rổ thiết kế riêng trong sân bóng rổ sáng"
            className="h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
            height="1080"
            src="/images/basketball-audience-hero-bright-20260722.webp"
            width="1920"
          />
        </picture>
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(255,248,235,.97)_0%,rgba(255,248,235,.92)_43%,rgba(255,248,235,.45)_75%,rgba(255,248,235,.12)_100%)] max-md:bg-[linear-gradient(180deg,rgba(255,248,235,.88)_0%,rgba(255,248,235,.84)_52%,rgba(255,248,235,.98)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,23,42,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.06)_1px,transparent_1px)] bg-[size:88px_88px] opacity-35" />

        <div className="section-shell py-5">
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-700" aria-label="Đường dẫn">
            <Link className="min-h-11 content-center transition hover:text-brand" href="/">Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <span className="truncate text-slate-950">{audience.eyebrow}</span>
          </nav>
        </div>

        <div className="section-shell grid min-h-[600px] gap-8 pb-12 pt-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:pb-16">
          <div>
            <p className="inline-flex min-h-10 items-center rounded-full border border-orange-200 bg-white/80 px-4 text-[11px] font-black uppercase tracking-[.16em] text-brand shadow-sm backdrop-blur">
              {audience.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.45rem,5.2vw,5.25rem)] font-extrabold leading-[.95] tracking-tight text-balance">
              {audience.heroTitle}
            </h1>
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-700 sm:text-lg">{audience.heroDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
                <MessageCircle aria-hidden="true" size={18} /> {audience.primaryCta}
              </a>
              <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/85 px-6 text-sm font-black text-slate-950 backdrop-blur transition hover:border-brand/40 hover:bg-white" href={audience.slug === 'giai-dau-su-kien' ? '/bang-gia-may-ao-bong-ro/' : '/san-pham/'}>
                {audience.secondaryCta} <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-orange-100 bg-white/88 p-5 shadow-[0_18px_45px_rgba(88,45,12,.13)] backdrop-blur" aria-label="Tóm tắt nhóm khách hàng">
            <p className="text-xs font-black uppercase tracking-[.18em] text-brand">Phù hợp với</p>
            <ul className="mt-4 grid gap-3">
              {audience.useCases.map((item) => (
                <li className="flex gap-3 rounded-2xl border border-orange-100 bg-orange-50/75 p-4 text-sm font-bold leading-6 text-slate-800" key={item}>
                  <BadgeCheck aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-7 sm:py-10">
        <div className="section-shell grid gap-3 md:grid-cols-3">
          {audience.proof.map((item) => (
            <div className="flex min-h-18 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4" key={item}>
              <Sparkles aria-hidden="true" className="shrink-0 text-brand" size={20} />
              <p className="text-sm font-black leading-6 text-slate-950">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-14 sm:py-18">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="section-kicker">Vấn đề cần xử lý</p>
            <h2 className="section-title">Không chỉ là chọn một mẫu áo đẹp.</h2>
            <p className="mt-5 text-base leading-8 text-slate-600">{audience.pain}</p>
            <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Kết quả cần đạt</p>
              <p className="mt-3 font-display text-3xl font-bold leading-tight">{audience.outcome}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {audience.benefits.map((benefit, index) => {
              const Icon = benefitIcons[index] || ClipboardList
              return (
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={benefit.title}>
                  <Icon aria-hidden="true" className="text-brand" size={24} />
                  <h3 className="mt-8 font-display text-4xl font-bold leading-none text-slate-950">{benefit.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{benefit.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 sm:py-18">
        <div className="section-shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.55fr)] lg:items-start">
          <div>
            <p className="section-kicker">Thông tin nên chuẩn bị</p>
            <h2 className="section-title">Gửi brief càng rõ, maket càng dễ duyệt.</h2>
            <p className="section-lead">Bạn có thể nhắn trước các ý chính dưới đây. Nếu chưa đủ, đội tư vấn sẽ cùng bạn bổ sung trong quá trình trao đổi.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {audience.checklist.map((item) => (
                <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4" key={item}>
                  <BadgeCheck aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={18} />
                  <p className="text-sm font-bold leading-6 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl bg-orange-50 p-6 lg:sticky lg:top-28">
            <p className="text-xs font-black uppercase tracking-[.18em] text-brand">CTA nhanh</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-none text-slate-950">Gửi mẫu bạn thích qua Zalo.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">Chỉ cần ảnh mẫu, màu chủ đạo và số lượng dự kiến là đã có thể bắt đầu trao đổi hướng thiết kế.</p>
            <a className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" size={18} /> {audience.primaryCta}
            </a>
          </aside>
        </div>
      </section>

      <section className="bg-slate-950 py-14 text-white sm:py-18">
        <div className="section-shell">
          <header className="max-w-4xl">
            <p className="section-kicker text-orange-300">Cách triển khai</p>
            <h2 className="font-display text-5xl font-bold leading-[.95] text-balance sm:text-7xl">Từ brief đến bàn giao trong bốn bước.</h2>
          </header>
          <ol className="mt-9 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {audience.steps.map((step, index) => (
              <li className="bg-slate-950 p-6 sm:p-7" key={step.title}>
                <span className="font-display text-5xl font-bold text-brand">0{index + 1}</span>
                <h3 className="mt-8 font-display text-3xl font-bold leading-none">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-shell py-14 sm:py-18">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]">
          <div>
            <p className="section-kicker">Câu hỏi thường gặp</p>
            <h2 className="section-title">Những điểm nên hỏi trước khi chốt.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {audience.faq.map((item, index) => (
              <article className="rounded-3xl border border-slate-200 bg-white p-6" key={item.question}>
                <span className="text-xs font-black text-brand">0{index + 1}</span>
                <h3 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-950">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactPanel
        title={`Cần phương án áo cho ${audience.shortTitle.toLowerCase()}?`}
        description="Gửi số lượng, mẫu thích, logo, danh sách tên số và ngày cần nhận để được tư vấn hướng thiết kế phù hợp."
        secondaryHref="/chat-lieu-va-bang-size-ao-bong-ro/"
        secondaryLabel="Xem vải & size"
      />
    </>
  )
}
