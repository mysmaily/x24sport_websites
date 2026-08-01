import { ArrowUpRight, Check, CircleDollarSign, Phone } from 'lucide-react'
import type { Metadata } from 'next'

import { HeaderSearch } from '../_components/header-search'

export const metadata: Metadata = {
  title: 'Bảng giá may áo bóng chuyền | MayaoBongChuyen',
  description: 'Bảng giá tham khảo khi đặt may áo bóng chuyền theo số lượng, chất liệu, tên số, logo và nhu cầu thiết kế riêng.',
  alternates: { canonical: '/bang-gia-may-ao-bong-chuyen/' },
  openGraph: {
    title: 'Bảng giá may áo bóng chuyền | MayaoBongChuyen',
    description: 'Bảng giá tham khảo khi đặt may áo bóng chuyền theo số lượng, chất liệu, tên số, logo và nhu cầu thiết kế riêng.',
    images: [{ url: '/images/mayaobongchuyen/volleyball-team-hero.png', width: 1672, height: 941, alt: 'Đội bóng chuyền mặc đồng phục đặt may MayaoBongChuyen' }],
    type: 'website',
    url: '/bang-gia-may-ao-bong-chuyen/',
  },
}

const priceRows = [
  ['5 - 9 bộ', '145.000đ', '189.000đ', '219.000đ', '260.000đ'],
  ['10 - 50 bộ', '125.000đ', '169.000đ', '199.000đ', '240.000đ'],
  ['50 - 100 bộ', '115.000đ', '159.000đ', '189.000đ', '230.000đ'],
  ['Trên 100 bộ', '105.000đ', '139.000đ', '169.000đ', '210.000đ'],
] as const

const included = [
  ['Thiết kế', 'Hỗ trợ lên mẫu theo màu đội, logo, tên số và vị trí libero nếu cần.'],
  ['In ấn', 'Bao gồm tên số cơ bản theo danh sách đội gửi trước khi sản xuất.'],
  ['Áo + quần', 'Bảng giá tính theo bộ. Không lấy quần giảm 20.000đ/bộ.'],
  ['VAT & vận chuyển', 'Giá tham khảo đã bao gồm VAT và phí giao hàng toàn quốc.'],
] as const

