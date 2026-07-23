import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ClipboardPenLine, PackageCheck, Ruler, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import X24HomePage from '../page'
import { getCategories, getProductsPage } from '../../lib/content'
import { RynoCard } from './ryno-catalog'
import { RynoSiteFooter, RynoSiteHeader } from './ryno-shell'

const visualCategories = [
  { name: 'Bóng đá', image: 'football' }, { name: 'Cầu lông', image: 'badminton' }, { name: 'Bóng chuyền', image: 'volleyball' },
  { name: 'Bóng rổ', image: 'basketball' }, { name: 'Pickleball', image: 'pickleball' }, { name: 'Chạy bộ', image: 'running' },
  { name: 'Đồng phục đội nhóm', image: 'teamwear' }, { name: 'Tập luyện', image: 'training' }, { name: 'Esports', image: 'esports' },
]

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24HomePage />
  if (tenant !== 'rynosport') notFound()
  const [{ products }, categories] = await Promise.all([getProductsPage({ limit: 4 }), getCategories()])
  const categoryLookup = new Map(categories.map((category) => [category.name.toLocaleLowerCase('vi'), category.slug]))
  return <div className="ryno-page">
    <RynoSiteHeader />
    <main id="noi-dung">
      <section className="ryno-hero">
        <Image className="ryno-hero-image" src="/images/rynosport/hero.png" alt="Vận động viên trong trang phục thể thao RynoSport" fill priority sizes="100vw" />
        <div className="ryno-grid" /><div className="ryno-hero-copy"><p>Trang phục cho đội nhóm</p><h1>RA SÂN<br /><em>CÓ BẢN SẮC.</em></h1><span>Chọn mẫu sẵn hoặc cùng Ryno tạo bộ áo mang màu sắc riêng của đội bạn.</span><div><Link href="/san-pham/">Xem bộ sưu tập <ArrowRight size={18} /></Link><Link className="ryno-secondary-cta" href="/lien-he/">Đặt áo đội</Link></div></div>
      </section>
      <section className="ryno-assurance" aria-label="Cam kết RynoSport">{[[Truck, 'Giao hàng toàn quốc'], [ShieldCheck, 'Chất liệu chọn lọc'], [Sparkles, 'Thiết kế theo đội'], [Ruler, 'Tư vấn size kỹ']].map(([Icon, label]) => { const AssuranceIcon = Icon as typeof Truck; return <div key={String(label)}><AssuranceIcon size={22} /><span>{label as string}</span></div> })}</section>
      <section className="ryno-section ryno-discovery"><div className="ryno-section-intro"><p>Chọn theo môn chơi</p><h2>ĐÚNG CHẤT ĐỘI BẠN.</h2><span>Từ những buổi tập đều đặn đến ngày thi đấu, hãy bắt đầu với trang phục phù hợp môn chơi và tinh thần của đội.</span></div><div className="ryno-categories">{visualCategories.map((category) => { const slug = categoryLookup.get(category.name.toLocaleLowerCase('vi')); return <Link href={slug ? `/danh-muc/${slug}/` : '/san-pham/'} key={category.name} className="ryno-cat"><Image src={`/images/rynosport/${category.image}.png`} alt={category.name} fill sizes="(max-width: 720px) 50vw, 33vw" /><i /><strong>{category.name}</strong><ArrowRight size={19} /></Link> })}</div></section>
      {products.length > 0 && <section className="ryno-section ryno-products-home"><div className="ryno-section-heading"><div><p>Mẫu mới trên kệ</p><h2>SẴN SÀNG<br />CHINH PHỤC.</h2></div><Link href="/san-pham/">Xem toàn bộ <ArrowRight size={18} /></Link></div><div className="ryno-product-grid">{products.map((product) => <RynoCard product={product} key={product.slug} />)}</div></section>}
      <section className="ryno-custom"><div className="ryno-custom-image"><Image src="/images/rynosport/teamwear.png" alt="Đội thể thao trong đồng phục riêng" fill sizes="(max-width: 860px) 100vw, 48vw" /></div><div className="ryno-custom-copy"><p>Đặt áo đội cùng Ryno</p><h2>Ý TƯỞNG CỦA ĐỘI, DẤU ẤN CỦA BẠN.</h2><span>Chọn kiểu áo, gửi logo và màu sắc. Ryno hỗ trợ hoàn thiện phương án phù hợp với nhu cầu sử dụng.</span><div className="ryno-custom-steps"><div><ClipboardPenLine size={22} /><b>Chia sẻ nhu cầu</b><small>Môn chơi, số lượng và ý tưởng.</small></div><div><PackageCheck size={22} /><b>Nhận tư vấn mẫu</b><small>Chọn chất liệu, phối màu và size.</small></div><div><Check size={22} /><b>Chốt phương án</b><small>Sẵn sàng cho đội hình mới.</small></div></div><Link href="/lien-he/">Đặt áo đội <ArrowRight size={18} /></Link></div></section>
      <section className="ryno-closing"><h2>ĐỘI HÌNH MỚI<br />BẮT ĐẦU TỪ ĐÂY.</h2><p>Chọn mẫu phù hợp hoặc liên hệ để trao đổi về bộ áo riêng của đội bạn.</p><Link href="/lien-he/">Đặt áo đội <ArrowRight size={18} /></Link></section>
    </main><RynoSiteFooter />
  </div>
}
