import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogPageContent } from '../san-pham/page'
import {
  catalogFilters,
  getCatalogFilterBySlug,
  getProductsByCatalogFilter,
} from '../../lib/content'

type Props = {
  params: Promise<{ catalogSlug: string }>
}

export function generateStaticParams() {
  return catalogFilters.map((filter) => ({ catalogSlug: filter.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { catalogSlug } = await params
  const filter = getCatalogFilterBySlug(catalogSlug)
  if (!filter) return {}

  return {
    title: filter.title,
    description: filter.description,
    alternates: {
      canonical: filter.href,
    },
    openGraph: {
      title: filter.title,
      description: filter.description,
      url: filter.href,
    },
  }
}

export default async function CatalogFilterPage({ params }: Props) {
  const { catalogSlug } = await params
  const filter = getCatalogFilterBySlug(catalogSlug)
  if (!filter) notFound()

  const products = await getProductsByCatalogFilter(filter)

  return <CatalogPageContent activeFilter={filter} products={products} />
}
