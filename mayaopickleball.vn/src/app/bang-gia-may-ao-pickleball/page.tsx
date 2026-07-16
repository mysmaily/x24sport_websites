import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, Calculator, Palette, Shirt, Timer } from 'lucide-react'
import { InfoPage, zaloHref } from '../_components/info-pages'

export const metadata: Metadata = {
  title: 'Bảng giá may áo pickleball | MayaoPickleball',
  description: 'Bảng giá tham khảo khi đặt may áo pickleball theo số lượng, chất liệu, thiết kế, tên số và logo CLB.',
}

const priceRows = [
  { qty: '5-10 áo', price: 'từ 155.000đ/áo', note: 'Nhóm nhỏ, đội giao lưu, đơn cần linh hoạt.' },
  { qty: '11-20 áo', price: 'từ 145.000đ/áo', note: 'Mức đặt phổ biến cho CLB phong trào.' },
  { qty: '21-50 áo', price: 'từ 135.000đ/áo', note: 'Tối ưu chi phí cho trường lớp, công ty.' },
  { qty: 'Trên 50 áo', price: 'báo giá riêng', note: 'Có phương án tiến độ, đóng gói và giao hàng riêng.' },
] as const

const quoteInputs = [
  'Số lượng áo hoặc set đồng phục cần đặt.',
  'Kiểu áo mong muốn: cổ tròn, polo, áo nam nữ hoặc set thi đấu.',
  'Logo, màu chủ đạo, mẫu tham khảo và nội dung in tên số.',
  'Thời gian cần nhận hàng, địa chỉ giao và yêu cầu đóng gói.',
] as const

const factors = [
  { icon: Shirt, title: 'Kiểu áo và chất liệu', text: 'Form cổ tròn, polo, chất vải và số lớp chi tiết ảnh hưởng đến đơn giá.' },
  { icon: Palette, title: 'Thiết kế và phối màu', text: 'Thiết kế theo yêu cầu được hỗ trợ miễn phí trước khi đội chốt sản xuất.' },
  { icon: BadgeCheck, title: 'Tên số, logo, vị trí in', text: 'Càng nhiều vị trí in, càng cần kiểm tra maket kỹ để tránh sai sót.' },
  { icon: Timer, title: 'Deadline giao hàng', text: 'Đơn cần gấp sẽ được tư vấn tiến độ riêng trước khi nhận sản xuất.' },
] as const

export default function PricePage() {
  return (
    <InfoPage
      description="Chi phí may áo pickleball được báo theo đúng yêu cầu của từng đội, vì mỗi đơn có thể khác nhau về số lượng, kiểu áo, chất liệu và nội dung in."
      image="https://picsum.photos/seed/pickleball-price-workshop/1280/960"
      kicker="Bảng giá may áo pickleball"
      stats={[
        { value: '135.000đ', label: 'giá tham khảo từ' },
        { value: 'miễn phí', label: 'thiết kế theo yêu cầu' },
        { value: '08:00-17:00', label: 'thời gian tư vấn' },
      ]}
      title="Báo giá rõ theo số lượng, chất vải và yêu cầu in"
    >
      <section className="info-section price-detail-section">
        <div className="info-section-heading">
          <h2>Giá tham khảo theo số lượng</h2>
          <p>Đây là khung tham khảo để đội dễ dự trù ngân sách. Giá cuối sẽ được chốt sau khi kiểm tra mẫu, chất liệu và deadline.</p>
        </div>
        <div className="info-price-grid">
          {priceRows.map((row) => (
            <article key={row.qty}>
              <span>{row.qty}</span>
              <strong>{row.price}</strong>
              <p>{row.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section quote-section">
        <div className="quote-panel">
          <Calculator size={34} strokeWidth={1.6} />
          <h2>Thông tin cần có để báo giá nhanh</h2>
          <p>Gửi đủ những thông tin này giúp đội ngũ kiểm tra yêu cầu và báo giá chính xác hơn.</p>
        </div>
        <ol className="quote-list">
          {quoteInputs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="info-section factor-section">
        <div className="info-section-heading compact">
          <h2>Những yếu tố làm giá thay đổi</h2>
          <p>Cùng là áo pickleball đặt may, nhưng yêu cầu in ấn và cách đóng gói có thể khác nhau giữa từng đội.</p>
        </div>
        <div className="factor-grid">
          {factors.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={26} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <a className="primary-button info-inline-cta" href={zaloHref}>
          Nhận báo giá <ArrowRight size={18} />
        </a>
      </section>
    </InfoPage>
  )
}
