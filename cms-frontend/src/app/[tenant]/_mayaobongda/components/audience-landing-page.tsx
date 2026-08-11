import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronLeft,
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
import Link from 'next/link'

import { TenantPromoHero, type TenantPromoHeroSlide } from '../../../_components/tenant-promo-hero'
import { JsonLd } from './json-ld'
import { ProductGrid } from './product-grid'
import { getProductCategory, getProducts } from '../lib/cms'
import { FOOTBALL_AUDIENCE_LANDINGS, type FootballAudienceLanding } from '../lib/audience-landings'
import { footballCategoryPath } from '../lib/category-paths'
import { canonical, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'

const audienceIcons = {
  'ao-bong-da-doi-bong-cau-lac-bo': UsersRound,
  'ao-bong-da-giai-phong-trao': Trophy,
  'thiet-ke-ao-bong-da-cong-ty': Building2,
  'thiet-ke-ao-bong-da-ngan-hang': Building2,
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

const LANDING_PRODUCT_LIMIT = 24

function landingHeroSlides(landing: FootballAudienceLanding): TenantPromoHeroSlide[] {
  return (landing.heroImages || [{ src: landing.heroImage, alt: landing.heroAlt }]).map((image) => ({
    alt: image.alt,
    height: 1024,
    mobileSrc: image.src,
    src: image.src,
    width: 1536,
  }))
}

export async function FootballAudienceLandingPage({ landing, page = 1 }: { landing: FootballAudienceLanding; page?: number }) {
  const currentPage = Math.max(1, page)
  const isBusinessLanding = landing.slug === 'thiet-ke-ao-bong-da-cong-ty' || landing.slug === 'thiet-ke-ao-bong-da-ngan-hang'
  const productHeading = landing.slug === 'thiet-ke-ao-bong-da-ngan-hang'
    ? 'Mẫu áo bóng đá ngân hàng.'
    : landing.slug === 'thiet-ke-ao-bong-da-cong-ty'
      ? 'Mẫu áo bóng đá công ty.'
      : 'Mẫu áo có thể phát triển theo nhu cầu này.'
  const categoryCatalog = landing.categorySlug ? await getProducts({ page: currentPage, limit: LANDING_PRODUCT_LIMIT, categorySlug: landing.categorySlug }) : null
  const emptyCatalog = { docs: [], totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false }
  const catalog = categoryCatalog?.docs.length ? categoryCatalog : isBusinessLanding ? (categoryCatalog || emptyCatalog) : await getProducts({ page: currentPage, limit: LANDING_PRODUCT_LIMIT })
  const category = landing.categorySlug ? await getProductCategory(landing.categorySlug) : null
  const categoryLabel = landing.categoryLabel || category?.name || landing.navLabel
  const categoryPath = category ? footballCategoryPath(category) : `/${landing.slug}/`
  const AudienceIcon = audienceIcons[landing.slug as keyof typeof audienceIcons]
  const related = FOOTBALL_AUDIENCE_LANDINGS.filter((item) => item.slug !== landing.slug)
  const pageHref = (value: number) => value === 1 ? `/${landing.slug}/#mau-ao` : `/${landing.slug}/?page=${value}#mau-ao`

  const hero = (
    <section className="football-audience-hero">
      <div className="football-audience-breadcrumb section-shell py-4 sm:py-5">
        <nav aria-label="Đường dẫn" className="flex items-center gap-2 overflow-hidden text-xs font-bold text-slate-400">
          <Link className="shrink-0 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href="/">Trang chủ</Link>
          <ChevronRight aria-hidden="true" className="shrink-0" size={14} />
          <Link className="shrink-0 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href="/san-pham/">Sản Phẩm</Link>
          <ChevronRight aria-hidden="true" className="shrink-0" size={14} />
          <span aria-current="page" className="truncate text-slate-200">{categoryLabel}</span>
        </nav>
      </div>

      <TenantPromoHero ariaLabel={landing.eyebrow} slides={landingHeroSlides(landing)}>
        <div className="football-audience-hero-copy min-w-0 max-w-3xl">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em] text-orange-200 backdrop-blur sm:px-4 sm:py-2 sm:text-xs sm:tracking-[.16em]"><AudienceIcon aria-hidden="true" className="shrink-0" size={16} /><span className="truncate">{landing.eyebrow}</span></p>
          <h1 className="football-audience-title mt-4 max-w-[860px] text-balance font-display font-extrabold sm:mt-7">{landing.title}</h1>
          {landing.tagline ? <p className="mt-3 max-w-2xl font-display text-2xl font-bold leading-[1.05] text-white sm:mt-4 sm:text-4xl">{landing.tagline}</p> : null}
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-5 sm:text-lg sm:leading-7">{landing.description}</p>
          <ul aria-label="Phù hợp với" className="mt-5 grid max-w-2xl grid-cols-1 gap-2 sm:mt-7 sm:grid-cols-3">
            {landing.contexts.map((item) => <li className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/[.055] px-3 text-xs font-bold leading-5 text-slate-100 backdrop-blur" key={item}><Check aria-hidden="true" className="shrink-0 text-brand" size={15} />{item}</li>)}
          </ul>
          <div className="mt-5 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
            <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-black transition duration-200 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-13 sm:px-6" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={19} /> Nhận tư vấn mẫu áo</a>
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-black transition duration-200 hover:border-white/55 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:min-h-13 sm:px-6" href="#mau-ao">Xem mẫu áo <ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
          <p className="football-audience-hero-note mt-6 max-w-xl border-l-2 border-brand pl-4 text-sm font-bold leading-6 text-slate-200 sm:mt-8">Thiết kế, size và nội dung in được rà soát trước khi chốt sản xuất.</p>
        </div>
      </TenantPromoHero>
    </section>
  )

  const productSection = (
    <section className="bg-white py-12 sm:py-16" id="mau-ao">
      <div className="section-shell">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">{categoryLabel}</p>
            <h2 className="section-title">{productHeading}</h2>
            <p className="section-lead">Chọn một mẫu gần đúng để làm điểm xuất phát. Màu sắc, logo, tên số và nội dung in có thể tiếp tục điều chỉnh theo đội.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg border border-slate-300 px-5 text-sm font-black transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href={categoryPath}>{isBusinessLanding && category ? 'Xem danh mục' : 'Xem landing từ đầu'} <ArrowRight aria-hidden="true" size={18} /></Link>
        </div>
        <div className="mb-2 mt-6 flex justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
          <span><b className="text-brand">{catalog.totalDocs.toLocaleString('vi-VN')}</b> mẫu phù hợp</span>
          <span>Trang {catalog.page}/{Math.max(catalog.totalPages, 1)}</span>
        </div>
        <div className="mt-8"><ProductGrid products={catalog.docs} /></div>
        {catalog.totalPages > 1 ? <nav className="mt-9 grid grid-cols-[1fr_auto_1fr] items-center border-t border-slate-200 pt-5 text-sm font-black" aria-label="Phân trang mẫu áo landing">{currentPage > 1 ? <Link className="inline-flex min-h-11 items-center gap-2" href={pageHref(currentPage - 1)}><ChevronLeft size={18} /> Trang trước</Link> : <span />}<span>{currentPage} / {catalog.totalPages}</span>{currentPage < catalog.totalPages ? <Link className="inline-flex min-h-11 items-center gap-2 justify-self-end" href={pageHref(currentPage + 1)}>Trang sau <ChevronRight size={18} /></Link> : <span />}</nav> : null}
      </div>
    </section>
  )

  if (currentPage > 1) {
    return <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') },
          { '@type': 'ListItem', position: 2, name: 'Sản Phẩm', item: canonical('/san-pham/') },
          { '@type': 'ListItem', position: 3, name: categoryLabel, item: canonical(categoryPath) },
        ],
      }} />
      {productSection}
    </>
  }

  if (isBusinessLanding) {
    return <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') },
          { '@type': 'ListItem', position: 2, name: 'Sản Phẩm', item: canonical('/san-pham/') },
          { '@type': 'ListItem', position: 3, name: categoryLabel, item: canonical(categoryPath) },
        ],
      }} />

      {hero}
      {productSection}

      <section className="section-shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="section-kicker">Đặt may gọn hơn</p>
          <h2 className="section-title">{landing.briefTitle}</h2>
          <p className="section-lead">{landing.processNote}</p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {landing.briefItems.map((item, index) => <li className="flex min-h-20 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4" key={item}><span className="font-display text-2xl font-bold text-brand">{index + 1}</span><strong className="text-sm leading-5 text-slate-900">{item}</strong></li>)}
        </ol>
      </section>

      <section className="section-shell grid gap-8 pb-12 sm:pb-16 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <div><p className="section-kicker">Câu hỏi thường gặp</p><h2 className="section-title">Thông tin cần rõ trước khi chốt áo.</h2></div>
        <dl className="grid gap-3">{landing.faq.map((item) => <div className="rounded-2xl border border-slate-200 bg-white p-5" key={item.question}><dt className="font-display text-xl font-bold leading-tight">{item.question}</dt><dd className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</dd></div>)}</dl>
      </section>

      <section className="football-audience-dark text-white">
        <div className="section-shell flex flex-col gap-6 py-12 sm:py-16 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Tư vấn theo nhận diện</p><h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-none sm:text-5xl">{landing.ctaTitle}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{landing.ctaText}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-7 text-sm font-black transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={19} /> Trao đổi qua Zalo</a><a className="inline-flex min-h-12 items-center justify-center gap-2 px-4 text-sm font-black text-slate-300 transition hover:text-white" href={`tel:${PHONE_VALUE}`}>Gọi {PHONE_DISPLAY} <ArrowRight aria-hidden="true" size={17} /></a></div>
        </div>
      </section>
    </>
  }

  return <>
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') },
        { '@type': 'ListItem', position: 2, name: 'Sản Phẩm', item: canonical('/san-pham/') },
        { '@type': 'ListItem', position: 3, name: categoryLabel, item: canonical(categoryPath) },
      ],
    }} />

    {hero}

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

    {productSection}

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
