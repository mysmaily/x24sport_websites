export const SITE_NAME = 'X24Sport'

export function normalizeText(value?: string | null) {
  return (value || '').replace(/\s+/g, ' ').trim()
}

export function truncateText(value: string, maximum = 155) {
  const clean = normalizeText(value)
  if (clean.length <= maximum) return clean
  const shortened = clean.slice(0, maximum + 1)
  const boundary = shortened.lastIndexOf(' ')
  return `${shortened.slice(0, boundary > maximum * .7 ? boundary : maximum).trim()}…`
}

export function metadataDescription(value?: string | null, fallback = 'Trang phục thể thao thiết kế theo yêu cầu tại X24Sport.') {
  return truncateText(value || fallback, 155)
}

export function cleanSeoTitle(value: string) {
  return normalizeText(value)
    .replace(/\s*(?:-|–|—|\|)\s*X24\s*Sport\s*$/i, '')
    .trim()
}

export function pageCanonical(path: string, page = 1) {
  const normalized = path.endsWith('/') ? path : `${path}/`
  return page > 1 ? `${normalized}?page=${page}` : normalized
}

export function pageTitle(title: string, page = 1) {
  return page > 1 ? `${title} – Trang ${page}` : title
}

export function absoluteUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://x24sport.vn').replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
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
