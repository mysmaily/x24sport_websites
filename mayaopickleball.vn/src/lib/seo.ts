import type { Metadata } from 'next'

import type { ProductDetail } from './content'

export const siteUrl = 'https://mayaopickleball.vn'
export const siteName = 'MayaoPickleball'
export const businessName = 'MayaoPickleball.vn'
export const businessPhone = '0989353247'
export const businessEmail = 'lienhe@mayaopickleball.vn'
export const defaultOgImage = {
  url: '/images/pickleball-team-hero.webp',
  width: 1672,
  height: 941,
  alt: 'Đội pickleball mặc đồng phục đặt may MayaoPickleball',
}

export const staticPages = [
  {
    path: '/',
    priority: 1,
  },
  {
    path: '/san-pham',
    priority: 0.9,
  },
  {
    path: '/dat-may-ao-pickleball',
    priority: 0.8,
  },
  {
    path: '/bang-gia-may-ao-pickleball',
    priority: 0.8,
  },
  {
    path: '/chat-lieu-va-bang-size-ao-pickleball',
    priority: 0.8,
  },
  {
    path: '/mau-ao-pickleball-da-lam',
    priority: 0.7,
  },
] as const

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path
  return new URL(path, siteUrl).toString()
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
  const url = absoluteUrl(path)

  return {
    title,
    description,
    alternates: { canonical: path },
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

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${siteUrl}/#store`,
    name: businessName,
    url: siteUrl,
    logo: absoluteUrl('/images/logo.svg'),
    email: businessEmail,
    telephone: businessPhone,
    areaServed: 'VN',
    sameAs: ['https://zalo.me/0989353247'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: businessPhone,
        contactType: 'customer support',
        areaServed: 'VN',
        availableLanguage: ['vi'],
      },
    ],
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function productJsonLd(product: ProductDetail) {
  const images = product.gallery?.map((image) => image.url).filter(Boolean).slice(0, 8) || []
  const availability =
    product.stockStatus === 'outofstock'
      ? 'https://schema.org/OutOfStock'
      : product.stockStatus === 'onbackorder' || product.isOnBackorder
        ? 'https://schema.org/BackOrder'
        : product.isPurchasable === false
          ? 'https://schema.org/PreOrder'
          : 'https://schema.org/InStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${absoluteUrl(`/san-pham/${product.slug}`)}#product`,
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    image: images,
    brand: {
      '@type': 'Brand',
      name: 'X24 Sport',
    },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/san-pham/${product.slug}`),
      priceCurrency: product.currency || 'VND',
      price: product.price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}
