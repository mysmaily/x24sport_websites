import { ArrowRight, Check, CircleDollarSign } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ZALO_URL } from '../lib/site'

export const metadata: Metadata = {
  title: 'Bảng giá may áo bóng đá | May Áo Bóng Đá',
  description: 'Bảng giá tham khảo khi đặt may áo bóng đá theo số lượng, chất liệu, tên số, logo và nhu cầu thiết kế riêng.',
  alternates: { canonical: '/bang-gia-may-ao-bong-da/' },
}

const priceRows = [
  ['5 - 9 bộ', '145.000đ', '189.000đ', '219.000đ', '260.000đ'],
  ['10 - 50 bộ', '125.000đ', '169.000đ', '199.000đ', '240.000đ'],
  ['50 - 100 bộ', '115.000đ', '159.000đ', '189.000đ', '230.000đ'],
  ['Trên 100 bộ', '105.000đ', '139.000đ', '169.000đ', '210.000đ'],
] as const

const included = [
  ['Thiết kế', 'Hỗ trợ lên maket theo màu đội, logo, tên đội và phong cách thi đấu.'],
  ['In tên số', 'Bao gồm tên số cơ bản theo danh sách đội gửi trước khi sản xuất.'],
  ['Áo + quần', 'Bảng giá tính theo bộ đồng phục bóng đá. Không lấy quần giảm 20.000đ/bộ.'],
  ['VAT & vận chuyển', 'Giá tham khảo đã bao gồm VAT và phí giao hàng toàn quốc.'],
] as const

const process = [
  ['Gửi số lượng', 'Cho biết số bộ, deadline, mẫu thích, logo và màu chủ đạo.'],
  ['Chọn chất liệu', 'Đối chiếu ngân sách với chất vải để chọn phương án phù hợp.'],
  ['Duyệt maket', 'Kiểm tra bố cục áo, tên số, logo và chi tiết in trước khi may.'],
  ['Sản xuất', 'Chốt size đội hình, thanh toán và hoàn thiện theo lịch hẹn.'],
] as const

export default function FootballPricingPage() {
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
          <p className="section-kicker text-orange-300">Bảng giá may theo đội</p>
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-none text-balance sm:text-5xl lg:text-6xl">Bảng giá may áo bóng đá.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Xem nhanh giá áo bóng đá theo số lượng và chất vải. Giá thực tế có thể thay đổi theo mẫu thiết kế, tiến độ và chi tiết in riêng.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">Nhận báo giá qua Zalo <ArrowRight size={18} /></a>
            <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10" href="/san-pham/">Xem mẫu áo</Link>
          </div>
        </div>
        <aside className="hidden rounded-2xl border border-white/15 bg-white/5 p-5 sm:block" aria-label="Tóm tắt bảng giá">
          <p className="flex items-center gap-2 text-sm font-bold text-orange-200"><CircleDollarSign aria-hidden="true" size={18} /> Giá tham khảo từ</p>
          <strong className="mt-2 block font-display text-6xl font-bold leading-none text-white">105.000đ</strong>
          <span className="mt-1 block text-sm text-slate-300">mỗi bộ · đơn trên 100 bộ</span>
        </aside>
      </div>
    </section>

    <section className="section-shell py-10 sm:py-14" id="bang-gia">
      <header className="max-w-4xl">
        <p className="section-kicker">So sánh trực tiếp</p>
        <h2 className="font-display text-3xl font-bold leading-none text-slate-950 sm:text-5xl">Bảng giá theo chất liệu và số lượng</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Giá đã bao gồm thiết kế, in ấn, vận chuyển và VAT. Nếu chỉ lấy áo, giá giảm 20.000đ/bộ.</p>
      </header>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm" role="region" aria-label="Bảng giá may áo bóng đá" tabIndex={0}>
        <table className="min-w-[820px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">Giá mỗi bộ đồng phục bóng đá theo số lượng và chất liệu</caption>
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
                {row.slice(1).map((price, index) => <td className={`px-5 py-5 ${index === 1 ? 'bg-orange-50' : rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}`} key={price}><strong className="text-base text-slate-950">{price}</strong><span className="text-xs text-slate-500">/bộ</span></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {included.map(([title, text]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={title}><Check aria-hidden="true" className="text-brand" size={21} /><h3 className="mt-5 font-display text-2xl font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
      </div>
    </section>

    <section className="bg-slate-950 py-16 text-white sm:py-20">
      <div className="section-shell">
        <header className="max-w-4xl"><p className="section-kicker text-orange-300">Từ yêu cầu đến sản xuất</p><h2 className="font-display text-5xl font-bold leading-[.95] tracking-tight text-balance sm:text-7xl">Bốn bước để nhận báo giá sát hơn.</h2></header>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {process.map(([title, text], index) => <li className="bg-slate-950 p-6 sm:p-8" key={title}><span className="font-display text-5xl font-bold text-brand">0{index + 1}</span><h3 className="mt-8 font-display text-3xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{text}</p></li>)}
        </ol>
      </div>
    </section>
  </>
}
