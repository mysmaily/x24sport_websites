import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'

import { InfoPage, phone, phoneHref, zaloHref } from '../_components/info-pages'
import { pageMetadata } from '../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Liên hệ đặt may áo cầu lông | MayaoCauLong',
  description: 'Liên hệ MayaoCauLong để trao đổi mẫu áo, số lượng, màu đội, logo và thời gian cần nhận hàng.',
  path: '/lien-he',
})

const contactWays = [
  { icon: Phone, title: 'Gọi tư vấn', text: phone, href: phoneHref },
  { icon: Mail, title: 'Gửi email', text: 'lienhe@mayaocaulong.vn', href: 'mailto:lienhe@mayaocaulong.vn' },
  { icon: MapPin, title: 'Tư vấn toàn quốc', text: 'Hỗ trợ đội nhóm từ xa và giao hàng tận nơi', href: zaloHref },
] as const

export default function MayaoCauLongContactPage() {
  return (
    <InfoPage
      description="Chia sẻ số lượng áo, màu đội, logo hoặc mẫu bạn đang tham khảo. MayaoCauLong sẽ hỗ trợ bạn chốt hướng thiết kế, chất vải và size phù hợp."
      image="/images/mayaocaulong/badminton-team-hero.png?v=20260728b"
      kicker="Liên hệ MayaoCauLong"
      stats={[
        { value: '08:00 – 17:00', label: 'tư vấn mỗi ngày' },
        { value: 'từ 5 áo', label: 'nhận đơn đội' },
        { value: 'toàn quốc', label: 'giao hàng tận nơi' },
      ]}
      title="Trao đổi nhu cầu đặt áo cho đội của bạn"
    >
      <section className="info-section contact-way-section">
        <div className="info-section-heading">
          <h2>Chọn cách liên hệ thuận tiện</h2>
          <p>Chỉ cần gửi thông tin bạn đang có, đội ngũ sẽ hướng dẫn phần còn lại để việc chốt mẫu dễ dàng hơn.</p>
        </div>
        <div className="order-step-grid">
          {contactWays.map(({ icon: Icon, title, text, href }) => (
            <a key={title} href={href}>
              <Icon size={28} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{text}</p>
            </a>
          ))}
        </div>
      </section>
    </InfoPage>
  )
}
