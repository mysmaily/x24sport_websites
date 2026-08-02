import { ArrowRight, BadgeCheck, Building2, CalendarDays, Flag, Palette, Ruler, Sparkles, TimerReset, Truck, UsersRound } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from './components/json-ld'
import { PromoHeroSlider } from './components/promo-hero-slider'
import { ProductGrid } from './components/product-grid'
import { getCategories, getLatestPosts, getProducts } from './lib/cms'
import { DEFAULT_OG_IMAGE, excerpt, LOGO_URL, SITE_URL, ZALO_URL } from './lib/site'

export const dynamic = 'force-dynamic'
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
  { icon: Palette, title: 'Thiết kế theo đội', text: 'Điều chỉnh màu sắc, logo, tên và thông tin giải chạy.' },
  { icon: Ruler, title: 'Tư vấn form & size', text: 'Hỗ trợ chuẩn bị bảng size cho cả đội trước khi sản xuất.' },
  { icon: BadgeCheck, title: 'Duyệt maket trước', text: 'Kiểm tra thiết kế và nội dung in trước khi chốt đơn.' },
  { icon: Truck, title: 'Giao hàng toàn quốc', text: 'Phục vụ câu lạc bộ, doanh nghiệp và giải chạy nhiều tỉnh thành.' },
]

const audiences = [
  { href: '/ao-chay-bo-doanh-nghiep/', icon: Building2, label: 'Công ty & doanh nghiệp', text: 'Đồng phục nội bộ · team building' },
  { href: '/ao-giai-chay-su-kien/', icon: CalendarDays, label: 'Giải chạy & sự kiện', text: 'Race kit · áo sự kiện' },
  { href: '/ao-chay-bo-doi-nhom-cau-lac-bo/', icon: UsersRound, label: 'Đội nhóm & câu lạc bộ', text: 'Nhận diện đồng nhất' },
]

const categoryCardBackground = '/images/mayaochaybo/home/running-shirt-category-bg.webp'

