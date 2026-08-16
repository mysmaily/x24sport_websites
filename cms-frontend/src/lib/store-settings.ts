import { getTenantSlug } from './tenant'

const API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

type ApiList<T> = { docs?: T[] }

export type StoreMapLocation = {
  id?: string | number | null
  label?: string | null
  address?: string | null
  googleMapUrl?: string | null
}

export type PublicStoreSettings = {
  contactPhone?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  mapLocations?: StoreMapLocation[] | null
  pinterestUrl?: string | null
  siteName?: string | null
  telegramChatId?: string | null
  threadsUrl?: string | null
  tiktokUrl?: string | null
  zaloUrl?: string | null
}

function cleanText(value: unknown, maxLength = 300) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : ''
}

function cleanUrl(value: unknown) {
  const url = cleanText(value, 800)
  if (!url) return ''
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : ''
  } catch {
    return ''
  }
}

function cleanPhone(value: unknown) {
  const phone = cleanText(value, 24)
  return phone.replace(/[^\d+]/g, '')
}

const defaultPhoneByTenant: Record<string, string> = {
  x24sport: '0989353247',
  rynosport: '0989353247',
  mayaobongda: '0989353247',
  mayaocaulong: '0989353247',
  mayaopickleball: '0989353247',
  mayaobongchuyen: '0989353247',
  mayaobongro: '0989353247',
  mayaochaybo: '0989353247',
}

const defaultFacebookByTenant: Record<string, string> = {
  x24sport: 'https://www.facebook.com/vnx24sport/',
  rynosport: 'https://www.facebook.com/vnx24sport/',
  mayaobongda: 'https://www.facebook.com/x24sport.vn',
  mayaocaulong: 'https://www.facebook.com/vnx24sport/',
  mayaopickleball: 'https://www.facebook.com/vnx24sport/',
  mayaobongchuyen: 'https://www.facebook.com/vnx24sport/',
  mayaobongro: 'https://www.facebook.com/vnx24sport/',
  mayaochaybo: 'https://facebook.com/mayaochaybo',
}

const defaultMapLocations: StoreMapLocation[] = [
  {
    label: 'Miền Bắc',
    address: '6 Ngõ 50 Nguyễn Hữu Thọ, Hoàng Liệt, Hà Nội',
    googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=6%20Ng%C3%B5%2050%20Nguy%E1%BB%85n%20H%E1%BB%AFu%20Th%E1%BB%8D%2C%20Ho%C3%A0ng%20Li%E1%BB%87t%2C%20H%C3%A0%20N%E1%BB%99i',
  },
  {
    label: 'Miền Nam',
    address: '86/10 đường 12, P.Tam Bình, Thủ Đức, TP.HCM',
    googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=86%2F10%20%C4%91%C6%B0%E1%BB%9Dng%2012%2C%20P.Tam%20B%C3%ACnh%2C%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20TP.HCM',
  },
  {
    label: 'Xưởng SX',
    address: 'Ngõ 32 Đại Từ, Hoàng Mai, Hà Nội',
    googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Ng%C3%B5%2032%20%C4%90%E1%BA%A1i%20T%E1%BB%AB%2C%20Ho%C3%A0ng%20Mai%2C%20H%C3%A0%20N%E1%BB%99i',
  },
]

function mapSettings(settings: PublicStoreSettings | undefined, tenantSlug: string): PublicStoreSettings {
  const phone = cleanPhone(settings?.contactPhone) || defaultPhoneByTenant[tenantSlug] || ''
  const zaloUrl = cleanUrl(settings?.zaloUrl) || (phone ? `https://zalo.me/${phone.replace(/^\+84/, '0')}` : '')
  const locations = (settings?.mapLocations || [])
    .map((location) => ({
      id: location.id,
      label: cleanText(location.label, 80),
      address: cleanText(location.address, 500),
      googleMapUrl: cleanUrl(location.googleMapUrl),
    }))
    .filter((location) => location.label && location.address && location.googleMapUrl)

  return {
    contactPhone: phone,
    facebookUrl: cleanUrl(settings?.facebookUrl) || cleanUrl(defaultFacebookByTenant[tenantSlug]),
    instagramUrl: cleanUrl(settings?.instagramUrl),
    mapLocations: locations.length ? locations : tenantSlug === 'pndsport' ? [] : defaultMapLocations,
    pinterestUrl: cleanUrl(settings?.pinterestUrl),
    siteName: cleanText(settings?.siteName, 120),
    telegramChatId: cleanText(settings?.telegramChatId, 120),
    threadsUrl: cleanUrl(settings?.threadsUrl),
    tiktokUrl: cleanUrl(settings?.tiktokUrl),
    zaloUrl,
  }
}

export async function getPublicStoreSettings() {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      depth: '0',
      limit: '1',
    })
    const response = await fetch(`${API_URL}/api/store-settings?${params.toString()}`, {
      next: { revalidate: 60 },
    })
    if (!response.ok) throw new Error(`Payload store-settings returned ${response.status}`)
    const data = (await response.json()) as ApiList<PublicStoreSettings>
    return mapSettings(data.docs?.[0], tenantSlug)
  } catch (error) {
    console.error(`Unable to load ${tenantSlug} public store settings.`, error)
    return mapSettings(undefined, tenantSlug)
  }
}
