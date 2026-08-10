import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, ClipboardList, PackageCheck, Palette, Ruler, Send, Shirt, Sparkles } from 'lucide-react'
import { InfoFooter, SiteHeader, zaloHref } from '../_components/info-pages'
import { pageMetadata } from '../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Đặt may áo cầu lông theo yêu cầu | MayaoCauLong',
  description: 'Nhận đặt may áo cầu lông theo mẫu, in tên số, logo CLB và hỗ trợ thiết kế miễn phí theo yêu cầu.',
  path: '/dat-may-ao-cau-long',
})

const orderSteps = [
  { icon: Send, title: 'Gửi yêu cầu', text: 'Bạn gửi mẫu thích, màu đội, logo, số lượng và thời gian cần nhận hàng.' },
  { icon: Palette, title: 'Lên maket miễn phí', text: 'Thiết kế theo yêu cầu, chỉnh màu và vị trí logo để đội duyệt trước.' },
  { icon: Ruler, title: 'Chốt size và chất liệu', text: 'Tư vấn form mặc, bảng size, danh sách tên số và chất vải phù hợp.' },
  { icon: PackageCheck, title: 'Sản xuất, đóng gói, giao hàng', text: 'Theo dõi tiến độ, đóng gói theo danh sách và bàn giao tận nơi.' },
] as const

const useCases = [
  'Đồng phục cầu lông cho câu lạc bộ phong trào.',
  'Áo thi đấu cho giải trường học, công ty, hội nhóm.',
  'Set nam nữ đồng bộ cho team đánh đôi hoặc giải nội bộ.',
  'Áo cầu lông in tên số, logo, slogan riêng của đội.',
] as const

const checklist = [
  'Logo đội hoặc tên đội nếu đã có.',
  'Màu chủ đạo, màu phụ và mẫu tham khảo.',
  'Danh sách tên, số áo, size từng thành viên.',
  'Deadline mong muốn và địa chỉ nhận hàng.',
] as const

export default function OrderPage() {
  return (
    <main className="site-page info-page badminton-order-page">
      <SiteHeader />

      <section className="order-atelier-hero">
        <div className="order-hero-copy">
          <p className="hero-kicker">Đặt may áo cầu lông</p>
          <h1>Áo đội lên đúng màu, đúng size, kịp ngày ra sân</h1>
          <p>
            Gửi logo, màu đội, danh sách tên số và deadline. MayaoCauLong lên maket miễn phí để đội duyệt trước khi sản xuất.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href={zaloHref}>
              Gửi yêu cầu ngay <ArrowRight size={18} />
            </a>
            <Link className="secondary-button" href="/san-pham">
              Xem mẫu áo
            </Link>
          </div>
        </div>

        <div className="order-hero-board" aria-label="Tóm tắt quy trình đặt may">
          <img
            alt="Đội cầu lông mặc đồng phục thiết kế riêng"
            height={960}
            src="/images/mayaocaulong/badminton-team-hero.png?v=20260728b"
            width={1280}
          />
          <div className="order-board-card order-board-card-main">
            <Sparkles size={22} strokeWidth={1.8} />
            <strong>Miễn phí maket</strong>
            <span>Chỉnh màu, logo, tên số trước khi may</span>
          </div>
          <div className="order-board-card order-board-card-side">
            <Shirt size={22} strokeWidth={1.8} />
            <strong>Đóng gói theo đội</strong>
            <span>Tách size, tên, số để phát áo nhanh</span>
          </div>
        </div>

        <div className="order-proof-strip">
          <div>
            <strong>4 bước</strong>
            <span>quy trình rõ ràng</span>
          </div>
          <div>
            <strong>Miễn phí</strong>
            <span>thiết kế theo yêu cầu</span>
          </div>
          <div>
            <strong>Toàn quốc</strong>
            <span>giao hàng cho CLB</span>
          </div>
        </div>
      </section>

      <section className="info-section order-flow-section">
        <div className="info-section-heading order-section-heading">
          <span>Quy trình</span>
          <h2>Đội chỉ cần chuẩn bị thông tin, phần còn lại có người dẫn từng bước</h2>
          <p>Mỗi bước đều có đầu việc rõ để không bị rối khi chốt mẫu, chốt size và chuẩn bị cho ngày thi đấu.</p>
        </div>
        <div className="order-step-grid">
          {orderSteps.map(({ icon: Icon, title, text }, index) => (
            <article key={title}>
              <span className="order-step-number">{String(index + 1).padStart(2, '0')}</span>
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

      <InfoFooter />
    </main>
  )
}
