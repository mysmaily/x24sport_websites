'use client'

import type { DefaultCellComponentProps } from 'payload'

import styles from './MediaPreviewCell.module.scss'

const getString = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : '')

export function MediaPreviewCell({ rowData }: DefaultCellComponentProps) {
  const mediaID = rowData?.id
  const imageURL = getString(rowData?.thumbnailURL) || getString(rowData?.url)
  const alt = getString(rowData?.alt) || 'Media'

  return (
    <div className={styles.cell}>
      {imageURL && (typeof mediaID === 'number' || typeof mediaID === 'string') ? (
        <a
          aria-label={`Mở media ${alt}`}
          className={styles.link}
          href={`/admin/collections/media/${encodeURIComponent(String(mediaID))}`}
          onClick={(event) => event.stopPropagation()}
        >
          <img alt="" className={styles.image} loading="lazy" src={imageURL} />
        </a>
      ) : null}
      {!imageURL ? <span className={styles.empty}>Không có ảnh</span> : null}
    </div>
  )
}
