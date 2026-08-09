'use client'

import { useState } from 'react'

type ProductContentPreviewProps = {
  html: string
}

export function ProductContentPreview({ html }: ProductContentPreviewProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="mcb-content-preview" aria-labelledby="mcb-content-preview-title">
      <div
        className={`mcb-content-preview-body ${expanded ? 'is-expanded' : ''}`}
        id="mcb-content-preview-body"
      >
        <h2 id="mcb-content-preview-title">Thông tin chi tiết mẫu áo</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {!expanded ? (
        <button
          aria-controls="mcb-content-preview-body"
          aria-expanded={expanded}
          className="mcb-content-preview-more"
          onClick={() => setExpanded(true)}
          type="button"
        >
          Xem thêm
        </button>
      ) : null}
    </section>
  )
}
