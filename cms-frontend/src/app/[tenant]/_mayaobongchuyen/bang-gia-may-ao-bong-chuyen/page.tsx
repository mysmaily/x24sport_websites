import { ArrowUpRight, Check, CircleDollarSign } from 'lucide-react'
import type { Metadata } from 'next'

import { SiteHeader } from '../_components/site-header'
import { SiteFooter } from '../_components/site-footer'
import { fallbackNavigation } from '../lib/content'

export const metadata: Metadata = {
  title: 'Bảng giá may áo bóng chuyền | MayaoBongChuyen',
  description: 'Bảng giá tham khảo khi đặt may áo bóng chuyền theo số lượng, chất liệu, tên số, logo và nhu cầu thiết kế riêng.',
  alternates: { canonical: '/bang-gia-may-ao-bong-chuyen/' },
  openGraph: {
    title: 'Bảng giá may áo bóng chuyền | MayaoBongChuyen',
    description: 'Bảng giá tham khảo khi đặt may áo bóng chuyền theo số lượng, chất liệu, tên số, logo và nhu cầu thiết kế riêng.',
    images: [{ url: '/images/mayaobongchuyen/images/volleyball-team-hero.png', width: 1672, height: 941, alt: 'Đội bóng chuyền mặc đồng phục đặt may MayaoBongChuyen' }],
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

export default async function VolleyballPricingPage() {
  return (
    <main>
      <SiteHeader legacyNavigation={fallbackNavigation} />

      <section className="border-b border-[var(--line)] px-[clamp(20px,5vw,76px)] py-[clamp(42px,7vw,90px)]">
        <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Bảng giá may áo bóng chuyền</p>
        <h1 className="max-w-[980px] text-[clamp(42px,6vw,88px)] font-black leading-[0.9]">Bảng giá may áo bóng chuyền.</h1>
        <p className="mt-5 max-w-[720px] text-[19px] leading-[1.7] text-[var(--muted)]">Giá tham khảo theo chất vải và số lượng đặt may. Gửi mẫu, logo, danh sách tên số và ngày cần nhận để được tư vấn chính xác hơn.</p>
        <a className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black text-white" href="/lien-he/">
          Nhận báo giá <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      </section>

      <section className="px-[clamp(20px,5vw,76px)] py-[58px]" id="bang-gia">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">So sánh trực tiếp</p>
            <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Bảng giá theo chất liệu và số lượng</h2>
          </div>
          <aside className="border border-[var(--line)] bg-white/6 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]"><CircleDollarSign aria-hidden="true" size={18} /> Giá từ</p>
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
            <Check aria-hidden="true" className="text-[var(--accent)]" size={24} />
            <h2 className="my-[18px] text-[28px] leading-[1.05]">{title}</h2>
            <p className="leading-[1.6] text-[var(--muted)]">{text}</p>
          </article>
        ))}
      </section>

      <SiteFooter />
    </main>
  )
}
