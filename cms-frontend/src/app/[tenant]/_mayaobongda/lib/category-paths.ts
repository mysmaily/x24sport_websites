import type { ProductCategory } from './cms'

const CATEGORY_PATH_OVERRIDES: Record<string, string> = {
  'ao-bong-da-cong-ty': '/thiet-ke-ao-bong-da-cong-ty/',
  'ao-bong-da-cong-ty-ngan-hang': '/thiet-ke-ao-bong-da-ngan-hang/',
}

export function footballCategoryPath(category: Pick<ProductCategory, 'slug' | 'legacyPath'>) {
  return CATEGORY_PATH_OVERRIDES[category.slug] || category.legacyPath || `/${category.slug}/`
}
