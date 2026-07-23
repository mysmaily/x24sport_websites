import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Palette,
  Phone,
  Ruler,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import type { WebContent } from '@/lib/cms'
import { DEFAULT_OG_IMAGE, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'

type PageConfig = {
  eyebrow: string
  heroAlt: string
  intro: string
  label: string
  note: string
  points: string[]
  quickLinks: { href: string; label: string }[]
  secondaryCta?: { href: string; label: string }
  title?: string
}

const DEFAULT_CONFIG: PageConfig = {
  eyebrow: 'Góc tư vấn',
  heroAlt: DEFAULT_OG_IMAGE.alt,
  intro: 'Nội dung được biên soạn để giúp đội bóng chọn mẫu áo, phối màu và chuẩn bị thông tin đặt may dễ hơn.',
  label: 'Bài tư vấn',
  note: 'Bạn có thể gửi mẫu đang thích, màu đội, logo và số lượng dự kiến để được tư vấn phương án phù hợp.',
  points: ['Chọn mẫu phù hợp với đội', 'Duyệt màu, logo, tên và số', 'Chốt size trước khi sản xuất'],
  quickLinks: [
    { href: '/san-pham/', label: 'Xem mẫu áo' },
    { href: '/chat-lieu-va-bang-size-ao-bong-ro/', label: 'Chất liệu & size' },
    { href: '/dat-may-ao-bong-ro/', label: 'Quy trình đặt may' },
  ],
}

const PAGE_CONFIGS: Record<string, PageConfig> = {
  '/gioi-thieu/': {
    eyebrow: 'Về May Áo Bóng Rổ',
    heroAlt: 'Đội bóng rổ mặc đồng phục thiết kế riêng trên sân',
    intro: 'Xưởng tư vấn, thiết kế và sản xuất đồng phục bóng rổ cho lớp học, câu lạc bộ, doanh nghiệp và đội thi đấu phong trào.',
    label: 'Thông tin xưởng',
    note: 'Mỗi đơn được xác nhận thiết kế, size, số lượng và chi tiết in trước khi may để đội dễ kiểm tra.',
    points: ['Thiết kế theo nhận diện đội', 'Tư vấn form và chất liệu', 'Duyệt maket trước khi sản xuất'],
    quickLinks: [
      { href: '/mau-da-lam/', label: 'Mẫu đã làm' },
      { href: '/bang-gia-may-ao-bong-ro/', label: 'Bảng giá' },
      { href: '/dat-may-ao-bong-ro/', label: 'Đặt may' },
    ],
    secondaryCta: { href: '/san-pham/', label: 'Xem bộ sưu tập' },
    title: 'Xưởng may áo bóng rổ thiết kế riêng cho đội nhóm',
  },
  '/cac-mau-ao-bong-ro-gradient-duoc-yeu-thich-nhat-cho-clb-va-doi-nhom/': {
    eyebrow: 'Xu hướng phối màu',
    heroAlt: 'Mẫu áo bóng rổ gradient nhiều màu cho đội nhóm',
    intro: 'Gợi ý các hướng phối gradient nổi bật để đội bóng chọn màu áo có chiều sâu, dễ nhận diện và hợp tinh thần thi đấu.',
    label: 'Gradient',
    note: 'Gradient đẹp nhất khi được chỉnh theo màu logo, nền áo và vị trí số áo thay vì sao chép nguyên mẫu.',
    points: ['Chọn gam màu chủ đạo', 'Đặt logo trên vùng dễ đọc', 'Duyệt màu in trên maket'],
    quickLinks: [
      { href: '/san-pham/?q=gradient', label: 'Mẫu gradient' },
      { href: '/logo-team/', label: 'Logo team' },
      { href: '/chat-lieu-va-bang-size-ao-bong-ro/', label: 'Chất liệu in' },
    ],
  },
  '/thiet-ke-ao-bong-ro-cho-team-ceo-1992-dau-an-rieng-tren-moi-cung-duong/': {
    eyebrow: 'Mẫu đã làm',
    heroAlt: 'Áo bóng rổ thiết kế riêng cho đội CEO 1992',
    intro: 'Câu chuyện thiết kế một bộ áo bóng rổ có dấu ấn riêng, phù hợp hoạt động đội nhóm và nhận diện của team.',
    label: 'Case study',
    note: 'Khi đặt áo cho team riêng, hãy chuẩn bị màu chủ đạo, logo, danh sách tên số và mốc thời gian cần nhận.',
    points: ['Giữ nhận diện riêng của team', 'Bố trí tên và số rõ ràng', 'Chọn form dễ vận động'],
    quickLinks: [
      { href: '/mau-da-lam/', label: 'Xem mẫu đã làm' },
      { href: '/dat-may-ao-bong-ro/', label: 'Gửi yêu cầu' },
      { href: '/san-pham/', label: 'Chọn mẫu nền' },
    ],
  },
}

export function LegacyContentPage({ content }: { content: WebContent }) {
  const config = PAGE_CONFIGS[content.legacyPath] ?? DEFAULT_CONFIG
  const title = config.title ?? content.title
  const description = content.excerpt || config.intro

  return (
    <article>
      <section className="overflow-hidden border-b border-slate-200 bg-white">
        <div className="section-shell grid gap-8 py-7 sm:py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-14">
          <div>
            <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-slate-700 hover:text-brand" href="/">
              Trang chủ
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <p className="section-kicker mt-8">{config.eyebrow}</p>
            <h1 className="max-w-5xl font-display text-[2.35rem] font-bold leading-[.98] text-slate-950 sm:text-[3.7rem] lg:text-[4.65rem]">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
                <MessageCircle aria-hidden="true" size={18} />
                Tư vấn qua Zalo
              </a>
              {config.secondaryCta ? (
                <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-950 transition hover:border-brand hover:text-brand" href={config.secondaryCta.href}>
                  {config.secondaryCta.label}
                  <ArrowRight aria-hidden="true" size={18} />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                alt={config.heroAlt}
                className="aspect-[4/3] h-full w-full object-cover"
                height={DEFAULT_OG_IMAGE.height}
                src={DEFAULT_OG_IMAGE.url}
                width={DEFAULT_OG_IMAGE.width}
              />
            </div>
            <div className="grid gap-3 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-wider text-orange-300">{config.label}</p>
              {config.points.map((point) => (
                <p className="flex items-center gap-2 text-sm font-bold" key={point}>
                  <CheckCircle2 aria-hidden="true" className="text-brand" size={17} />
                  {point}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,850px)_minmax(280px,1fr)] lg:items-start">
        <div className="legacy-content prose rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,.06)] sm:p-8 lg:p-10">
          {content.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: content.contentHtml }} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">Nội dung đang được cập nhật.</div>
          )}
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-28">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Sparkles aria-hidden="true" className="text-brand" size={28} />
            <h2 className="mt-5 font-display text-3xl font-bold leading-none text-slate-950">Chuẩn bị đặt áo</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{config.note}</p>
            <a className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" size={18} />
              Gửi thông tin đội
            </a>
            <a className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-black text-slate-950 transition hover:border-brand hover:text-brand" href={`tel:${PHONE_VALUE}`}>
              <Phone aria-hidden="true" size={18} />
              {PHONE_DISPLAY}
            </a>
          </div>

          <nav className="rounded-2xl border border-slate-200 bg-white p-4" aria-label="Liên kết liên quan">
            {config.quickLinks.map((link) => (
              <Link className="flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-black text-slate-800 transition hover:bg-orange-50 hover:text-brand" href={link.href} key={link.href}>
                {link.label}
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            ))}
          </nav>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Palette, label: 'Phối màu' },
              { icon: Ruler, label: 'Chọn size' },
              { icon: BadgeCheck, label: 'Duyệt mẫu' },
            ].map(({ icon: Icon, label }) => (
              <div className="rounded-xl border border-slate-200 bg-white p-3" key={label}>
                <Icon aria-hidden="true" className="mx-auto text-brand" size={20} />
                <p className="mt-2 text-xs font-black text-slate-700">{label}</p>
              </div>
            ))}
          </div>

          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-brand" href="/mau-da-lam/">
            <BookOpen aria-hidden="true" size={18} />
            Xem thêm mẫu đã làm
          </Link>
        </aside>
      </section>
    </article>
  )
}

