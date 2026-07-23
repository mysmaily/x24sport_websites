import {
  BadgeCheck,
  ClipboardList,
  MessageCircle,
  Palette,
  Ruler,
  Scissors,
  Send,
  Shirt,
  Timer,
  Truck,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactPanel, PrimaryZaloButton, SecondaryLinkButton, ServicePageHero } from '@/components/service-page'
import { pageMetadata, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'Đặt May Áo Bóng Rổ',
  description: 'Quy trình đặt may áo bóng rổ theo yêu cầu: gửi thông tin đội, chọn mẫu và chất liệu, duyệt thiết kế, chốt size, sản xuất và giao hàng.',
  path: '/dat-may-ao-bong-ro/',
})

const orderSteps = [
  {
    icon: ClipboardList,
    title: 'Gửi đội hình',
    eyebrow: 'Thông tin đầu vào',
    text: 'Số lượng, độ tuổi, nam/nữ, ngày cần nhận, khu vực giao và mẫu áo đội đang thích.',
    detail: 'Có thể gửi ảnh mẫu, màu áo NBA yêu thích hoặc link sản phẩm trên website.',
  },
  {
    icon: Palette,
    title: 'Chọn hướng thiết kế',
    eyebrow: 'Màu, logo, phong cách',
    text: 'Chốt màu chủ đạo, logo, tên đội, kiểu phối và các chi tiết muốn giữ hoặc tránh.',
    detail: 'Nếu chưa có ý tưởng, đội tư vấn sẽ gợi ý theo màu nhận diện và mục đích thi đấu.',
  },
  {
    icon: Ruler,
    title: 'Khớp size',
    eyebrow: 'Form mặc thực tế',
    text: 'Gửi chiều cao, cân nặng hoặc danh sách size để kiểm tra lại trước khi may hàng loạt.',
    detail: 'Ưu tiên form bóng rổ rộng rãi, dễ vận động và phù hợp học sinh, câu lạc bộ hoặc giải đấu.',
  },
  {
    icon: BadgeCheck,
    title: 'Duyệt maket',
    eyebrow: 'Điểm khóa đơn',
    text: 'Xem lại bố cục logo, tên số, màu phối, chất liệu và số lượng trước khi xác nhận.',
    detail: 'Đây là bước quan trọng để cả đội thống nhất thiết kế trước khi chuyển sang sản xuất.',
  },
  {
    icon: Scissors,
    title: 'Sản xuất',
    eyebrow: 'May và in theo mẫu',
    text: 'Tiến hành may/in theo maket đã duyệt, danh sách size và phương án chất liệu đã chốt.',
    detail: 'Các thay đổi lớn sau bước này cần kiểm tra lại khả năng xử lý theo tiến độ thực tế.',
  },
  {
    icon: Truck,
    title: 'Giao cho đội',
    eyebrow: 'Nhận hàng',
    text: 'Bàn giao theo thông tin nhận hàng, giúp đội có đủ áo trước lịch tập, giải hoặc sự kiện.',
    detail: 'Nên đặt sớm hơn ngày cần mặc để có thời gian kiểm tra và phân size cho từng thành viên.',
  },
]

const prepItems = [
  ['Số lượng', 'Áo lẻ hay áo + quần, số bộ dự kiến và có cần may bổ sung sau không.'],
  ['Nhận diện', 'Logo đội, màu chủ đạo, tên đội, slogan hoặc mẫu phối muốn tham khảo.'],
  ['Tên số', 'Danh sách tên cầu thủ, số áo, ghi chú viết hoa và ký tự đặc biệt nếu có.'],
  ['Size', 'Chiều cao, cân nặng hoặc size dự kiến của từng người trong đội.'],
  ['Thời gian', 'Ngày cần nhận, địa chỉ giao và mốc giải đấu hoặc sự kiện quan trọng.'],
  ['Ngân sách', 'Khoảng giá mong muốn để tư vấn chất liệu và phương án in phù hợp.'],
]

const quickChoices = [
  { icon: Shirt, title: 'Đội lớp, trường học', text: 'Ưu tiên dễ mặc, dễ chia size, màu nổi bật khi chụp ảnh tập thể.' },
  { icon: Users, title: 'Câu lạc bộ', text: 'Cân bằng giữa nhận diện riêng, độ bền và cảm giác thi đấu thường xuyên.' },
  { icon: Timer, title: 'Giải đấu gấp', text: 'Chốt nhanh thông tin bắt buộc: số lượng, size, maket và ngày cần nhận.' },
]

const approvalChecks = [
  'Logo đúng phiên bản và đặt ở vị trí mong muốn.',
  'Tên cầu thủ, số áo và chính tả đã được cả đội kiểm tra.',
  'Màu phối phù hợp với ảnh mẫu hoặc nhận diện đội.',
  'Danh sách size không thiếu người và không trùng ghi chú.',
  'Ngày nhận hàng, người nhận và số điện thoại liên hệ đã rõ.',
]

