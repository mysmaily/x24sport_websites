export const SITE_URL = 'https://mayaobongro.vn'
export const PHONE_DISPLAY = '0989 353 247'
export const PHONE_VALUE = '0989353247'
export const ZALO_URL = `https://zalo.me/${PHONE_VALUE}`
export const DEFAULT_OG_IMAGE = {
  url: '/images/basketball-audience-hero-bright-20260722.webp',
  width: 1920,
  height: 1080,
  alt: 'Đội bóng rổ mặc đồng phục thiết kế riêng trên sân sáng',
}

export function canonical(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function excerpt(value?: string | null, limit = 150) {
  const clean = (value || '').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trimEnd()}…` : clean
}

export function pageMetadata({ description, path, title }: { description: string; path: string; title: string }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
      type: 'website' as const,
      url: canonical(path),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}
