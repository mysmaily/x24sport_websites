import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Images, Palette } from 'lucide-react'
import { InfoPage, zaloHref } from '../_components/info-pages'
import { pageMetadata } from '../../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Mẫu áo pickleball đã làm | MayaoPickleball',
  description: 'Tham khảo mẫu áo pickleball đã làm cho trường học, câu lạc bộ, đội phong trào và doanh nghiệp.',
  path: '/mau-ao-pickleball-da-lam',
})

const projects = [
  {
    title: 'Mẫu áo pickleball CLB Linh Đàm',
    text: 'Tông xanh lá trắng nổi bật, số áo lớn, logo đặt trước ngực và sau lưng.',
    image: '/images/pickleball-team-hero.png',
    date: '12 Th7',
  },
  {
    title: 'Giải pickleball nội bộ công ty',
    text: 'Thiết kế xanh navy, chia size theo danh sách và đóng gói theo từng đội.',
    image: '/images/pickleball-team-hero.png',
    date: '12 Th7',
  },
  {
    title: 'Mẫu áo pickleball trường học',
    text: 'Màu vàng cam trẻ, dễ nhận diện khi thi đấu ngoài trời và chụp ảnh tập thể.',
    image: '/images/pickleball-team-hero.png',
    date: '11 Th7',
  },
  {
    title: 'Set pickleball nam nữ đồng bộ',
    text: 'Form gọn, phối màu xanh ngọc và trắng, phù hợp đội đánh đôi phong trào.',
    image: '/images/pickleball-team-hero.png',
    date: '08 Th7',
  },
] as const

const colorFilters = ['Đỏ', 'Trắng', 'Xanh', 'Vàng', 'Cam', 'Hồng', 'Gradient', 'Navy'] as const

export default function FinishedWorkPage() {
  return (
    <InfoPage
      description="Tham khảo một số hướng thiết kế áo pickleball đã làm cho team, trường học, doanh nghiệp và câu lạc bộ phong trào."
      image="/images/pickleball-team-hero.png"
      kicker="Mẫu áo pickleball đã làm"
      stats={[
        { value: 'nhiều màu', label: 'có thể chỉnh theo đội' },
        { value: 'logo riêng', label: 'tên số và slogan' },
        { value: 'miễn phí', label: 'thiết kế theo yêu cầu' },
      ]}
      title="Gallery mẫu áo pickleball để đội dễ chọn hướng thiết kế"
    >
      <section className="info-section gallery-intro-section">
        <div className="info-section-heading">
          <h2>Mẫu đã làm để tham khảo, không phải giới hạn thiết kế</h2>
          <p>Mỗi đội có màu áo, logo và lịch thi đấu riêng. Bạn có thể chọn một mẫu gần ý tưởng rồi yêu cầu đổi màu, đổi họa tiết hoặc thêm chi tiết đội.</p>
        </div>
        <div className="color-filter-row" aria-label="Màu áo tham khảo">
          {colorFilters.map((color) => (
            <span key={color}>{color}</span>
          ))}
        </div>
      </section>

      <section className="info-section project-gallery-section">
        <div className="project-grid">
          {projects.map((project) => (
            <article key={project.title}>
              <img alt={project.title} height={760} src={project.image} width={900} />
              <div>
                <span>{project.date}</span>
                <h2>{project.title}</h2>
                <p>{project.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section split-info-section">
        <article>
          <Images size={28} strokeWidth={1.6} />
          <h2>Khi gửi mẫu tham khảo</h2>
          <ul>
            <li>Gửi ảnh áo, logo đội và màu muốn giữ lại.</li>
            <li>Nêu rõ phần muốn đổi: màu nền, họa tiết, cổ áo, vị trí logo.</li>
            <li>Gửi danh sách tên số nếu cần lên maket hoàn chỉnh.</li>
          </ul>
        </article>
        <article>
          <Palette size={28} strokeWidth={1.6} />
          <h2>Có thể chỉnh theo đội bạn</h2>
          <ul>
            <li>Đổi màu theo nhận diện CLB hoặc trường học.</li>
            <li>Thêm logo, slogan, tên giải đấu hoặc nhà tài trợ.</li>
            <li>Chọn form cổ tròn, polo hoặc set nam nữ đồng bộ.</li>
          </ul>
        </article>
      </section>

      <section className="info-section design-free-band">
        <div>
          <h2>Muốn một mẫu gần giống nhưng đúng màu đội?</h2>
          <p>Gửi mẫu bạn thích, chúng tôi chỉnh lại theo màu, logo và danh sách tên số của đội.</p>
        </div>
        <div className="dual-actions">
          <a className="primary-button" href={zaloHref}>
            Gửi mẫu tham khảo <ArrowRight size={18} />
          </a>
          <Link className="secondary-button dark" href="/san-pham">
            Xem sản phẩm
          </Link>
        </div>
      </section>
    </InfoPage>
  )
}
