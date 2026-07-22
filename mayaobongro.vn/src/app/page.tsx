import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Layers3,
  Palette,
  Ruler,
  Shirt,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { LegacyHomeBanner } from '@/components/legacy-home-banner'
import { ProductGrid } from '@/components/product-grid'
import { BASKETBALL_AUDIENCES } from '@/lib/basketball-audiences'
import { getLatestPosts, getProducts } from '@/lib/cms'
import { excerpt, SITE_URL, ZALO_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'May Áo Bóng Rổ Thiết Kế Riêng',
  description: 'Khám phá mẫu đồng phục bóng rổ và gửi yêu cầu thiết kế riêng cho đội, câu lạc bộ hoặc trường học.',
  alternates: { canonical: '/' },
}

const trustItems = [
  { icon: Palette, title: 'Thiết kế theo màu đội', text: 'Điều chỉnh phối màu, logo, tên và số trước khi sản xuất.' },
  { icon: Ruler, title: 'Hỗ trợ chọn size', text: 'Tư vấn form và size theo danh sách thành viên của đội.' },
  { icon: BadgeCheck, title: 'Duyệt maket trước', text: 'Kiểm tra bố cục nhận diện trước khi xác nhận đặt may.' },
  { icon: Truck, title: 'Giao hàng toàn quốc', text: 'Phù hợp lớp học, câu lạc bộ và đội thi đấu ở nhiều tỉnh thành.' },
] as const

const buyerPaths = [
  { icon: Users, audience: BASKETBALL_AUDIENCES[0] },
  { icon: Shirt, audience: BASKETBALL_AUDIENCES[1] },
  { icon: Layers3, audience: BASKETBALL_AUDIENCES[2] },
  { icon: BadgeCheck, audience: BASKETBALL_AUDIENCES[3] },
] as const

const process = [
  { number: '01', title: 'Gửi mẫu và yêu cầu', text: 'Chia sẻ mẫu thích, màu đội, logo, số lượng và thời gian cần nhận.' },
  { number: '02', title: 'Duyệt thiết kế', text: 'Rà soát phối màu, vị trí logo, tên và số trên maket trước khi may.' },
  { number: '03', title: 'Chốt size & sản xuất', text: 'Xác nhận danh sách size, chất liệu và các thông tin cuối cùng.' },
  { number: '04', title: 'Bàn giao cho đội', text: 'Đóng gói theo thông tin đã chốt và giao đến địa chỉ nhận hàng.' },
] as const

