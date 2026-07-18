import type { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_ENV === 'preview') return { rules: { userAgent: '*', allow: '/' } }
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://x24sport.vn'
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${base}/sitemap.xml` }
}
