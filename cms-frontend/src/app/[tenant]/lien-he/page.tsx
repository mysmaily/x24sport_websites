import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone, Ruler, Shirt, SwatchBook } from 'lucide-react'

import X24ContactPage from '../../lien-he/page'
import { RYNO_PHONE, RYNO_PHONE_LABEL, RynoSiteFooter, RynoSiteHeader } from '../ryno-shell'
import MayaoChayBoContactPage, { metadata as mayaoChayBoContactMetadata } from '../_mayaochaybo/lien-he/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'
import MayaoCauLongContactPage, { metadata as mayaoCauLongContactMetadata } from '../_mayaocaulong/lien-he/page'
import MayaoBongRoContactPage, { metadata as mayaoBongRoContactMetadata } from '../_mayaobongro/lien-he/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params
  if (tenant === 'mayaochaybo') return mayaoChayBoContactMetadata
  if (tenant === 'mayaocaulong') return mayaoCauLongContactMetadata
  if (tenant === 'mayaobongro') return mayaoBongRoContactMetadata
  if (tenant !== 'rynosport') return {}

  return {
    title: 'Liên hệ đặt áo đội RynoSport',
    description: 'Liên hệ RynoSport để được tư vấn mẫu áo, màu sắc, logo, số lượng và size cho đội nhóm hoặc câu lạc bộ.',
    alternates: { canonical: 'https://rynosport.vn/lien-he/' },
    openGraph: {
      title: 'Liên hệ đặt áo đội RynoSport',
      description: 'Trao đổi nhu cầu đặt áo đội cùng RynoSport.',
      url: 'https://rynosport.vn/lien-he/',
    },
  }
}

export default async function TenantContactPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant === 'mayaochaybo') return <MayaoChayBoShell><MayaoChayBoContactPage /></MayaoChayBoShell>
  if (tenant === 'mayaocaulong') return <MayaoCauLongContactPage />
  if (tenant === 'mayaobongro') return <MayaoBongRoShell><MayaoBongRoContactPage /></MayaoBongRoShell>

  if (tenant === 'rynosport') {
    return <div className="ryno-store">
      <RynoSiteHeader />
      <main id="noi-dung" className="ryno-contact">
        <section>
          <p>Đặt áo đội cùng Ryno</p>
          <h1>CHO RYNO BIẾT ĐỘI BẠN MUỐN RA SÂN THẾ NÀO.</h1>
          <span>Gọi trực tiếp để trao đổi về môn chơi, số lượng, màu sắc, logo và thời gian cần nhận áo.</span>
          <a href={`tel:${RYNO_PHONE}`}><Phone size={18} />Gọi {RYNO_PHONE_LABEL}</a>
        </section>
        <aside aria-label="Thông tin cần chuẩn bị khi đặt áo">
          <div><Shirt size={24} /><h2>Kiểu áo & môn chơi</h2><p>Cho Ryno biết đội bạn chơi môn gì và thích phom áo ra sao.</p></div>
          <div><SwatchBook size={24} /><h2>Màu sắc & logo</h2><p>Chia sẻ màu chủ đạo, logo hoặc ý tưởng nhận diện của đội.</p></div>
          <div><Ruler size={24} /><h2>Số lượng & size</h2><p>Chuẩn bị số lượng thành viên để được tư vấn size gọn hơn.</p></div>
          <Link href="/san-pham/">Xem mẫu đang có <ArrowRight size={18} /></Link>
        </aside>
      </main>
      <RynoSiteFooter />
    </div>
  }

  if (tenant !== 'x24sport') notFound()
  return <X24ContactPage />
}
