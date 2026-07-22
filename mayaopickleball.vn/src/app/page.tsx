import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Clock3,
  Flame,
  PackageCheck,
  Palette,
  Shirt,
  Sparkles,
  Truck,
} from 'lucide-react'
import { JsonLd } from './_components/json-ld'
import { SiteHeader, phone, phoneHref, zaloHref } from './_components/info-pages'
import { formatPrice, getHomeData, getValidCompareAtPrice, type Product } from '../lib/content'
import { organizationJsonLd } from '../lib/seo'

const trustItems = [
  { icon: Palette, title: 'Lên mẫu theo màu đội', text: 'Gợi ý phối màu, logo, tên số trước khi sản xuất.' },
  { icon: Clock3, title: 'Hỗ trợ đơn cần gấp', text: 'Chốt deadline sớm, báo tiến độ rõ cho đội và CLB.' },
  { icon: PackageCheck, title: 'Đóng gói theo size', text: 'Tách size, tên, số để đội phát áo nhanh hơn.' },
  { icon: Truck, title: 'Giao hàng toàn quốc', text: 'Phù hợp trường học, doanh nghiệp và giải phong trào.' },
] as const

const buyerPaths = [
  {
    title: 'CLB cần đồng phục mới',
    text: 'Chọn mẫu có sẵn, đổi màu chủ đạo, thêm logo CLB và tên số từng thành viên.',
    image: '/images/home/pickleball-club-uniforms.webp',
  },
  {
    title: 'Đội thi đấu giải cuối tuần',
    text: 'Ưu tiên form nhẹ, màu nổi trên sân, in số lớn và tư vấn deadline giao áo.',
    image: '/images/home/pickleball-weekend-tournament.webp',
  },
  {
    title: 'Trường lớp, công ty, team building',
    text: 'Thiết kế đồng bộ nam nữ, dễ mặc, dễ chia size và có phương án ngân sách.',
    image: '/images/home/pickleball-team-building.webp',
  },
] as const

const processSteps = [
  { title: 'Gửi mẫu thích và số lượng', text: 'Bạn gửi màu đội, logo, tên số hoặc ảnh mẫu. Nếu chưa có ý tưởng, chúng tôi gợi ý theo ngân sách.' },
  { title: 'Duyệt maket trước khi may', text: 'Maket thể hiện phối màu, vị trí logo, số áo và tên vận động viên để đội kiểm tra trước.' },
  { title: 'Chốt size, chất liệu, deadline', text: 'Tư vấn form nam nữ, chất vải, thời gian sản xuất và cách đóng gói theo từng thành viên.' },
  { title: 'Sản xuất và bàn giao', text: 'Theo dõi tiến độ, đóng gói theo danh sách, giao tận nơi và hỗ trợ sau khi nhận hàng.' },
] as const

const priceTiers = [
  { qty: '5-10 áo', price: 'từ 155.000đ', note: 'Phù hợp nhóm nhỏ, giao lưu cuối tuần' },
  { qty: '11-20 áo', price: 'từ 145.000đ', note: 'Mức đặt phổ biến cho CLB phong trào' },
  { qty: '21-50 áo', price: 'từ 135.000đ', note: 'Tối ưu chi phí cho đội trường, công ty' },
  { qty: 'Trên 50 áo', price: 'báo giá riêng', note: 'Có phương án tiến độ và đóng gói riêng' },
] as const

const fabricCards = [
  { title: 'Vải mè thể thao', text: 'Bề mặt thoáng, nhẹ, phù hợp cường độ vận động cao và ra mồ hôi nhiều.' },
  { title: 'Form thi đấu gọn', text: 'Vai và nách đủ linh hoạt để đánh bóng, di chuyển ngang liên tục trên sân pickleball.' },
  { title: 'In chuyển nhiệt sắc nét', text: 'Tên số, logo và họa tiết lên màu rõ, phù hợp thiết kế gradient và mảng lớn.' },
  { title: 'Size nam nữ dễ chia', text: 'Có tư vấn theo chiều cao, cân nặng và form mặc mong muốn của từng thành viên.' },
] as const

