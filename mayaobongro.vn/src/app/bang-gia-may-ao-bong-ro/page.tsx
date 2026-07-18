import { Check, CircleDollarSign } from 'lucide-react'
import type { Metadata } from 'next'

import { ContactPanel, FabricGrid, PrimaryZaloButton, SecondaryLinkButton, SectionHeading, ServicePageHero, TableScroll } from '@/components/service-page'

export const metadata: Metadata = {
  title: 'Bảng Giá May Áo Bóng Rổ',
  description: 'Bảng giá tham khảo đồng phục bóng rổ áo và quần theo chất liệu, số lượng; kèm chi phí in logo, hướng dẫn chọn vải và quy trình nhận báo giá.',
  alternates: { canonical: '/bang-gia-may-ao-bong-ro/' },
}

const priceRows = [
  ['5 – 9 bộ', '179.000đ', '200.000đ', '235.000đ', '300.000đ'],
  ['10 – 25 bộ', '169.000đ', '190.000đ', '225.000đ', '280.000đ'],
  ['26 – 50 bộ', '159.000đ', '180.000đ', '215.000đ', '255.000đ'],
  ['51 – 100 bộ', '149.000đ', '170.000đ', '205.000đ', '240.000đ'],
]

const included = [
  ['Thiết kế', 'Hỗ trợ lên mockup theo màu đội, logo và phong cách thi đấu.'],
  ['In tên số', 'Miễn phí theo danh sách đội gửi, áp dụng cho nội dung cá nhân hóa cơ bản.'],
  ['Vận chuyển & VAT', 'Bảng giá hiện tại đã bao gồm phí ship và thuế VAT.'],
  ['Chỉ lấy áo', 'Nếu không lấy quần, giá giảm 20.000đ trên mỗi bộ.'],
]

const process = [
  ['Gửi yêu cầu', 'Số lượng, chất liệu mong muốn, logo đội, màu chủ đạo, tên số và deadline.'],
  ['Chốt chất liệu', 'Đối chiếu bảng giá, xem ảnh vải và chọn phương án hợp ngân sách.'],
  ['Lên thiết kế', 'Thiết kế mockup áo bóng rổ theo form, màu và nhận diện của đội.'],
  ['Sản xuất', 'Chốt danh sách size, tên số, thanh toán và sản xuất theo lịch hẹn.'],
]

const faqs = [
  ['Đặt 5 bộ có nhận may không?', 'Có. Bảng giá bắt đầu từ 5 bộ, phù hợp nhóm nhỏ, đội 3×3 hoặc team cần may bổ sung.'],
  ['Giá đã bao gồm những gì?', 'Giá đã bao gồm thiết kế, in ấn, vận chuyển và thuế VAT. Logo thêu cộng 20.000đ/logo; logo in PET cộng 15.000đ/logo.'],
  ['Nên chọn vải nào nếu chưa biết?', 'Mè Thái là lựa chọn cân bằng để bắt đầu. Nếu cần tối ưu chi phí chọn Thun lạnh; nếu muốn đứng form hơn chọn Mè Texa hoặc Mè Lava.'],
  ['Cần gửi gì để báo giá nhanh?', 'Gửi số lượng, mẫu thích, logo, màu áo, danh sách tên số, size và ngày cần nhận hàng qua Zalo.'],
]

