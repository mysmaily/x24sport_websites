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
  {
    material: 'Thun lạnh',
    notes: ['Vải giá rẻ, co giãn vừa đủ', 'Vải bền, mặt vải khá kín, thoáng khí bị hạn chế'],
    price: '125k',
  },
  {
    material: 'Mè Thái',
    notes: ['Vải giá rẻ, co giãn vừa đủ', 'Vải mỏng, thấm hút mồ hôi và thoáng khí tốt'],
    price: '145k',
  },
  {
    material: 'Mè sọc mịn',
    notes: ['Vải giá tầm trung, co giãn tốt', 'Chất vải mỏng - mềm, thấm hút tốt, nhanh khô'],
    price: '160k',
  },
  {
    material: 'Mè Nano',
    notes: ['Vải cao cấp, co giãn tốt', 'Chất vải mỏng nhẹ, thoáng khí tốt, nhanh khô'],
    price: '199k',
  },
  {
    material: 'Mè Luxury',
    notes: ['Vải cao cấp, co giãn tốt', 'Chất vải mỏng nhẹ, bền, nhanh khô, thoáng khí và thấm hút tốt'],
    price: '245k',
  },
] as const

const included = [
  ['Miễn phí in ấn', 'In ấn lên áo không giới hạn theo danh sách tên, số và chi tiết đội gửi.'],
  ['Thiết kế mẫu', 'Thiết kế mẫu, logo theo yêu cầu trước khi sản xuất.'],
  ['Vận chuyển', 'Miễn phí vận chuyển toàn quốc cho đơn hàng đủ điều kiện.'],
] as const

const extras = [
  'Quần được may bằng chất liệu vải thể thao chuyên dụng.',
  'Nếu màu quần không có trong bảng màu, chi phí phát sinh thêm là 20k/quần.',
  'Logo quần: in Pet +5k, thêu +10k.',
  'Áo cổ trụ +10k.',
] as const

const shortColors = [
  '#1c7587',
  '#8b949e',
  '#126eb4',
  '#08a856',
  '#970029',
  '#73afd5',
  '#f6bed1',
  '#e91b2c',
  '#11263f',
  '#d8a85c',
  '#f46d39',
  '#67267f',
  '#050505',
  '#ffd313',
  '#f6f2c7',
  '#ee4e9b',
  '#12aeb4',
  '#2ba9d6',
  '#ffffff',
  '#8ac735',
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
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-none text-balance sm:text-5xl lg:text-6xl">Bảng giá may áo bóng đá</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Bảng giá chi tiết theo chất liệu vải, áp dụng với đơn từ 10 bộ trở lên. Giá đã bao gồm thiết kế, in ấn, vận chuyển và VAT.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-black text-white transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">Nhận báo giá qua Zalo <ArrowRight size={18} /></a>
            <Link className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 text-sm font-black text-white transition hover:border-white/40 hover:bg-white/10" href="/san-pham/">Xem mẫu áo</Link>
          </div>
        </div>
        <aside className="hidden rounded-2xl border border-white/15 bg-white/5 p-5 sm:block" aria-label="Tóm tắt bảng giá">
          <p className="flex items-center gap-2 text-sm font-bold text-orange-200"><CircleDollarSign aria-hidden="true" size={18} /> Giá tham khảo từ</p>
          <strong className="mt-2 block font-display text-6xl font-bold leading-none text-white">125k</strong>
          <span className="mt-1 block text-sm text-slate-300">mỗi bộ · đơn từ 10 bộ trở lên</span>
        </aside>
      </div>
    </section>

    <section className="section-shell py-10 sm:py-14" id="bang-gia">
      <header className="max-w-4xl">
        <p className="section-kicker">Bảng giá chi tiết - chất liệu vải</p>
        <h2 className="font-display text-3xl font-bold leading-none text-slate-950 sm:text-5xl">Áp dụng với đơn từ 10 bộ trở lên</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Giá trên đã bao gồm phí VAT 8%, thiết kế mẫu, in ấn lên áo và vận chuyển toàn quốc.</p>
      </header>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Giá mỗi bộ đồng phục bóng đá theo chất liệu vải cho đơn từ 10 bộ trở lên</caption>
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="bg-brand px-5 py-4 font-display text-2xl font-bold" scope="col">Chất liệu vải</th>
                <th className="w-32 bg-slate-950 px-5 py-4 text-center font-display text-2xl font-bold" scope="col">Đơn giá</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((row, rowIndex) => (
                <tr className={rowIndex % 2 ? 'bg-white' : 'bg-slate-100'} key={row.material}>
                  <th className="px-5 py-5 align-top" scope="row">
                    <strong className="block font-display text-2xl font-bold uppercase leading-none text-brand">{row.material}</strong>
                    <span className="mt-3 grid gap-1 text-sm font-medium leading-6 text-slate-700">
                      {row.notes.map((note) => <span key={note}>- {note}</span>)}
                    </span>
                  </th>
                  <td className="border-l border-slate-300 px-5 py-5 text-center align-middle">
                    <strong className="font-display text-4xl font-bold leading-none text-brand">{row.price}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="grid gap-4">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <h3 className="bg-slate-950 px-5 py-4 font-display text-2xl font-bold text-white">Miễn phí</h3>
            <ul className="grid gap-3 p-5 text-base leading-7 text-slate-900">
              {included.map(([title, text]) => (
                <li className="flex gap-3" key={title}>
                  <Check aria-hidden="true" className="mt-1 shrink-0 text-brand" size={18} />
                  <span><strong>{title}:</strong> {text}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <h3 className="bg-slate-950 px-5 py-4 font-display text-2xl font-bold text-white">Khác</h3>
            <ul className="grid gap-3 p-5 text-base leading-7 text-slate-900">
              {extras.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </section>
        </aside>
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="sr-only">Bảng màu quần tham khảo</p>
        <div className="flex flex-wrap justify-center gap-2">
          {shortColors.map((color, index) => (
            <span
              aria-label={`Màu quần ${index + 1}`}
              className="grid size-12 place-items-center rounded-b-2xl rounded-t-md border border-slate-200 font-display text-lg font-bold text-white shadow-sm"
              key={`${color}-${index}`}
              style={{
                backgroundColor: color,
                color: color === '#ffffff' || color === '#ffd313' || color === '#f6f2c7' ? '#64748b' : '#ffffff',
              }}
            >
              9
            </span>
          ))}
        </div>
      </div>
      <p className="mt-8 font-display text-3xl font-bold uppercase leading-none text-brand">Lưu ý: Giá trên đã bao gồm phí VAT 8%</p>
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