export default function OrderPage() {
  return (
    <>
      <ServicePageHero
        kicker="Đặt may theo đội"
        title="Biến ý tưởng áo bóng rổ thành đơn hàng rõ từng bước."
        description="Không cần phóng to ảnh quy trình nữa. Trang này gom toàn bộ thứ đội bạn cần chuẩn bị, điểm cần duyệt và cách chốt đơn thành một lộ trình dễ đọc trên điện thoại."
        compact
        actions={
          <>
            <PrimaryZaloButton>Gửi yêu cầu qua Zalo</PrimaryZaloButton>
            <SecondaryLinkButton href="#quy-trinh">Xem quy trình</SecondaryLinkButton>
          </>
        }
        aside={
          <aside className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-2xl shadow-black/20" aria-label="Tóm tắt đặt may áo bóng rổ">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-200">Bảng chốt nhanh</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                ['5+', 'bộ nhận may'],
                ['6', 'bước rõ ràng'],
                ['1', 'maket cần duyệt'],
              ].map(([value, label]) => (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3" key={label}>
                  <strong className="block font-display text-3xl font-bold leading-none text-white">{value}</strong>
                  <span className="mt-1 block text-[11px] font-bold leading-4 text-slate-400">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-white p-4 text-slate-950">
              <p className="font-display text-2xl font-bold leading-none">Chuẩn bị tốt, duyệt nhanh hơn.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Gửi đủ logo, màu, size và deadline giúp đội tư vấn báo hướng may sát hơn ngay từ lần đầu.</p>
            </div>
          </aside>
        }
      />

      <section className="border-b border-slate-200 bg-white py-7 sm:py-10">
        <div className="section-shell grid gap-4 md:grid-cols-3">
          {quickChoices.map((item) => {
            const Icon = item.icon
            return (
              <article className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5" key={item.title}>
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand text-white">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold leading-none text-slate-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="bg-slate-950 py-12 text-white sm:py-16 lg:py-20" id="quy-trinh">
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:items-start">
            <header className="lg:sticky lg:top-28">
              <p className="section-kicker text-orange-300">Quy trình HTML responsive</p>
              <h2 className="font-display text-5xl font-bold leading-[.92] text-balance sm:text-7xl">Sáu pha bóng để chốt một bộ áo.</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">Mỗi bước là một điểm kiểm tra thực tế. Trên điện thoại, bạn có thể đọc như checklist; trên desktop, toàn bộ quy trình mở ra như một bảng chiến thuật trước trận.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
                  <MessageCircle aria-hidden="true" size={18} /> Gửi thông tin đội
                </a>
                <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10" href={`tel:${PHONE_VALUE}`}>
                  Gọi {PHONE_DISPLAY}
                </a>
              </div>
            </header>

            <ol className="relative grid gap-4 before:absolute before:left-6 before:top-8 before:hidden before:h-[calc(100%-4rem)] before:w-px before:bg-white/15 sm:before:block lg:grid-cols-2 lg:before:hidden">
              {orderSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <li className="relative rounded-2xl border border-white/10 bg-white/[.06] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-orange-300/40 hover:bg-white/[.09] sm:pl-20 lg:p-6" key={step.title}>
                    <div className="mb-5 flex items-center gap-3 sm:absolute sm:left-5 sm:top-5 sm:mb-0 sm:block lg:static lg:mb-5 lg:flex">
                      <span className="grid size-12 place-items-center rounded-xl bg-brand text-white ring-8 ring-slate-950">
                        <Icon aria-hidden="true" size={22} />
                      </span>
                      <span className="font-display text-4xl font-bold leading-none text-orange-200">0{index + 1}</span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-orange-200">{step.eyebrow}</p>
                    <h3 className="mt-2 font-display text-3xl font-bold leading-none text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
                    <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">{step.detail}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="section-shell py-12 sm:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.55fr)] lg:items-start">
          <div>
            <p className="section-kicker">Chuẩn bị trước khi nhắn</p>
            <h2 className="section-title">Gửi càng rõ, đội càng nhanh có hướng may đúng.</h2>
            <p className="section-lead">Bạn không cần có đủ mọi thứ ngay lập tức. Nhưng nếu đã có các thông tin dưới đây, cuộc trao đổi qua Zalo sẽ gọn hơn rất nhiều.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {prepItems.map(([title, text]) => (
                <article className="rounded-2xl border border-slate-200 bg-white p-5" key={title}>
                  <h3 className="font-display text-3xl font-bold leading-none text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white lg:sticky lg:top-28" aria-label="Checklist duyệt maket">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Trước khi sản xuất</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-none">Checklist duyệt maket</h2>
            <ul className="mt-6 grid gap-3">
              {approvalChecks.map((item) => (
                <li className="flex gap-3 rounded-xl border border-white/10 bg-white/[.06] p-4 text-sm leading-6 text-slate-200" key={item}>
                  <BadgeCheck aria-hidden="true" className="mt-0.5 shrink-0 text-orange-300" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-12 sm:py-16">
        <div className="section-shell grid gap-6 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] lg:items-center">
          <div>
            <p className="section-kicker">Bước tiếp theo</p>
            <h2 className="section-title">Nếu chưa có mẫu, bắt đầu bằng một màu áo.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {['Chọn màu đội thích', 'Gửi logo hoặc tên đội', 'Nhắn ngày cần nhận'].map((item, index) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5" key={item}>
                <span className="font-display text-4xl font-bold text-brand">0{index + 1}</span>
                <p className="mt-4 text-sm font-black leading-6 text-slate-950">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactPanel
        title="Gửi logo, màu đội và số lượng. Chúng tôi cùng bạn chốt hướng áo phù hợp."
        description="Đội tư vấn sẽ đối chiếu mẫu, chất liệu, size và deadline để đưa ra phương án rõ ràng trước khi sản xuất."
        secondaryHref="/bang-gia-may-ao-bong-ro/"
        secondaryLabel="Xem bảng giá"
      />

      <section className="section-shell pb-14 sm:pb-18">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-slate-600">Muốn xem mẫu trước khi nhắn? Duyệt thư viện áo bóng rổ rồi gửi link mẫu bạn thích qua Zalo.</p>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-brand" href="/san-pham/">
            Xem mẫu áo <Send aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}
