import type { ProductCategory } from './cms'

const CATEGORY_PATH_OVERRIDES: Record<string, string> = {
  'ao-bong-da-cong-ty': '/thiet-ke-ao-bong-da-cong-ty/',
  'ao-bong-da-cong-ty-ngan-hang': '/thiet-ke-ao-bong-da-ngan-hang/',
}

export const INDEXABLE_COLOR_SLUGS = new Set([
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
  if (INDEXABLE_COLOR_SLUGS.has(category.slug)) return `/ao-bong-da-${category.slug}/`
  return CATEGORY_PATH_OVERRIDES[category.slug] || category.legacyPath || `/${category.slug}/`
}

export function footballColorSlugFromPath(path: string) {
  const match = path.match(/^\/ao-bong-da-(mau-[a-z0-9-]+)\/$/)
  return match && INDEXABLE_COLOR_SLUGS.has(match[1]) ? match[1] : null
}

export function footballColorLandingLabel(categoryName: string) {
  return `Áo bóng đá ${categoryName.trim().toLocaleLowerCase('vi-VN')}`
}

export function footballColorLandingDescription(categoryName: string) {
  return `Khám phá các mẫu ${footballColorLandingLabel(categoryName).toLocaleLowerCase('vi-VN')}, có thể tùy chỉnh phối màu, logo, tên số và nội dung theo đội.`
}

export function isIndexableFootballColor(category: Pick<ProductCategory, 'name' | 'slug'>) {
  return /^màu\b/i.test(category.name.trim()) && INDEXABLE_COLOR_SLUGS.has(category.slug)
}

export function footballColorPath(category: Pick<ProductCategory, 'name' | 'slug' | 'legacyPath'>) {
  if (isIndexableFootballColor(category)) return footballCategoryPath(category)

  const params = new URLSearchParams({ q: category.name.trim() })
  return `/san-pham/?${params}`
}
