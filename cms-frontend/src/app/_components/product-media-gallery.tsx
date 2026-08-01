'use client'

import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export type ProductMediaGalleryImage = {
  id?: number | string
  url?: string
  alt?: string | null
  width?: number | null
  height?: number | null
}

type ProductMediaGalleryProps = {
  discountPercent?: number
  fallbackText?: string
  images: ProductMediaGalleryImage[]
  label?: string
  productName: string
  variant?: 'css' | 'utility'
}

export function ProductMediaGallery({
  discountPercent = 0,
  fallbackText,
  images,
  label,
  productName,
  variant = 'css',
}: ProductMediaGalleryProps) {
  const usableImages = images.filter((image): image is ProductMediaGalleryImage & { url: string } => Boolean(image.url))
  const total = usableImages.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const activeImage = usableImages[activeIndex] || usableImages[0]

  const goTo = useCallback(
    (index: number) => {
      if (!total) return
      setActiveIndex(((index % total) + total) % total)
    },
    [total],
  )

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  useEffect(() => {
    if (!total || activeIndex < total) return
    setActiveIndex(0)
  }, [activeIndex, total])

  useEffect(() => {
    if (!zoomOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomOpen(false)
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [goNext, goPrev, zoomOpen])

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    const startX = touchStartX.current
    const endX = event.changedTouches[0]?.clientX
    touchStartX.current = null
    if (startX === null || endX === undefined || Math.abs(startX - endX) < 48 || total < 2) return
    if (startX > endX) goNext()
    else goPrev()
  }

  const rootClassName = variant === 'utility' ? 'product-media-gallery product-media-gallery--utility' : 'product-detail-gallery'
  const stageClassName = variant === 'utility' ? 'product-media-stage product-gallery-stage' : 'product-gallery-stage'

  return (
    <section
      aria-label={`Ảnh sản phẩm ${productName}`}
      className={rootClassName}
      onKeyDown={(event) => {
        if (total < 2) return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          goPrev()
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          goNext()
        }
      }}
      tabIndex={0}
    >
      <div
        className={stageClassName}
        onTouchEnd={onTouchEnd}
        onTouchStart={onTouchStart}
        style={{ aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative' }}
      >
        {activeImage ? (
          <img
            alt={activeImage.alt || `${productName} - ảnh ${activeIndex + 1}`}
            className="product-media-image"
            draggable={false}
            height={activeImage.height || 1254}
            key={activeImage.url}
            src={activeImage.url}
            style={{ display: 'block', height: '100%', objectFit: 'contain', width: '100%' }}
            width={activeImage.width || 1254}
          />
        ) : (
          <div className="product-image-fallback" style={{ height: '100%', width: '100%' }}>{fallbackText || productName}</div>
        )}

        {label ? <span className="product-media-label">{label}</span> : null}
        {total > 1 ? <span className="product-media-count">{activeIndex + 1} / {total}</span> : null}
        {total > 1 ? (
          <>
            <button aria-label="Ảnh trước" className="gallery-nav gallery-nav-prev" onClick={goPrev} type="button">
              <ChevronLeft aria-hidden="true" size={23} />
            </button>
            <button aria-label="Ảnh tiếp theo" className="gallery-nav gallery-nav-next" onClick={goNext} type="button">
              <ChevronRight aria-hidden="true" size={23} />
            </button>
          </>
        ) : null}
        {activeImage ? (
          <button aria-label="Phóng to ảnh sản phẩm" className="product-zoom-button" onClick={() => setZoomOpen(true)} type="button">
            <Search aria-hidden="true" size={20} />
          </button>
        ) : null}
        {discountPercent ? <span className="product-sale-badge">-{discountPercent}%</span> : null}
        <span aria-live="polite" className="sr-only">Đang xem ảnh {total ? activeIndex + 1 : 0} trên {total}</span>
      </div>

      {total > 1 ? (
        <div className="product-gallery-thumbnails" aria-label="Chọn ảnh sản phẩm" role="group">
          {usableImages.map((image, index) => {
            const selected = index === activeIndex
            return (
              <button
                aria-label={`Xem ảnh sản phẩm ${index + 1}`}
                aria-pressed={selected}
                className={selected ? 'is-active' : undefined}
                key={`${image.id || image.url}-${index}`}
                onClick={() => goTo(index)}
                type="button"
              >
                <img alt="" draggable={false} height={image.height || 1254} src={image.url} width={image.width || 1254} />
                {variant === 'utility' ? <span>{index + 1}</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {zoomOpen && activeImage ? (
        <div className="product-image-lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh sản phẩm">
          <button aria-label="Đóng ảnh" className="product-image-lightbox-backdrop" onClick={() => setZoomOpen(false)} type="button" />
          <div className="product-image-lightbox-panel">
            <button aria-label="Đóng ảnh" className="product-image-lightbox-close" onClick={() => setZoomOpen(false)} type="button">
              <X aria-hidden="true" size={22} />
            </button>
            {total > 1 ? (
              <>
                <button aria-label="Ảnh trước" className="product-image-lightbox-nav product-image-lightbox-prev" onClick={goPrev} type="button">
                  <ChevronLeft aria-hidden="true" size={28} />
                </button>
                <button aria-label="Ảnh tiếp theo" className="product-image-lightbox-nav product-image-lightbox-next" onClick={goNext} type="button">
                  <ChevronRight aria-hidden="true" size={28} />
                </button>
              </>
            ) : null}
            <img
              alt={activeImage.alt || `${productName} - ảnh ${activeIndex + 1}`}
              className="product-image-lightbox-image"
              draggable={false}
              height={activeImage.height || 1254}
              src={activeImage.url}
              width={activeImage.width || 1254}
            />
            {total > 1 ? <div className="product-image-lightbox-count">{activeIndex + 1} / {total}</div> : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
