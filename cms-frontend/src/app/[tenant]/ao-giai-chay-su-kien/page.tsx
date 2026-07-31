import { notFound } from 'next/navigation'

import Page from '../_mayaochaybo/ao-giai-chay-su-kien/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'

export { metadata } from '../_mayaochaybo/ao-giai-chay-su-kien/page'

export default async function TenantStaticPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaochaybo') notFound()
  return <MayaoChayBoShell><Page /></MayaoChayBoShell>
}
