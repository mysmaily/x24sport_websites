import { INDEXABLE_COLOR_SLUGS } from './category-paths'

export const FOOTBALL_PERMANENT_REDIRECTS: Record<string, string> = {
  '/cong-ty/': '/thiet-ke-ao-bong-da-cong-ty/',
  '/ngan-hang/': '/thiet-ke-ao-bong-da-ngan-hang/',
  '/ao-bong-da-cong-ty-ngan-hang/': '/thiet-ke-ao-bong-da-ngan-hang/',
  ...Object.fromEntries([...INDEXABLE_COLOR_SLUGS].map((slug) => [
    `/tu-khoa/${slug}/`,
    `/ao-bong-da-${slug}/`,
  ])),
}

export function footballPermanentRedirect(path: string) {
  return FOOTBALL_PERMANENT_REDIRECTS[path]
}
