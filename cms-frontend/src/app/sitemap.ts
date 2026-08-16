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
  getAllCanonicalRoutes as getMayaoBongDaCanonicalRoutes,
} from './[tenant]/_mayaobongda/lib/cms'
import {
  footballColorPath,
  isIndexableFootballColor,
} from './[tenant]/_mayaobongda/lib/category-paths'
import {
  HOT_FOOTBALL_PATH,
} from './[tenant]/_mayaobongda/lib/hot-football'
import { FOOTBALL_PERMANENT_REDIRECTS } from './[tenant]/_mayaobongda/lib/permanent-redirects'
import {
  getAllPostPaths as getMayaoPickleballPostPaths,
  getSitemapProducts as getMayaoPickleballProductPaths,
} from './[tenant]/_mayaopickleball/lib/content'
import {
  staticPages as mayaoPickleballStaticPages,
} from './[tenant]/_mayaopickleball/lib/seo'
import { pndLandings } from './[tenant]/_pndsport/lib'
import { getUniformCategories, getUniformProducts } from './[tenant]/_mayaodongphuc/lib'

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
  if (tenant.slug === 'mayaodongphuc') {
    const now = new Date()
    const [categories, productResult] = await Promise.all([
      getUniformCategories(),
      getUniformProducts({ limit: 100 }),
    ])

    return [
      { url: `${base}/`, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
      { url: `${base}/san-pham/`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
      ...categories.filter((category) => (category.productCount || 0) > 0).map((category) => ({
        url: `${base}/danh-muc/${category.slug}/`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...productResult.docs.map((product) => ({
        url: `${base}/san-pham/${product.slug}/`,
        lastModified: product.sourceModifiedAt ? new Date(product.sourceModifiedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ]
  }
  if (tenant.slug === 'mayaobongda') {
    const now = new Date()
    const { categories, products, content } = await getMayaoBongDaCanonicalRoutes()
    const seen = new Set<string>()
    const keepUnique = <T extends { url: string }>(item: T) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    }

    return [
      { url: `${base}/`, lastModified: now, priority: 1 },
      { url: `${base}/san-pham/`, lastModified: now, priority: 0.9 },
      { url: `${base}${HOT_FOOTBALL_PATH}`, lastModified: now, priority: 0.84 },
      { url: `${base}/bang-gia-may-ao-bong-da/`, priority: 0.82 },
      { url: `${base}/ao-bong-da-doi-bong-cau-lac-bo/`, priority: 0.82 },
      { url: `${base}/ao-bong-da-truong-hoc-sinh-vien/`, priority: 0.82 },
      { url: `${base}/ao-bong-da-giai-phong-trao/`, priority: 0.82 },
      { url: `${base}/thiet-ke-ao-bong-da-cong-ty/`, priority: 0.82 },
      { url: `${base}/thiet-ke-ao-bong-da-ngan-hang/`, priority: 0.82 },
      { url: `${base}/blog/`, lastModified: now, priority: 0.7 },
      ...categories
        .filter((category) => {
          if ((category.productCount || 0) <= 0) return false
          if (category.group === 'tag' && /^màu\b/i.test(category.name.trim())) return isIndexableFootballColor(category)
          return Boolean(category.legacyPath && !FOOTBALL_PERMANENT_REDIRECTS[category.legacyPath])
        })
        .map((category) => ({
          url: `${base}${isIndexableFootballColor(category) ? footballColorPath(category) : category.legacyPath}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: category.group === 'type' ? 0.8 : 0.65,
        })),
      ...products.map((product) => ({
        url: `${base}/san-pham/${product.slug}/`,
        lastModified: product.sourceModifiedAt ? new Date(product.sourceModifiedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...content.filter((item) => !FOOTBALL_PERMANENT_REDIRECTS[item.legacyPath]).map((item) => ({
        url: `${base}${item.legacyPath}`,
        lastModified: item.sourceModifiedAt ? new Date(item.sourceModifiedAt) : undefined,
        changeFrequency: item.kind === 'post' ? 'monthly' as const : 'weekly' as const,
        priority: item.kind === 'post' ? 0.6 : 0.72,
      })),
    ].filter(keepUnique)
  }

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
      { url: `${base}/thiet-ke-ao-bong-da-cong-ty/`, priority: .82 },
      { url: `${base}/thiet-ke-ao-bong-da-ngan-hang/`, priority: .82 },
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
    ...(tenant.slug === 'pndsport' ? pndLandings.map((landing) => ({
      url: `${base}/${landing.slug}/`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: .78,
    })) : []),
    { url: `${base}/blog/`, lastModified: now, priority: .7 },
    ...categories.map((category) => {
      const legacyPath = 'legacyPath' in category && typeof category.legacyPath === 'string' ? category.legacyPath : undefined
      return {
      url: (tenant.slug === 'mayaobongda' || tenant.slug === 'mayaochaybo') && legacyPath ? `${base}${legacyPath}` : `${base}/danh-muc/${category.slug}/`,
      lastModified: now,
      priority: .8,
      }
    }),
    ...products.map((product) => ({
      url: tenant.slug.startsWith('mayao') || tenant.slug === 'pndsport' ? `${base}/san-pham/${product.slug}/` : `${base}${product.legacyPath || `/${product.slug}/`}`,
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
