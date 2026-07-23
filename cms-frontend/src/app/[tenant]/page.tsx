import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, Menu, Phone, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import X24HomePage from '../page'

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24HomePage />
  if (tenant !== 'rynosport') notFound()

  const categories = [{ name: 'Bóng đá', image: 'football' }, { name: 'Cầu lông', image: 'badminton' }, { name: 'Bóng chuyền', image: 'volleyball' }, { name: 'Bóng rổ', image: 'basketball' }, { name: 'Pickleball', image: 'pickleball' }, { name: 'Chạy bộ', image: 'running' }, { name: 'Đồng phục đội nhóm', image: 'teamwear' }, { name: 'Tập luyện', image: 'training' }, { name: 'Esports', image: 'esports' }]
  return <div className="ryno-page">
    <header className="ryno-header"><Link href="/" className="ryno-logo">RYNO<span>SPORT</span></Link><nav>{categories.slice(0, 4).map((item) => <Link href="/san-pham/" key={item.name}>{item.name}</Link>)}</nav><a className="ryno-call" href="tel:0989371161"><Phone size={17} />098 937 11 61</a><button aria-label="Mở menu"><Menu /></button></header>
    <main id="noi-dung">
      <section className="ryno-hero"><Image className="ryno-hero-image" src="/images/rynosport/hero.png" alt="Đội thể thao trong trang phục RynoSport" fill priority sizes="100vw" /><div className="ryno-grid" /><div className="ryno-hero-copy"><p>RYNOSPORT / TEAM PERFORMANCE</p><h1>ĐỒNG ĐỘI<br /><em>KHÁC BIỆT.</em></h1><span>Trang phục thể thao cho đội nhóm sẵn sàng tạo dấu ấn trên mọi sân chơi.</span><div><Link href="/san-pham/">Khám phá bộ sưu tập <ArrowRight size={18} /></Link><a href="tel:0989371161">Tư vấn thiết kế</a></div></div><div className="ryno-orb"><b>01</b><small>MAKE<br />YOUR MOVE</small></div></section>
      <section className="ryno-trust">{[[Truck,'Giao hàng toàn quốc'],[ShieldCheck,'Chất liệu tuyển chọn'],[Sparkles,'Thiết kế theo đội'],[Phone,'Tư vấn nhanh']].map(([Icon,label]) => { const ItemIcon = Icon as typeof Truck; return <div key={String(label)}><ItemIcon /><span>{label as string}</span></div> })}</section>
      <section className="ryno-section"><div className="ryno-kicker">CHỌN THEO NHU CẦU</div><div className="ryno-heading"><h2>ĐỘI CỦA BẠN<br />CHƠI MÔN GÌ?</h2><Link href="/san-pham/">Xem tất cả <ArrowRight /></Link></div><div className="ryno-categories">{categories.map((category, index) => <Link href="/san-pham/" key={category.name} className={`ryno-cat ryno-cat-${index}`}><Image src={`/images/rynosport/${category.image}.png`} alt={category.name} fill sizes="(max-width: 720px) 50vw, 33vw" /><i /><span>0{index + 1}</span><strong>{category.name}</strong><ArrowRight /></Link>)}</div></section>
      <section className="ryno-feature"><div><p>RYNO CUSTOM LAB</p><h2>TỪ Ý TƯỞNG<br />ĐẾN MÀU ÁO RIÊNG</h2><span>Chọn kiểu áo, gửi logo và màu sắc. Đội ngũ Ryno cùng bạn hoàn thiện bộ trang phục phù hợp.</span><Link href="tel:0989371161">Bắt đầu tư vấn <ArrowRight /></Link></div><ol>{['Chia sẻ nhu cầu','Nhận gợi ý thiết kế','Chốt size & sản xuất'].map((step, index) => <li key={step}><b>0{index + 1}</b><span>{step}</span><Check /></li>)}</ol></section>
      <section className="ryno-cta"><p>RYNOSPORT</p><h2>SẴN SÀNG<br />CHO MỘT ĐỘI HÌNH MỚI?</h2><a href="tel:0989371161">Gọi 098 937 11 61 <Phone size={18} /></a></section>
    </main><footer className="ryno-footer"><strong>RYNO<span>SPORT</span></strong><p>Trang phục thể thao cho tinh thần đồng đội.</p><a href="tel:0989371161">098 937 11 61</a></footer>
  </div>
}
