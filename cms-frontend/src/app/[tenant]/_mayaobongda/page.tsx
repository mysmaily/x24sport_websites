import { ArrowRight, BadgeCheck, Flag, GraduationCap, Palette, Ruler, ShieldCheck, Sparkles, TimerReset, Trophy, Truck, UsersRound } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { TenantPromoHero, type TenantPromoHeroSlide } from '../../_components/tenant-promo-hero'
import { JsonLd } from './components/json-ld'
import { ProductGrid } from './components/product-grid'
import { getCategories, getLatestPosts, getProducts } from './lib/cms'
import { footballCategoryPath } from './lib/category-paths'
import { HOT_FOOTBALL_PATH } from './lib/hot-football'
import { excerpt, LOGO_ABSOLUTE_URL, SITE_NAME, SITE_URL, ZALO_URL } from './lib/site'

export const revalidate = 180
export const metadata: Metadata = {
  title: 'May Áo Bóng Đá Thiết Kế, Áo Không Logo Giá Xưởng',
  description: 'May áo bóng đá thiết kế riêng, áo không logo và đồng phục thi đấu cho đội bóng, câu lạc bộ, công ty, ngân hàng và giải phong trào.',
  alternates: { canonical: '/' },
}

const commitments = [
  { icon: Palette, title: 'Phối màu theo đội', text: 'Điều chỉnh màu áo, logo, tên số và tinh thần nhận diện của đội bóng.' },
  { icon: Ruler, title: 'Tư vấn size thi đấu', text: 'Gợi ý form và bảng size cho đội nam, đội nữ và nhóm phong trào.' },
  { icon: BadgeCheck, title: 'Duyệt maket trước', text: 'Kiểm tra thiết kế trước khi in và sản xuất số lượng lớn.' },
  { icon: Truck, title: 'Giao hàng toàn quốc', text: 'Phục vụ đội bóng, câu lạc bộ, công ty và giải đấu nhiều tỉnh thành.' },
]

const audiences = [
  { href: '/ao-bong-da-doi-bong-cau-lac-bo/', icon: UsersRound, label: 'Đội bóng & CLB phong trào', text: 'Thi đấu · tập luyện · giao hữu' },
  { href: '/ao-bong-da-truong-hoc-sinh-vien/', icon: GraduationCap, label: 'Trường học & sinh viên', text: 'Đội lớp · khoa · giải trường' },
  { href: '/thiet-ke-ao-bong-da-cong-ty/', icon: ShieldCheck, label: 'Công ty & doanh nghiệp', text: 'Giải nội bộ · team building' },
  { href: '/thiet-ke-ao-bong-da-ngan-hang/', icon: ShieldCheck, label: 'Ngân hàng', text: 'Giao lưu chi nhánh · giải nội bộ' },
  { href: '/ao-bong-da-giai-phong-trao/', icon: Trophy, label: 'Giải đấu & hội thao', text: 'Đồng phục giải · kỷ niệm đội hình' },
]

const heroSlides: TenantPromoHeroSlide[] = [
  {
    alt: 'Khuyến mãi áo bóng đá thiết kế từ 119K, miễn phí thiết kế và in tên số',
    height: 809,
    mobileSrc: '/images/mayaobongda/home/football-promo-119k-blue-mobile.webp',
    src: '/images/mayaobongda/home/football-promo-119k-blue-wide.webp',
    width: 1942,
  },
  {
    alt: 'Bộ sưu tập áo bóng đá 2026 trắng cam xanh, tùy chọn cổ áo và in tên số theo đội',
    height: 809,
    mobileSrc: '/images/mayaobongda/home/football-promo-2026-white-mobile.webp',
    src: '/images/mayaobongda/home/football-promo-2026-white-wide.webp',
    width: 1942,
  },
]

