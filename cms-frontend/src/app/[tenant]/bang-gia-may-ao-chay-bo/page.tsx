import { notFound } from 'next/navigation'

import Page, { metadata } from '../_mayaochaybo/bang-gia-may-ao-chay-bo/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'

type Props = { params: Promise<{ tenant: string }> }

export async function generateMetadata({ params }: Props) {
  if ((await params).tenant !== 'mayaochaybo') return {}
  return metadata
}

export default async function TenantRunningPricingPage({ params }: Props) {
  if ((await params).tenant !== 'mayaochaybo') notFound()
  return <MayaoChayBoShell><Page /></MayaoChayBoShell>
}
