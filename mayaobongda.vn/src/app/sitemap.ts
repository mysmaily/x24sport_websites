import type { MetadataRoute } from 'next'

import { getAllCanonicalRoutes } from '@/lib/cms'
import { POST_CATEGORY_ARCHIVES, isIndexableContent } from '@/lib/legacy-routes'
import { canonical } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, content, categories } = await getAllCanonicalRoutes()
  return [
    { url: canonical('/'), changeFrequency: 'weekly', priority: 1 },
    { url: canonical('/shop/'), changeFrequency: 'daily', priority: 0.9 },
    { url: canonical('/san-pham/'), changeFrequency: 'daily', priority: 0.7 },
    { url: canonical('/blog/'), changeFrequency: 'weekly', priority: 0.7 },
    ...POST_CATEGORY_ARCHIVES.map((item) => ({ url: canonical(item.path), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...categories.filter((item) => item.legacyPath).map((item) => ({ url: canonical(item.legacyPath!), changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.filter((item) => item.legacyPath).map((item) => ({ url: canonical(item.legacyPath!), lastModified: item.sourceModifiedAt || undefined, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...content.filter((item) => isIndexableContent(item.kind, item.legacyPath)).map((item) => ({ url: canonical(item.legacyPath), lastModified: item.sourceModifiedAt || undefined, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]
}
