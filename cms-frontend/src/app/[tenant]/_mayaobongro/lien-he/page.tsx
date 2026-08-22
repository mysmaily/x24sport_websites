import type { Metadata } from 'next'
import { MessageCircle, Phone, Send, Shirt, Users } from 'lucide-react'
import Link from 'next/link'

import { pageMetadata, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'Liên Hệ Đặt May Áo Bóng Rổ',
  description: 'Liên hệ MayaoBongRo để gửi mẫu tham khảo, màu đội, logo, tên số, số lượng và thời gian cần nhận áo.',
  path: '/lien-he/',
})

export default function MayaoBongRoContactPage() {
  return (
    <article className="section-shell py-12 sm:py-16 lg:py-20">
      <p className="section-kicker">Liên hệ đặt may</p>
      <h1 className="section-title max-w-4xl">Gửi đội hình, màu áo và logo. Chúng tôi cùng bạn chốt hướng thiết kế.</h1>
      <p className="section-lead max-w-3xl">Chia sẻ mẫu đang thích, số lượng, danh sách tên số và ngày cần nhận. Đội tư vấn sẽ giúp bạn làm rõ chất liệu, form áo và bảng size trước khi sản xuất.</p>

      <div className="mt-9 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8" aria-labelledby="basketball-contact-title">
          <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Trao đổi trực tiếp</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-none" id="basketball-contact-title">Chọn cách thuận tiện cho đội bạn.</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a className="flex min-h-28 flex-col justify-between rounded-2xl bg-brand p-5 font-black transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" /><span>Gửi mẫu qua Zalo</span></a>
            <a className="flex min-h-28 flex-col justify-between rounded-2xl border border-white/15 bg-white/[.06] p-5 font-black transition hover:border-orange-300/50" href={`tel:${PHONE_VALUE}`}><Phone aria-hidden="true" /><span>Gọi {PHONE_DISPLAY}</span></a>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8" aria-label="Thông tin nên chuẩn bị">
          <h2 className="font-display text-3xl font-bold leading-none text-slate-950">Chuẩn bị trước khi nhắn</h2>
          <ul className="mt-6 grid gap-4 text-sm leading-6 text-slate-600">
            <li className="flex gap-3"><Users aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={19} /><span>Số lượng thành viên, độ tuổi và ngày cần nhận.</span></li>
            <li className="flex gap-3"><Shirt aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={19} /><span>Mẫu áo, màu đội, logo và danh sách tên số.</span></li>
            <li className="flex gap-3"><Send aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={19} /><span>Địa chỉ giao hàng và người phụ trách chốt đơn.</span></li>
          </ul>
          <Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-brand" href="/dat-may-ao-bong-ro/">Xem quy trình đặt may</Link>
        </aside>
      </div>
    </article>
  )
}
