import type { Metadata } from 'next'
import { AudienceLandingPage } from '@/components/audience-landing-page'
import { getAudienceLanding } from '@/lib/audience-landings'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Áo Chạy Bộ Đội Nhóm & Câu Lạc Bộ Thiết Kế Riêng',
  description: 'Thiết kế áo chạy bộ cho đội nhóm và câu lạc bộ theo tên đội, logo, màu sắc và cá tính chung.',
  alternates: { canonical: '/ao-chay-bo-doi-nhom-cau-lac-bo/' },
}

export default function RunningClubShirtPage() {
  return <AudienceLandingPage landing={getAudienceLanding('ao-chay-bo-doi-nhom-cau-lac-bo')} />
}
