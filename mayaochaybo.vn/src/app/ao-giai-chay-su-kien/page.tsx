import type { Metadata } from 'next'
import { AudienceLandingPage } from '@/components/audience-landing-page'
import { getAudienceLanding } from '@/lib/audience-landings'
import { pageMetadata } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = pageMetadata({
  title: 'Áo Giải Chạy & Sự Kiện Thiết Kế Theo Chương Trình',
  description: 'Thiết kế áo giải chạy, áo sự kiện và race kit theo chủ đề chương trình, logo ban tổ chức và nhà tài trợ.',
  image: { url: '/images/audience-landings/giai-chay-x24-run-start.webp', width: 1448, height: 1086, alt: 'Áo giải chạy và sự kiện thiết kế theo chương trình' },
  path: '/ao-giai-chay-su-kien/',
})

export default function RunningEventShirtPage() {
  return <AudienceLandingPage landing={getAudienceLanding('ao-giai-chay-su-kien')} />
}
