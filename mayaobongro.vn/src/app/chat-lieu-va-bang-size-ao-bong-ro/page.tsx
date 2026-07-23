import { Check, Layers3, Ruler, Shirt } from 'lucide-react'
import type { Metadata } from 'next'

import { ContactPanel, FabricGrid, PrimaryZaloButton, SecondaryLinkButton, SectionHeading, ServicePageHero, TableScroll } from '@/components/service-page'
import { pageMetadata } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'Chất Liệu & Bảng Size Áo Bóng Rổ',
  description: 'So sánh bốn chất liệu may áo bóng rổ và tra bảng size người lớn, trẻ em theo cân nặng, chiều cao để chọn đồng phục phù hợp cho cả đội.',
  path: '/chat-lieu-va-bang-size-ao-bong-ro/',
})

const adultSizes = [
  ['Cân nặng (kg)', '40 – 53', '53 – 60', '60 – 68', '68 – 74', '74 – 80', '80 – 86', '86 – 120'],
  ['Chiều cao (m)', '1.45 – 1.60', '1.60 – 1.65', '1.65 – 1.70', '1.70 – 1.75', '1.75 – 1.80', '1.80 – 1.85', '1.80 – 1.85'],
]

const childSizes = [
  ['Cân nặng (kg)', '8 – 10', '10 – 15', '15 – 20', '20 – 25', '25 – 30', '30 – 35', '35 – 40'],
  ['Tuổi', '≤ 2 tuổi', '≤ 3 tuổi', '≤ 5 tuổi', '≤ 7 tuổi', '≤ 9 tuổi', '≤ 11 tuổi', '≤ 13 tuổi'],
]

function SizeTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  return (
    <article className="min-w-0">
      <h3 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h3>
      <TableScroll label={title} minWidth="min-w-[900px]">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{title} áo bóng rổ theo thông số cơ thể</caption>
          <thead className="bg-brand text-white">
            <tr>{columns.map((column, index) => <th className={`px-5 py-4 text-center ${index === 0 ? 'sticky left-0 z-20 bg-brand text-left' : ''}`} key={column} scope="col">{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className="border-t border-slate-200" key={row[0]}>
                {row.map((cell, index) => index === 0
                  ? <th className={`sticky left-0 z-10 px-5 py-5 font-black text-slate-950 ${rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}`} key={cell} scope="row">{cell}</th>
                  : <td className={`px-5 py-5 text-center font-bold text-slate-700 ${rowIndex % 2 ? 'bg-slate-50' : 'bg-white'}`} key={`${cell}-${index}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </article>
  )
}

export default function MaterialsAndSizesPage() {
  return (
    <>
      <ServicePageHero
        kicker="Chất liệu & bảng size"
        title="Chất liệu và bảng size áo bóng rổ."
        description="Xem nhanh bề mặt vải, rồi tra size theo cân nặng và chiều cao để chốt danh sách cho cả đội."
        compact
        actions={<><PrimaryZaloButton>Gửi danh sách size</PrimaryZaloButton><span className="hidden sm:contents"><SecondaryLinkButton href="#bang-size">Tra bảng size</SecondaryLinkButton></span></>}
        aside={
          <aside className="hidden rounded-2xl border border-white/15 bg-white/5 p-4 sm:block sm:p-5" aria-label="Ba bước chọn chất liệu và size">
            <p className="flex items-center gap-2 text-sm font-bold text-orange-200"><Ruler aria-hidden="true" size={18} /> Chọn nhanh cho cả đội</p>
            <ol className="mt-4 grid gap-3">
              {[['01', 'Xem bề mặt vải'], ['02', 'Đo chiều cao, cân nặng'], ['03', 'Gửi danh sách size']].map(([number, title]) => <li className="grid grid-cols-[36px_1fr] gap-3" key={number}><span className="font-display text-2xl font-bold text-brand">{number}</span><b className="pt-1 text-sm text-white">{title}</b></li>)}
            </ol>
          </aside>
        }
      />

      <section className="section-shell py-7 sm:py-10">
        <header className="max-w-4xl">
          <p className="section-kicker">Bốn lựa chọn thực tế</p>
          <h2 className="font-display text-3xl font-bold leading-none text-slate-950 sm:text-5xl">Nhìn rõ bề mặt trước khi chọn vải</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Mỗi chất liệu có một ưu điểm riêng. Mở ảnh để xem chi tiết bề mặt, sau đó chọn theo tần suất sử dụng và cảm giác mặc mong muốn.</p>
        </header>
        <FabricGrid compact />
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-22">
        <div className="section-shell">
          <SectionHeading kicker="Gợi ý theo nhu cầu" title="Không cần chọn loại đắt nhất." description="Phương án phù hợp là phương án cân bằng giữa ngân sách, tần suất thi đấu và độ đứng form mà đội mong muốn." />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Shirt, 'Tối ưu chi phí', 'Thun lạnh', 'Dễ mặc, phù hợp lớp học, đội giao hữu hoặc team phong trào.'],
              [Layers3, 'Cân bằng nhất', 'Mè Thái', 'Nhẹ, thoáng và phù hợp đa số nhu cầu vận động của đội.'],
              [Check, 'Ưu tiên đứng form', 'Mè Texa', 'Bề mặt dệt nổi, cảm giác chắc vải và form áo rõ hơn.'],
              [Ruler, 'Ưu tiên thoát nhiệt', 'Mè Lava', 'Bề mặt lưới thể thao, phù hợp đội muốn cảm giác thoáng.'],
            ].map(([Icon, kicker, title, text]) => {
              const ItemIcon = Icon as typeof Shirt
              return <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6" key={String(title)}><ItemIcon aria-hidden="true" className="text-brand" size={23} /><p className="mt-6 text-xs font-black uppercase tracking-wider text-slate-500">{String(kicker)}</p><h3 className="mt-2 font-display text-3xl font-bold text-slate-950">{String(title)}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{String(text)}</p></article>
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 sm:py-22" id="bang-size">
        <div className="section-shell">
          <header className="max-w-4xl text-white"><p className="section-kicker text-orange-300">Bảng size châu Á</p><h2 className="font-display text-5xl font-bold leading-[.95] tracking-tight text-balance sm:text-7xl">Tra theo cân nặng và chiều cao.</h2><p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">Thông số dưới đây là mốc tham khảo. Nếu muốn mặc rộng rãi, thoải mái, có thể chọn tăng 1–2 size và gửi danh sách để được tư vấn lại.</p></header>
          <div className="mt-10 grid gap-10">
            <SizeTable title="Bảng size người lớn" columns={['SIZE', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4, 5, 6XL']} rows={adultSizes} />
            <SizeTable title="Bảng size trẻ em" columns={['SIZE', '1', '3', '5', '7', '9', '11', '13']} rows={childSizes} />
          </div>
          <aside className="mt-8 grid gap-3 rounded-2xl border border-orange-300/20 bg-orange-300/10 p-5 text-sm leading-7 text-orange-50 sm:grid-cols-[auto_1fr] sm:items-start">
            <Ruler aria-hidden="true" className="mt-1 text-orange-300" size={22} />
            <p><b className="text-white">Lưu ý khi chốt size:</b> cân nặng và chiều cao chỉ là mốc tham khảo; form mặc rộng hoặc ôm còn phụ thuộc sở thích. Hãy gửi danh sách size trước khi sản xuất để được kiểm tra lại.</p>
          </aside>
        </div>
      </section>

      <ContactPanel title="Gửi chiều cao, cân nặng và số lượng để kiểm tra danh sách size." description="Nếu đội chưa thống nhất chất liệu, có thể gửi thêm ngân sách dự kiến để được tư vấn cùng lúc." secondaryHref="/bang-gia-may-ao-bong-ro/" secondaryLabel="Xem bảng giá" />
    </>
  )
}
