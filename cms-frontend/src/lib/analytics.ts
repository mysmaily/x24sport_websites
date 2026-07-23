type ApiList<T> = {
  docs: T[]
}

type StoreSettings = {
  analytics?: {
    ga4Enabled?: boolean
    gaMeasurementId?: string
    metaPixelEnabled?: boolean
    metaPixelId?: string
  }
}

const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3001'
import { getTenantSlug } from './tenant'

export async function getAnalyticsSettings() {
  const tenantSlug = await getTenantSlug()
  try {
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      limit: '1',
    })
    const response = await fetch(`${apiUrl}/api/store-settings?${params.toString()}`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return undefined
    }

    const data = (await response.json()) as ApiList<StoreSettings>
    return data.docs[0]?.analytics
  } catch {
    return undefined
  }
}
