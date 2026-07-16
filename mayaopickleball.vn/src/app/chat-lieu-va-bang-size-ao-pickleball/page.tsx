import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, Ruler, Shirt, Sparkles, Wind } from 'lucide-react'
import { InfoPage, zaloHref } from '../_components/info-pages'

export const metadata: Metadata = {
  title: 'Chất liệu & bảng size áo pickleball | MayaoPickleball',
  description: 'Tư vấn chất liệu, form áo và cách chọn size khi đặt may áo pickleball cho đội nhóm, CLB, trường lớp.',
}

const fabrics = [
  {
    icon: Wind,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-df5dd085-3f31-4f81-9121-3ddabb8822ee.png',
    title: 'Mè lava',
    text: 'Bề mặt lưới thoáng, nhẹ, hợp áo pickleball cần thoát hơi nhanh khi vận động liên tục.',
    tags: ['Thoáng khí', 'Nhanh khô', 'Nhẹ áo'],
  },
  {
    icon: Shirt,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-0efda5f5-7efe-4a75-8a16-14fb44009dd7.png',
    title: 'Mè nano',
    text: 'Mắt vải mịn, mặc êm và giữ bề mặt gọn, phù hợp đồng phục CLB cần cảm giác nhẹ.',
    tags: ['Mịn mặt', 'Êm da', 'Dễ mặc'],
  },
  {
    icon: Sparkles,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-c937b825-1046-4a3e-a37d-2a4dd1551f4d.png',
    title: 'Mè zennix',
    text: 'Chất vải mềm, bề mặt đều, hỗ trợ lên màu thiết kế và in chuyển nhiệt sắc nét.',
    tags: ['Lên màu đẹp', 'Mềm', 'Giữ form'],
  },
  {
    icon: BadgeCheck,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-eea74471-ee2d-4cce-9e41-0db6a6f25ae2.png',
    title: 'Mè thái',
    text: 'Kiểu vải thể thao phổ biến, bề mặt thoáng và ổn định cho đơn đội số lượng nhiều.',
    tags: ['Bền', 'Dễ đồng bộ', 'Thể thao'],
  },
] as const

const sizeSteps = [
  'Gửi chiều cao và cân nặng của từng thành viên.',
  'Cho biết mong muốn mặc gọn, vừa người hay rộng thoải mái.',
  'Đối chiếu bảng size với đúng kiểu áo trước khi sản xuất.',
  'Gửi danh sách tên, số áo và size theo từng người để hạn chế nhầm lẫn.',
] as const

const sizeColumns = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4,5,6XL'] as const

const menRows = [
  { label: 'Cân nặng (kg)', values: ['45 - 53', '53 - 60', '60 - 68', '68 - 74', '74 - 80', '80 - 86', '86 - 120'] },
  { label: 'Chiều cao (m)', values: ['1.45 - 1.60', '1.60 - 1.65', '1.65 - 1.70', '1.70 - 1.75', '1.75 - 1.80', '1.80 - 1.85', '1.80 - 1.85'] },
  { label: 'Chiều rộng đo ở chân ngực', values: ['46 cm', '48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm'] },
  { label: 'Chiều dài áo', values: ['62 cm', '64 cm', '66 cm', '68 cm', '70 cm', '72 cm', '72 cm'] },
] as const

const womenRows = [
  { label: 'Cân nặng (kg)', values: ['40 - 45', '45 - 50', '50 - 55', '55 - 60', '60 - 65', '65 - 70', '70 - 100'] },
  { label: 'Chiều cao (m)', values: ['1.50 - 1.55', '1.55 - 1.60', '1.57 - 1.62', '1.60 - 1.65', '1.62 - 1.68', '1.64 - 1.70', '1.64 - 1.70'] },
  { label: 'Chiều rộng đo ở chân ngực', values: ['42 cm', '44 cm', '46 cm', '48 cm', '50 cm', '52 cm', '54 cm'] },
  { label: 'Chiều dài áo', values: ['56 cm', '58 cm', '60 cm', '62 cm', '64 cm', '66 cm', '66 cm'] },
] as const

