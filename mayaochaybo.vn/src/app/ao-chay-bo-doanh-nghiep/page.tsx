import type { Metadata } from 'next'
import { AudienceLandingPage } from '@/components/audience-landing-page'
import { getAudienceLanding } from '@/lib/audience-landings'
import { pageMetadata } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({
  title: 'Áo Chạy Bộ Công Ty & Doanh Nghiệp Thiết Kế Riêng',
  description: 'Thiết kế áo chạy bộ cho công ty, giải nội bộ và hoạt động gắn kết theo màu sắc, logo và nhận diện doanh nghiệp.',
  image: { url: '/images/audience-landings/doanh-nghiep-vinaseed-green-run.webp', width: 1448, height: 1086, alt: 'Áo chạy bộ doanh nghiệp thiết kế riêng cho hoạt động nội bộ' },
  path: '/ao-chay-bo-doanh-nghiep/',
})

export default function CorporateRunningShirtPage() {
  return <AudienceLandingPage landing={getAudienceLanding('ao-chay-bo-doanh-nghiep')} />
}