export default function PricePage() {
  return (
    <>
      <ServicePageHero
        kicker="Bảng giá may theo yêu cầu"
        title="Chi phí rõ ràng cho từng lựa chọn vải."
        description="Bảng giá tham khảo cho đồng phục bóng rổ áo + quần, nhận may từ 5 bộ. So sánh trực tiếp theo số lượng và chất liệu trước khi gửi mẫu để nhận báo giá sát nhu cầu."
        actions={<><PrimaryZaloButton>Nhận báo giá qua Zalo</PrimaryZaloButton><SecondaryLinkButton href="#bang-gia">Xem bảng giá</SecondaryLinkButton></>}
        aside={
          <aside className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8" aria-label="Tóm tắt bảng giá">
            <p className="flex items-center gap-2 text-sm font-bold text-orange-200"><CircleDollarSign aria-hidden="true" size={19} /> Giá tham khảo từ</p>
            <strong className="mt-3 block font-display text-6xl font-bold leading-none text-white sm:text-7xl">149.000đ</strong>
            <span className="mt-2 block text-sm text-slate-300">mỗi bộ · Thun lạnh · 51–100 bộ</span>
            <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-sm">
              <div><dt className="text-xs text-slate-400">Tối thiểu</dt><dd className="mt-1 font-black">5 bộ</dd></div>
              <div><dt className="text-xs text-slate-400">Bao gồm</dt><dd className="mt-1 font-black">Áo + quần</dd></div>
              <div><dt className="text-xs text-slate-400">Thiết kế</dt><dd className="mt-1 font-black">Miễn phí</dd></div>
            </dl>
          </aside>
        }
      />

      <section className="section-shell py-16 sm:py-22" id="bang-gia">
        <SectionHeading kicker="So sánh trực tiếp" title="Bảng giá theo chất liệu và số lượng" description="Giá đã bao gồm thiết kế, in ấn, vận chuyển và thuế VAT. Nếu chỉ lấy áo, giá giảm 20.000đ/bộ." />
        <div className="mt-9">
          <TableScroll label="Bảng giá may áo bóng rổ">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Giá mỗi bộ đồng phục bóng rổ theo số lượng và chất liệu</caption>
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="sticky left-0 z-20 w-36 bg-slate-950 px-5 py-5" scope="col">Số lượng</th>
                  <th className="px-5 py-5" scope="col"><b className="block text-base">Thun lạnh</b><span className="mt-1 block text-xs font-medium text-slate-400">Giá tốt, dễ mặc</span></th>
                  <th className="bg-brand px-5 py-5" scope="col"><b className="block text-base">Mè Thái</b><span className="mt-1 block text-xs font-medium text-orange-100">Cân bằng, thoáng nhẹ</span></th>
                  <th className="px-5 py-5" scope="col"><b className="block text-base">Mè Texa</b><span className="mt-1 block text-xs font-medium text-slate-400">Chắc vải, đứng form</span></th>
                  <th className="px-5 py-5" scope="col"><b className="block text-base">Mè Lava</b><span className="mt-1 block text-xs font-medium text-slate-400">Lưới thoáng</span></th>
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
          </TableScroll>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600"><b className="text-slate-950">Chi phí logo riêng:</b> logo thêu cộng 20.000đ/logo; logo in PET cộng 15.000đ/logo.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {included.map(([title, text]) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-5" key={title}>
              <Check aria-hidden="true" className="text-brand" size={21} />
              <h3 className="mt-5 font-display text-2xl font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-22">
        <div className="section-shell">
          <SectionHeading kicker="Chọn theo nhu cầu" title="Chất vải quyết định cảm giác mặc." description="Bắt đầu từ ngân sách, tần suất sử dụng và độ đứng form mong muốn. Có thể mở ảnh để xem rõ bề mặt từng loại vải." />
          <FabricGrid compact />
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white sm:py-22">
        <div className="section-shell">
          <header className="max-w-4xl"><p className="section-kicker text-orange-300">Từ yêu cầu đến sản xuất</p><h2 className="font-display text-5xl font-bold leading-[.95] tracking-tight text-balance sm:text-7xl">Bốn bước để nhận đúng báo giá.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">Gửi đủ thông tin ngay từ đầu giúp hạn chế chỉnh sửa nhiều vòng và chốt phương án nhanh hơn.</p></header>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {process.map(([title, text], index) => (
              <li className="bg-slate-950 p-6 sm:p-8" key={title}><span className="font-display text-5xl font-bold text-brand">0{index + 1}</span><h3 className="mt-8 font-display text-3xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-shell py-16 sm:py-22">
        <SectionHeading kicker="Giải đáp trước khi đặt" title="Những điều đội bóng thường hỏi." description="Các khoản chính được trình bày trước để bạn dễ dự trù ngân sách và chuẩn bị thông tin." />
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer], index) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7" key={question}><span className="text-xs font-black text-brand">0{index + 1}</span><h3 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-950">{question}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p></article>
          ))}
        </div>
      </section>

      <ContactPanel title="Gửi mẫu, số lượng và ngày cần nhận để có báo giá sát nhất." description="Đội ngũ tư vấn sẽ cùng bạn đối chiếu chất liệu, bảng size và phương án in phù hợp." secondaryHref="/chat-lieu-va-bang-size-ao-bong-ro/" secondaryLabel="Xem vải & size" />
    </>
  )
}