export default async function HomePage() {
  const [catalog, hotCatalog, posts, categoryResult] = await Promise.all([getProducts({ limit: 8 }), getProducts({ limit: 12, sort: 'popular' }), getLatestPosts(3), getCategories()])
  const categories = categoryResult.docs.filter((item) => item.group === 'type' && (item.productCount || 0) > 0).slice(0, 4)

  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'OnlineStore', name: SITE_NAME, url: SITE_URL, logo: LOGO_ABSOLUTE_URL, telephone: '+84989353247' }} />
    <TenantPromoHero ariaLabel="Khuyến mãi áo bóng đá" slides={heroSlides}>
        <div className="min-w-0 max-w-3xl">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.1em] text-orange-200 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[.16em]"><TimerReset className="shrink-0" size={16} /><span className="sm:hidden">Duyệt maket trước</span><span className="hidden sm:inline">May trực tiếp tại xưởng · Duyệt maket trước</span></p>
          <h1 className="mt-4 max-w-[760px] font-display text-[2.65rem] font-extrabold leading-[.9] tracking-[.012em] sm:mt-7 sm:text-[4.75rem] lg:text-[clamp(4.4rem,5.25vw,6.15rem)]">May áo bóng đá <br /><span className="text-brand">thiết kế riêng</span></h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-5 sm:text-lg sm:leading-7">Chọn mẫu, chỉnh màu, logo, tên số và nội dung theo đúng nhận diện đội bóng hoặc giải đấu.</p>

          <ul className="mabd-home-audience-grid mt-4 grid grid-cols-2 gap-1.5 sm:mt-6 sm:grid-cols-3 sm:gap-2 lg:grid-cols-5" aria-label="Đối tượng khách hàng chính">
            {audiences.map(({ href, icon: Icon, label, text }) => <li className="min-w-0" key={label}><Link className="group block h-full rounded-lg border border-white/10 bg-white/[.055] p-2.5 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-white/[.085] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:rounded-xl sm:p-3.5" href={href}><Icon className="text-brand" size={20} /><strong className="mt-2 flex items-center gap-1 text-[11px] font-black leading-4 text-white sm:mt-3 sm:text-sm">{label}<ArrowRight className="hidden opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 sm:block" size={14} /></strong><span className="mt-1 hidden text-[11px] leading-4 text-slate-400 sm:block">{text}</span></Link></li>)}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3"><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-black transition duration-200 hover:bg-brand-dark sm:min-h-13 sm:px-6" href="/san-pham/">Khám phá mẫu áo <ArrowRight size={19} /></Link><a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-black transition duration-200 hover:border-white/50 hover:bg-white/10 sm:min-h-13 sm:px-6" href={ZALO_URL} rel="noreferrer" target="_blank">Tư vấn thiết kế</a></div>
        </div>
    </TenantPromoHero>

    <section className="border-b border-slate-200 bg-white"><div className="section-shell grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">{commitments.map(({ icon: Icon, title, text }) => <article className="flex gap-4 py-6 md:px-5 first:pl-0 last:pr-0" key={title}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Icon size={22} /></span><div><h2 className="text-sm font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div></article>)}</div></section>

    <section className="mabd-category-section py-10 sm:py-18">
      <div className="section-shell">
        <div className="max-w-3xl">
          <p className="section-kicker">Chọn điểm xuất phát</p>
          <h2 className="section-title">Mẫu áo cho từng kiểu đội hình.</h2>
          <p className="section-lead">Duyệt nhanh theo nhóm sản phẩm. Mỗi mẫu đều có thể chỉnh màu, logo và tên số.</p>
        </div>
        <div className="mabd-category-grid mt-5 gap-2.5 sm:mt-9 sm:gap-4">
          {categories.map((category, index) => (
            <Link
              className="mabd-category-card group relative overflow-hidden rounded-xl p-4 sm:rounded-2xl sm:p-6"
              href={footballCategoryPath(category)}
              key={category.id}
            >
              <span aria-hidden="true" className="mabd-category-number absolute -bottom-8 -right-4 font-display text-[6rem] font-black leading-none sm:-bottom-12 sm:-right-5 sm:text-[9rem]">0{index + 1}</span>
              <Flag aria-hidden="true" className="mabd-category-icon relative" size={24} />
              <h3 className="relative mt-8 max-w-sm font-display text-xl font-bold leading-[.98] sm:mt-14 sm:text-3xl">{category.name}</h3>
              <span className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-black sm:pt-6 sm:text-sm">Xem mẫu <ArrowRight aria-hidden="true" className="mabd-category-arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-white py-10 sm:py-18">
      <div className="section-shell">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Mẫu mới cập nhật</p>
            <h2 className="section-title">Chọn mẫu, rồi hoàn thiện phiên bản của đội.</h2>
          </div>
          <Link className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-slate-300 px-4 text-sm font-black hover:border-brand hover:text-brand sm:min-h-12 sm:px-5" href="/san-pham/">Xem {catalog.totalDocs.toLocaleString('vi-VN')} mẫu <ArrowRight size={18} /></Link>
        </div>
        <div className="mt-6 sm:mt-10"><ProductGrid priorityImages={false} products={catalog.docs} /></div>

        <div className="mabd-product-next mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 sm:mt-10 sm:p-5 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-brand">Tiếp tục xem mẫu</p>
            <h3 className="mt-2 font-display text-3xl font-bold leading-none text-slate-950 sm:text-4xl">Chưa thấy mẫu hợp ý? Lướt tiếp theo đúng nhu cầu của đội.</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Người mua thường chọn một mẫu gần đúng trước, rồi chỉnh màu, logo, tên số và form áo sau. Bạn có thể xem toàn bộ kho mẫu hoặc lọc nhanh theo nhóm bên dưới.</p>
          </div>

          <div className="grid gap-3">
            <Link className="mabd-product-next-primary group flex min-h-14 items-center justify-between rounded-xl bg-[#07101e] px-4 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:px-5" href="/san-pham/">
              <span>Xem tất cả {catalog.totalDocs.toLocaleString('vi-VN')} mẫu áo</span>
              <ArrowRight aria-hidden="true" className="shrink-0 transition group-hover:translate-x-1" size={19} />
            </Link>

            <div className="grid gap-2 sm:grid-cols-2" aria-label="Xem mẫu theo danh mục sản phẩm">
              {categories.map((category) => (
                <Link className="group flex min-h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 transition duration-200 hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href={footballCategoryPath(category)} key={category.id}>
                  <span className="min-w-0 truncate">{category.name}</span>
                  <ArrowRight aria-hidden="true" className="shrink-0 transition group-hover:translate-x-1" size={17} />
                </Link>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-3" aria-label="Xem mẫu theo đối tượng đặt áo">
              {audiences.map(({ href, icon: Icon, label }) => (
                <Link className="group flex min-h-12 items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3 text-xs font-black text-slate-900 transition duration-200 hover:border-brand hover:bg-white hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href={href} key={label}>
                  <Icon aria-hidden="true" className="shrink-0 text-brand" size={17} />
                  <span className="min-w-0 leading-4">{label}</span>
                </Link>
              ))}
            </div>

            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-900 transition duration-200 hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand" href={ZALO_URL} rel="noreferrer" target="_blank">Gửi mẫu đang thích để được tư vấn phối lại <ArrowRight aria-hidden="true" size={17} /></a>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-white py-10 sm:py-18">
      <div className="section-shell">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Sản phẩm HOT</p>
            <h2 className="section-title">Chọn mẫu, rồi hoàn thiện phiên bản của đội.</h2>
          </div>
          <Link className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-slate-300 px-4 text-sm font-black hover:border-brand hover:text-brand sm:min-h-12 sm:px-5" href={HOT_FOOTBALL_PATH}>Xem tất cả mẫu hot <ArrowRight size={18} /></Link>
        </div>
        <div className="mt-6 sm:mt-10"><ProductGrid priorityImages={false} products={hotCatalog.docs} /></div>
      </div>
    </section>

    <section className="bg-[#0b1220] text-white"><div className="section-shell grid gap-12 py-16 sm:py-22 lg:grid-cols-[.85fr_1.15fr]"><div><p className="section-kicker text-orange-300">Từ ý tưởng đến ngày ra sân</p><h2 className="section-title text-white">Bốn bước để cả đội mặc đúng tinh thần thi đấu.</h2><p className="mt-5 max-w-xl leading-7 text-slate-400">Gửi mẫu tham khảo, chốt logo và màu sắc. Thiết kế, size và nội dung in được rà soát trước khi bắt đầu sản xuất.</p></div><ol className="grid gap-3 sm:grid-cols-2">{[['01','Gửi ý tưởng','Mẫu tham khảo, logo, tên đội và số lượng cần đặt.'],['02','Duyệt thiết kế','Kiểm tra bố cục, màu áo, tên số và font in.'],['03','Chốt size','Tổng hợp form, size và thời gian cần giao hàng.'],['04','Sản xuất & giao','Hoàn thiện đơn theo nội dung đã được duyệt.']].map(([number,title,text]) => <li className="rounded-2xl border border-white/10 bg-white/[.05] p-6" key={number}><span className="font-display text-4xl font-bold text-brand">{number}</span><h3 className="mt-8 font-display text-3xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></li>)}</ol></div></section>

    {posts.docs.length ? <section className="section-shell py-16 sm:py-22"><div><p className="section-kicker">Góc tư vấn</p><h2 className="section-title">Kinh nghiệm chọn mẫu, vải và quy trình đặt may.</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{posts.docs.map((post) => <article className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6" key={post.id}><Sparkles className="text-brand" /><h3 className="mt-6 font-display text-3xl font-bold leading-[1.05]"><Link href={post.legacyPath}>{post.title}</Link></h3><p className="mt-4 text-sm leading-6 text-slate-600">{excerpt(post.excerpt, 120)}</p><Link className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-brand" href={post.legacyPath}>Đọc bài <ArrowRight size={17} /></Link></article>)}</div></section> : null}
  </>
}
