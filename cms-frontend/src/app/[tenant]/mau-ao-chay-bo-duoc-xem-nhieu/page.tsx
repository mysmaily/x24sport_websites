import { notFound } from 'next/navigation'

import Page, { metadata } from '../_mayaochaybo/mau-ao-chay-bo-duoc-xem-nhieu/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'

export { metadata }

export default async function TenantPopularRunningShirtsPage({ params, searchParams }: { params: Promise<{ tenant: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { tenant } = await params
  if (tenant !== 'mayaochaybo') notFound()
  return <MayaoChayBoShell><Page searchParams={searchParams} /></MayaoChayBoShell>
}
