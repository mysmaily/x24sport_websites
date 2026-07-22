'use client'

import { useEffect } from 'react'

const SESSION_TTL_MS = 30 * 60 * 1000
const STORAGE_KEY = 'x24-product-view-identity'
const VIEW_DELAY_MS = 1000

type StoredIdentity = {
  lastSeen: number
  sessionId: string
  visitorId: string
}

type ProductViewTrackerProps = {
  currency?: string
  itemCategory?: string
  name: string
  price?: number | null
  productId: number | string
  sku?: string | null
  tenantSlug: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function randomIdentifier() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getAnonymousIdentity(): StoredIdentity {
  const now = Date.now()
  let stored: Partial<StoredIdentity> = {}

  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<StoredIdentity>
  } catch {
    stored = {}
  }

  const visitorId = stored.visitorId || randomIdentifier()
  const sessionExpired = !stored.lastSeen || now - stored.lastSeen > SESSION_TTL_MS
  const identity = {
    lastSeen: now,
    sessionId: sessionExpired || !stored.sessionId ? randomIdentifier() : stored.sessionId,
    visitorId,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  } catch {
    // Tracking remains best-effort when storage is unavailable.
  }

  return identity
}

export function ProductViewTracker({
  currency = 'VND',
  itemCategory,
  name,
  price,
  productId,
  sku,
  tenantSlug,
}: ProductViewTrackerProps) {
  useEffect(() => {
    let sent = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const send = () => {
      if (sent) return
      sent = true

      const identity = getAnonymousIdentity()
      const item = {
        item_id: `${tenantSlug}:${productId}`,
        item_name: name,
        ...(sku ? { item_variant: sku } : {}),
        ...(itemCategory ? { item_category: itemCategory } : {}),
        ...(typeof price === 'number' && price > 0 ? { price } : {}),
        quantity: 1,
      }

      window.gtag?.('event', 'view_item', {
        currency,
        items: [item],
        ...(typeof price === 'number' && price > 0 ? { value: price } : {}),
      })

      const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.x24sport.vn'
      void fetch(`${cmsUrl}/api/analytics/product-view`, {
        body: JSON.stringify({
          path: window.location.pathname,
          productId,
          sessionId: identity.sessionId,
          tenantSlug,
          visitorId: identity.visitorId,
        }),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        method: 'POST',
        mode: 'cors',
      }).catch(() => undefined)
    }

    const schedule = () => {
      if (document.visibilityState !== 'visible' || sent || timer) return
      timer = setTimeout(send, VIEW_DELAY_MS)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        schedule()
      } else if (timer) {
        clearTimeout(timer)
        timer = undefined
      }
    }

    schedule()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [currency, itemCategory, name, price, productId, sku, tenantSlug])

  return null
}