export default async function HomePage() {
  const [catalog, posts] = await Promise.all([
    getProducts({ limit: 8, categorySlug: 'bo-quan-ao-bong-ro' }),
    getLatestPosts(3),
  ])

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'OnlineStore', name: 'May Áo Bóng Rổ', url: SITE_URL, telephone: '+84989353247' }} />
      <LegacyHomeBanner />

      <section className="border-b border-slate-200 bg-white" aria-label="Cam kết dịch vụ">
        <div className="section-shell grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article className="flex gap-4 py-6 md:px-5 first:pl-0 last:pr-0" key={title}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Icon aria-hidden="true" size={22} strokeWidth={1.8} /></span>
              <div><h2 className="text-sm font-black text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell py-16 sm:py-22">
        <div className="max-w-3xl">
          <p className="section-kicker">Bắt đầu đúng nhu cầu</p>
          <h2 className="section-title">Bạn đang đặt áo cho đội nào?</h2>
          <p className="section-lead">Chọn tình huống gần nhất để xem mẫu và thông tin cần chuẩn bị. Không cần biết sẵn mọi chi tiết trước khi trao đổi.</p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {buyerPaths.map(({ icon: Icon, audience }) => (
            <Link className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_20px_55px_rgba(15,23,42,.08)]" href={audience.path} key={audience.slug}>
              <span className="grid size-12 place-items-center rounded-xl bg-slate-950 text-white transition group-hover:bg-brand"><Icon aria-hidden="true" size={24} /></span>
              <h3 className="mt-8 font-display text-3xl font-bold tracking-tight text-slate-950">{audience.shortTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{audience.description}</p>
              <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-black text-brand">Khám phá <ArrowRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-22">
        <div className="section-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="section-kicker">Bộ sưu tập mới cập nhật</p>
              <h2 className="section-title">Chọn một mẫu làm điểm bắt đầu.</h2>
              <p className="section-lead">Mỗi mẫu có thể trao đổi lại màu sắc, logo, tên và số theo nhu cầu thực tế của đội.</p>
            </div>
            <Link className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-950 transition hover:border-brand hover:text-brand" href="/san-pham/">Xem {catalog.totalDocs.toLocaleString('vi-VN')} mẫu <ArrowRight size={18} /></Link>
          </div>
          <div className="mt-10"><ProductGrid products={catalog.docs} /></div>
        </div>
      </section>

      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="section-shell grid gap-10 py-16 sm:py-22 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="section-kicker text-orange-300">Quy trình đặt may</p>
            <h2 className="section-title text-white">Rõ từng bước, dễ kiểm tra trước khi sản xuất.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">Khách hàng cần biết mình phải gửi gì, sẽ duyệt gì và khi nào đơn hàng được xác nhận. Quy trình được trình bày ngắn gọn để cả đội dễ phối hợp.</p>
            <a className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">Gửi yêu cầu tư vấn <ArrowRight size={18} /></a>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {process.map((step) => (
              <li className="rounded-2xl border border-white/10 bg-white/[.055] p-6" key={step.number}>
                <span className="font-display text-4xl font-bold text-brand">{step.number}</span>
                <h3 className="mt-8 font-display text-3xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-shell py-16 sm:py-22">
        <div className="grid overflow-hidden rounded-3xl bg-orange-50 lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <p className="section-kicker">Một bộ áo tốt bắt đầu từ thông tin đúng</p>
            <h2 className="section-title">Đẹp trên ảnh là chưa đủ. Đội cần mặc vừa và nhận đúng chi tiết.</h2>
            <p className="section-lead">Trước khi đặt, hãy chuẩn bị màu chủ đạo, logo, danh sách tên số, size dự kiến và mốc thời gian cần nhận.</p>
            <ul className="mt-7 grid gap-3 text-sm font-bold text-slate-800 sm:grid-cols-2">
              {['Màu và logo của đội', 'Danh sách tên, số áo', 'Số lượng và size dự kiến', 'Ngày cần nhận hàng'].map((item) => <li className="flex items-center gap-2" key={item}><Sparkles className="text-brand" size={17} /> {item}</li>)}
            </ul>
          </div>
          <div className="relative min-h-80 bg-slate-950 p-7 text-white sm:p-10 lg:min-h-full lg:p-12">
            <Clock3 className="text-brand" size={42} strokeWidth={1.5} />
            <p className="mt-12 text-sm font-bold text-orange-200">Cần hỗ trợ chuẩn bị?</p>
            <h3 className="mt-3 font-display text-4xl font-bold leading-none sm:text-5xl">Gửi mẫu bạn thích. Phần còn lại cùng trao đổi.</h3>
            <a className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-orange-50" href={ZALO_URL} rel="noreferrer" target="_blank">Trao đổi qua Zalo <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      {posts.docs.length ? (
        <section className="border-t border-slate-200 bg-white py-16 sm:py-22">
          <div className="section-shell">
            <div className="max-w-3xl"><p className="section-kicker">Góc tư vấn</p><h2 className="section-title">Đọc trước khi chốt đơn.</h2></div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {posts.docs.map((post) => (
                <article className="flex min-h-72 flex-col rounded-2xl border border-slate-200 p-6" key={post.id}>
                  <p className="text-xs font-black uppercase tracking-wider text-brand">{post.kind === 'post' ? 'Tư vấn' : 'Thông tin'}</p>
                  <h3 className="mt-5 font-display text-3xl font-bold leading-[1.05] tracking-tight text-slate-950"><Link href={post.legacyPath}>{post.title}</Link></h3>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{excerpt(post.excerpt, 120)}</p>
                  <Link className="mt-auto inline-flex min-h-11 items-end gap-2 pt-6 text-sm font-black text-brand" href={post.legacyPath}>Đọc bài <ArrowRight size={17} /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
