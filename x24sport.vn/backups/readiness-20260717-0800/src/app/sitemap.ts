import type { MetadataRoute } from 'next'
import { getAllProductPaths, getCategories } from '../lib/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://x24sport.vn'
  const [categories, products] = await Promise.all([getCategories(), getAllProductPaths()])
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/san-pham/`, priority: .9 },
    ...categories.map(({ slug }) => ({ url: `${base}/danh-muc/${slug}/`, priority: .8 })),
    ...products.map((product) => ({ url: `${base}${product.legacyPath || `/${product.slug}/`}`, priority: .7 })),
  ]
}
