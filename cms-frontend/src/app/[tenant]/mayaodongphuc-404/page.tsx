import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MayAoDongPhucNotFoundPage } from '../_mayaodongphuc/not-found-page'
import { MayAoDongPhucShell } from '../_mayaodongphuc/shell'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  if (tenant !== 'mayaodongphuc') return {}
  return {
    title: { absolute: 'Không tìm thấy trang | May Áo Đồng Phục' },
    description: 'Trang không tồn tại trên May Áo Đồng Phục. Quay lại catalog hoặc gửi brief để được tư vấn mẫu đồng phục phù hợp.',
    alternates: { canonical: '/' },
    openGraph: {
      title: 'Không tìm thấy trang | May Áo Đồng Phục',
      description: 'Trang không tồn tại trên May Áo Đồng Phục. Quay lại catalog hoặc gửi brief để được tư vấn mẫu đồng phục phù hợp.',
      url: '/',
    },
    robots: { index: false, follow: false },
  }
}

export default async function Mayaodongphuc404Page({ params }: Props) {
  const { tenant } = await params
  if (tenant !== 'mayaodongphuc') notFound()
  return <MayAoDongPhucShell><MayAoDongPhucNotFoundPage /></MayAoDongPhucShell>
}
