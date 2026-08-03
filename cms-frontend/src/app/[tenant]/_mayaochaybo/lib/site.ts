export const SITE_URL = 'https://mayaochaybo.vn'
export const PHONE_DISPLAY = '0989 353 247'
export const PHONE_VALUE = '0989353247'
export const ZALO_URL = `https://zalo.me/${PHONE_VALUE}`
export const FACEBOOK_URL = 'https://facebook.com/mayaochaybo'
export const LOGO_URL = 'https://static.x24sport.vn/mayaochaybo/wp-2371-mayaochaybo-header-logo-horizontal-2026.png'
export const DEFAULT_OG_IMAGE = {
  url: '/images/mayaochaybo/og-share.webp',
  width: 1200,
  height: 630,
  alt: 'Đội chạy bộ mặc áo thiết kế riêng May Áo Chạy Bộ',
}

export function canonical(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function excerpt(value?: string | null, limit = 150) {
  const clean = (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  const sliced = clean.slice(0, limit).trimEnd()
  const lastSpace = sliced.lastIndexOf(' ')
  const readableSlice = lastSpace > limit * 0.7 ? sliced.slice(0, lastSpace) : sliced
  return `${readableSlice.trimEnd()}…`
}

export function cleanSeoText(value?: string | null) {
  return (value || '')
    .replace(/\s+-\s+May Áo Chạy Bộ\s+-\s+VN$/i, '')
    .replace(/\s+-\s+MayaoChayBo\.vn$/i, '')
    .replace(/\.\.\./g, '…')
    .replace(/\s+/g, ' ')
    .trim()
}

export function seoTitle(value: string, limit = 60) {
  return excerpt(cleanSeoText(value), limit)
}

export function seoDescription(value?: string | null, limit = 155) {
  return excerpt(cleanSeoText(value), limit)
}

export function pageMetadata({
  description,
  image = DEFAULT_OG_IMAGE,
  path,
  title,
}: {
  description: string
  image?: typeof DEFAULT_OG_IMAGE
  path: string
  title: string
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      images: [image],
      type: 'website' as const,
      url: canonical(path),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [image.url],
    },
  }
}
