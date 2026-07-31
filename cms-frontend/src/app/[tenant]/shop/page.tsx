import { notFound } from 'next/navigation'

import MayaoChayBoShopPage from '../_mayaochaybo/shop/page'
import MayaoBongDaShopPage, { generateMetadata as generateMayaoBongDaShopMetadata } from '../_mayaobongda/shop/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

type Props = {
  params: Promise<{ tenant: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { tenant } = await params
  if (tenant === 'mayaobongda') return generateMayaoBongDaShopMetadata({ searchParams })
  return {}
}

export default async function TenantShopPage({ params, searchParams }: Props) {
  const { tenant } = await params
  if (tenant === 'mayaochaybo') {
    await MayaoChayBoShopPage({ searchParams })
    notFound()
  }
  if (tenant === 'mayaobongda') return <MayaoBongDaShell><MayaoBongDaShopPage searchParams={searchParams} /></MayaoBongDaShell>
  notFound()
}
