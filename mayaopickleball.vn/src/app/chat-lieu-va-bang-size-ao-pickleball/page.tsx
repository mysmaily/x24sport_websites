import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, ClipboardCheck, Ruler, Shirt, Sparkles, Wind } from 'lucide-react'
import { JsonLd } from '../_components/json-ld'
import { InfoPage, zaloHref } from '../_components/info-pages'
import { breadcrumbJsonLd, pageMetadata } from '../../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Chất liệu & bảng size áo pickleball | MayaoPickleball',
  description: 'Hướng dẫn chọn chất vải, form mặc và bảng size áo pickleball nam, nữ, trẻ em khi đặt may cho CLB, đội nhóm.',
  path: '/chat-lieu-va-bang-size-ao-pickleball',
})

const fabrics = [
  {
    icon: Wind,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-df5dd085-3f31-4f81-9121-3ddabb8822ee.png',
    title: 'Mè lava',
    text: 'Bề mặt lưới thoáng, nhẹ, hợp áo pickleball cần thoát hơi nhanh khi vận động liên tục.',
    bestFor: 'Đội chơi thường xuyên, ưu tiên cảm giác mát và nhẹ.',
    tags: ['Thoáng khí', 'Nhanh khô', 'Nhẹ áo'],
  },
  {
    icon: Shirt,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-0efda5f5-7efe-4a75-8a16-14fb44009dd7.png',
    title: 'Mè nano',
    text: 'Mắt vải mịn, mặc êm và giữ bề mặt gọn, phù hợp đồng phục CLB cần cảm giác nhẹ.',
    bestFor: 'Đội muốn áo mặc êm, bề mặt tinh gọn khi in tên số.',
    tags: ['Mịn mặt', 'Êm da', 'Dễ mặc'],
  },
  {
    icon: Sparkles,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-c937b825-1046-4a3e-a37d-2a4dd1551f4d.png',
    title: 'Mè zennix',
    text: 'Chất vải mềm, bề mặt đều, hỗ trợ lên màu thiết kế và in chuyển nhiệt sắc nét.',
    bestFor: 'Mẫu áo nhiều mảng màu, logo và chi tiết cần rõ nét.',
    tags: ['Lên màu đẹp', 'Mềm', 'Giữ form'],
  },
  {
    icon: BadgeCheck,
    image: 'https://static.x24sport.vn/mayaocaulong/codex-clipboard-eea74471-ee2d-4cce-9e41-0db6a6f25ae2.png',
    title: 'Mè thái',
    text: 'Kiểu vải thể thao phổ biến, bề mặt thoáng và ổn định cho đơn đội số lượng nhiều.',
    bestFor: 'Đơn đồng phục số lượng lớn cần phương án dễ mặc, dễ đồng bộ.',
    tags: ['Bền', 'Dễ đồng bộ', 'Thể thao'],
  },
] as const

