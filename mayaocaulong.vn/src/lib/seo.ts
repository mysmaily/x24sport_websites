import type { Metadata } from 'next'

export const siteUrl = 'https://mayaocaulong.vn'
export const siteName = 'MayaoCauLong'
export const defaultOgImage = {
  url: '/images/badminton-team-hero.png',
  width: 1672,
  height: 941,
  alt: 'Đội cầu lông mặc áo thi đấu đặt may MayaoCauLong',
}

export function pageMetadata({
  description,
  path,
  title,
}: {
  description: string
  path: string
  title: string
}): Metadata {
  const canonical = path.startsWith('http') ? new URL(path).pathname : path
  const url = new URL(canonical, siteUrl).toString()

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      images: [defaultOgImage],
      siteName,
      type: 'website',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultOgImage.url],
    },
  }
}
