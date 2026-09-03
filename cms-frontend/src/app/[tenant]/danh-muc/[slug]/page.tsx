import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import X24CategoryPage, { generateMetadata as generateX24CategoryMetadata } from '../../../danh-muc/[slug]/page'
import { RynoCategoryPage } from '../../ryno-catalog'
import { getCategory } from '../../../../lib/content'

const CATEGORY_REDIRECTS_BY_TENANT: Record<string, Record<string, string>> = {
  pndsport: {
    'dong-phuc-cong-ty': 'dong-phuc-doanh-nghiep',
    'dong-phuc-lop-truong-hoc': 'dong-phuc-truong-hoc',
  },
  dongphucx24: {
    'ao-lop-truong-hoc': 'dong-phuc-truong-hoc',
    'dong-phuc-bao-ho-ky-thuat': 'dong-phuc-bao-ho',
    'dong-phuc-cong-ty': 'dong-phuc-doanh-nghiep',
    'dong-phuc-nha-hang-fnb': 'dong-phuc-fnb',
    'team-building-su-kien': 'dong-phuc-da-ngoai-team-building',
  },
}

function redirectLegacyCategory(tenant: string, slug: string) {
  const target = CATEGORY_REDIRECTS_BY_TENANT[tenant]?.[slug]
  if (target) permanentRedirect(`/danh-muc/${target}/`)
}

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
  if (tenant === 'dongphucx24') {
    redirectLegacyCategory(tenant, slug)
    const { getDongPhucX24CatalogMetadata } = await import('../../_dongphucx24/catalog-page')
    return getDongPhucX24CatalogMetadata(slug)
  }
  if (tenant === 'pndsport') {
    redirectLegacyCategory(tenant, slug)
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
  if (tenant === 'dongphucx24') {
    redirectLegacyCategory(tenant, slug)
    const { DongPhucX24CatalogPage } = await import('../../_dongphucx24/catalog-page')
    return <DongPhucX24CatalogPage categorySlug={slug} />
  }
  if (tenant === 'pndsport') {
    redirectLegacyCategory(tenant, slug)
    const { PndCatalogPage } = await import('../../_pndsport/catalog-page')
    return <PndCatalogPage categorySlug={slug} search={await props.searchParams} />
  }
  if (tenant === 'rynosport') return <RynoCategoryPage slug={slug} />
  return <X24CategoryPage params={Promise.resolve({ slug })} searchParams={props.searchParams} />
}