export default function VolleyballPricingPage() {
  return (
    <main>
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b-[3px] border-[var(--accent)] bg-[#080909] px-4 shadow-[0_10px_28px_rgba(0,0,0,.22)] md:h-[82px] md:px-[clamp(20px,5vw,92px)]">
        <a className="flex min-w-0 items-center gap-3 uppercase md:min-w-[330px]" href="/">
          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--accent),#911410)] text-[13px] font-black text-white shadow-[14px_0_0_-7px_rgba(238,43,36,.32)] md:h-11 md:w-11">VB</span>
          <span className="inline-flex flex-col justify-center leading-[0.92]">
            <strong className="text-base font-black italic text-white md:text-[clamp(16px,1.25vw,22px)]">MAYAOBONGCHUYEN</strong>
            <small className="hidden text-[13px] font-black tracking-[0.08em] text-[var(--accent)] md:block">.VN</small>
          </span>
        </a>
        <nav className="hidden items-center gap-[clamp(14px,1.55vw,26px)] text-[12.5px] font-black uppercase tracking-[0.02em] text-[#b9b9b9] lg:flex">
          {[
            ['/', 'Trang chủ'],
            ['/ao-bong-chuyen', 'Áo bóng chuyền'],
            ['/dat-may-theo-yeu-cau', 'Đặt may'],
            ['/bang-gia-may-ao-bong-chuyen/', 'Bảng giá'],
            ['/chat-lieu-size', 'Chất liệu & Size'],
            ['/lien-he', 'Liên hệ'],
          ].map(([href, label]) => <a className="whitespace-nowrap hover:text-[var(--ink)]" href={href} key={href}>{label}</a>)}
        </nav>
        <div className="flex min-w-0 items-center justify-end gap-2.5 md:min-w-[210px] md:gap-4">
          <a className="inline-flex items-center gap-2.5 whitespace-nowrap text-sm font-extrabold text-[#c7c7c7]" href="tel:0989353247">
            <Phone size={17} />
            <span className="hidden md:inline">0989.353.247</span>
          </a>
          <HeaderSearch />
        </div>
      </header>

      <section className="border-b border-[var(--line)] px-[clamp(20px,5vw,76px)] py-[clamp(42px,7vw,90px)]">
        <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Bảng giá may áo bóng chuyền</p>
        <h1 className="max-w-[980px] text-[clamp(42px,6vw,88px)] font-black leading-[0.9]">Bảng giá may áo bóng chuyền.</h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-[1.7] text-[var(--muted)]">Giá tham khảo theo chất vải và số lượng đặt may. Gửi mẫu, logo, danh sách tên số và ngày cần nhận để được tư vấn chính xác hơn.</p>
        <a className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black text-white" href="/lien-he">
          Nhận báo giá <ArrowUpRight size={18} />
        </a>
      </section>

      <section className="px-[clamp(20px,5vw,76px)] py-[58px]" id="bang-gia">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">So sánh trực tiếp</p>
            <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Bảng giá theo chất liệu và số lượng</h2>
          </div>
          <aside className="border border-[var(--line)] bg-white/6 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]"><CircleDollarSign size={18} /> Giá từ</p>
            <strong className="mt-2 block text-[42px] leading-none">105.000đ</strong>
            <span className="text-sm text-[var(--muted)]">mỗi bộ · đơn trên 100 bộ</span>
          </aside>
        </div>
        <div className="overflow-x-auto border border-[var(--line)] bg-white/6" role="region" aria-label="Bảng giá may áo bóng chuyền" tabIndex={0}>
          <table className="min-w-[820px] w-full border-collapse text-left text-sm">
            <caption className="sr-only">Giá mỗi bộ đồng phục bóng chuyền theo số lượng và chất liệu</caption>
            <thead className="bg-[#05070c] text-white">
              <tr>
                <th className="sticky left-0 z-20 w-36 bg-[#05070c] px-5 py-5" scope="col">Số lượng</th>
                <th className="px-5 py-5" scope="col">Mè Thái</th>
                <th className="bg-[var(--accent)] px-5 py-5" scope="col">Mè Zennix</th>
                <th className="px-5 py-5" scope="col">Mè Nano</th>
                <th className="px-5 py-5" scope="col">Mè Lava</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((row, rowIndex) => (
                <tr className="border-t border-[var(--line)]" key={row[0]}>
                  <th className={`sticky left-0 z-10 px-5 py-5 font-black ${rowIndex % 2 ? 'bg-[#111827]' : 'bg-[#080b12]'}`} scope="row">{row[0]}</th>
                  {row.slice(1).map((price, index) => <td className={`px-5 py-5 ${index === 1 ? 'bg-[rgba(238,43,36,.16)]' : rowIndex % 2 ? 'bg-white/4' : ''}`} key={price}><strong className="text-base text-[var(--ink)]">{price}</strong><span className="text-xs text-[var(--muted)]">/bộ</span></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]"><b className="text-[var(--ink)]">Lưu ý:</b> Giá đã bao gồm thiết kế, in ấn, vận chuyển và VAT. Chi tiết phát sinh sẽ được báo trước khi chốt đơn.</p>
      </section>

      <section className="grid grid-cols-1 gap-px border-y border-[var(--line)] px-[clamp(20px,5vw,76px)] md:grid-cols-4">
        {included.map(([title, text]) => (
          <article className="min-h-[210px] bg-white/5 p-7" key={title}>
            <Check className="text-[var(--accent)]" size={24} />
            <h2 className="my-[18px] text-[28px] leading-[1.05]">{title}</h2>
            <p className="leading-[1.6] text-[var(--muted)]">{text}</p>
          </article>
        ))}
      </section>

      <footer className="border-t border-[var(--line)] bg-[#05070c] px-[clamp(20px,5vw,76px)] py-[58px]">
        <p className="font-black uppercase text-[var(--accent)]">Custom volleyball teamwear</p>
        <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Gửi mẫu và số lượng để nhận báo giá sát hơn.</h2>
        <a className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black text-white" href="/lien-he">
          Gọi tư vấn
        </a>
      </footer>
    </main>
  )
}