const sizeSteps = [
  { title: 'Đo nhanh', text: 'Gửi chiều cao và cân nặng của từng thành viên.' },
  { title: 'Chọn cảm giác mặc', text: 'Cho biết đội thích mặc gọn, vừa người hay rộng thoải mái.' },
  { title: 'Đối chiếu kiểu áo', text: 'Kiểm tra bảng size theo đúng mẫu cổ tròn, polo hoặc áo không tay.' },
  { title: 'Chốt danh sách', text: 'Gửi tên, số áo và size theo từng người để hạn chế nhầm lẫn.' },
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

const decisionNotes = [
  { value: 'Mặc mát', label: 'ưu tiên mè lava hoặc mè thái' },
  { value: 'Mặt vải mịn', label: 'ưu tiên mè nano' },
  { value: 'Màu in nổi', label: 'ưu tiên mè zennix' },
] as const

const faqItems = [
  {
    question: 'Nên chọn vải nào cho áo pickleball mặc khi thi đấu?',
    answer: 'Nếu đội ưu tiên thoáng và nhẹ, mè lava hoặc mè thái là lựa chọn dễ mặc. Nếu mẫu có nhiều mảng màu và cần in sắc nét, có thể ưu tiên mè zennix.',
  },
  {
    question: 'Bảng size áo pickleball có dùng chung cho nam và nữ không?',
    answer: 'Không nên dùng chung. Trang này tách bảng size nam, nữ và trẻ em để đội đối chiếu theo dáng mặc phù hợp hơn.',
  },
  {
    question: 'Khi đặt áo cho cả đội cần gửi thông tin size như thế nào?',
    answer: 'Nên gửi danh sách theo từng người gồm tên, số áo, chiều cao, cân nặng và size dự kiến. Nếu có người thích mặc rộng hoặc gọn, ghi chú riêng để được rà lại trước khi may.',
  },
] as const

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

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
      description="Một trang để đội chọn nhanh chất vải, hiểu form mặc và đối chiếu size nam, nữ, trẻ em trước khi đặt may áo pickleball."
      image={fabrics[0].image}
      kicker="Chất liệu & bảng size"
      stats={[
        { value: '4 loại', label: 'vải thể thao' },
        { value: '3 bảng', label: 'nam, nữ, trẻ em' },
        { value: 'miễn phí', label: 'rà size trước khi may' },
      ]}
      title="Chọn vải, form và size áo pickleball cho cả đội"
    >
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Trang chủ', path: '/' },
            { name: 'Chất liệu & bảng size áo pickleball', path: '/chat-lieu-va-bang-size-ao-pickleball' },
          ]),
          faqJsonLd(),
        ]}
      />

      <nav className="info-section fabric-anchor-bar" aria-label="Nội dung hướng dẫn">
        <a href="#chat-lieu">Chọn chất liệu</a>
        <a href="#chon-size">Cách chốt size</a>
        <a href="#bang-size">Bảng size</a>
        <a href="#hoi-dap">Hỏi đáp</a>
      </nav>

      <section className="info-section fabric-decision-section" id="chat-lieu">
        <div className="fabric-decision-copy">
          <span className="section-eyebrow">Chất liệu áo pickleball</span>
          <h2>Chọn vải theo cách đội thật sự vận động</h2>
          <p>Bề mặt vải quyết định cảm giác mặc, độ thoáng và độ rõ của màu in. Các mẫu dưới đây phù hợp áo pickleball đặt may cho CLB, đội phong trào và trường lớp.</p>
          <div className="fabric-decision-notes">
            {decisionNotes.map((note) => (
              <div key={note.value}>
                <strong>{note.value}</strong>
                <span>{note.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="fabric-card-grid">
          {fabrics.map(({ bestFor, icon: Icon, image, tags, title, text }) => (
            <article className="fabric-card" key={title}>
              <a className="fabric-card-media" href={image} target="_blank" rel="noreferrer">
                <img alt={`Chất liệu ${title} áo pickleball X24 Sports`} src={image} />
              </a>
              <div className="fabric-card-body">
                <Icon size={26} strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{text}</p>
                <strong>{bestFor}</strong>
              </div>
              <div className="fabric-tag-row">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section size-guide-section fabric-size-flow" id="chon-size">
        <div className="size-guide-copy">
          <Ruler size={32} strokeWidth={1.6} />
          <h2>Cách chọn size cho đội</h2>
          <ol>
            {sizeSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
          <p>Lưu ý: form và thông số có thể khác theo kiểu áo. Hãy xác nhận bảng size của đúng mẫu trước khi chốt đơn.</p>
        </div>
        <div className="html-size-panel" id="bang-size" aria-label="Bảng size áo pickleball">
          <div className="html-size-title">
            <h2>Hướng dẫn chọn size</h2>
            <p>(Bảng size Châu Á)</p>
          </div>
          <SizeTable title="Bảng size nam" columns={sizeColumns} rows={menRows} />
          <SizeTable title="Bảng size nữ" columns={sizeColumns} rows={womenRows} accent="red" />
          <SizeTable title="Bảng size trẻ em" columns={kidsColumns} rows={kidsRows} />
        </div>
      </section>

      <section className="info-section fabric-faq-section" id="hoi-dap">
        <div>
          <span className="section-eyebrow">Hỏi đáp nhanh</span>
          <h2>Những câu hỏi đội hay gặp khi chốt vải và size</h2>
        </div>
        <div className="fabric-faq-list">
          {faqItems.map((item) => (
            <article key={item.question}>
              <ClipboardCheck size={24} strokeWidth={1.7} />
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
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
