import { ArrowLeft, ArrowRight, Check, MessageCircle, Phone, Sparkles, Wind } from 'lucide-react'
import Link from 'next/link'

import { FabricLightbox } from './fabric-lightbox'
import { PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'

const fabrics = [
  {
    name: 'Thun lạnh',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1446-vai-thun-lanh.jpg',
    alt: 'Bề mặt vải thun lạnh dùng để may áo bóng đá',
    note: 'Mát tay, dễ mặc, ít nhăn',
    bestFor: 'Đội phong trào, tập luyện hằng tuần',
    feel: 'Mịn',
    breath: 'Tốt',
    tags: ['Mát lạnh', 'Chống nhăn', 'Dễ chọn'],
  },
  {
    name: 'Mè sọc mịn',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1447-vai-me-soc-min.jpg',
    alt: 'Bề mặt vải mè sọc mịn may áo bóng đá',
    note: 'Sọc nhỏ, co giãn ổn, lên form thể thao',
    bestFor: 'Đội cần áo thoáng và sắc nét',
    feel: 'Êm',
    breath: 'Rất tốt',
    tags: ['Co giãn', 'Thoáng khí', 'Bóng nhẹ'],
  },
  {
    name: 'Mè luxury',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1445-vai-me-luxury.jpg',
    alt: 'Bề mặt vải mè luxury cao cấp may áo bóng đá',
    note: 'Dày dặn hơn, bề mặt sang, giữ dáng tốt',
    bestFor: 'Đội thi đấu, áo sự kiện, áo premium',
    feel: 'Đầm',
    breath: 'Tốt',
    tags: ['Cao cấp', 'Bền form', 'Sang'],
  },
  {
    name: 'Mè Thái',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1444-vai-me-thai.jpg',
    alt: 'Bề mặt vải mè Thái nhập khẩu may áo bóng đá',
    note: 'Nhẹ, thoát khí nhanh, hợp trời nóng',
    bestFor: 'Trận cường độ cao, sân 7 và sân 11',
    feel: 'Nhẹ',
    breath: 'Xuất sắc',
    tags: ['Nhập khẩu', 'Siêu thoáng', 'Nhanh khô'],
  },
  {
    name: 'Mè nano',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1443-vai-me-nano.jpg',
    alt: 'Bề mặt vải mè nano công nghệ may áo bóng đá',
    note: 'Nhẹ, khô nhanh, bền màu sau nhiều lần giặt',
    bestFor: 'Đội muốn hiệu năng và độ bền cao',
    feel: 'Mượt',
    breath: 'Xuất sắc',
    tags: ['Nano', 'Kháng khuẩn', 'Bền màu'],
  },
]

const quickPicks = [
  ['Dễ mặc nhất', 'Thun lạnh'],
  ['Cân bằng nhất', 'Mè sọc mịn'],
  ['Cảm giác cao cấp', 'Mè luxury'],
  ['Đá trời nóng', 'Mè Thái'],
  ['Hiệu năng cao', 'Mè nano'],
]

export function FabricGuidePage() {
  return (
    <article className="football-fabric-page">
      <section className="football-fabric-hero">
        <div className="football-fabric-hero-bg" />
        <div className="section-shell football-fabric-hero-grid">
          <div>
            <Link className="football-fabric-back" href="/">
              <ArrowLeft size={18} /> Trang chủ
            </Link>
            <p className="football-fabric-kicker">Chất liệu vải áo bóng đá</p>
            <h1>
              Chọn vải trước khi chọn mẫu áo
            </h1>
            <p className="football-fabric-lead">
              5 chất liệu thường dùng cho áo bóng đá, được đặt cạnh nhau để đội dễ so sánh cảm giác mặc, độ thoáng và tình huống sử dụng.
            </p>
          </div>
          <div className="football-fabric-picks" aria-label="Gợi ý chọn nhanh chất liệu">
            <div className="football-fabric-picks-grid">
              {quickPicks.map(([label, value]) => (
                <div className="football-fabric-pick" key={label}>
                  <p>{label}</p>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell football-fabric-materials">
        <div className="football-fabric-material-layout">
          <aside className="football-fabric-sticky-copy">
            <p>Bảng vật liệu</p>
            <h2>Sờ bằng mắt trước.</h2>
            <span>Ảnh vải được giữ lớn để nhìn bề mặt sợi, sau đó đọc nhanh gợi ý dùng cho đội bóng.</span>
          </aside>

          <div className="football-fabric-card-list">
            {fabrics.map((fabric, index) => (
              <section className="football-fabric-card" key={fabric.name}>
                <FabricLightbox
                  alt={fabric.alt}
                  className="football-fabric-media"
                  image={fabric.image}
                  title={fabric.name}
                >
                  <img alt={fabric.alt} fetchPriority={index === 0 ? 'high' : undefined} loading={index === 0 ? 'eager' : 'lazy'} src={fabric.image} />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </FabricLightbox>
                <div className="football-fabric-card-body">
                  <div>
                    <p className="football-fabric-note"><Sparkles size={14} /> {fabric.note}</p>
                    <h3>{fabric.name}</h3>
                  </div>
                  <p className="football-fabric-best-for">{fabric.bestFor}</p>
                  <div className="football-fabric-stats">
                    <div>
                      <p>Cảm giác</p>
                      <strong>{fabric.feel}</strong>
                    </div>
                    <div>
                      <p>Độ thoáng</p>
                      <strong>{fabric.breath}</strong>
                    </div>
                  </div>
                  <div className="football-fabric-tags">
                    {fabric.tags.map((tag) => (
                      <span key={tag}><Check size={14} /> {tag}</span>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell football-fabric-size-section">
        <div className="football-fabric-size-copy">
          <p><Wind size={15} /> Size và form áo</p>
          <h2>Chọn vải xong, chốt size cho cả đội.</h2>
          <span>Dùng bảng size làm mốc, sau đó gửi chiều cao và cân nặng nếu đội có nhiều dáng người khác nhau.</span>
        </div>
        <div className="football-fabric-size-image">
          <img alt="Bảng size may áo bóng đá" loading="eager" src="https://static.x24sport.vn/mayaobongda/wp-1442-bang-size-may-ao-bong-da.jpg" />
        </div>
      </section>

      <section className="football-fabric-cta">
        <div className="section-shell football-fabric-cta-grid">
          <div>
            <p>Tư vấn nhanh</p>
            <h2>Gửi mẫu áo, số lượng và ngân sách.</h2>
          </div>
          <div className="football-fabric-cta-actions">
            <a className="football-fabric-primary-link" href={ZALO_URL} rel="noreferrer" target="_blank">
              <MessageCircle size={18} /> Zalo tư vấn <ArrowRight size={17} />
            </a>
            <a className="football-fabric-secondary-link" href={`tel:${PHONE_VALUE}`}>
              <Phone size={18} /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </article>
  )
}
