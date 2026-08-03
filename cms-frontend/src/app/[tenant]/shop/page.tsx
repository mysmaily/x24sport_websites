import { notFound, permanentRedirect } from 'next/navigation'

import MayaoChayBoShopPage from '../_mayaochaybo/shop/page'

type Props = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { tenant } = await params
  void searchParams
  if (tenant === 'mayaobongda') return {
    title: 'Mẫu Áo Bóng Đá Thiết Kế',
    description: 'Xem mẫu áo bóng đá thiết kế sẵn, áo không logo và bộ đồ thi đấu có thể chỉnh màu, logo, tên số theo đội.',
    alternates: { canonical: '/san-pham/' },
  }
  return {}
}

export default async function TenantShopPage({ params, searchParams }: Props) {
  const { tenant } = await params
  if (tenant === 'mayaochaybo') {
    await MayaoChayBoShopPage({ searchParams })
    notFound()
  }
  if (tenant === 'mayaobongda') permanentRedirect('/san-pham/')
  notFound()
}
