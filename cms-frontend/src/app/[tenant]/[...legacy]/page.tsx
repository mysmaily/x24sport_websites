import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import X24LegacyPage from '../../[...legacy]/page'
import { getProductBySlug, productImages } from '../../../lib/content'
import { RynoProductPage } from '../ryno-catalog'
import MayaoCauLongCatalogFilterPage, { generateMetadata as generateMayaoCauLongCatalogMetadata } from '../_mayaocaulong/[catalogSlug]/page'
import { getCatalogFilterBySlug } from '../_mayaocaulong/lib/content'
import MayaoPickleballCatalogFilterPage, { generateMetadata as generateMayaoPickleballCatalogMetadata } from '../_mayaopickleball/[catalogSlug]/page'
import { getCatalogFilterBySlug as getMayaoPickleballCatalogFilterBySlug } from '../_mayaopickleball/lib/content'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string; legacy: string[] }> }): Promise<Metadata> {
  const { tenant, legacy } = await params
  if (tenant === 'mayaocaulong' && legacy.length === 1 && getCatalogFilterBySlug(legacy[0])) {
    return generateMayaoCauLongCatalogMetadata({ params: Promise.resolve({ catalogSlug: legacy[0] }) })
  }
  if (tenant === 'mayaopickleball' && legacy.length === 1 && getMayaoPickleballCatalogFilterBySlug(legacy[0])) {
    return generateMayaoPickleballCatalogMetadata({
      params: Promise.resolve({ catalogSlug: legacy[0] }),
      searchParams: Promise.resolve({}),
    })
  }
  if (tenant !== 'rynosport' || legacy.length !== 1) return {}

  const product = await getProductBySlug(legacy[0])
  if (!product) return {}

  const image = productImages(product)[0]
  const description = product.shortDescription || `Thông tin mẫu ${product.name} tại RynoSport. Liên hệ để được tư vấn size, màu sắc và đặt áo đội.`

  return {
    title: product.name,
    description,
    alternates: { canonical: `https://rynosport.vn/${legacy[0]}/` },
    openGraph: {
      title: product.name,
      description,
      url: `https://rynosport.vn/${legacy[0]}/`,
      images: image ? [{ url: image.url, width: 1000, height: 1000, alt: image.alt || product.name }] : undefined,
    },
  }
}

export default async function TenantLegacyPage(props: Parameters<typeof X24LegacyPage>[0] & { params: Promise<{ tenant: string; legacy: string[] }> }) {
  const { tenant, legacy } = await props.params
  if (tenant === 'mayaocaulong' && legacy.length === 1 && getCatalogFilterBySlug(legacy[0])) {
    return <MayaoCauLongCatalogFilterPage params={Promise.resolve({ catalogSlug: legacy[0] })} />
  }
  if (tenant === 'mayaopickleball' && legacy.length === 1 && getMayaoPickleballCatalogFilterBySlug(legacy[0])) {
    return <MayaoPickleballCatalogFilterPage
      params={Promise.resolve({ catalogSlug: legacy[0] })}
      searchParams={props.searchParams as Promise<{ page?: string }>}
    />
  }
  if (tenant === 'rynosport' && legacy.length === 1) return <RynoProductPage slug={legacy[0]} />
  if (tenant !== 'x24sport') notFound()
  return <X24LegacyPage params={Promise.resolve({ legacy })} searchParams={props.searchParams} />
}
