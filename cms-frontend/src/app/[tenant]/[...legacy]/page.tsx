import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import X24LegacyPage from '../../[...legacy]/page'
import { getProductBySlug, productImages } from '../../../lib/content'
import { RynoProductPage } from '../ryno-catalog'
import MayaoCauLongCatalogFilterPage, { generateMetadata as generateMayaoCauLongCatalogMetadata } from '../_mayaocaulong/[catalogSlug]/page'
import { getCatalogFilterBySlug, getProductBySlug as getMayaoCauLongProductBySlug } from '../_mayaocaulong/lib/content'
import MayaoPickleballCatalogFilterPage, { generateMetadata as generateMayaoPickleballCatalogMetadata } from '../_mayaopickleball/[catalogSlug]/page'
import { getCatalogFilterBySlug as getMayaoPickleballCatalogFilterBySlug, getProductBySlug as getMayaoPickleballProductBySlug } from '../_mayaopickleball/lib/content'
import MayaoBongChuyenLegacyPage, { generateMetadata as generateMayaoBongChuyenLegacyMetadata } from '../_mayaobongchuyen/[slug]/page'
import MayaoBongRoLegacyPage, { generateMetadata as generateMayaoBongRoLegacyMetadata } from '../_mayaobongro/[...segments]/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'
import MayaoChayBoLegacyPage, { generateMetadata as generateMayaoChayBoLegacyMetadata } from '../_mayaochaybo/[...segments]/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'
import MayaoBongDaLegacyPage, { generateMetadata as generateMayaoBongDaLegacyMetadata } from '../_mayaobongda/[...segments]/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

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
  if (tenant === 'mayaobongchuyen' && legacy.length === 1) {
    return generateMayaoBongChuyenLegacyMetadata({ params: Promise.resolve({ slug: legacy[0] }) })
  }
  if (tenant === 'mayaobongro') {
    return generateMayaoBongRoLegacyMetadata({ params: Promise.resolve({ segments: legacy }) })
  }
  if (tenant === 'mayaochaybo') {
    return generateMayaoChayBoLegacyMetadata({ params: Promise.resolve({ segments: legacy }), searchParams: Promise.resolve({}) })
  }
  if (tenant === 'mayaobongda') {
    return generateMayaoBongDaLegacyMetadata({ params: Promise.resolve({ segments: legacy }), searchParams: Promise.resolve({}) })
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
  if (tenant === 'mayaocaulong' && legacy.length === 1) {
    const product = await getMayaoCauLongProductBySlug(legacy[0])
    if (product) permanentRedirect(`/san-pham/${product.slug}/`)
  }
  if (tenant === 'mayaopickleball' && legacy.length === 1 && getMayaoPickleballCatalogFilterBySlug(legacy[0])) {
    return <MayaoPickleballCatalogFilterPage
      params={Promise.resolve({ catalogSlug: legacy[0] })}
      searchParams={props.searchParams as Promise<{ page?: string }>}
    />
  }
  if (tenant === 'mayaopickleball' && legacy.length === 1) {
    const product = await getMayaoPickleballProductBySlug(legacy[0])
    if (product) permanentRedirect(`/san-pham/${product.slug}/`)
  }
  if (tenant === 'mayaobongchuyen' && legacy.length === 1) {
    return <MayaoBongChuyenLegacyPage params={Promise.resolve({ slug: legacy[0] })} />
  }
  if (tenant === 'mayaobongro') {
    return <MayaoBongRoShell><MayaoBongRoLegacyPage params={Promise.resolve({ segments: legacy })} searchParams={props.searchParams as Promise<Record<string, string | string[] | undefined>>} /></MayaoBongRoShell>
  }
  if (tenant === 'mayaochaybo') {
    return <MayaoChayBoShell><MayaoChayBoLegacyPage params={Promise.resolve({ segments: legacy })} searchParams={props.searchParams as Promise<Record<string, string | string[] | undefined>>} /></MayaoChayBoShell>
  }
  if (tenant === 'mayaobongda') {
    return <MayaoBongDaShell><MayaoBongDaLegacyPage params={Promise.resolve({ segments: legacy })} searchParams={props.searchParams as Promise<Record<string, string | string[] | undefined>>} /></MayaoBongDaShell>
  }
  if (tenant === 'rynosport' && legacy.length === 1) return <RynoProductPage slug={legacy[0]} />
  if (tenant !== 'x24sport') notFound()
  return <X24LegacyPage params={Promise.resolve({ legacy })} searchParams={props.searchParams} />
}
