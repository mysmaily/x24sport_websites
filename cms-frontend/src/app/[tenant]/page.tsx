import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardPenLine,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react'

import X24HomePage from '../page'
import { getCategories, getProductsPage } from '../../lib/content'
import { RynoCard } from './ryno-catalog'
import { RynoSiteFooter, RynoSiteHeader } from './ryno-shell'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params
  if (tenant !== 'rynosport') return {}

  return {
    title: 'RynoSport - Trang phục thể thao đặt theo đội',
    description: 'RynoSport tư vấn trang phục thể thao cho đội nhóm, câu lạc bộ: chọn mẫu, phối màu, đặt logo và hoàn thiện size.',
    alternates: { canonical: 'https://rynosport.vn/' },
    openGraph: {
      title: 'RynoSport - Trang phục thể thao đặt theo đội',
      description: 'Chọn mẫu, phối màu và đặt áo đội cùng RynoSport.',
      url: 'https://rynosport.vn/',
      images: [{ url: '/images/rynosport/hero.png', width: 864, height: 1821, alt: 'Trang phục thể thao RynoSport' }],
    },
  }
}

const visualCategories = [
  { name: 'Bóng đá', image: 'football', note: 'Form thi đấu mạnh mẽ' },
  { name: 'Cầu lông', image: 'badminton', note: 'Nhẹ, thoáng, linh hoạt' },
  { name: 'Bóng chuyền', image: 'volleyball', note: 'Đồng bộ cho đội hình' },
  { name: 'Bóng rổ', image: 'basketball', note: 'Phom rộng năng động' },
  { name: 'Pickleball', image: 'pickleball', note: 'Gọn gàng cho chuyển động nhanh' },
  { name: 'Chạy bộ', image: 'running', note: 'Tối giản và dễ phối' },
  { name: 'Đồng phục đội nhóm', image: 'teamwear', note: 'Màu sắc riêng của đội' },
  { name: 'Tập luyện', image: 'training', note: 'Bền bỉ cho lịch tập dày' },
  { name: 'Esports', image: 'esports', note: 'Sắc nét cho clan và giải đấu' },
]

