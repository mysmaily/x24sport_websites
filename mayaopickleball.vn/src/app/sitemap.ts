import type { MetadataRoute } from 'next'

import { catalogFilters } from '../lib/catalog-filters'
import { getSitemapProducts } from '../lib/content'
import { absoluteUrl, staticPages } from '../lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const products = await getSitemapProducts()

  return [
    ...staticPages.map((page) => ({
      url: absoluteUrl(page.path),
      lastModified: now,
      changeFrequency: page.path === '/' ? 'daily' as const : 'weekly' as const,
      priority: page.priority,
    })),
    ...catalogFilters.map((filter) => ({
      url: absoluteUrl(filter.href),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/san-pham/${product.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    })),
  ]
}
