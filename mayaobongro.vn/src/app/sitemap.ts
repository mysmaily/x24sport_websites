import type { MetadataRoute } from 'next'

import { CATALOG_LANDINGS } from '@/lib/catalog-colors'
import { getAllCanonicalRoutes } from '@/lib/cms'
import { canonical } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, content } = await getAllCanonicalRoutes()
  return [
    { url: canonical('/'), changeFrequency: 'weekly', priority: 1 },
    { url: canonical('/san-pham/'), changeFrequency: 'daily', priority: 0.9 },
    { url: canonical('/mau-da-lam/'), changeFrequency: 'weekly', priority: 0.8 },
    { url: canonical('/logo-team/'), changeFrequency: 'daily', priority: 0.8 },
    ...CATALOG_LANDINGS.map((landing) => ({ url: canonical(landing.path), changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.map((item) => ({ url: canonical(`/san-pham/${item.slug}/`), lastModified: item.sourceModifiedAt || undefined, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...content.filter((item) => item.legacyPath !== '/' && item.legacyPath !== '/mau-ao-bong-ro/').map((item) => ({ url: canonical(item.legacyPath), lastModified: item.sourceModifiedAt || undefined, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]
}