const assuranceItems = [
  { icon: Truck, label: 'Giao hàng toàn quốc' },
  { icon: ShieldCheck, label: 'Chất liệu chọn lọc' },
  { icon: Sparkles, label: 'Tư vấn phối màu' },
  { icon: Ruler, label: 'Hỗ trợ chọn size' },
]

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24HomePage />
  if (tenant !== 'rynosport') notFound()

  const [{ products }, categories] = await Promise.all([
    getProductsPage({ limit: 4 }),
    getCategories(),
  ])
  const categoryLookup = new Map(categories.map((category) => [category.name.toLocaleLowerCase('vi'), category.slug]))

  return <div className="ryno-page">
    <RynoSiteHeader />
    <main id="noi-dung">
      <section className="ryno-hero" aria-labelledby="ryno-home-title">
        <Image
          className="ryno-hero-image"
          src="/images/rynosport/hero.png"
          alt="Đội thể thao mặc trang phục RynoSport khi ra sân"
          fill
          priority
          sizes="100vw"
        />
        <div className="ryno-hero-shield" aria-hidden="true" />
        <div className="ryno-hero-copy">
          <p>Trang phục thể thao đặt theo đội</p>
          <h1 id="ryno-home-title">RA SÂN<br /><em>CÓ BẢN SẮC</em></h1>
          <span>RynoSport giúp đội bạn chọn mẫu, phối màu, đặt logo và hoàn thiện bộ áo phù hợp với môn chơi lẫn tinh thần đội hình.</span>
          <div className="ryno-hero-actions">
            <Link href="/san-pham/">Xem bộ sưu tập <ArrowRight size={18} /></Link>
            <Link href="/lien-he/">Đặt áo đội</Link>
          </div>
        </div>
        <aside className="ryno-hero-card" aria-label="Quy trình nhanh">
          <b>3 bước</b>
          <span>Chọn mẫu</span>
          <span>Gửi màu & logo</span>
          <span>Chốt size đội hình</span>
        </aside>
      </section>

      <section className="ryno-assurance" aria-label="Cam kết RynoSport">
        {assuranceItems.map(({ icon: Icon, label }) => <div key={label}>
          <Icon size={22} />
          <span>{label}</span>
        </div>)}
      </section>

      <section className="ryno-section ryno-discovery" aria-labelledby="ryno-category-title">
        <div className="ryno-section-intro">
          <p>Chọn theo môn chơi</p>
          <h2 id="ryno-category-title">MỖI ĐỘI MỘT NHỊP, MỖI ÁO MỘT DẤU ẤN.</h2>
          <span>Bắt đầu từ môn chơi quen thuộc, rồi tinh chỉnh màu sắc, logo và phom áo để đội bạn có một bộ trang phục đúng chất.</span>
        </div>
        <div className="ryno-categories">
          {visualCategories.map((category) => {
            const slug = categoryLookup.get(category.name.toLocaleLowerCase('vi'))
            return <Link href={slug ? `/danh-muc/${slug}/` : '/san-pham/'} key={category.name} className="ryno-cat">
              <Image
                src={`/images/rynosport/${category.image}.png`}
                alt={`Trang phục ${category.name} RynoSport`}
                fill
                sizes="(max-width: 720px) 50vw, 33vw"
              />
              <i aria-hidden="true" />
              <small>{category.note}</small>
              <strong>{category.name}</strong>
              <ArrowRight size={19} />
            </Link>
          })}
        </div>
      </section>

      {products.length > 0 ? <section className="ryno-section ryno-products-home" aria-labelledby="ryno-products-title">
        <div className="ryno-section-heading">
          <div>
            <p>Mẫu đang sẵn sàng</p>
            <h2 id="ryno-products-title">CHỌN NHANH.<br />RA SÂN GỌN.</h2>
          </div>
          <Link href="/san-pham/">Xem toàn bộ <ArrowRight size={18} /></Link>
        </div>
        <div className="ryno-product-grid">
          {products.map((product) => <RynoCard product={product} key={product.slug} />)}
        </div>
      </section> : null}

      <section className="ryno-custom" aria-labelledby="ryno-custom-title">
        <div className="ryno-custom-image">
          <Image
            src="/images/rynosport/teamwear.png"
            alt="Đội thể thao trong bộ đồng phục RynoSport"
            fill
            sizes="(max-width: 860px) 100vw, 48vw"
          />
        </div>
        <div className="ryno-custom-copy">
          <p>Đặt áo đội cùng Ryno</p>
          <h2 id="ryno-custom-title">TỪ Ý TƯỞNG CŨ, LÊN DIỆN MẠO MỚI.</h2>
          <span>Giữ tinh thần đội bạn đang có, rồi làm mới bằng màu sắc, chất liệu và chi tiết nhận diện dễ nhớ hơn khi ra sân.</span>
          <div className="ryno-custom-steps">
            <div><ClipboardPenLine size={22} /><b>Chia sẻ nhu cầu</b><small>Môn chơi, số lượng, màu đội và logo.</small></div>
            <div><PackageCheck size={22} /><b>Nhận tư vấn mẫu</b><small>Gợi ý phom, chất liệu và cách phối phù hợp.</small></div>
            <div><CheckCircle2 size={22} /><b>Chốt phương án</b><small>Hoàn thiện size để đội hình mặc đồng bộ.</small></div>
          </div>
          <Link href="/lien-he/">Bắt đầu đặt áo <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="ryno-closing" aria-labelledby="ryno-closing-title">
        <p>RynoSport teamwear</p>
        <h2 id="ryno-closing-title">ĐỘI HÌNH MỚI<br />BẮT ĐẦU TỪ MỘT CUỘC GỌI.</h2>
        <span>Chọn mẫu có sẵn hoặc trao đổi để Ryno tư vấn bộ áo riêng cho đội bạn.</span>
        <Link href="/lien-he/">Liên hệ tư vấn <ArrowRight size={18} /></Link>
      </section>
    </main>
    <RynoSiteFooter />
  </div>
}
