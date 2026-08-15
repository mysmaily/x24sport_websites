import type { ProductCategory } from './cms'

const CATEGORY_PATH_OVERRIDES: Record<string, string> = {
  'ao-bong-da-cong-ty': '/thiet-ke-ao-bong-da-cong-ty/',
  'ao-bong-da-cong-ty-ngan-hang': '/thiet-ke-ao-bong-da-ngan-hang/',
}

const INDEXABLE_COLOR_SLUGS = new Set([
  'mau-cam',
  'mau-den',
  'mau-do',
  'mau-do-do',
  'mau-hong',
  'mau-kem',
  'mau-tim',
  'mau-trang',
  'mau-vang',
  'mau-xanh',
  'mau-xanh-bich',
  'mau-xanh-duong',
  'mau-xanh-la',
  'mau-xanh-ngoc',
  'mau-xanh-than',
])

export function footballCategoryPath(category: Pick<ProductCategory, 'slug' | 'legacyPath'>) {
  return CATEGORY_PATH_OVERRIDES[category.slug] || category.legacyPath || `/${category.slug}/`
}

export function footballColorPath(category: Pick<ProductCategory, 'name' | 'slug' | 'legacyPath'>) {
  const isColor = /^màu\b/i.test(category.name.trim())
  const hasCuratedColorLanding = isColor && INDEXABLE_COLOR_SLUGS.has(category.slug)

  if (!isColor && category.legacyPath) return footballCategoryPath(category)
  if (hasCuratedColorLanding && category.legacyPath) return footballCategoryPath(category)

  const params = new URLSearchParams({ q: category.name.trim() })
  return `/san-pham/?${params}`
}
