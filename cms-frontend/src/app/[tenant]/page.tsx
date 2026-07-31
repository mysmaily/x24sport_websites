import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardPenLine,
  Layers3,
  PackageCheck,
  Paintbrush,
  Ruler,
  ShieldCheck,
  Shirt,
  Sparkles,
  Timer,
  Truck,
  Users,
} from 'lucide-react'

import X24HomePage from '../page'
import { getCategories, getProductsPage } from '../../lib/content'
import { RynoCard, RynoDesignGrid } from './ryno-catalog'
import { RynoSiteFooter, RynoSiteHeader } from './ryno-shell'
import MayaoCauLongHomePage from './_mayaocaulong/page'
import MayaoPickleballHomePage from './_mayaopickleball/page'
import MayaoBongChuyenHomePage from './_mayaobongchuyen/page'
import MayaoBongRoHomePage from './_mayaobongro/page'
import { MayaoBongRoShell } from './_mayaobongro/shell'
import MayaoChayBoHomePage from './_mayaochaybo/page'
import { MayaoChayBoShell } from './_mayaochaybo/shell'
import MayaoBongDaHomePage from './_mayaobongda/page'
import { MayaoBongDaShell } from './_mayaobongda/shell'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params
  if (tenant === 'mayaocaulong') return {}
  if (tenant === 'mayaopickleball') return {}
  if (tenant === 'mayaobongchuyen') return {}
  if (tenant === 'mayaobongro') return {}
  if (tenant === 'mayaochaybo') return {}
  if (tenant === 'mayaobongda') return {}
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
  { name: 'Bóng đá', image: 'football-red', note: 'Form thi đấu mạnh mẽ' },
  { name: 'Cầu lông', image: 'badminton-red', note: 'Nhẹ, thoáng, linh hoạt' },
  { name: 'Bóng chuyền', image: 'volleyball-red', note: 'Đồng bộ cho đội hình' },
  { name: 'Bóng rổ', image: 'basketball-red', note: 'Phom rộng năng động' },
  { name: 'Pickleball', image: 'pickleball-red', note: 'Gọn gàng cho chuyển động nhanh' },
  { name: 'Chạy bộ', image: 'running-red', note: 'Tối giản và dễ phối' },
  { name: 'Đồng phục đội nhóm', image: 'teamwear-red', note: 'Màu sắc riêng của đội' },
  { name: 'Tập luyện', image: 'training-red', note: 'Bền bỉ cho lịch tập dày' },
  { name: 'Esports', image: 'esports-red', note: 'Sắc nét cho clan và giải đấu' },
]

const assuranceItems = [
  { icon: Truck, label: 'Giao hàng toàn quốc' },
  { icon: ShieldCheck, label: 'Chất liệu chọn lọc' },
  { icon: Sparkles, label: 'Tư vấn phối màu' },
  { icon: Ruler, label: 'Hỗ trợ chọn size' },
]

const materialItems = [
  { icon: Shirt, title: 'Form áo theo môn', text: 'Ưu tiên phom mặc thoải mái khi chạy, bật nhảy, xoay người hoặc thi đấu nhiều hiệp.' },
  { icon: Layers3, title: 'Bề mặt thoáng nhẹ', text: 'Tư vấn chất liệu thể thao dễ vận động, phù hợp lịch tập và thi đấu của đội.' },
  { icon: Paintbrush, title: 'Màu đội rõ bản sắc', text: 'Phối đỏ, đen, trắng hoặc màu riêng của đội để lên sân đồng bộ và dễ nhận diện.' },
]

const processItems = [
  { step: '01', title: 'Gửi nhu cầu', text: 'Cho Ryno biết môn chơi, số lượng, màu đội, logo và thời gian cần nhận áo.' },
  { step: '02', title: 'Chọn mẫu & phối màu', text: 'Dựa trên mẫu có sẵn hoặc ý tưởng riêng, Ryno gợi ý phom áo và cách đặt nhận diện.' },
  { step: '03', title: 'Chốt size đội hình', text: 'Tổng hợp size, tên, số áo và các chi tiết cần in trước khi hoàn thiện đơn.' },
  { step: '04', title: 'Nhận áo đồng bộ', text: 'Đội nhận bộ trang phục gọn gàng để tập luyện, thi đấu, đi giải hoặc tham gia sự kiện.' },
]

