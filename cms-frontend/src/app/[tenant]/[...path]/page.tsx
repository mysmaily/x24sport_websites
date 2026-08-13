import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import X24PathPage from '../../[...path]/page'
import { getProductBySlug, productImages } from '../../../lib/content'
import { RynoProductPage } from '../ryno-catalog'
import MayaoCauLongCatalogFilterPage, { generateMetadata as generateMayaoCauLongCatalogMetadata } from '../_mayaocaulong/[catalogSlug]/page'
import { getCatalogFilterBySlug, getProductBySlug as getMayaoCauLongProductBySlug } from '../_mayaocaulong/lib/content'
import MayaoPickleballCatalogFilterPage, { generateMetadata as generateMayaoPickleballCatalogMetadata } from '../_mayaopickleball/[catalogSlug]/page'
import { getCatalogFilterBySlug as getMayaoPickleballCatalogFilterBySlug, getProductBySlug as getMayaoPickleballProductBySlug } from '../_mayaopickleball/lib/content'
import MayaoBongChuyenPathPage, { generateMetadata as generateMayaoBongChuyenPathMetadata } from '../_mayaobongchuyen/[slug]/page'
import MayaoBongRoPathPage, { generateMetadata as generateMayaoBongRoPathMetadata } from '../_mayaobongro/[...segments]/page'
import { MayaoBongRoShell } from '../_mayaobongro/shell'
import MayaoChayBoPathPage, { generateMetadata as generateMayaoChayBoPathMetadata } from '../_mayaochaybo/[...segments]/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'
import MayaoBongDaPathPage, { generateMetadata as generateMayaoBongDaPathMetadata } from '../_mayaobongda/[...segments]/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

export async function generateMetadata({ params, searchParams }: { params: Promise<{ tenant: string; path: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const [{ tenant, path }, query] = await Promise.all([params, searchParams])
  if (tenant === 'mayaocaulong' && path.length === 1 && getCatalogFilterBySlug(path[0])) {
    return generateMayaoCauLongCatalogMetadata({ params: Promise.resolve({ catalogSlug: path[0] }) })
  }
  if (tenant === 'mayaopickleball' && path.length === 1 && getMayaoPickleballCatalogFilterBySlug(path[0])) {
    return generateMayaoPickleballCatalogMetadata({
      params: Promise.resolve({ catalogSlug: path[0] }),
      searchParams: Promise.resolve({}),
    })
  }
  if (tenant === 'mayaobongchuyen' && path.length === 1) {
    return generateMayaoBongChuyenPathMetadata({ params: Promise.resolve({ slug: path[0] }) })
  }
  if (tenant === 'mayaobongro') {
    return generateMayaoBongRoPathMetadata({ params: Promise.resolve({ segments: path }) })
  }
  if (tenant === 'mayaochaybo') {
    return generateMayaoChayBoPathMetadata({ params: Promise.resolve({ segments: path }), searchParams: Promise.resolve(query) })
  }
  if (tenant === 'mayaobongda') {
    return generateMayaoBongDaPathMetadata({ params: Promise.resolve({ segments: path }), searchParams: Promise.resolve(query) })
  }
  if (tenant !== 'rynosport' || path.length !== 1) return {}

  const product = await getProductBySlug(path[0])
  if (!product) return {}

  const image = productImages(product)[0]
  const description = product.shortDescription || `Thông tin mẫu ${product.name} tại RynoSport. Liên hệ để được tư vấn size, màu sắc và đặt áo đội.`

  return {
    title: product.name,
    description,
    alternates: { canonical: `https://rynosport.vn/${path[0]}/` },
    openGraph: {
      title: product.name,
      description,
      url: `https://rynosport.vn/${path[0]}/`,
      images: image ? [{ url: image.url, width: 1000, height: 1000, alt: image.alt || product.name }] : undefined,
    },
  }
}

export default async function TenantPathPage(props: Parameters<typeof X24PathPage>[0] & { params: Promise<{ tenant: string; path: string[] }> }) {
  const { tenant, path } = await props.params
  if (tenant === 'mayaocaulong' && path.length === 1 && getCatalogFilterBySlug(path[0])) {
    return <MayaoCauLongCatalogFilterPage params={Promise.resolve({ catalogSlug: path[0] })} />
  }
  if (tenant === 'mayaocaulong' && path.length === 1) {
    const product = await getMayaoCauLongProductBySlug(path[0])
    if (product) permanentRedirect(`/san-pham/${product.slug}/`)
  }
  if (tenant === 'mayaopickleball' && path.length === 1 && getMayaoPickleballCatalogFilterBySlug(path[0])) {
    return <MayaoPickleballCatalogFilterPage
      params={Promise.resolve({ catalogSlug: path[0] })}
      searchParams={props.searchParams as Promise<{ page?: string }>}
    />
  }
  if (tenant === 'mayaopickleball' && path.length === 1) {
    const product = await getMayaoPickleballProductBySlug(path[0])
    if (product) permanentRedirect(`/san-pham/${product.slug}/`)
  }
  if (tenant === 'mayaobongchuyen' && path.length === 1) {
    return <MayaoBongChuyenPathPage params={Promise.resolve({ slug: path[0] })} />
  }
  if (tenant === 'mayaobongro') {
    return <MayaoBongRoShell><MayaoBongRoPathPage params={Promise.resolve({ segments: path })} searchParams={props.searchParams as Promise<Record<string, string | string[] | undefined>>} /></MayaoBongRoShell>
  }
  if (tenant === 'mayaochaybo') {
    return <MayaoChayBoShell><MayaoChayBoPathPage params={Promise.resolve({ segments: path })} searchParams={props.searchParams as Promise<Record<string, string | string[] | undefined>>} /></MayaoChayBoShell>
  }
  if (tenant === 'mayaobongda') {
    return <MayaoBongDaShell><MayaoBongDaPathPage params={Promise.resolve({ segments: path })} searchParams={props.searchParams as Promise<Record<string, string | string[] | undefined>>} /></MayaoBongDaShell>
  }
  if (tenant === 'rynosport' && path.length === 1) return <RynoProductPage slug={path[0]} />
  return <X24PathPage params={Promise.resolve({ path })} searchParams={props.searchParams} />
}
