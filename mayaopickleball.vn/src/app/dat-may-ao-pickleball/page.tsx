import type { Metadata } from 'next'
import { ArrowRight, BadgeCheck, ClipboardList, PackageCheck, Palette, Ruler, Send } from 'lucide-react'
import { InfoPage, zaloHref } from '../_components/info-pages'
import { pageMetadata } from '../../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Đặt may áo pickleball theo yêu cầu | MayaoPickleball',
  description: 'Nhận đặt may áo pickleball theo mẫu, in tên số, logo CLB và hỗ trợ thiết kế miễn phí theo yêu cầu.',
  path: '/dat-may-ao-pickleball',
})

const orderSteps = [
  { icon: Send, title: 'Gửi yêu cầu', text: 'Bạn gửi mẫu thích, màu đội, logo, số lượng và thời gian cần nhận hàng.' },
  { icon: Palette, title: 'Lên maket miễn phí', text: 'Thiết kế theo yêu cầu, chỉnh màu và vị trí logo để đội duyệt trước.' },
  { icon: Ruler, title: 'Chốt size và chất liệu', text: 'Tư vấn form mặc, bảng size, danh sách tên số và chất vải phù hợp.' },
  { icon: PackageCheck, title: 'Sản xuất, đóng gói, giao hàng', text: 'Theo dõi tiến độ, đóng gói theo danh sách và bàn giao tận nơi.' },
] as const

const useCases = [
  'Đồng phục pickleball cho câu lạc bộ phong trào.',
  'Áo thi đấu cho giải trường học, công ty, hội nhóm.',
  'Set nam nữ đồng bộ cho team đánh đôi hoặc giải nội bộ.',
  'Áo pickleball in tên số, logo, slogan riêng của đội.',
] as const

const checklist = [
  'Logo đội hoặc tên đội nếu đã có.',
  'Màu chủ đạo, màu phụ và mẫu tham khảo.',
  'Danh sách tên, số áo, size từng thành viên.',
  'Deadline mong muốn và địa chỉ nhận hàng.',
] as const

export default function OrderPage() {
  return (
    <InfoPage
      description="Nhận đặt may áo pickleball theo mẫu có sẵn hoặc thiết kế riêng, hỗ trợ miễn phí phần maket để đội dễ duyệt trước khi sản xuất."
      image="/images/pickleball-team-hero.webp"
      kicker="Đặt may áo pickleball"
      stats={[
        { value: '4 bước', label: 'quy trình rõ ràng' },
        { value: 'miễn phí', label: 'thiết kế theo yêu cầu' },
        { value: 'toàn quốc', label: 'giao hàng cho CLB' },
      ]}
      title="Đặt áo pickleball theo màu đội, logo và tên số riêng"
    >
      <section className="info-section order-flow-section">
        <div className="info-section-heading">
          <h2>Quy trình đặt may dễ theo dõi</h2>
          <p>Mỗi bước đều có phần việc rõ để đội không bị rối khi chốt mẫu, chốt size và chuẩn bị cho ngày thi đấu.</p>
        </div>
        <div className="order-step-grid">
          {orderSteps.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={28} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section split-info-section">
        <article>
          <BadgeCheck size={28} strokeWidth={1.6} />
          <h2>Phù hợp với những đội nào?</h2>
          <ul>
            {useCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <ClipboardList size={28} strokeWidth={1.6} />
          <h2>Chuẩn bị gì trước khi gửi yêu cầu?</h2>
          <ul>
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="info-section design-free-band">
        <div>
          <h2>Miễn phí thiết kế theo yêu cầu</h2>
          <p>Bạn có thể gửi ý tưởng còn rất thô: màu áo, logo, ảnh mẫu hoặc tên đội. Chúng tôi sẽ chuyển thành maket dễ duyệt trước khi may.</p>
        </div>
        <a className="primary-button" href={zaloHref}>
          Gửi ý tưởng <ArrowRight size={18} />
        </a>
      </section>
    </InfoPage>
  )
}
