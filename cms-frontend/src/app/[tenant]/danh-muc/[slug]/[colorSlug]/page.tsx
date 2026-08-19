import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isIndexableUniformColorSlug } from '../../../_mayaodongphuc/lib'

type RouteProps = {
  params: Promise<{ colorSlug: string; slug: string; tenant: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

export async function generateMetadata({ params, searchParams }: RouteProps): Promise<Metadata> {
  const { colorSlug, slug, tenant } = await params
  if (tenant !== 'mayaodongphuc' || !isIndexableUniformColorSlug(colorSlug)) return {}
  const { getMayAoDongPhucCatalogMetadata } = await import('../../../_mayaodongphuc/catalog-page')
  return getMayAoDongPhucCatalogMetadata(slug, await searchParams, colorSlug)
}

export default async function TenantCategoryColorPage(props: RouteProps) {
  const { colorSlug, slug, tenant } = await props.params
  if (tenant !== 'mayaodongphuc' || !isIndexableUniformColorSlug(colorSlug)) notFound()
  const { MayAoDongPhucCatalogPage } = await import('../../../_mayaodongphuc/catalog-page')
  return <MayAoDongPhucCatalogPage categorySlug={slug} colorSlug={colorSlug} search={await props.searchParams} />
}