const trustItems = [
  { icon: Users, title: 'CLB & đội phong trào', text: 'Tập trung vào sự đồng bộ, dễ mặc và dễ bổ sung thành viên mới.' },
  { icon: Award, title: 'Giải đấu & trường học', text: 'Tư vấn mẫu áo nổi bật, gọn thông tin đội và phù hợp nhiều nhóm tuổi.' },
  { icon: Timer, title: 'Đơn cần tiến độ rõ', text: 'Trao đổi sớm về số lượng, size và thời gian để chọn phương án phù hợp.' },
]

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24HomePage />
  if (tenant === 'mayaocaulong') return <MayaoCauLongHomePage />
  if (tenant === 'mayaopickleball') return <MayaoPickleballHomePage />
  if (tenant === 'mayaobongchuyen') return <MayaoBongChuyenHomePage />
  if (tenant === 'mayaobongro') return <MayaoBongRoShell><MayaoBongRoHomePage /></MayaoBongRoShell>
  if (tenant === 'mayaochaybo') return <MayaoChayBoShell><MayaoChayBoHomePage /></MayaoChayBoShell>
  if (tenant === 'mayaobongda') return <MayaoBongDaShell><MayaoBongDaHomePage /></MayaoBongDaShell>
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
          src="/images/rynosport/cta-banner.png"
          alt="Đội thể thao mặc trang phục RynoSport khi ra sân"
          fill
          priority
          sizes="100vw"
        />
        <div className="ryno-hero-shield" aria-hidden="true" />
        <div className="ryno-hero-copy">
          <Image
            className="ryno-hero-logo"
            src="/images/rynosport/logo-banner.png"
            alt="RynoSport - Áo đấu và đồng phục thể thao"
            width={360}
            height={120}
            priority
          />
          <p>Áo đấu & đồng phục thể thao</p>
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

      <section className="ryno-section ryno-products-home" aria-labelledby="ryno-products-title">
        <div className="ryno-section-heading">
          <div>
            <p>{products.length > 0 ? 'Mẫu đang sẵn sàng' : 'Hướng thiết kế gợi ý'}</p>
            <h2 id="ryno-products-title">CHỌN NHANH.<br />RA SÂN GỌN.</h2>
          </div>
          <Link href="/san-pham/">Xem toàn bộ <ArrowRight size={18} /></Link>
        </div>
        {products.length > 0 ? <div className="ryno-product-grid">
          {products.map((product, index) => <RynoCard product={product} priority={index < 2} key={product.slug} />)}
        </div> : <RynoDesignGrid />}
      </section>

      <section className="ryno-materials" aria-labelledby="ryno-materials-title">
        <div className="ryno-materials-copy">
          <p>Chất liệu & form áo</p>
          <h2 id="ryno-materials-title">MẶC GỌN. CHƠI THOÁNG. LÊN HÌNH SẮC NÉT.</h2>
          <span>Ryno tập trung vào cảm giác mặc khi vận động và cách bộ áo thể hiện màu đội ngoài sân. Mỗi lựa chọn về cổ áo, tay áo, mảng màu và vị trí logo đều phục vụ cho đội hình thật.</span>
          <div className="ryno-material-list">
            {materialItems.map(({ icon: Icon, title, text }) => <div key={title}>
              <Icon size={23} />
              <b>{title}</b>
              <small>{text}</small>
            </div>)}
          </div>
        </div>
        <div className="ryno-materials-image">
          <Image
            src="/images/rynosport/materials.png"
            alt="Chi tiết vải áo thể thao đỏ đen trắng RynoSport"
            fill
            sizes="(max-width: 860px) 100vw, 48vw"
          />
        </div>
      </section>

      <section className="ryno-process" aria-labelledby="ryno-process-title">
        <div className="ryno-process-image">
          <Image
            src="/images/rynosport/process.png"
            alt="Tư vấn mẫu áo đội RynoSport với bảng màu và size"
            fill
            sizes="(max-width: 900px) 100vw, 42vw"
          />
        </div>
        <div className="ryno-process-copy">
          <p>Quy trình đặt áo</p>
          <h2 id="ryno-process-title">TỪ Ý TƯỞNG ĐỘI ĐẾN BỘ ÁO SẴN SÀNG RA SÂN.</h2>
          <div className="ryno-process-list">
            {processItems.map((item) => <div key={item.step}>
              <strong>{item.step}</strong>
              <b>{item.title}</b>
              <span>{item.text}</span>
            </div>)}
          </div>
        </div>
      </section>

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

      <section className="ryno-trust" aria-labelledby="ryno-trust-title">
        <div className="ryno-section-intro">
          <p>Phù hợp nhiều đội hình</p>
          <h2 id="ryno-trust-title">MỘT BỘ ÁO ĐẸP PHẢI GIÚP CẢ ĐỘI DỄ MẶC.</h2>
          <span>Ryno không chỉ làm một mẫu áo nhìn mạnh trên banner. Mục tiêu là giúp cả đội chọn được phương án dễ đặt, dễ mặc và dễ dùng lâu dài.</span>
        </div>
        <div className="ryno-trust-grid">
          {trustItems.map(({ icon: Icon, title, text }) => <div key={title}>
            <Icon size={25} />
            <b>{title}</b>
            <span>{text}</span>
          </div>)}
        </div>
      </section>

      <section className="ryno-closing" aria-labelledby="ryno-closing-title">
        <Image
          src="/images/rynosport/cta-banner.png"
          alt="Đội thể thao mặc đồng phục đỏ đen trắng RynoSport"
          fill
          sizes="100vw"
        />
        <div>
          <p>RynoSport teamwear</p>
          <h2 id="ryno-closing-title">ĐỘI HÌNH MỚI<br />BẮT ĐẦU TỪ MỘT CUỘC GỌI.</h2>
          <span>Chọn mẫu có sẵn hoặc trao đổi để Ryno tư vấn bộ áo riêng cho đội bạn.</span>
        </div>
        <Link href="/lien-he/">Liên hệ tư vấn <ArrowRight size={18} /></Link>
      </section>
    </main>
    <RynoSiteFooter />
  </div>
}
