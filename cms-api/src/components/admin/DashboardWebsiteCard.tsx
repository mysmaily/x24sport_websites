'use client'

import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import React from 'react'

type Website = {
  domain?: string | null
  id: number | string
  name: string
}

export function DashboardWebsiteCard({ websites }: { websites: Website[] }) {
  const { selectedTenantID } = useTenantSelection()
  const selectedWebsite = websites.find(({ id }) => String(id) === String(selectedTenantID))

  return (
    <section className="x24-dashboard-welcome" aria-labelledby="x24-dashboard-title">
      <div className="x24-dashboard-welcome__copy">
        <p className="x24-dashboard-welcome__eyebrow">X24SPORT COMMERCE</p>
        <h1 id="x24-dashboard-title">Trung tâm quản lý website</h1>
        <p>Quản lý sản phẩm, hình ảnh và nội dung tập trung cho hệ thống website X24Sport.</p>
      </div>

      <div className="x24-dashboard-welcome__website" aria-live="polite">
        <span className="x24-dashboard-welcome__status" aria-hidden="true" />
        <span className="x24-dashboard-welcome__website-copy">
          <small>Website đang làm việc</small>
          <strong>{selectedWebsite?.name || 'Chưa chọn website'}</strong>
          {selectedWebsite?.domain ? (
            <a
              href={`https://${selectedWebsite.domain}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Mở website ${selectedWebsite.domain} trong tab mới`}
            >
              {selectedWebsite.domain}
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
            </a>
          ) : null}
        </span>
      </div>
    </section>
  )
}
