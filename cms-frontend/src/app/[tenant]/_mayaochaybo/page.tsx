import { ArrowRight, BadgeCheck, Building2, CalendarDays, Flag, Palette, Ruler, Sparkles, TimerReset, Truck, UsersRound } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { CSSProperties } from 'react'

import { TenantPromoHero, type TenantPromoHeroSlide } from '../../_components/tenant-promo-hero'
import { JsonLd } from './components/json-ld'
import { ProductGrid } from './components/product-grid'
import { getCategories, getLatestPosts, getProducts, type ProductCategory } from './lib/cms'
import { DEFAULT_OG_IMAGE, excerpt, LOGO_URL, SITE_URL, ZALO_URL } from './lib/site'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'May Áo Chạy Bộ Thiết Kế Riêng',
  description: 'May áo chạy bộ thiết kế riêng cho công ty, doanh nghiệp, giải chạy, event, đội nhóm và câu lạc bộ.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'May Áo Chạy Bộ Thiết Kế Riêng',
    description: 'May áo chạy bộ thiết kế riêng cho công ty, doanh nghiệp, giải chạy, event, đội nhóm và câu lạc bộ.',
    images: [DEFAULT_OG_IMAGE],
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'May Áo Chạy Bộ Thiết Kế Riêng',
    description: 'May áo chạy bộ thiết kế riêng cho công ty, doanh nghiệp, giải chạy, event, đội nhóm và câu lạc bộ.',
    images: [DEFAULT_OG_IMAGE.url],
  },
}

const commitments = [
  { icon: Palette, title: 'Bản thiết kế riêng', text: 'Căn màu, logo, bib, sponsor và tinh thần của đội.' },
  { icon: Ruler, title: 'Fit chạy bộ', text: 'Tư vấn form, size và chất liệu theo cách đội vận động.' },
  { icon: BadgeCheck, title: 'Duyệt maket kỹ', text: 'Rà bố cục in trước khi đưa mẫu vào sản xuất.' },
  { icon: Truck, title: 'Giao toàn quốc', text: 'Phục vụ câu lạc bộ, doanh nghiệp và giải chạy nhiều tỉnh thành.' },
]

const audiences = [
  { href: '/ao-chay-bo-doanh-nghiep/', icon: Building2, label: 'Công ty & doanh nghiệp', text: 'Đồng phục nội bộ · team building' },
  { href: '/ao-giai-chay-su-kien/', icon: CalendarDays, label: 'Giải chạy & sự kiện', text: 'Race kit · áo sự kiện' },
  { href: '/ao-chay-bo-doi-nhom-cau-lac-bo/', icon: UsersRound, label: 'Đội nhóm & câu lạc bộ', text: 'Nhận diện đồng nhất' },
]

const heroSlides: TenantPromoHeroSlide[] = [
  {
    alt: 'Áo chạy bộ màu trắng phong cách Việt Nam có thể in logo đội, tên nhóm, số áo và duyệt mẫu trước',
    height: 809,
    mobileSrc: '/images/mayaochaybo/home/running-promo-vietnam-mobile.webp',
    src: '/images/mayaochaybo/home/running-promo-vietnam-wide.webp',
    width: 1942,
  },
  {
    alt: 'Áo ba lỗ chạy bộ race day nhẹ, khô nhanh, đủ size cho đội chạy và sự kiện',
    height: 809,
    mobileSrc: '/images/mayaochaybo/home/running-promo-singlet-mobile.webp',
    src: '/images/mayaochaybo/home/running-promo-singlet-wide.webp',
    width: 1944,
  },
]

const categoryVisuals = [
  {
    accent: '#d91a30',
    accentRgb: '217 26 48',
    image: '/images/mayaochaybo/images/audience-landings/doi-nhom-viet-nam-running-club.webp',
    label: 'Tinh thần Việt Nam',
    match: ['co do', 'sao vang', 'viet nam'],
    position: 'center',
  },
  {
    accent: '#37b7a5',
    accentRgb: '55 183 165',
    image: '/images/mayaochaybo/images/audience-landings/doanh-nghiep-vinaseed-green-run.webp',
    label: 'Áo có tay',
    match: ['co tay'],
    position: 'center',
  },
  {
    accent: '#ffd33d',
    accentRgb: '255 211 61',
    image: '/images/mayaochaybo/home/running-promo-singlet-wide.webp',
    label: 'Race day',
    match: ['sat nach', 'ba lo', 'singlet'],
    position: 'center',
  },
  {
    accent: '#d91a30',
    accentRgb: '217 26 48',
    image: '/images/mayaochaybo/images/audience-landings/doanh-nghiep-finisher-team.webp',
    label: 'Thiết kế riêng',
    match: ['thiet ke rieng', 'custom'],
    position: 'center',
  },
  {
    accent: '#37b7a5',
    accentRgb: '55 183 165',
    image: '/images/mayaochaybo/images/audience-landings/giai-chay-x24-run-start.webp',
    label: 'Logo đội chạy',
    match: ['logo', 'doi chay', 'cau lac bo'],
    position: 'center',
  },
]

