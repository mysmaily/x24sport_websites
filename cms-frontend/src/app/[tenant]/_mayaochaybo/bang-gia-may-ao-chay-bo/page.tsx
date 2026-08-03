import { ArrowRight, Check, CircleDollarSign } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { pageMetadata, ZALO_URL } from '../lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'Bảng giá may áo chạy bộ | May Áo Chạy Bộ',
  description: 'Bảng giá tham khảo khi đặt may áo chạy bộ cho đội nhóm, câu lạc bộ, doanh nghiệp và giải chạy.',
  path: '/bang-gia-may-ao-chay-bo/',
})

const priceRows = [
  ['5 - 9 áo', '145.000đ', '189.000đ', '219.000đ', '260.000đ'],
  ['10 - 50 áo', '125.000đ', '169.000đ', '199.000đ', '240.000đ'],
  ['50 - 100 áo', '115.000đ', '159.000đ', '189.000đ', '230.000đ'],
  ['Trên 100 áo', '105.000đ', '139.000đ', '169.000đ', '210.000đ'],
] as const

const notes = [
  ['Form theo nhu cầu', 'Áo có tay, sát nách hoặc singlet được tư vấn theo mục đích tập luyện, race day hay sự kiện.'],
  ['Thiết kế theo nhận diện', 'Phối màu, logo đội chạy, tên giải hoặc tên doanh nghiệp trước khi sản xuất.'],
  ['Gom size đội', 'Hỗ trợ chuẩn bị danh sách size để đơn hàng mặc đồng bộ và dễ bổ sung.'],
  ['VAT & vận chuyển', 'Bảng giá tham khảo đã bao gồm VAT và phí giao hàng toàn quốc.'],
] as const

export default function RunningPricingPage() {
  return <>
    <section className="bg-[#0b1220] text-white">
      <div className="section-shell py-3">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400" aria-label="Đường dẫn">
          <Link className="min-h-9 content-center transition hover:text-white" href="/">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-200">Bảng giá</span>
        </nav>
      </div>
      <div className="section-shell grid gap-5 pb-7 pt-1 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-7">
        <div>
          <p className="section-kicker text-orange-300">Bảng giá may áo chạy bộ</p>
          <h1 className="max-w-3xl font-display text-[38px] font-bold leading-[.98] text-balance sm:text-[48px] lg:text-[58px]">Bảng giá may áo chạy bộ</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-[15px]">Giá tham khảo theo số lượng và chất vải cho đội chạy, câu lạc bộ, doanh nghiệp hoặc giải chạy. Gửi mẫu và deadline để báo giá sát hơn.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">Báo giá qua Zalo <ArrowRight size={17} /></a>
            <Link className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10" href="/san-pham/">Xem mẫu áo</Link>
          </div>
        </div>
        <aside className="rounded-xl border border-white/15 bg-white/[.06] p-4" aria-label="Tóm tắt bảng giá">
          <p className="flex items-center gap-2 text-sm font-bold text-orange-200"><CircleDollarSign aria-hidden="true" size={18} /> Giá tham khảo từ</p>
          <strong className="mt-2 block font-display text-[38px] font-bold leading-none text-white sm:text-[46px]">105.000đ</strong>
          <span className="mt-1 block text-sm text-slate-300">mỗi áo · đơn trên 100 áo</span>
        </aside>
      </div>
    </section>

    <section className="section-shell py-8 sm:py-12" id="bang-gia">
      <header className="max-w-4xl">
        <p className="section-kicker">So sánh trực tiếp</p>
        <h2 className="font-display text-3xl font-bold leading-[1.02] text-slate-950 sm:text-5xl">Bảng giá theo chất liệu và số lượng</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Giá đã bao gồm thiết kế, in ấn, vận chuyển và VAT. Các chi tiết như tên cá nhân, logo nhà tài trợ hoặc tiến độ gấp sẽ được tư vấn trước khi chốt đơn.</p>
      </header>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm" role="region" aria-label="Bảng giá may áo chạy bộ" tabIndex={0}>
        <table className="min-w-[820px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">Giá áo chạy bộ theo số lượng và chất liệu</caption>
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="sticky left-0 z-20 w-36 bg-slate-950 px-5 py-5" scope="col">Số lượng</th>
              <th className="px-5 py-5" scope="col">Mè Thái</th>
              <th className="bg-brand px-5 py-5" scope="col">Mè Zennix</th>
              <th className="px-5 py-5" scope="col">Mè Nano</th>
              <th className="px-5 py-5" scope="col">Mè Lava</th>
            </tr>
          </thead>
          <tbody>
            {priceRows.map((row, rowIndex) => (
              <tr className="border-t border-slate-200" key={row[0]}>
                <th className={`sticky left-0 z-10 px-5 py-5 font-black text-slate-950 ${rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}`} scope="row">{row[0]}</th>
                {row.slice(1).map((price, index) => <td className={`px-5 py-5 ${index === 1 ? 'bg-orange-50' : rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}`} key={price}><strong className="text-base text-slate-950">{price}</strong><span className="text-xs text-slate-500">/áo</span></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {notes.map(([title, text]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={title}><Check aria-hidden="true" className="text-brand" size={21} /><h3 className="mt-5 font-display text-2xl font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
      </div>
    </section>
  </>
}
