export const SITE_URL = 'https://mayaochaybo.vn'
export const PHONE_DISPLAY = '0989 353 247'
export const PHONE_VALUE = '0989353247'
export const ZALO_URL = `https://zalo.me/${PHONE_VALUE}`
export const FACEBOOK_URL = 'https://facebook.com/mayaochaybo'
export const LOGO_URL = 'https://static.x24sport.vn/mayaochaybo/wp-2371-mayaochaybo-header-logo-horizontal-2026.png'
export const DEFAULT_OG_IMAGE = {
  url: '/images/audience-landings/doi-nhom-viet-nam-running-club.webp',
  width: 1448,
  height: 1086,
  alt: 'Đội chạy bộ mặc áo thiết kế riêng May Áo Chạy Bộ',
}

export function canonical(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function excerpt(value?: string | null, limit = 150) {
  const clean = (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trimEnd()}…` : clean
}
