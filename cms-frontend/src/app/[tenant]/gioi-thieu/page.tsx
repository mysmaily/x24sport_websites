import { notFound } from 'next/navigation'

import Page from '../_mayaochaybo/gioi-thieu/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'

export { metadata } from '../_mayaochaybo/gioi-thieu/page'

export default async function TenantStaticPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaochaybo') notFound()
  return <MayaoChayBoShell><Page /></MayaoChayBoShell>
}
