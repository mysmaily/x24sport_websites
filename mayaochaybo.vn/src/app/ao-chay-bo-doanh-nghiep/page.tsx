import type { Metadata } from 'next'
import { AudienceLandingPage } from '@/components/audience-landing-page'
import { getAudienceLanding } from '@/lib/audience-landings'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Áo Chạy Bộ Công Ty & Doanh Nghiệp Thiết Kế Riêng',
  description: 'Thiết kế áo chạy bộ cho công ty, giải nội bộ và hoạt động gắn kết theo màu sắc, logo và nhận diện doanh nghiệp.',
  alternates: { canonical: '/ao-chay-bo-doanh-nghiep/' },
}

export default function CorporateRunningShirtPage() {
  return <AudienceLandingPage landing={getAudienceLanding('ao-chay-bo-doanh-nghiep')} />
}
