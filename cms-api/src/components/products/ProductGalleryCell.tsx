'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import styles from './ProductGalleryCell.module.scss'

type GalleryImage = {
  alt: string
  height?: number
  id: number | string
  thumbnailURL?: string
  url: string
  width?: number
}

type MediaDocument = {
  alt?: unknown
  height?: unknown
  id?: unknown
  thumbnailURL?: unknown
  url?: unknown
  width?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const optionalPositiveNumber = (value: unknown) =>
  typeof value === 'number' && value > 0 ? value : undefined

const mediaToImage = (value: MediaDocument, fallbackAlt: string): GalleryImage | null => {
  if ((typeof value.id !== 'number' && typeof value.id !== 'string') || typeof value.url !== 'string') {
    return null
  }

  const url = value.url.trim()
  if (!url) return null

  return {
    alt: typeof value.alt === 'string' && value.alt.trim() ? value.alt : fallbackAlt,
    height: optionalPositiveNumber(value.height),
    id: value.id,
    thumbnailURL:
      typeof value.thumbnailURL === 'string' && value.thumbnailURL.trim()
        ? value.thumbnailURL
        : undefined,
    url,
    width: optionalPositiveNumber(value.width),
  }
}

const legacyToImage = (
  value: Record<string, unknown>,
  fallbackAlt: string,
  index: number,
): GalleryImage | null => {
  if (typeof value.url !== 'string' || !value.url.trim()) return null

  return {
    alt: typeof value.alt === 'string' && value.alt.trim() ? value.alt : fallbackAlt,
    height: optionalPositiveNumber(value.height),
    id:
      typeof value.id === 'number' || typeof value.id === 'string'
        ? `legacy-${value.id}`
        : `legacy-${index}`,
    url: value.url.trim(),
    width: optionalPositiveNumber(value.width),
  }
}

function GalleryLightbox({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const isOpen = activeIndex !== null

  const close = useCallback(() => setActiveIndex(null), [])
  const showPrevious = useCallback(
    () =>
      setActiveIndex((current) =>
        current === null ? 0 : (current - 1 + images.length) % images.length,
      ),
    [images.length],
  )
  const showNext = useCallback(
    () => setActiveIndex((current) => (current === null ? 0 : (current + 1) % images.length)),
    [images.length],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) {
      dialog.close()
      openerRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [close, isOpen, showNext, showPrevious])

  useEffect(() => {
    if (activeIndex === null || images.length < 2) return

    const adjacent = [
      images[(activeIndex - 1 + images.length) % images.length],
      images[(activeIndex + 1) % images.length],
    ]
    adjacent.forEach((image) => {
      const preload = new Image()
      preload.src = image.url
    })
  }, [activeIndex, images])

  const activeImage = images[activeIndex ?? 0]

  return (
    <>
      <button
        aria-label={`Xem ${images.length} ảnh của ${productName}`}
        className={styles.thumbnailButton}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setActiveIndex(0)
        }}
        ref={openerRef}
        type="button"
      >
        <img alt="" className={styles.thumbnail} src={images[0].thumbnailURL || images[0].url} />
        {images.length > 1 ? <span className={styles.imageCount}>+{images.length - 1}</span> : null}
      </button>

      <dialog
        aria-label={`Thư viện ảnh ${productName}`}
        className={styles.dialog}
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (event.target === event.currentTarget) close()
        }}
        ref={dialogRef}
      >
        <div className={styles.lightbox}>
          <div aria-live="polite" className={styles.counter}>
            {activeIndex === null ? 0 : activeIndex + 1} / {images.length}
          </div>
          <button aria-label="Đóng thư viện ảnh" className={styles.closeButton} onClick={close} type="button">
            <span aria-hidden="true">×</span>
          </button>

          <div className={styles.stage}>
            {images.length > 1 ? (
              <button
                aria-label="Xem ảnh trước"
                className={`${styles.navigationButton} ${styles.previousButton}`}
                onClick={showPrevious}
                type="button"
              >
                <span aria-hidden="true">‹</span>
              </button>
            ) : null}

            {activeImage ? (
              <img
                alt={activeImage.alt}
                className={styles.activeImage}
                height={activeImage.height}
                src={activeImage.url}
                width={activeImage.width}
              />
            ) : null}

            {images.length > 1 ? (
              <button
                aria-label="Xem ảnh tiếp theo"
                className={`${styles.navigationButton} ${styles.nextButton}`}
                onClick={showNext}
                type="button"
              >
                <span aria-hidden="true">›</span>
              </button>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div aria-label="Chọn ảnh sản phẩm" className={styles.thumbnailRail} role="group">
              {images.map((image, index) => (
                <button
                  aria-current={index === activeIndex ? 'true' : undefined}
                  aria-label={`Xem ảnh ${index + 1} / ${images.length}`}
                  className={styles.railButton}
                  key={`${image.id}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <img alt="" src={image.thumbnailURL || image.url} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  )
}

export function ProductGalleryCell({ cellData, rowData }: DefaultCellComponentProps) {
  const productName = typeof rowData?.name === 'string' ? rowData.name : 'sản phẩm'
  const gallery = useMemo(() => (Array.isArray(cellData) ? cellData : []), [cellData])
  const legacyImages = useMemo(
    () =>
      (Array.isArray(rowData?.legacyImages) ? rowData.legacyImages : [])
        .filter(isRecord)
        .map((image, index) => legacyToImage(image, productName, index))
        .filter((image): image is GalleryImage => Boolean(image)),
    [productName, rowData?.legacyImages],
  )
  const embeddedImages = useMemo(
    () =>
      gallery
        .filter(isRecord)
        .map((image) => mediaToImage(image, productName))
        .filter((image): image is GalleryImage => Boolean(image)),
    [gallery, productName],
  )
  const galleryIDs = useMemo(
    () =>
      gallery
        .map((value) => {
          if (typeof value === 'number' || typeof value === 'string') return value
          if (isRecord(value) && (typeof value.id === 'number' || typeof value.id === 'string')) {
            return value.id
          }
          return null
        })
        .filter((id): id is number | string => id !== null),
    [gallery],
  )
  const [remoteImages, setRemoteImages] = useState<GalleryImage[]>(embeddedImages)
  const [loadState, setLoadState] = useState<'error' | 'idle' | 'loading'>(
    galleryIDs.length > embeddedImages.length ? 'loading' : 'idle',
  )
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const missingIDs = galleryIDs.filter(
      (id) => !embeddedImages.some((image) => String(image.id) === String(id)),
    )
    if (!missingIDs.length) {
      setRemoteImages(embeddedImages)
      setLoadState('idle')
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({ depth: '0', limit: String(missingIDs.length) })
    missingIDs.forEach((id, index) => params.set(`where[id][in][${index}]`, String(id)))
    setLoadState('loading')

    void fetch(`/api/media?${params.toString()}`, {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Media request failed with ${response.status}`)
        return (await response.json()) as { docs?: MediaDocument[] }
      })
      .then(({ docs = [] }) => {
        const fetchedImages = docs
          .map((image) => mediaToImage(image, productName))
          .filter((image): image is GalleryImage => Boolean(image))
        const byID = new Map(
          [...embeddedImages, ...fetchedImages].map((image) => [String(image.id), image]),
        )
        setRemoteImages(
          galleryIDs
            .map((id) => byID.get(String(id)))
            .filter((image): image is GalleryImage => Boolean(image)),
        )
        setLoadState('idle')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadState('error')
      })

    return () => controller.abort()
  }, [embeddedImages, galleryIDs, productName, retryCount])

  const images = remoteImages.length ? remoteImages : galleryIDs.length ? [] : legacyImages

  return (
    <div
      className={styles.cell}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      {images.length ? <GalleryLightbox images={images} productName={productName} /> : null}
      {!images.length && loadState === 'loading' ? (
        <span aria-label="Đang tải ảnh" className={styles.loading} role="status" />
      ) : null}
      {!images.length && loadState === 'error' ? (
        <button className={styles.retryButton} onClick={() => setRetryCount((count) => count + 1)} type="button">
          Tải lại ảnh
        </button>
      ) : null}
      {!images.length && loadState === 'idle' ? <span className={styles.empty}>Không có ảnh</span> : null}
    </div>
  )
}
