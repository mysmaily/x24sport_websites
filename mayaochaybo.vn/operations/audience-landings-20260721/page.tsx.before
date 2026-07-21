import { ArrowRight, BadgeCheck, Building2, CalendarDays, Flag, Palette, Ruler, Sparkles, TimerReset, Truck, UsersRound } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { HeroGallery, type HeroSlide } from '@/components/hero-gallery'
import { JsonLd } from '@/components/json-ld'
import { ProductGrid } from '@/components/product-grid'
import { getCategories, getLatestPosts, getProducts, productImages } from '@/lib/cms'
import { excerpt, LOGO_URL, SITE_URL, ZALO_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'May Áo Chạy Bộ Thiết Kế Riêng',
  description: 'May áo chạy bộ thiết kế riêng cho công ty, doanh nghiệp, giải chạy, event, đội nhóm và câu lạc bộ.',
  alternates: { canonical: '/' },
}

const commitments = [
  { icon: Palette, title: 'Thiết kế theo đội', text: 'Điều chỉnh màu sắc, logo, tên và thông tin giải chạy.' },
  { icon: Ruler, title: 'Tư vấn form & size', text: 'Hỗ trợ chuẩn bị bảng size cho cả đội trước khi sản xuất.' },
  { icon: BadgeCheck, title: 'Duyệt maket trước', text: 'Kiểm tra thiết kế và nội dung in trước khi chốt đơn.' },
  { icon: Truck, title: 'Giao hàng toàn quốc', text: 'Phục vụ câu lạc bộ, doanh nghiệp và giải chạy nhiều tỉnh thành.' },
]

const audiences = [
  { icon: Building2, label: 'Công ty & doanh nghiệp', text: 'Đồng phục nội bộ · team building' },
  { icon: CalendarDays, label: 'Giải chạy & event', text: 'Race kit · áo sự kiện' },
  { icon: UsersRound, label: 'Đội nhóm & câu lạc bộ', text: 'Nhận diện đồng nhất' },
]

