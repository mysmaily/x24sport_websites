export const SITE_URL = 'https://mayaobongro.vn'
export const PHONE_DISPLAY = '0989 353 247'
export const PHONE_VALUE = '0989353247'
export const ZALO_URL = `https://zalo.me/${PHONE_VALUE}`

export function canonical(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function excerpt(value?: string | null, limit = 150) {
  const clean = (value || '').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trimEnd()}…` : clean
}
