'use client'

import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import React from 'react'

export function CurrentTenantHeader() {
  const { options, selectedTenantID } = useTenantSelection()
  const selectedTenant = options.find(({ value }) => String(value) === String(selectedTenantID))
  const tenantName = typeof selectedTenant?.label === 'string' ? selectedTenant.label : 'Chưa chọn website'

  return (
    <div
      className="x24-current-tenant"
      aria-label={`Website đang làm việc: ${tenantName}`}
      aria-live="polite"
      title={`Website đang làm việc: ${tenantName}`}
    >
      <span className="x24-current-tenant__status" aria-hidden="true" />
      <span className="x24-current-tenant__copy">
        <small>Website đang làm việc</small>
        <strong>{tenantName}</strong>
      </span>
    </div>
  )
}
