import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogPageContent } from '../san-pham/page'
import {
  catalogFilters,
  getCatalogFilterBySlug,
  getProductsByCatalogFilter,
} from '../../lib/content'

const defaultOgImage = {
  url: '/images/badminton-team-hero.png',
  width: 1672,
  height: 941,
  alt: 'Đội cầu lông mặc áo thi đấu đặt may MayaoCauLong',
}

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
      images: [defaultOgImage],
      url: filter.href,
    },
    twitter: {
      card: 'summary_large_image',
      title: filter.title,
      description: filter.description,
      images: [defaultOgImage.url],
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