const kidsColumns = ['1', '3', '5', '7', '9', '11', '13'] as const

const kidsRows = [
  { label: 'Cân nặng (kg)', values: ['8 - 10', '10 - 15', '15 - 20', '20 - 25', '25 - 30', '30 - 35', '35 - 40'] },
  { label: 'Tuổi', values: ['<= 2 tuổi', '<= 3 tuổi', '<= 5 tuổi', '<= 7 tuổi', '<= 9 tuổi', '<= 11 tuổi', '<= 13 tuổi'] },
] as const

function SizeTable({
  accent = 'blue',
  columns,
  rows,
  title,
}: {
  accent?: 'blue' | 'red'
  columns: readonly string[]
  rows: ReadonlyArray<{ label: string; values: readonly string[] }>
  title: string
}) {
  return (
    <section className={`html-size-block ${accent === 'red' ? 'is-red' : ''}`}>
      <h3>{title}</h3>
      <div className="html-size-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Size</th>
              {columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.label}-${columns[index]}`}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function FabricSizePage() {
  return (
    <InfoPage
      description="Chọn đúng chất liệu và kích thước giúp đồng phục thoải mái khi vận động, đồng thời giữ được form áo đồng đều cho cả đội."
      image={fabrics[0].image}
      kicker="Chất liệu & bảng size"
      stats={[
        { value: '4 loại', label: 'vải thể thao' },
        { value: '3 bảng', label: 'nam, nữ, trẻ em' },
        { value: 'miễn phí', label: 'rà size trước khi may' },
      ]}
      title="Chọn vải và size áo pickleball để cả đội mặc thoải mái"
    >
      <section className="info-section fabric-detail-section">
        <div className="info-section-heading">
          <h2>Chất liệu áo pickleball</h2>
          <p>Bấm vào từng ảnh để xem rõ bề mặt vải. Các lựa chọn dưới đây đều phù hợp áo pickleball đặt may cho CLB, đội phong trào và trường lớp.</p>
        </div>
        <div className="fabric-card-grid">
          {fabrics.map(({ icon: Icon, image, tags, title, text }) => (
            <article className="fabric-card" key={title}>
              <a className="fabric-card-media" href={image} target="_blank" rel="noreferrer">
                <img alt={`Chất liệu ${title} áo pickleball X24 Sports`} src={image} />
              </a>
              <Icon size={26} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="fabric-tag-row">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section size-guide-section">
        <div className="size-guide-copy">
          <Ruler size={32} strokeWidth={1.6} />
          <h2>Cách chọn size cho đội</h2>
          <ol>
            {sizeSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>Lưu ý: form và thông số có thể khác theo kiểu áo. Hãy xác nhận bảng size của đúng mẫu trước khi chốt đơn.</p>
        </div>
        <div className="html-size-panel" aria-label="Bảng size áo pickleball">
          <div className="html-size-title">
            <h2>Hướng dẫn chọn size</h2>
            <p>(Bảng size Châu Á)</p>
          </div>
          <SizeTable title="Bảng size nam" columns={sizeColumns} rows={menRows} />
          <SizeTable title="Bảng size nữ" columns={sizeColumns} rows={womenRows} accent="red" />
          <SizeTable title="Bảng size trẻ em" columns={kidsColumns} rows={kidsRows} />
        </div>
      </section>

      <section className="info-section design-free-band">
        <div>
          <h2>Gửi danh sách size qua Zalo</h2>
          <p>Nếu đội có nhiều thể trạng khác nhau, gửi danh sách theo tên từng người để được rà lại trước khi sản xuất.</p>
        </div>
        <a className="primary-button" href={zaloHref}>
          Gửi danh sách size <ArrowRight size={18} />
        </a>
      </section>
    </InfoPage>
  )
}
