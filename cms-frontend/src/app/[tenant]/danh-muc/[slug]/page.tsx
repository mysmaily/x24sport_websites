import type { Metadata } from 'next'
import X24CategoryPage, { generateMetadata as generateX24CategoryMetadata } from '../../../danh-muc/[slug]/page'
import { RynoCategoryPage } from '../../ryno-catalog'
import { getCategory } from '../../../../lib/content'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string; slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}): Promise<Metadata> {
  const { tenant, slug } = await params
  if (tenant === 'mayaodongphuc') {
    const { getMayAoDongPhucCatalogMetadata } = await import('../../_mayaodongphuc/catalog-page')
    return getMayAoDongPhucCatalogMetadata(slug, await searchParams)
  }
  if (tenant === 'pndsport') {
    const { getPndCatalogMetadata } = await import('../../_pndsport/catalog-page')
    return getPndCatalogMetadata(slug, await searchParams)
  }
  if (tenant !== 'rynosport') {
    return generateX24CategoryMetadata({
      params: Promise.resolve({ slug }),
      searchParams,
    })
  }
  const category = await getCategory(slug)
  const title = category ? `${category.name} RynoSport` : 'Danh mục RynoSport'
  const description = category?.description || `Khám phá mẫu trang phục ${category?.name?.toLowerCase() || 'thể thao'} RynoSport cho đội nhóm và câu lạc bộ.`

  return {
    title,
    description,
    alternates: { canonical: `https://rynosport.vn/danh-muc/${slug}/` },
    openGraph: {
      title,
      description,
      url: `https://rynosport.vn/danh-muc/${slug}/`,
    },
  }
}

export default async function TenantCategoryPage(props: Parameters<typeof X24CategoryPage>[0] & { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant, slug } = await props.params
  if (tenant === 'mayaodongphuc') {
    const { MayAoDongPhucCatalogPage } = await import('../../_mayaodongphuc/catalog-page')
    return <MayAoDongPhucCatalogPage categorySlug={slug} search={await props.searchParams} />
  }
  if (tenant === 'pndsport') {
    const { PndCatalogPage } = await import('../../_pndsport/catalog-page')
    return <PndCatalogPage categorySlug={slug} search={await props.searchParams} />
  }
  if (tenant === 'rynosport') return <RynoCategoryPage slug={slug} />
  return <X24CategoryPage params={Promise.resolve({ slug })} searchParams={props.searchParams} />
}
