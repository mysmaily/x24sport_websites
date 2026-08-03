import type { MetadataRoute } from 'next'
import { getAllProductPaths, getAllWebContentPaths, getSitemapCategories } from '../lib/content'
import { getTenantContext } from '../lib/tenant'
import {
  catalogFilters as mayaoCauLongCatalogFilters,
} from './[tenant]/_mayaocaulong/lib/catalog-filters'
import {
  getAllPostPaths as getMayaoCauLongPostPaths,
  getAllProductPaths as getMayaoCauLongProductPaths,
} from './[tenant]/_mayaocaulong/lib/content'
import {
  catalogFilters as mayaoPickleballCatalogFilters,
} from './[tenant]/_mayaopickleball/lib/catalog-filters'
import {
  getAllPostPaths as getMayaoPickleballPostPaths,
  getSitemapProducts as getMayaoPickleballProductPaths,
} from './[tenant]/_mayaopickleball/lib/content'
import {
  staticPages as mayaoPickleballStaticPages,
} from './[tenant]/_mayaopickleball/lib/seo'

const mayaoCauLongStaticPages = [
  { path: '/', priority: 1 },
  { path: '/san-pham/', priority: 0.9 },
  { path: '/dat-may-ao-cau-long/', priority: 0.8 },
  { path: '/bang-gia-may-ao-cau-long/', priority: 0.8 },
  { path: '/chat-lieu-va-bang-size-ao-cau-long/', priority: 0.8 },
  { path: '/mau-da-lam/', priority: 0.7 },
  { path: '/blog/', priority: 0.7 },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getTenantContext()
  const base = `https://${tenant.domain}`
  if (tenant.slug === 'mayaocaulong') {
    const now = new Date()
    const [products, posts] = await Promise.all([
      getMayaoCauLongProductPaths(),
      getMayaoCauLongPostPaths(),
    ])

    return [
      ...mayaoCauLongStaticPages.map((page) => ({
        url: `${base}${page.path}`,
        lastModified: now,
        changeFrequency: page.path === '/' ? 'daily' as const : 'weekly' as const,
        priority: page.priority,
      })),
      ...mayaoCauLongCatalogFilters.map((filter) => ({
        url: `${base}${filter.href}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })),
      ...products.map((product) => ({
        url: `${base}/san-pham/${product.slug}/`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...posts.map((post) => ({
        url: `${base}/blog/${post.slug}/`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  }

  if (tenant.slug === 'mayaopickleball') {
    const now = new Date()
    const [products, posts] = await Promise.all([
      getMayaoPickleballProductPaths(),
      getMayaoPickleballPostPaths(),
    ])

    return [
      ...mayaoPickleballStaticPages.map((page) => ({
        url: `${base}${page.path}`,
        lastModified: now,
        changeFrequency: page.path === '/' ? 'daily' as const : 'weekly' as const,
        priority: page.priority,
      })),
      ...mayaoPickleballCatalogFilters.map((filter) => ({
        url: `${base}${filter.href}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })),
      ...products.map((product) => ({
        url: `${base}/san-pham/${product.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      })),
      ...posts.map((post) => ({
        url: `${base}${post.path}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  }

  const [categories, products, content] = await Promise.all([getSitemapCategories(), getAllProductPaths(), getAllWebContentPaths()])
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/san-pham/`, lastModified: now, priority: .9 },
    ...(tenant.slug === 'mayaobongda' ? [
      { url: `${base}/bang-gia-may-ao-bong-da/`, priority: .82 },
      { url: `${base}/ao-bong-da-doi-bong-cau-lac-bo/`, priority: .82 },
      { url: `${base}/ao-bong-da-giai-phong-trao/`, priority: .82 },
      { url: `${base}/ao-bong-da-cong-ty-ngan-hang/`, priority: .82 },
    ] : []),
    ...(tenant.slug === 'mayaobongchuyen' ? [{ url: `${base}/bang-gia-may-ao-bong-chuyen/`, priority: .82 }] : []),
    ...(tenant.slug === 'mayaobongro' ? [{ url: `${base}/bang-gia-may-ao-bong-ro/`, priority: .82 }] : []),
    ...(tenant.slug === 'mayaochaybo' ? [
      { url: `${base}/bang-gia-may-ao-chay-bo/`, lastModified: now, priority: .82 },
      { url: `${base}/mau-ao-chay-bo-duoc-xem-nhieu/`, lastModified: now, priority: .82 },
    ] : []),
    ...(tenant.slug === 'x24sport' ? [
      { url: `${base}/bang-gia-may-ao-bong-da/`, priority: .82 },
      { url: `${base}/bang-gia-may-ao-bong-chuyen/`, priority: .82 },
      { url: `${base}/bang-gia-may-ao-bong-ro/`, priority: .82 },
      { url: `${base}/bang-gia-may-ao-cau-long/`, priority: .82 },
      { url: `${base}/bang-gia-may-ao-pickleball/`, priority: .82 },
      { url: `${base}/bang-gia-may-ao-chay-bo/`, priority: .82 },
      { url: `${base}/mau-logo/`, priority: .8 },
    ] : []),
    { url: `${base}/blog/`, lastModified: now, priority: .7 },
    ...categories.map(({ slug, legacyPath }) => ({
      url: (tenant.slug === 'mayaobongda' || tenant.slug === 'mayaochaybo') && legacyPath ? `${base}${legacyPath}` : `${base}/danh-muc/${slug}/`,
      lastModified: now,
      priority: .8,
    })),
    ...products.map((product) => ({
      url: tenant.slug.startsWith('mayao') ? `${base}/san-pham/${product.slug}/` : `${base}${product.legacyPath || `/${product.slug}/`}`,
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
