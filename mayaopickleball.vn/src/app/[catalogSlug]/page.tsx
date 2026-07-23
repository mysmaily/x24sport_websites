import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogPageContent } from '../san-pham/page'
import { getCatalogFilterBySlug, getProductsByCatalogFilter } from '../../lib/content'
import { absoluteUrl, defaultOgImage } from '../../lib/seo'

type CatalogPageProps = {
  params: Promise<{ catalogSlug: string }>
  searchParams: Promise<{ page?: string }>
}

export function generateStaticParams() {
  const { catalogFilters } = require('../../lib/catalog-filters')
  return catalogFilters.map((filter: { slug: string }) => ({ catalogSlug: filter.slug }))
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
  const { catalogSlug } = await params
  const filter = getCatalogFilterBySlug(catalogSlug)

  if (!filter) {
    return { title: 'Không tìm thấy | MayaoPickleball' }
  }

  return {
    title: filter.title,
    description: filter.description,
    alternates: { canonical: filter.href },
    openGraph: { title: filter.title, description: filter.description, images: [defaultOgImage], url: absoluteUrl(filter.href) },
    twitter: { card: 'summary_large_image', title: filter.title, description: filter.description, images: [defaultOgImage.url] },
  }
}

export default async function CatalogFilterPage({ params, searchParams }: CatalogPageProps) {
  const { catalogSlug } = await params
  const filter = getCatalogFilterBySlug(catalogSlug)

  if (!filter) notFound()

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const paginated = await getProductsByCatalogFilter(filter, page)

  return <CatalogPageContent activeFilter={filter} paginated={paginated} />
}