const serviceChecks = [
  {
    title: 'Duyệt maket trước khi may',
    text: 'Đội được kiểm tra phối màu, logo, tên số và form áo trước khi chốt sản xuất.',
  },
  {
    title: 'Chia size theo danh sách',
    text: 'Tư vấn size theo từng thành viên và đóng gói rõ để khi nhận áo dễ phát cho cả đội.',
  },
  {
    title: 'Theo sát deadline của đội',
    text: 'Thống nhất mốc duyệt mẫu, sản xuất và giao hàng theo lịch tập luyện hoặc thi đấu.',
  },
] as const

const faqs = [
  {
    question: 'Có nhận thiết kế áo pickleball theo logo riêng không?',
    answer: 'Có. Bạn gửi logo, màu chủ đạo, tên đội và danh sách tên số. Chúng tôi lên maket để duyệt trước khi sản xuất.',
  },
  {
    question: 'Đặt ít áo có làm được không?',
    answer: 'Có thể hỗ trợ đơn nhỏ. Với đơn số lượng lớn, đơn giá và cách đóng gói sẽ tối ưu hơn.',
  },
  {
    question: 'Thời gian làm áo thường mất bao lâu?',
    answer: 'Tùy số lượng và độ phức tạp của mẫu. Khi nhận yêu cầu, chúng tôi sẽ báo mốc duyệt maket, sản xuất và giao hàng rõ ràng.',
  },
  {
    question: 'Nếu đội chưa biết chọn size thì sao?',
    answer: 'Chúng tôi gửi bảng gợi ý size theo chiều cao, cân nặng và tư vấn thêm theo form mặc gọn hoặc thoải mái.',
  },
] as const

const articleCards = [
  { title: 'Cách chọn chất liệu và size áo pickleball', href: '/chat-lieu-va-bang-size-ao-pickleball', text: 'Gợi ý chất vải, form áo và bảng size để đội mặc thoải mái khi vào sân.' },
  { title: 'Checklist đặt áo cho CLB trước mùa giải', href: '/dat-may-ao-pickleball', text: 'Những thông tin nên chuẩn bị để chốt maket nhanh và tránh nhầm size.' },
  { title: 'Bảng giá may áo pickleball theo số lượng', href: '/bang-gia-may-ao-pickleball', text: 'Các yếu tố ảnh hưởng đến giá: chất liệu, kiểu áo, tên số, logo và deadline.' },
] as const

function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const image = product.gallery?.[0]
  const compareAtPrice = getValidCompareAtPrice(product)

  return (
    <article className={featured ? 'product-card product-card-featured' : 'product-card'}>
      <Link className="product-card-media" href={`/san-pham/${product.slug}`}>
        {image?.url ? (
          <img
            alt={image.alt || product.name}
            height={image.height || 1000}
            src={image.url}
            width={image.width || 1000}
          />
        ) : (
          <span className="product-card-fallback">
            <Shirt size={58} strokeWidth={1.5} />
          </span>
        )}
      </Link>
      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{product.sku}</span>
          <span>★★★★★</span>
        </div>
        <h3>
          <Link href={`/san-pham/${product.slug}`}>{product.name}</Link>
        </h3>
        <p>{product.shortDescription}</p>
        <div className="product-card-price">
          <strong>{formatPrice(product.price)}</strong>
          {compareAtPrice ? <span>{formatPrice(compareAtPrice)}</span> : null}
        </div>
        <Link className="text-link" href={`/san-pham/${product.slug}`}>
          Xem chi tiết <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  )
}

