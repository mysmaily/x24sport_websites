'use client'

import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
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
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const galleryRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement>(null)
  const lightboxRef = useRef<{ loadAndOpen: (index: number) => void } | null>(null)
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    horizontal: false,
    locked: false,
  })

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
    const gallery = galleryRef.current
    if (!gallery || !total) return

    let destroyed = false
    let lightbox: { destroy: () => void } | undefined

    import('photoswipe/lightbox').then(({ default: PhotoSwipeLightbox }) => {
      if (destroyed) return
      const nextLightbox = new PhotoSwipeLightbox({
        bgOpacity: 0.92,
        children: 'a',
        doubleTapAction: 'zoom',
        gallery,
        imageClickAction: 'zoom',
        initialZoomLevel: 'fit',
        pswpModule: () => import('photoswipe'),
        wheelToZoom: true,
      })
      nextLightbox.on('change', () => {
        const pswp = nextLightbox.pswp
        if (typeof pswp?.currIndex === 'number') setActiveIndex(pswp.currIndex)
      })
      nextLightbox.init()
      lightbox = nextLightbox
      lightboxRef.current = nextLightbox
    })

    return () => {
      destroyed = true
      lightbox?.destroy()
      lightboxRef.current = null
    }
  }, [total])

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      horizontal: false,
      locked: false,
    }
    setIsDragging(true)
    setDragOffset(0)
  }

  const onTouchMove = (event: React.TouchEvent) => {
    if (!isDragging || total < 2) return
    const touch = event.touches[0]
    if (!touch) return

    const state = touchRef.current
    const dx = touch.clientX - state.startX
    const dy = touch.clientY - state.startY

    if (!state.locked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      state.locked = true
      state.horizontal = Math.abs(dx) > Math.abs(dy)
    }

    if (!state.horizontal) return
    state.currentX = touch.clientX
    setDragOffset(dx)
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    const state = touchRef.current
    const endX = event.changedTouches[0]?.clientX
    setIsDragging(false)

    if (!state.horizontal || endX === undefined || total < 2) {
      setDragOffset(0)
      return
    }

    const width = stageRef.current?.clientWidth || 1
    const dx = endX - state.startX
    const threshold = Math.max(48, width * 0.16)
    if (Math.abs(dx) > threshold) {
      if (dx < 0) goNext()
      else goPrev()
    }
    setDragOffset(0)
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
        ref={stageRef}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        style={{ aspectRatio: '1 / 1', overflow: 'hidden', position: 'relative' }}
      >
        {activeImage ? (
          <div
            className="product-media-track"
            ref={galleryRef}
            style={{
              transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
              transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(.22, .61, .36, 1)',
            }}
          >
            {usableImages.map((image, index) => (
              <a
                aria-label={`Mở ảnh sản phẩm ${index + 1}`}
                className="product-media-slide"
                data-pswp-height={image.height || 1254}
                data-pswp-width={image.width || 1254}
                href={image.url}
                key={`${image.id || image.url}-${index}`}
                onClick={() => setActiveIndex(index)}
                rel="noreferrer"
                ref={index === activeIndex ? activeLinkRef : undefined}
                target="_blank"
              >
                <img
                  alt={image.alt || `${productName} - ảnh ${index + 1}`}
                  className="product-media-image"
                  draggable={false}
                  height={image.height || 1254}
                  src={image.url}
                  style={{ display: 'block', height: '100%', objectFit: 'contain', width: '100%' }}
                  width={image.width || 1254}
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="product-image-fallback" style={{ height: '100%', width: '100%' }}>{fallbackText || productName}</div>
        )}

        {label ? <span className="product-media-label">{label}</span> : null}
        {total > 1 ? <span className="product-media-count">{activeIndex + 1} / {total}</span> : null}
        {total > 1 ? (
          <>
            <button
              aria-label="Ảnh trước"
              className="gallery-nav gallery-nav-prev"
              onClick={goPrev}
              style={{ left: 12, position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 12 }}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={23} />
            </button>
            <button
              aria-label="Ảnh tiếp theo"
              className="gallery-nav gallery-nav-next"
              onClick={goNext}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 12 }}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={23} />
            </button>
          </>
        ) : null}
        {activeImage ? (
          <button
            aria-label="Phóng to ảnh sản phẩm"
            className="product-zoom-button"
            onClick={() => lightboxRef.current?.loadAndOpen(activeIndex) || activeLinkRef.current?.click()}
            style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 14 }}
            type="button"
          >
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

    </section>
  )
}
