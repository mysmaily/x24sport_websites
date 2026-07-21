import type { Metadata } from 'next'
import { AudienceLandingPage } from '@/components/audience-landing-page'
import { getAudienceLanding } from '@/lib/audience-landings'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Áo Giải Chạy & Sự Kiện Thiết Kế Theo Chương Trình',
  description: 'Thiết kế áo giải chạy, áo sự kiện và race kit theo chủ đề chương trình, logo ban tổ chức và nhà tài trợ.',
  alternates: { canonical: '/ao-giai-chay-su-kien/' },
}

export default function RunningEventShirtPage() {
  return <AudienceLandingPage landing={getAudienceLanding('ao-giai-chay-su-kien')} />
}