export default async function Home() {
  const { products, posts } = await getHomeData()
  const runwayProducts = products.slice(0, 5)
  const heroProducts = products.slice(0, 3)

  return (
    <main className="site-page">
      <JsonLd data={organizationJsonLd()} />
      <SiteHeader />

      <section className="hero-section">
        <div className="hero-media" aria-hidden="true">
          <img src="/images/pickleball-team-hero.png" alt="" />
        </div>
        <div className="hero-content">
          <p className="hero-kicker">Áo pickleball đặt may cho CLB</p>
          <h1>Đồng phục pickleball lên màu sắc nét, mặc nhẹ khi vào sân</h1>
          <p>
            Thiết kế theo màu đội, in tên số và logo, hỗ trợ chốt size cho đội nhóm.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href={zaloHref}>
              Nhận báo giá <ArrowRight size={18} />
            </a>
            <Link className="secondary-button" href="/san-pham">
              Xem mẫu áo
            </Link>
          </div>
        </div>

        <aside className="hero-panel" aria-label="Thông tin nhanh">
          <div className="hero-panel-highlight">
            <strong>Miễn phí thiết kế theo yêu cầu</strong>
          </div>
          <div>
            <span>Giá đặt may</span>
            <strong>từ 135.000đ</strong>
          </div>
          <div>
            <span>Hoàn thiện</span>
            <strong>mẫu, tên, số, logo</strong>
          </div>
          <div>
            <span>Phù hợp</span>
            <strong>CLB, trường lớp, công ty</strong>
          </div>
        </aside>
      </section>

      <section className="trust-strip" aria-label="Cam kết dịch vụ">
        {trustItems.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={24} strokeWidth={1.7} />
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section-shell product-runway" id="mau-ao">
        <div className="section-heading">
          <h2>Bộ sưu tập đang được đội nhóm chọn nhiều</h2>
          <p>Mẫu có thể đổi màu, chỉnh logo, thêm tên số và sản xuất theo danh sách size.</p>
        </div>

        <div className="runway-grid">
          {runwayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} featured={index === 0} />
          ))}
        </div>

        <div className="section-action">
          <Link className="secondary-button dark" href="/san-pham">
            Xem toàn bộ sản phẩm <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="section-shell buyer-section" id="dat-thiet-ke">
        <div className="section-heading compact">
          <h2>Chọn theo tình huống đặt áo</h2>
          <p>Khách mua áo pickleball thường không chỉ cần một mẫu đẹp. Họ cần đúng form, đúng màu và kịp lịch thi đấu.</p>
        </div>
        <div className="buyer-grid">
          {buyerPaths.map((item) => (
            <article key={item.title}>
              <img alt={item.title} height={1100} src={item.image} width={900} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="court-story">
        <div className="court-story-copy">
          <h2>Một bộ áo tốt phải nhìn rõ đội hình ngay từ mép sân</h2>
          <p>
            Với pickleball phong trào, áo không chỉ để mặc. Màu áo giúp đội dễ nhận diện,
            tên số giúp giải đấu vận hành gọn, form áo quyết định cảm giác di chuyển.
          </p>
          <ul>
            <li>Logo CLB đặt đúng vùng nhìn, không bị vỡ khi in.</li>
            <li>Màu nền cân bằng với ánh sáng sân ngoài trời.</li>
            <li>Form áo gọn vai, không cản động tác đánh bóng.</li>
          </ul>
        </div>
        <div className="court-story-products">
          {heroProducts.map((product) => {
            const image = product.gallery?.[0]
            return (
              <Link key={product.id} href={`/san-pham/${product.slug}`} aria-label={product.name}>
                {image?.url ? <img alt={image.alt || product.name} src={image.url} /> : <span>{product.sku}</span>}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section-shell process-section" id="quy-trinh">
        <div className="section-heading">
          <h2>Quy trình đặt may rõ từ lúc gửi ý tưởng đến khi phát áo</h2>
          <p>Mỗi bước đều có đầu ra cụ thể để đội dễ kiểm tra và hạn chế sửa sát ngày thi đấu.</p>
        </div>
        <div className="process-grid">
          {processSteps.map((step) => (
            <article key={step.title}>
              <BadgeCheck size={25} strokeWidth={1.7} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell pricing-section" id="bang-gia">
        <div className="pricing-intro">
          <h2>Bảng giá tham khảo cho đội nhóm</h2>
          <p>
            Giá cuối phụ thuộc chất liệu, độ phức tạp của thiết kế, số vị trí in và thời gian cần giao.
          </p>
          <a className="primary-button" href={zaloHref}>
            Gửi số lượng để báo giá <ArrowRight size={18} />
          </a>
        </div>
        <div className="price-grid">
          {priceTiers.map((tier) => (
            <article key={tier.qty}>
              <span>{tier.qty}</span>
              <strong>{tier.price}</strong>
              <p>{tier.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell fabric-section" id="chat-lieu">
        <div className="fabric-visual">
          <img
            alt="Chi tiết áo pickleball đặt may trên sân"
            height={1100}
            src="/images/home/pickleball-fabric-detail.webp"
            width={980}
          />
        </div>
        <div className="fabric-copy">
          <h2>Chất liệu và form được chọn cho nhịp di chuyển pickleball</h2>
          <div className="fabric-grid">
            {fabricCards.map((item) => (
              <article key={item.title}>
                <Sparkles size={22} strokeWidth={1.6} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell proof-section">
        <div className="proof-copy">
          <Flame size={28} strokeWidth={1.6} />
          <h2>Mẫu đã làm, mẫu đang bán và mẫu có thể chỉnh theo đội bạn</h2>
          <p>
            Mỗi mẫu có thể dùng làm hướng tham khảo để đổi màu, thêm logo, tên số và điều chỉnh form áo
            theo nhu cầu của đội.
          </p>
        </div>
        <div className="proof-mosaic">
          <img alt="Đội pickleball mặc áo thi đấu xanh trắng" src="/images/home/pickleball-blue-white-team.webp" />
          <img alt="Mẫu áo pickleball có thể chỉnh màu theo đội" src="/images/home/pickleball-color-mockups.webp" />
          <img alt="Đồng phục pickleball đặt may cho câu lạc bộ" src="/images/home/pickleball-club-delivery.webp" />
        </div>
      </section>

      <section className="section-shell review-section">
        <div className="section-heading compact">
          <h2>Đặt áo đội cần rõ ràng từ mẫu đến size</h2>
          <p>Ba điểm nên chốt sớm: maket, danh sách size và thời gian cần nhận áo.</p>
        </div>
        <div className="review-grid">
          {serviceChecks.map((item) => (
            <article key={item.title}>
              <p>{item.text}</p>
              <div>
                <span>
                  <strong>{item.title}</strong>
                  <small>Quy trình đặt may</small>
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-heading">
          <h2>Nội dung tư vấn để khách tự tin chốt đơn</h2>
          <p>Các hướng dẫn ngắn giúp đội chuẩn bị thông tin đặt áo nhanh và chính xác hơn.</p>
        </div>
        <div className="article-grid">
          {[...articleCards, ...posts.slice(0, 2).map((post) => ({ title: post.title, href: `/bai-viet/${post.slug}`, text: post.excerpt }))].slice(0, 5).map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <a href={item.href}>Đọc thêm</a>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell faq-section" id="faq">
        <div className="section-heading compact">
          <h2>Câu hỏi trước khi đặt áo</h2>
          <p>Trả lời nhanh những điểm khách thường hỏi trước khi gửi logo và danh sách size.</p>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div>
          <h2>Gửi màu đội, logo và số lượng. Chúng tôi lên hướng áo phù hợp.</h2>
          <p>Không cần chuẩn bị đủ mọi thứ ngay từ đầu. Chỉ cần gửi ý tưởng hiện có, phần còn lại có thể tư vấn từng bước.</p>
        </div>
        <a className="primary-button" href={zaloHref}>
          Tư vấn qua Zalo <ArrowRight size={18} />
        </a>
      </section>

      <footer className="site-footer">
        <div>
          <Link className="brand-mark footer-brand" href="/">
            <img src="/images/logo.svg" alt="MayaoPickleball" style={{height: 36, width: 'auto'}} />
          </Link>
          <p>Đồng phục pickleball đặt may cho CLB, đội phong trào, trường lớp và doanh nghiệp.</p>
        </div>
        <div>
          <h3>Liên hệ</h3>
          <p>Hotline: {phone}</p>
          <p>Email: lienhe@mayaopickleball.vn</p>
          <p>Xưởng may: Hà Nội, Việt Nam</p>
        </div>
        <div>
          <h3>Cam kết</h3>
          <p>Thiết kế theo màu đội</p>
          <p>In tên số và logo</p>
          <p>Giao hàng toàn quốc</p>
        </div>
      </footer>

      <div className="mobile-cta" aria-label="Liên hệ nhanh">
        <a href={phoneHref}>Gọi ngay</a>
        <a href={zaloHref}>Nhận báo giá</a>
      </div>
    </main>
  )
}
