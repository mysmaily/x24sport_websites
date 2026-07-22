import { ArrowRight, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'

import { PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'

export function SiteFooter() {
  return (
    <>
      <section className="bg-brand text-white">
        <div className="section-shell flex flex-col gap-7 py-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-orange-100">Đội bạn đã có ý tưởng?</p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[.95] tracking-tight text-balance sm:text-6xl">Gửi logo, màu đội và số lượng. Chúng tôi cùng bạn chốt hướng áo phù hợp.</h2>
          </div>
          <a className="inline-flex min-h-13 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-white px-6 text-sm font-black text-brand transition hover:-translate-y-0.5 hover:bg-orange-50" href={ZALO_URL} rel="noreferrer" target="_blank">Nhận tư vấn <ArrowRight size={18} /></a>
        </div>
      </section>

      <footer className="bg-slate-950 pb-24 text-slate-300 lg:pb-0">
        <div className="section-shell grid gap-10 py-12 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <img alt="May Áo Bóng Rổ" className="h-11 w-auto" height="44" src="https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/may-ao-bong-ro-logo.svg" width="287" />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">Đồng phục bóng rổ thiết kế theo màu đội, logo, tên số cho lớp học, câu lạc bộ và đội thi đấu.</p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">Khám phá</h3>
            <nav className="grid gap-3 text-sm" aria-label="Liên kết chân trang">
              <Link className="hover:text-white" href="/san-pham/">Mẫu áo bóng rổ</Link>
              <Link className="hover:text-white" href="/mau-da-lam/">Mẫu đã làm</Link>
              <Link className="hover:text-white" href="/dat-may-ao-bong-ro/">Quy trình đặt may</Link>
              <Link className="hover:text-white" href="/bang-gia-may-ao-bong-ro/">Bảng giá</Link>
              <Link className="hover:text-white" href="/chat-lieu-va-bang-size-ao-bong-ro/">Chất liệu & bảng size</Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">Liên hệ</h3>
            <div className="grid gap-3 text-sm">
              <a className="inline-flex items-center gap-2 hover:text-white" href={`tel:${PHONE_VALUE}`}><Phone size={16} /> {PHONE_DISPLAY}</a>
              <a className="inline-flex items-center gap-2 hover:text-white" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={16} /> Zalo tư vấn</a>
              <p className="text-slate-500">Thời gian tư vấn: 08:00–17:00</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} MayAoBongRo.vn · X24 Sport</div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-slate-200 bg-white p-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(15,23,42,.12)] lg:hidden" aria-label="Liên hệ nhanh">
        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-l-lg bg-slate-950 px-3 text-sm font-black text-white" href={`tel:${PHONE_VALUE}`}><Phone size={17} /> Gọi ngay</a>
        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-r-lg bg-brand px-3 text-sm font-black text-white" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={17} /> Nhận báo giá</a>
      </div>
    </>
  )
}