export default async function HomePage() {
  const [catalog, posts, categoryResult] = await Promise.all([getProducts({ limit: 8 }), getLatestPosts(3), getCategories()])
  const categories = categoryResult.docs.filter((item) => item.group !== 'color').slice(0, 5)

  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'OnlineStore', name: 'May Áo Chạy Bộ', url: SITE_URL, logo: LOGO_URL, telephone: '+84989353247' }} />
    <section className="relative overflow-hidden bg-[#0b1220] text-white">
      <PromoHeroSlider />
      <div className="section-shell relative flex min-h-[560px] items-center py-7 sm:min-h-[720px] sm:py-12 lg:py-16">
        <div className="z-10 min-w-0 max-w-3xl">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[.08em] text-orange-200 sm:px-4 sm:text-xs sm:tracking-[.16em]"><TimerReset className="shrink-0" size={16} /><span className="sm:hidden">Thiết kế riêng · Duyệt maket</span><span className="hidden sm:inline">May theo nhận diện riêng · Duyệt maket trước</span></p>
          <h1 className="mt-5 max-w-[760px] font-display text-[2.55rem] font-extrabold leading-none tracking-[.012em] sm:mt-7 sm:text-[4.75rem] lg:text-[clamp(4.4rem,5.25vw,6.15rem)]">
            <span className="block">ÁO CHẠY BỘ</span>
            <span className="mt-[.2em] block text-brand">THIẾT KẾ RIÊNG</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:mt-5 sm:max-w-2xl sm:text-lg sm:leading-7">Thiết kế đồng bộ với màu sắc, logo và tinh thần của đội chạy, công ty hoặc sự kiện.</p>

          <div className="mt-5 grid max-w-sm gap-3 sm:mt-7 sm:max-w-lg sm:flex sm:flex-wrap"><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black uppercase transition duration-200 hover:bg-brand-dark sm:min-h-13" href="/san-pham/">Xem mẫu áo <ArrowRight size={19} /></Link><a className="hidden min-h-13 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-black transition duration-200 hover:border-white/50 hover:bg-white/10 sm:inline-flex" href={ZALO_URL} rel="noreferrer" target="_blank">Nhận tư vấn thiết kế</a></div>

          <ul className="mt-6 hidden gap-2 sm:grid sm:grid-cols-3" aria-label="Đối tượng khách hàng chính">
            {audiences.map(({ href, icon: Icon, label, text }) => <li className="min-w-0" key={label}><Link className="group block h-full rounded-xl border border-white/10 bg-white/[.055] p-3.5 backdrop-blur transition duration-200 hover:border-brand/50 hover:bg-white/[.085]" href={href}><Icon className="text-brand" size={21} /><strong className="mt-3 flex items-center gap-1 text-sm font-black text-white">{label}<ArrowRight aria-hidden="true" className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" size={14} /></strong><span className="mt-1 block text-[11px] leading-4 text-slate-400">{text}</span></Link></li>)}
          </ul>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white"><div className="section-shell grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">{commitments.map(({ icon: Icon, title, text }) => <article className="flex gap-4 py-6 md:px-5 first:pl-0 last:pr-0" key={title}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Icon size={22} /></span><div><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div></article>)}</div></section>

    <section className="py-16 sm:py-22"><div className="section-shell"><div style={{ alignItems: 'end', display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))' }}><div className="max-w-3xl"><p className="section-kicker">Chọn điểm xuất phát</p><h2 className="section-title">Mẫu áo cho từng cách bạn chạy.</h2><p className="section-lead">Duyệt theo kiểu áo hoặc chọn toàn bộ bộ sưu tập. Các mẫu đều có thể phát triển lại theo nhận diện của đội.</p></div><div aria-hidden="true" className="overflow-hidden rounded-2xl bg-[#0b1220] bg-cover shadow-sm ring-1 ring-slate-900/10" style={{ backgroundImage: `linear-gradient(90deg,rgba(11,18,32,.18),rgba(11,18,32,0)),url(${categoryCardBackground})`, backgroundPosition: 'right center', minHeight: 'clamp(210px,22vw,320px)' }} /></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category, index) => <Link className={`group relative min-h-56 overflow-hidden rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${index === 0 ? 'bg-brand text-white' : 'bg-[#0b1220] text-white'}`} href={category.legacyPath || `/danh-muc-san-pham/${category.slug}/`} key={category.id} style={{ color: '#fff' }}><span className={`absolute inset-0 ${index === 0 ? 'bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.24),transparent_34%)]' : 'bg-[radial-gradient(circle_at_80%_20%,rgba(249,82,30,.22),transparent_36%)]'}`} /><span className="absolute -bottom-12 -right-5 z-10 font-display text-[10rem] font-black leading-none text-white/[.11]">0{index + 1}</span><Flag className="relative z-10 drop-shadow-sm" size={28} style={{ color: '#fff' }} /><h3 className="relative z-10 mt-16 max-w-sm font-display text-4xl font-bold leading-none drop-shadow-sm" style={{ color: '#fff' }}>{category.name}</h3><span className="relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-black drop-shadow-sm" style={{ color: '#fff' }}>Xem bộ sưu tập <ArrowRight size={17} /></span></Link>)}</div></div></section>

    <section className="bg-white py-16 sm:py-22"><div className="section-shell"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker">Mẫu mới cập nhật</p><h2 className="section-title">Chọn mẫu. Chúng tôi giúp bạn biến nó thành của riêng.</h2></div><Link className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg border border-slate-300 px-5 text-sm font-black hover:border-brand hover:text-brand" href="/san-pham/">Xem toàn bộ {catalog.totalDocs.toLocaleString('vi-VN')} mẫu <ArrowRight size={18} /></Link></div><div className="mt-10"><ProductGrid products={catalog.docs} /></div></div></section>

    <section className="bg-[#0b1220] text-white"><div className="section-shell grid gap-12 py-16 sm:py-22 lg:grid-cols-[.85fr_1.15fr]"><div><p className="section-kicker text-orange-300">Từ ý tưởng đến vạch xuất phát</p><h2 className="section-title text-white">Bốn bước để cả đội mặc đúng một tinh thần.</h2><p className="mt-5 max-w-xl leading-7 text-slate-400">Gửi mẫu và nhu cầu thực tế. Thiết kế, size và thông tin sản xuất được rà soát trước khi bắt đầu.</p></div><ol className="grid gap-3 sm:grid-cols-2">{[['01','Gửi ý tưởng','Mẫu tham khảo, logo, màu chủ đạo và số lượng.'],['02','Duyệt thiết kế','Kiểm tra bố cục, nội dung in và phối màu.'],['03','Chốt size','Tổng hợp form, size và thời gian cần nhận.'],['04','Sản xuất & giao','Hoàn thiện đơn hàng theo nội dung đã duyệt.']].map(([number,title,text]) => <li className="rounded-2xl border border-white/10 bg-white/[.05] p-6" key={number}><span className="font-display text-4xl font-bold text-brand">{number}</span><h3 className="mt-8 font-display text-3xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></li>)}</ol></div></section>

    {posts.docs.length ? <section className="section-shell py-16 sm:py-22"><div><p className="section-kicker">Góc chạy bộ</p><h2 className="section-title">Chuẩn bị tốt hơn cho đội và giải chạy.</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{posts.docs.map((post) => <article className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6" key={post.id}><Sparkles className="text-brand" /><h3 className="mt-6 font-display text-3xl font-bold leading-[1.05]"><Link href={post.legacyPath}>{post.title}</Link></h3><p className="mt-4 text-sm leading-6 text-slate-600">{excerpt(post.excerpt, 120)}</p><Link className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-brand" href={post.legacyPath}>Đọc bài <ArrowRight size={17} /></Link></article>)}</div></section> : null}
  </>
}
