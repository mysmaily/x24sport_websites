import { notFound } from 'next/navigation'

import X24ProductPage, { generateMetadata as generateX24ProductMetadata } from '../../../san-pham/[slug]/page'
import MayaoCauLongProductPage, { generateMetadata as generateMayaoCauLongProductMetadata } from '../../_mayaocaulong/san-pham/[slug]/page'

type Props = {
  params: Promise<{ tenant: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'mayaocaulong') return generateMayaoCauLongProductMetadata({ params: Promise.resolve({ slug }) })
  if (tenant !== 'x24sport') return {}
  return generateX24ProductMetadata({ params: Promise.resolve({ slug }) })
}

export default async function TenantProductPage({ params, searchParams }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'mayaocaulong') return <MayaoCauLongProductPage params={Promise.resolve({ slug })} />
  if (tenant !== 'x24sport') notFound()
  return <X24ProductPage params={Promise.resolve({ slug })} searchParams={searchParams} />
}