export default async function HomePage() {
  const [catalog, posts, categoryResult] = await Promise.all([getProducts({ limit: 8 }), getLatestPosts(3), getCategories()])
  const heroSlides: HeroSlide[] = catalog.docs.flatMap((product) => {
    const image = productImages(product)[0]
    return image ? [{ alt: image.alt || product.name, href: product.legacyPath || `/${product.slug}/`, name: product.name, src: image.url }] : []
  }).slice(0, 5)
  const categories = categoryResult.docs.filter((item) => item.group !== 'color').slice(0, 5)

  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'OnlineStore', name: 'May Áo Chạy Bộ', url: SITE_URL, logo: LOGO_URL, telephone: '+84989353247' }} />
    <section className="relative overflow-hidden bg-[#0b1220] text-white">
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="section-shell relative grid min-h-[720px] items-center gap-10 py-12 lg:grid-cols-[.94fr_1.06fr] lg:py-16 xl:gap-14">
        <div className="z-10 min-w-0 max-w-3xl">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[.1em] text-orange-200 sm:text-xs sm:tracking-[.16em]"><TimerReset className="shrink-0" size={16} /><span className="sm:hidden">Thiết kế riêng · Duyệt maket</span><span className="hidden sm:inline">May theo nhận diện riêng · Duyệt maket trước</span></p>
          <h1 className="mt-7 max-w-[760px] font-display text-[3.25rem] font-extrabold leading-none tracking-[.012em] sm:text-[4.75rem] lg:text-[clamp(4.4rem,5.25vw,6.15rem)]">
            <span className="block">ÁO CHẠY BỘ</span>
            <span className="mt-[.2em] block text-brand">THIẾT KẾ RIÊNG</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Thiết kế đồng bộ với màu sắc, logo và tinh thần của tổ chức — từ buổi chạy nội bộ đến ngày diễn ra sự kiện.</p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-3" aria-label="Đối tượng khách hàng chính">
            {audiences.map(({ icon: Icon, label, text }) => <li className="min-w-0 rounded-xl border border-white/10 bg-white/[.055] p-3.5 backdrop-blur transition duration-200 hover:border-brand/50 hover:bg-white/[.085]" key={label}><Icon className="text-brand" size={21} /><strong className="mt-3 block text-sm font-black text-white">{label}</strong><span className="mt-1 block text-[11px] leading-4 text-slate-400">{text}</span></li>)}
          </ul>

          <div className="mt-7 grid max-w-lg gap-3 sm:flex sm:flex-wrap"><Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black transition duration-200 hover:bg-brand-dark" href="/san-pham/">Khám phá mẫu áo <ArrowRight size={19} /></Link><a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/25 px-6 text-sm font-black transition duration-200 hover:border-white/50 hover:bg-white/10" href={ZALO_URL} rel="noreferrer" target="_blank">Nhận tư vấn thiết kế</a></div>
        </div>
        <HeroGallery slides={heroSlides} totalProducts={catalog.totalDocs} />
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white"><div className="section-shell grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">{commitments.map(({ icon: Icon, title, text }) => <article className="flex gap-4 py-6 md:px-5 first:pl-0 last:pr-0" key={title}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Icon size={22} /></span><div><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div></article>)}</div></section>

    <section className="section-shell py-16 sm:py-22"><div className="max-w-3xl"><p className="section-kicker">Chọn điểm xuất phát</p><h2 className="section-title">Mẫu áo cho từng cách bạn chạy.</h2><p className="section-lead">Duyệt theo kiểu áo hoặc chọn toàn bộ bộ sưu tập. Các mẫu đều có thể phát triển lại theo nhận diện của đội.</p></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category, index) => <Link className={`group relative min-h-56 overflow-hidden rounded-2xl p-6 text-white ${index === 0 ? 'bg-brand' : 'bg-[#0b1220]'}`} href={category.legacyPath || `/danh-muc-san-pham/${category.slug}/`} key={category.id}><span className="absolute -bottom-12 -right-5 font-display text-[10rem] font-black leading-none text-white/[.06]">0{index + 1}</span><Flag size={28} /><h3 className="mt-16 max-w-sm font-display text-4xl font-bold leading-none">{category.name}</h3><span className="mt-5 inline-flex items-center gap-2 text-sm font-black">Xem bộ sưu tập <ArrowRight size={17} /></span></Link>)}</div></section>

    <section className="bg-white py-16 sm:py-22"><div className="section-shell"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker">Mẫu mới cập nhật</p><h2 className="section-title">Chọn mẫu. Chúng tôi giúp bạn biến nó thành của riêng.</h2></div><Link className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg border border-slate-300 px-5 text-sm font-black hover:border-brand hover:text-brand" href="/san-pham/">Xem toàn bộ {catalog.totalDocs.toLocaleString('vi-VN')} mẫu <ArrowRight size={18} /></Link></div><div className="mt-10"><ProductGrid products={catalog.docs} /></div></div></section>

    <section className="bg-[#0b1220] text-white"><div className="section-shell grid gap-12 py-16 sm:py-22 lg:grid-cols-[.85fr_1.15fr]"><div><p className="section-kicker text-orange-300">Từ ý tưởng đến vạch xuất phát</p><h2 className="section-title text-white">Bốn bước để cả đội mặc đúng một tinh thần.</h2><p className="mt-5 max-w-xl leading-7 text-slate-400">Gửi mẫu và nhu cầu thực tế. Thiết kế, size và thông tin sản xuất được rà soát trước khi bắt đầu.</p></div><ol className="grid gap-3 sm:grid-cols-2">{[['01','Gửi ý tưởng','Mẫu tham khảo, logo, màu chủ đạo và số lượng.'],['02','Duyệt thiết kế','Kiểm tra bố cục, nội dung in và phối màu.'],['03','Chốt size','Tổng hợp form, size và thời gian cần nhận.'],['04','Sản xuất & giao','Hoàn thiện đơn hàng theo nội dung đã duyệt.']].map(([number,title,text]) => <li className="rounded-2xl border border-white/10 bg-white/[.05] p-6" key={number}><span className="font-display text-4xl font-bold text-brand">{number}</span><h3 className="mt-8 font-display text-3xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></li>)}</ol></div></section>

    {posts.docs.length ? <section className="section-shell py-16 sm:py-22"><div><p className="section-kicker">Góc chạy bộ</p><h2 className="section-title">Chuẩn bị tốt hơn cho đội và giải chạy.</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{posts.docs.map((post) => <article className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6" key={post.id}><Sparkles className="text-brand" /><h3 className="mt-6 font-display text-3xl font-bold leading-[1.05]"><Link href={post.legacyPath}>{post.title}</Link></h3><p className="mt-4 text-sm leading-6 text-slate-600">{excerpt(post.excerpt, 120)}</p><Link className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-brand" href={post.legacyPath}>Đọc bài <ArrowRight size={17} /></Link></article>)}</div></section> : null}
  </>
}
