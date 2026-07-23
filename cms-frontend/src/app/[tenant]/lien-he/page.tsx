import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Phone, Ruler, Shirt, SwatchBook } from 'lucide-react'
import X24ContactPage from '../../lien-he/page'
import { RYNO_PHONE, RYNO_PHONE_LABEL, RynoSiteFooter, RynoSiteHeader } from '../ryno-shell'
export default async function TenantContactPage({ params }: { params: Promise<{ tenant: string }> }) {
  if ((await params).tenant === 'rynosport') return <div className="ryno-store"><RynoSiteHeader /><main id="noi-dung" className="ryno-contact"><section><p>Đặt áo đội cùng Ryno</p><h1>TRAO ĐỔI ĐỂ BỘ ÁO ĐÚNG VỚI ĐỘI BẠN.</h1><span>Gọi trực tiếp để Ryno nắm môn chơi, số lượng và ý tưởng bạn đang có.</span><a href={`tel:${RYNO_PHONE}`}><Phone size={18} />Gọi {RYNO_PHONE_LABEL}</a></section><aside><div><Shirt size={24} /><h2>Chọn kiểu áo</h2><p>Chia sẻ nhu cầu sử dụng và phong cách đội hướng đến.</p></div><div><SwatchBook size={24} /><h2>Phối màu, đặt logo</h2><p>Đội ngũ Ryno hỗ trợ tinh chỉnh phương án phù hợp.</p></div><div><Ruler size={24} /><h2>Hoàn thiện size</h2><p>Trao đổi để đội hình có lựa chọn thoải mái khi vận động.</p></div><Link href="/san-pham/">Xem mẫu đang có <ArrowRight size={18} /></Link></aside></main><RynoSiteFooter /></div>
  if ((await params).tenant !== 'x24sport') notFound()
  return <X24ContactPage />
}
