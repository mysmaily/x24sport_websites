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
  ['5 áo', '200.000đ', '240.000đ', '280.000đ', '320.000đ'],
  ['6 - 20 áo', '180.000đ', '220.000đ', '260.000đ', '299.000đ'],
  ['21 - 50 áo', '159.000đ', '199.000đ', '245.000đ', '275.000đ'],
  ['51 - 100 áo', '145.000đ', '185.000đ', '220.000đ', '250.000đ'],
  ['101 - 500 áo', '135.000đ', '175.000đ', '210.000đ', '240.000đ'],
] as const

const notes = [
  ['Thiết kế miễn phí', 'Lên concept, phối màu, logo đội chạy, tên giải hoặc tên doanh nghiệp trước khi sản xuất.'],
  ['In ấn miễn phí', 'In chuyển nhiệt sắc nét mọi vị trí trên áo, không giới hạn màu sắc và kích thước logo.'],
  ['Giao hàng miễn phí', 'Vận chuyển toàn quốc, đúng hẹn. Bảng giá đã bao gồm VAT và phí giao hàng.'],
] as const

export default function RunningPricingPage() {
  return <>
    <section className="bg-[#0b1220] text-white">
      <div className="section-shell py-5">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400" aria-label="Đường dẫn">
          <Link className="min-h-11 content-center transition hover:text-white" href="/">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-200">Bảng giá</span>
        </nav>
      </div>
      <div className="section-shell grid gap-6 pb-10 pt-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)] lg:items-end lg:gap-8">
        <div>
          <p className="section-kicker text-orange-300">Bảng giá may áo chạy bộ</p>
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-none text-balance sm:text-5xl lg:text-6xl">Bảng giá may áo chạy bộ.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Giá tham khảo theo số lượng và chất vải cho đội chạy, câu lạc bộ, doanh nghiệp hoặc giải chạy. Gửi mẫu và deadline để được báo giá sát hơn.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">Nhận báo giá qua Zalo <ArrowRight size={18} /></a>
            <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10" href="/san-pham/">Xem mẫu áo</Link>
          </div>
        </div>
        <aside className="hidden rounded-2xl border border-white/15 bg-white/5 p-5 sm:block" aria-label="Tóm tắt bảng giá">
          <p className="flex items-center gap-2 text-sm font-bold text-orange-200"><CircleDollarSign aria-hidden="true" size={18} /> Giá tham khảo từ</p>
          <strong className="mt-2 block font-display text-6xl font-bold leading-none text-white">135.000đ</strong>
          <span className="mt-1 block text-sm text-slate-300">mỗi áo · đơn 101 - 500 áo</span>
        </aside>
      </div>
    </section>

    <section className="section-shell py-10 sm:py-14" id="bang-gia">
      <header className="max-w-4xl">
        <h2 className="font-display text-3xl font-bold leading-none text-slate-950 sm:text-5xl">Bảng giá theo chất liệu và số lượng</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Giá đã bao gồm thiết kế, in ấn, vận chuyển và VAT. Các chi tiết như tên cá nhân, logo nhà tài trợ hoặc tiến độ gấp sẽ được tư vấn trước khi chốt đơn.</p>
      </header>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm" role="region" aria-label="Bảng giá may áo chạy bộ" tabIndex={0}>
        <table className="min-w-[820px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">Giá áo chạy bộ theo số lượng và chất liệu</caption>
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="sticky left-0 z-20 w-36 bg-slate-950 px-5 py-5" scope="col">Số lượng</th>
              <th className="px-5 py-5" scope="col">Basic</th>
              <th className="bg-brand px-5 py-5" scope="col">Coolmax</th>
              <th className="px-5 py-5" scope="col">Dryfit</th>
              <th className="px-5 py-5" scope="col">Runair</th>
            </tr>
          </thead>
          <tbody>
            {priceRows.map((row, rowIndex) => {
              const isBestValue = rowIndex === 2 // "21 - 50 áo" — sweet spot for club orders
              return (
              <tr className={`border-t border-slate-200 transition ${isBestValue ? 'bg-amber-50/60' : ''}`} key={row[0]}>
                <th className={`sticky left-0 z-10 px-5 py-5 font-black text-slate-950 ${isBestValue ? 'bg-amber-50/60' : rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}`} scope="row">
                  {row[0]}
                  {isBestValue && <span className="ml-2 inline-block rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white align-middle">Phổ biến</span>}
                </th>
                {row.slice(1).map((price, index) => <td className={`px-5 py-5 ${index === 1 ? 'bg-orange-50' : ''}`} key={price}><strong className="text-base text-slate-950">{price}</strong><span className="text-xs text-slate-500">/áo</span></td>)}
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map(([title, text]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={title}><Check aria-hidden="true" className="text-brand" size={20} /><h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p></article>)}
      </div>
    </section>
  </>
}
