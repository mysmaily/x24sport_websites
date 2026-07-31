export const SITE_URL = 'https://mayaobongda.vn'
export const SITE_NAME = 'May Áo Bóng Đá'
export const PHONE_DISPLAY = '0989 353 247'
export const PHONE_VALUE = '0989353247'
export const ZALO_URL = `https://zalo.me/${PHONE_VALUE}`
export const FACEBOOK_URL = 'https://www.facebook.com/x24sport.vn'
export const LOGO_URL = 'https://cdn.mayaobongda.vn/wp-content/uploads/2026/07/mayaobongda-header-logo.png'

export function canonical(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function excerpt(value?: string | null, limit = 160) {
  const clean = (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trimEnd()}...` : clean
}
