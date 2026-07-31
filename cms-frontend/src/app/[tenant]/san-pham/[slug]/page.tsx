import { notFound, permanentRedirect } from 'next/navigation'

import X24ProductPage, { generateMetadata as generateX24ProductMetadata } from '../../../san-pham/[slug]/page'
import MayaoCauLongProductPage, { generateMetadata as generateMayaoCauLongProductMetadata } from '../../_mayaocaulong/san-pham/[slug]/page'
import MayaoPickleballProductPage, { generateMetadata as generateMayaoPickleballProductMetadata } from '../../_mayaopickleball/san-pham/[slug]/page'
import MayaoBongRoProductPage, { generateMetadata as generateMayaoBongRoProductMetadata } from '../../_mayaobongro/san-pham/[slug]/page'
import { MayaoBongRoShell } from '../../_mayaobongro/shell'
import { resolveProductSlug as resolveMayaoChayBoProductSlug } from '../../_mayaochaybo/lib/cms'

type Props = {
  params: Promise<{ tenant: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'mayaocaulong') return generateMayaoCauLongProductMetadata({ params: Promise.resolve({ slug }) })
  if (tenant === 'mayaopickleball') return generateMayaoPickleballProductMetadata({ params: Promise.resolve({ slug }) })
  if (tenant === 'mayaobongro') return generateMayaoBongRoProductMetadata({ params: Promise.resolve({ slug }), searchParams })
  if (tenant !== 'x24sport') return {}
  return generateX24ProductMetadata({ params: Promise.resolve({ slug }) })
}

export default async function TenantProductPage({ params, searchParams }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'mayaocaulong') return <MayaoCauLongProductPage params={Promise.resolve({ slug })} />
  if (tenant === 'mayaopickleball') return <MayaoPickleballProductPage params={Promise.resolve({ slug })} />
  if (tenant === 'mayaobongro') return <MayaoBongRoShell><MayaoBongRoProductPage params={Promise.resolve({ slug })} searchParams={searchParams} /></MayaoBongRoShell>
  if (tenant === 'mayaochaybo') {
    const product = await resolveMayaoChayBoProductSlug(slug)
    if (!product) notFound()
    permanentRedirect(product.legacyPath || `/${product.slug}/`)
  }
  if (tenant !== 'x24sport') notFound()
  return <X24ProductPage params={Promise.resolve({ slug })} searchParams={searchParams} />
}
