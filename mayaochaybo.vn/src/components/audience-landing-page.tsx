import { ArrowRight, BadgeCheck, Building2, CalendarDays, Check, ChevronRight, ClipboardCheck, MessageCircle, Palette, Ruler, Sparkles, UsersRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { ProductGrid } from '@/components/product-grid'
import { getProducts, productImages } from '@/lib/cms'
import { AUDIENCE_LANDINGS, type AudienceLanding } from '@/lib/audience-landings'
import { canonical, ZALO_URL } from '@/lib/site'

const audienceIcons = {
  'ao-chay-bo-doanh-nghiep': Building2,
  'ao-giai-chay-su-kien': CalendarDays,
  'ao-chay-bo-doi-nhom-cau-lac-bo': UsersRound,
}

const benefitIcons = [Palette, ClipboardCheck, BadgeCheck]

const corporateHeroImages = [
  {
    alt: 'Tập thể nhân viên doanh nghiệp mặc đồng phục VINASEED Green Run cùng tham gia chạy bộ',
    src: '/images/audience-landings/doanh-nghiep-vinaseed-green-run.webp',
  },
  {
    alt: 'Tập thể nhân viên doanh nghiệp mặc áo chạy bộ sát nách trắng xanh trong hoạt động gắn kết',
    src: '/images/audience-landings/doanh-nghiep-finisher-team.webp',
  },
]

const eventHeroImages = [
  {
    alt: 'Vận động viên xuất phát dưới cổng vòm X24 Run với áo sự kiện và số báo danh',
    src: '/images/audience-landings/giai-chay-x24-run-start.webp',
  },
  {
    alt: 'Vận động viên mặc áo đồng bộ và đeo số báo danh tại cổng về đích X24 Run',
    src: '/images/audience-landings/giai-chay-x24-run-finish.webp',
  },
]

const clubHeroImages = [
  {
    alt: 'Các thành viên Bình Minh Runner mặc đồng phục câu lạc bộ sau buổi chạy',
    src: '/images/audience-landings/doi-nhom-binh-minh-runner-feedback.webp',
  },
  {
    alt: 'Nhóm chạy bộ mặc đồng phục đỏ trắng Việt Nam cùng tham gia chạy',
    src: '/images/audience-landings/doi-nhom-viet-nam-running-club.webp',
  },
]

export async function AudienceLandingPage({ landing }: { landing: AudienceLanding }) {
  const catalog = await getProducts({ limit: 4 })
  const heroProducts = catalog.docs.slice(0, 2).map((product) => ({ product, image: productImages(product)[0] })).filter((item) => item.image?.url)
  const isCorporateLanding = landing.slug === 'ao-chay-bo-doanh-nghiep'
  const isEventLanding = landing.slug === 'ao-giai-chay-su-kien'
  const isClubLanding = landing.slug === 'ao-chay-bo-doi-nhom-cau-lac-bo'
  const AudienceIcon = audienceIcons[landing.slug as keyof typeof audienceIcons]
  const related = AUDIENCE_LANDINGS.filter((item) => item.slug !== landing.slug)

  return <>
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') },
        { '@type': 'ListItem', position: 2, name: landing.navLabel, item: canonical(`/${landing.slug}/`) },
      ],
    }} />

    <section className="relative overflow-hidden bg-[#0b1220] text-white">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="section-shell relative py-7 sm:py-9">
        <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link className="transition hover:text-white" href="/">Trang chủ</Link><ChevronRight aria-hidden="true" size={14} /><span aria-current="page" className="text-slate-200">{landing.navLabel}</span>
        </nav>
      </div>
      <div className="section-shell relative grid gap-12 pb-16 pt-5 sm:pb-22 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-4 py-2 text-xs font-black uppercase tracking-[.14em] text-orange-200"><AudienceIcon aria-hidden="true" size={17} />{landing.eyebrow}</p>
          <h1 className="mt-7 max-w-[820px] font-display text-[3.35rem] font-extrabold leading-[.92] tracking-[-.025em] text-balance sm:text-[4.75rem] lg:text-[5.35rem]">{landing.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{landing.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black transition duration-200 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={19} /> Trao đổi nhu cầu</a>
            <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-black transition duration-200 hover:border-white/50 hover:bg-white/10" href="#mau-ao">Xem mẫu áo <ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
          <div className="mt-8 border-l-2 border-brand pl-4 text-sm leading-6 text-slate-400">{landing.heroNote}</div>
        </div>

        <div className="relative min-h-[440px] sm:min-h-[520px]" aria-label="Mẫu áo chạy bộ tham khảo">
          <div className="absolute inset-x-8 top-0 rounded-2xl border border-white/10 bg-white/[.06] p-5 backdrop-blur sm:left-16 sm:right-0">
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-orange-200">{landing.contextLabel}</p>
            <ul className="mt-4 grid gap-2 text-sm font-bold text-slate-200">{landing.contexts.map((item) => <li className="flex items-center gap-2" key={item}><Check aria-hidden="true" className="text-brand" size={17} />{item}</li>)}</ul>
          </div>
          {isCorporateLanding ? <>
            <div className="absolute bottom-0 left-0 w-[72%] overflow-hidden rounded-2xl border border-white/10 bg-slate-100 shadow-[0_26px_80px_rgba(0,0,0,.35)]">
              <div className="relative aspect-[4/3]"><Image alt={corporateHeroImages[0].alt} className="object-cover" fill priority sizes="(max-width: 1024px) 72vw, 34vw" src={corporateHeroImages[0].src} /></div>
            </div>
            <div className="absolute bottom-8 right-0 w-[58%] overflow-hidden rounded-2xl border-4 border-[#0b1220] bg-slate-100 shadow-[0_20px_60px_rgba(0,0,0,.4)]">
              <div className="relative aspect-[4/3]"><Image alt={corporateHeroImages[1].alt} className="object-cover" fill sizes="(max-width: 1024px) 58vw, 27vw" src={corporateHeroImages[1].src} /></div>
            </div>
          </> : isEventLanding ? <>
            <div className="absolute bottom-0 left-0 w-[72%] overflow-hidden rounded-2xl border border-white/10 bg-slate-100 shadow-[0_26px_80px_rgba(0,0,0,.35)]">
              <div className="relative aspect-[4/3]"><Image alt={eventHeroImages[0].alt} className="object-cover" fill priority sizes="(max-width: 1024px) 72vw, 34vw" src={eventHeroImages[0].src} /></div>
            </div>
            <div className="absolute bottom-8 right-0 w-[58%] overflow-hidden rounded-2xl border-4 border-[#0b1220] bg-slate-100 shadow-[0_20px_60px_rgba(0,0,0,.4)]">
              <div className="relative aspect-[4/3]"><Image alt={eventHeroImages[1].alt} className="object-cover" fill sizes="(max-width: 1024px) 58vw, 27vw" src={eventHeroImages[1].src} /></div>
            </div>
          </> : isClubLanding ? <>
            <div className="absolute bottom-0 left-0 w-[72%] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_26px_80px_rgba(0,0,0,.35)]">
              <div className="relative aspect-[4/3]"><Image alt={clubHeroImages[0].alt} className="object-contain" fill priority sizes="(max-width: 1024px) 72vw, 34vw" src={clubHeroImages[0].src} /></div>
            </div>
            <div className="absolute bottom-8 right-0 w-[58%] overflow-hidden rounded-2xl border-4 border-[#0b1220] bg-slate-100 shadow-[0_20px_60px_rgba(0,0,0,.4)]">
              <div className="relative aspect-[4/3]"><Image alt={clubHeroImages[1].alt} className="object-cover" fill sizes="(max-width: 1024px) 58vw, 27vw" src={clubHeroImages[1].src} /></div>
            </div>
          </> : <>
            {heroProducts[0] ? <Link className="group absolute bottom-0 left-0 w-[64%] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_26px_80px_rgba(0,0,0,.35)]" href={heroProducts[0].product.legacyPath || `/${heroProducts[0].product.slug}/`}>
              <div className="relative aspect-square bg-slate-100"><Image alt={heroProducts[0].image.alt || heroProducts[0].product.name} className="object-contain transition duration-500 group-hover:scale-[1.025]" fill priority sizes="(max-width: 1024px) 64vw, 30vw" src={heroProducts[0].image.url} /></div>
            </Link> : null}
            {heroProducts[1] ? <Link className="group absolute bottom-10 right-0 w-[48%] overflow-hidden rounded-2xl border-4 border-[#0b1220] bg-white shadow-[0_20px_60px_rgba(0,0,0,.4)]" href={heroProducts[1].product.legacyPath || `/${heroProducts[1].product.slug}/`}>
              <div className="relative aspect-square bg-slate-100"><Image alt={heroProducts[1].image.alt || heroProducts[1].product.name} className="object-contain transition duration-500 group-hover:scale-[1.025]" fill sizes="(max-width: 1024px) 48vw, 22vw" src={heroProducts[1].image.url} /></div>
            </Link> : null}
          </>}
          <span className="absolute bottom-5 right-[42%] grid size-14 place-items-center rounded-full bg-brand text-white shadow-xl"><Sparkles aria-hidden="true" size={24} /></span>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white py-16 sm:py-22">
      <div className="section-shell grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
        <div><p className="section-kicker">Bắt đầu từ đúng vấn đề</p><h2 className="section-title">Một mẫu áo tập thể cần nhiều hơn một hình in đẹp.</h2><p className="section-lead">Thiết kế tốt phải giúp người phụ trách dễ chốt, người mặc dễ sử dụng và tập thể được nhận ra đúng cách.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{landing.challenges.map((item, index) => <article className="rounded-2xl border border-slate-200 bg-[#f8f6f2] p-6" key={item.title}><span className="font-display text-4xl font-bold text-brand">0{index + 1}</span><h3 className="mt-8 font-display text-3xl font-bold leading-none">{item.title}</h3><p className="mt-4 text-sm leading-6 text-slate-600">{item.text}</p></article>)}</div>
      </div>
    </section>

    <section className="section-shell py-16 sm:py-22">
      <div className="max-w-3xl"><p className="section-kicker">Giá trị nhận được</p><h2 className="section-title">Rõ từ nhận diện đến cách phối hợp.</h2></div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">{landing.benefits.map((item, index) => { const Icon = benefitIcons[index]; return <article className="rounded-2xl bg-[#0b1220] p-7 text-white" key={item.title}><span className="grid size-12 place-items-center rounded-xl bg-brand/15 text-brand"><Icon aria-hidden="true" size={24} /></span><h3 className="mt-9 font-display text-3xl font-bold leading-none">{item.title}</h3><p className="mt-4 text-sm leading-6 text-slate-400">{item.text}</p></article> })}</div>
    </section>

    <section className="bg-brand text-white">
      <div className="section-shell grid gap-12 py-16 sm:py-22 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
        <div className="lg:sticky lg:top-28"><p className="text-xs font-black uppercase tracking-[.16em] text-orange-100">Chuẩn bị yêu cầu</p><h2 className="mt-3 font-display text-5xl font-bold leading-[.95] sm:text-6xl">Sáu thông tin giúp cuộc trao đổi đi thẳng vào mẫu áo.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-orange-50">Chưa cần một bản thiết kế hoàn chỉnh. Chỉ cần tập hợp những thông tin đang có để đội ngũ hiểu đúng nhu cầu.</p></div>
        <ol className="grid gap-3 sm:grid-cols-2">{landing.briefItems.map((item, index) => <li className="flex min-h-28 items-center gap-5 rounded-2xl border border-white/20 bg-white/[.1] p-5" key={item}><span className="font-display text-3xl font-bold text-orange-100">0{index + 1}</span><strong className="text-base leading-6">{item}</strong></li>)}</ol>
      </div>
    </section>

    <section className="section-shell py-16 sm:py-22">
      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
        <div><p className="section-kicker">Quy trình phối hợp</p><h2 className="section-title">Từ ý tưởng ban đầu đến phương án đã duyệt.</h2><p className="section-lead">Mỗi bước đều có một đầu ra rõ ràng để người phụ trách biết cần chuẩn bị và kiểm tra điều gì.</p></div>
        <ol className="relative grid gap-4 before:absolute before:bottom-8 before:left-[23px] before:top-8 before:w-px before:bg-slate-200">{[
          ['Gửi yêu cầu', 'Chia sẻ mẫu tham khảo, logo, màu sắc, số lượng và mục đích sử dụng.'],
          ['Trao đổi phương án', 'Làm rõ kiểu áo, vị trí nhận diện và những nội dung cần ưu tiên.'],
          ['Duyệt maket & size', 'Kiểm tra bố cục, thông tin in và tổng hợp bảng size trước khi chốt.'],
          ['Chốt nội dung sản xuất', 'Xác nhận lại các thông tin đã thống nhất cho đơn hàng.'],
        ].map(([title, text], index) => <li className="relative grid grid-cols-[48px_1fr] gap-5 rounded-2xl border border-slate-200 bg-white p-5" key={title}><span className="z-10 grid size-12 place-items-center rounded-full bg-[#0b1220] font-display text-xl font-bold text-white">{index + 1}</span><div><h3 className="font-display text-2xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div></li>)}</ol>
      </div>
    </section>

    <section className="bg-white py-16 sm:py-22" id="mau-ao">
      <div className="section-shell"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker">Gợi ý để bắt đầu</p><h2 className="section-title">Chọn một mẫu gần với ý tưởng của bạn.</h2><p className="section-lead">Mỗi mẫu có thể tiếp tục được phát triển theo màu sắc và nhận diện riêng.</p></div><Link className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg border border-slate-300 px-5 text-sm font-black transition hover:border-brand hover:text-brand" href="/san-pham/">Xem toàn bộ mẫu áo <ArrowRight aria-hidden="true" size={18} /></Link></div><div className="mt-10"><ProductGrid products={catalog.docs} /></div></div>
    </section>

    <section className="section-shell py-16 sm:py-22">
      <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-16"><div><p className="section-kicker">Câu hỏi thường gặp</p><h2 className="section-title">Những điều nên làm rõ trước khi đặt áo.</h2></div><dl className="grid gap-3">{landing.faq.map((item) => <div className="rounded-2xl border border-slate-200 bg-white p-6" key={item.question}><dt className="font-display text-2xl font-bold leading-tight">{item.question}</dt><dd className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</dd></div>)}</dl></div>
    </section>

    <section className="bg-[#0b1220] text-white">
      <div className="section-shell grid gap-10 py-16 sm:py-22 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
        <div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Bắt đầu từ nhu cầu thật</p><h2 className="mt-3 max-w-4xl font-display text-5xl font-bold leading-[.94] sm:text-7xl">{landing.ctaTitle}</h2><p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{landing.ctaText}</p></div>
        <div className="flex flex-col gap-3 lg:items-end"><a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-7 text-sm font-black transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={19} /> Nhận tư vấn mẫu áo</a><Link className="inline-flex min-h-12 items-center justify-center gap-2 px-4 text-sm font-black text-slate-300 transition hover:text-white" href="/lien-he/">Xem thông tin liên hệ <ArrowRight aria-hidden="true" size={17} /></Link></div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-[#f8f6f2] py-12">
      <div className="section-shell"><p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Khám phá theo nhu cầu khác</p><div className="mt-5 grid gap-3 md:grid-cols-2">{related.map((item) => <Link className="group flex min-h-24 items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand hover:shadow-md" href={`/${item.slug}/`} key={item.slug}><span><strong className="font-display text-2xl">{item.navLabel}</strong><span className="mt-1 block text-xs text-slate-500">Xem giải pháp phù hợp</span></span><ArrowRight aria-hidden="true" className="text-brand transition group-hover:translate-x-1" /></Link>)}</div></div>
    </section>
  </>
}
