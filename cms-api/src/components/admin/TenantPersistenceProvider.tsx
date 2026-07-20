'use client'

import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import React from 'react'

const STORAGE_KEY = 'x24sport-cms:selected-tenant'

export function TenantPersistenceProvider({ children }: { children?: React.ReactNode }) {
  const { options, selectedTenantID, setTenant } = useTenantSelection()

  React.useEffect(() => {
    if (selectedTenantID === undefined) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, String(selectedTenantID))
  }, [selectedTenantID])

  React.useEffect(() => {
    if (selectedTenantID !== undefined || options.length === 0) {
      return
    }

    const storedTenantID = window.localStorage.getItem(STORAGE_KEY)
    const storedOption = options.find(({ value }) => String(value) === storedTenantID)

    if (!storedOption) {
      if (storedTenantID) {
        window.localStorage.removeItem(STORAGE_KEY)
      }
      return
    }

    // The multi-tenant plugin clears a missing server cookie in its own mount
    // effect. Restoring on the next task lets that effect finish first, then
    // writes the remembered tenant back to the long-lived cookie.
    setTimeout(() => {
      setTenant({ id: storedOption.value, refresh: true })
    }, 0)
  }, [options, selectedTenantID, setTenant])

  return children
}
