import type { MetadataRoute } from 'next'
import { getAllProductPaths, getAllWebContentPaths, getSitemapCategories } from '../lib/content'
import { getTenantContext } from '../lib/tenant'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getTenantContext()
  const base = `https://${tenant.domain}`
  const [categories, products, content] = await Promise.all([getSitemapCategories(), getAllProductPaths(), getAllWebContentPaths()])
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/san-pham/`, priority: .9 },
    ...(tenant.slug === 'x24sport' ? [{ url: `${base}/mau-logo/`, priority: .8 }] : []),
    { url: `${base}/blog/`, priority: .7 },
    ...categories.map(({ slug }) => ({ url: `${base}/danh-muc/${slug}/`, priority: .8 })),
    ...products.map((product) => ({
      url: `${base}${product.legacyPath || `/${product.slug}/`}`,
      lastModified: product.sourceModifiedAt ? new Date(product.sourceModifiedAt) : undefined,
      priority: .7,
    })),
    ...content.map((item) => ({
      url: `${base}${item.legacyPath}`,
      lastModified: item.sourceModifiedAt ? new Date(item.sourceModifiedAt) : undefined,
      priority: .6,
    })),
  ]
}