function normalizeCategoryText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function getCategoryVisual(category: ProductCategory, index: number) {
  const searchable = normalizeCategoryText(`${category.name} ${category.slug}`)
  return categoryVisuals.find((visual) => visual.match.some((term) => searchable.includes(term))) ?? categoryVisuals[index % categoryVisuals.length]
}

export default async function HomePage() {
  const [catalog, hotCatalog, posts, categoryResult] = await Promise.all([getProducts({ limit: 8 }), getProducts({ limit: 8, sort: 'popular' }), getLatestPosts(3), getCategories()])
  const categories = categoryResult.docs.filter((item) => item.group !== 'color').slice(0, 5)

  return <>
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'May Áo Chạy Bộ', url: SITE_URL, logo: LOGO_URL, telephone: '+84989353247', sameAs: ['https://facebook.com/mayaochaybo'] },
        { '@type': 'OnlineStore', name: 'May Áo Chạy Bộ', url: SITE_URL, logo: LOGO_URL, telephone: '+84989353247' },
        { '@type': 'WebSite', name: 'MayAoChayBo.vn', url: SITE_URL, potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/san-pham/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
      ],
    }} />
    <TenantPromoHero ariaLabel="Hình ảnh may áo chạy bộ thiết kế riêng" slides={heroSlides}>
        <div className="mcb-premium-hero-copy min-w-0 max-w-3xl">
          <p className="mcb-atelier-pill inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-orange-200 sm:text-xs sm:tracking-[.16em]"><TimerReset className="shrink-0" size={16} /><span className="sm:hidden">Atelier áo chạy bộ</span><span className="hidden sm:inline">Atelier áo chạy bộ · Duyệt maket trước</span></p>
          <h1 className="mcb-premium-hero-title mt-5 max-w-[760px] font-display text-[3.25rem] font-extrabold leading-none tracking-[.012em] sm:mt-7 sm:text-[4.75rem] lg:text-[clamp(4.4rem,5.25vw,6.15rem)]">
            <span className="block">ÁO CHẠY BỘ</span>
            <span className="mt-[.2em] block text-brand">THIẾT KẾ RIÊNG</span>
          </h1>
          <p className="mcb-premium-hero-lead mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-5 sm:text-lg sm:leading-7">Thiết kế đồng bộ với màu sắc, logo và tinh thần của tổ chức, từ buổi chạy nội bộ đến ngày diễn ra sự kiện.</p>

          <ul className="mcb-audience-rail mt-5 grid grid-cols-3 gap-2 sm:mt-6" aria-label="Đối tượng khách hàng chính">
            {audiences.map(({ href, icon: Icon, label, text }) => <li className="min-w-0" key={label}><Link className="mcb-glass-link group block h-full rounded-xl border border-white/10 bg-white/[.055] p-2.5 backdrop-blur transition duration-200 hover:border-brand/50 hover:bg-white/[.085] sm:p-3.5" href={href}><Icon className="text-brand" size={21} /><strong className="mt-2 flex items-center gap-1 text-[11px] font-black leading-tight text-white sm:mt-3 sm:text-sm">{label}<ArrowRight aria-hidden="true" className="hidden opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 sm:block" size={14} /></strong><span className="mt-1 hidden text-[11px] leading-4 text-slate-400 sm:block">{text}</span></Link></li>)}
          </ul>

          <div className="mcb-hero-actions mt-5 grid max-w-lg grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3"><Link className="mcb-primary-cta inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-xs font-black transition duration-200 hover:bg-brand-dark sm:min-h-13 sm:px-6 sm:text-sm" href="/san-pham/">Khám phá mẫu áo <ArrowRight size={19} /></Link><a className="mcb-secondary-cta inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/25 px-3 text-xs font-black transition duration-200 hover:border-white/50 hover:bg-white/10 sm:min-h-13 sm:px-6 sm:text-sm" href={ZALO_URL} rel="noreferrer" target="_blank">Nhận tư vấn thiết kế</a></div>
        </div>
    </TenantPromoHero>

    <section className="mcb-commitment-strip border-b border-slate-200 bg-white"><div className="section-shell grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">{commitments.map(({ icon: Icon, title, text }) => <article className="mcb-commitment-item flex gap-4 py-6 md:px-5 first:pl-0 last:pr-0" key={title}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Icon size={22} /></span><div><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div></article>)}</div></section>

    <section className="mcb-category-section py-16 sm:py-22"><div className="section-shell"><div className="mcb-category-intro max-w-4xl"><p className="section-kicker">Chọn điểm xuất phát</p><h2 className="section-title">Mẫu áo cho từng cách bạn chạy.</h2><p className="section-lead">Duyệt theo kiểu áo hoặc chọn toàn bộ bộ sưu tập. Các mẫu đều có thể phát triển lại theo nhận diện của đội.</p></div><div className="mcb-category-grid mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category, index) => {
      const visual = getCategoryVisual(category, index)
      const categoryStyle = {
        '--mcb-category-accent': visual.accent,
        '--mcb-category-accent-rgb': visual.accentRgb,
        '--mcb-category-image': `url(${visual.image})`,
        '--mcb-category-position': visual.position,
      } as CSSProperties

      return <Link className="mcb-category-card group relative min-h-56 overflow-hidden rounded-2xl p-6 text-white shadow-sm ring-1 ring-slate-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href={category.legacyPath || `/danh-muc-san-pham/${category.slug}/`} key={category.id} style={categoryStyle}><span className="mcb-category-card-chrome" /><span className="mcb-category-card-media" /><span className="mcb-category-card-topline"><Flag size={18} /> {visual.label}</span><h3 className="relative z-10 mt-auto max-w-sm font-display text-[2.35rem] font-bold leading-none drop-shadow-sm sm:text-[2.6rem]">{category.name}</h3><span className="relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-black drop-shadow-sm">Xem bộ sưu tập <ArrowRight size={17} /></span></Link>
    })}</div></div></section>

    <section className="mcb-hot-products-section py-16 text-white sm:py-22"><div className="section-shell"><div className="mcb-hot-products-panel rounded-[1.35rem] p-4 sm:p-6 lg:p-8"><div className="max-w-3xl"><p className="section-kicker text-orange-300">Đang được quan tâm</p><h2 className="section-title text-white">Sản phẩm HOT</h2><p className="section-lead text-slate-300">Những mẫu áo chạy bộ khách thường mở để tham khảo phối màu, kiểu áo và tinh thần thiết kế cho đội.</p></div><div className="mt-8"><ProductGrid products={hotCatalog.docs} /></div><div className="mcb-section-footer-action"><Link className="mcb-light-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-slate-950 hover:bg-orange-50 hover:text-brand" href="/mau-ao-chay-bo-duoc-xem-nhieu/">Xem tất cả mẫu hot <ArrowRight size={18} /></Link></div></div></div></section>

    <section className="mcb-product-showcase bg-white py-16 sm:py-22"><div className="section-shell"><div className="max-w-3xl"><p className="section-kicker">Mới cập nhật</p><h2 className="section-title">Sản phẩm mới ra mắt</h2><p className="section-lead">Các thiết kế vừa cập nhật để đội dễ chọn form áo, phối màu và ý tưởng in ấn cho đơn tiếp theo.</p></div><div className="mt-10"><ProductGrid products={catalog.docs} /></div><div className="mcb-section-footer-action"><Link className="mcb-outline-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-black hover:border-brand hover:text-brand" href="/san-pham/">Xem tất cả {catalog.totalDocs.toLocaleString('vi-VN')} mẫu <ArrowRight size={18} /></Link></div></div></section>

    <section className="mcb-process-section bg-[#0b1220] text-white"><div className="section-shell grid gap-12 py-16 sm:py-22 lg:grid-cols-[.85fr_1.15fr]"><div><p className="section-kicker text-orange-300">Từ ý tưởng đến vạch xuất phát</p><h2 className="section-title text-white">Bốn bước để cả đội mặc đúng một tinh thần.</h2><p className="mt-5 max-w-xl leading-7 text-slate-400">Gửi mẫu và nhu cầu thực tế. Thiết kế, size và thông tin sản xuất được rà soát trước khi bắt đầu.</p></div><ol className="mcb-process-grid grid gap-3 sm:grid-cols-2">{[['01','Gửi ý tưởng','Mẫu tham khảo, logo, màu chủ đạo và số lượng.'],['02','Duyệt thiết kế','Kiểm tra bố cục, nội dung in và phối màu.'],['03','Chốt size','Tổng hợp form, size và thời gian cần nhận.'],['04','Sản xuất & giao','Hoàn thiện đơn hàng theo nội dung đã duyệt.']].map(([number,title,text]) => <li className="mcb-process-card rounded-2xl border border-white/10 bg-white/[.05] p-6" key={number}><span className="font-display text-4xl font-bold text-brand">{number}</span><h3 className="mt-8 font-display text-3xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></li>)}</ol></div></section>

    {posts.docs.length ? <section className="mcb-journal-section section-shell py-16 sm:py-22"><div><p className="section-kicker">Góc chạy bộ</p><h2 className="section-title">Chuẩn bị tốt hơn cho đội và giải chạy.</h2></div><div className="mcb-journal-grid mt-9 grid gap-4 md:grid-cols-3">{posts.docs.map((post) => <article className="mcb-journal-card flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6" key={post.id}><Sparkles className="text-brand" /><h3 className="mt-6 font-display text-3xl font-bold leading-[1.05]"><Link href={post.legacyPath}>{post.title}</Link></h3><p className="mt-4 text-sm leading-6 text-slate-600">{excerpt(post.excerpt, 120)}</p><Link className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-brand" href={post.legacyPath}>Đọc bài <ArrowRight size={17} /></Link></article>)}</div></section> : null}
  </>
}
