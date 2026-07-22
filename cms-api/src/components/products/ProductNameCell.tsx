'use client'

import type { DefaultCellComponentProps } from 'payload'

export function ProductNameCell({ cellData, rowData }: DefaultCellComponentProps) {
  const productID = rowData?.id
  const name = typeof cellData === 'string' && cellData.trim() ? cellData : 'Chưa đặt tên'

  if (typeof productID !== 'number' && typeof productID !== 'string') {
    return <span>{name}</span>
  }

  return (
    <a
      href={`/admin/collections/products/${encodeURIComponent(String(productID))}`}
      onClick={(event) => event.stopPropagation()}
      style={{
        color: 'var(--theme-text)',
        fontWeight: 600,
        textDecoration: 'underline',
        textDecorationThickness: '1px',
        textUnderlineOffset: '3px',
      }}
    >
      {name}
    </a>
  )
}
