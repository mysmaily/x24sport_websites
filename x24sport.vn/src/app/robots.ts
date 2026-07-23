import type { MetadataRoute } from 'next'
import { getTenantBaseUrl } from '../lib/tenant'
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (process.env.SITE_ENV === 'preview') return { rules: { userAgent: '*', allow: '/' } }
  const base = await getTenantBaseUrl()
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${base}/sitemap.xml` }
}
