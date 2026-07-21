import type { MetadataRoute } from 'next'
import { getAllCanonicalRoutes } from '@/lib/cms'
import { canonical } from '@/lib/site'
import { isIndexableContent, POST_CATEGORIES } from '@/lib/legacy-routes'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, content, categories } = await getAllCanonicalRoutes()
  return [
    { url: canonical('/'), changeFrequency: 'weekly', priority: 1 },
    { url: canonical('/san-pham/'), changeFrequency: 'daily', priority: 0.9 },
    { url: canonical('/blog/'), changeFrequency: 'weekly', priority: 0.7 },
    { url: canonical('/gioi-thieu/'), changeFrequency: 'yearly', priority: 0.5 },
    { url: canonical('/lien-he/'), changeFrequency: 'yearly', priority: 0.6 },
    ...POST_CATEGORIES.map((item) => ({ url: canonical(`/category/${item.slug}/`), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...categories.filter((item) => item.legacyPath).map((item) => ({ url: canonical(item.legacyPath!), changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.filter((item) => item.legacyPath).map((item) => ({ url: canonical(item.legacyPath!), lastModified: item.sourceModifiedAt || undefined, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...content.filter((item) => isIndexableContent(item.kind, item.legacyPath)).map((item) => ({ url: canonical(item.legacyPath), lastModified: item.sourceModifiedAt || undefined, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]
}
