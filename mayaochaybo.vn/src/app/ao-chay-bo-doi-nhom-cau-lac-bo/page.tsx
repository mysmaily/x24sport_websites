import type { Metadata } from 'next'
import { AudienceLandingPage } from '@/components/audience-landing-page'
import { getAudienceLanding } from '@/lib/audience-landings'
import { pageMetadata } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({
  title: 'Áo Chạy Bộ Đội Nhóm & Câu Lạc Bộ Thiết Kế Riêng',
  description: 'Thiết kế áo chạy bộ cho đội nhóm và câu lạc bộ theo tên đội, logo, màu sắc và cá tính chung.',
  image: { url: '/images/audience-landings/doi-nhom-viet-nam-running-club.webp', width: 1448, height: 1086, alt: 'Đội chạy bộ mặc áo câu lạc bộ thiết kế riêng' },
  path: '/ao-chay-bo-doi-nhom-cau-lac-bo/',
})

export default function RunningClubShirtPage() {
  return <AudienceLandingPage landing={getAudienceLanding('ao-chay-bo-doi-nhom-cau-lac-bo')} />
}
