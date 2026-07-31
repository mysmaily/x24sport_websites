'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

type GalleryImage = {
  id: number | string
  url?: string
  alt?: string
  width?: number | null
  height?: number | null
}

type ProductGalleryProps = {
  discountPercent: number
  images: GalleryImage[]
  productName: string
}

export function ProductGallery({ discountPercent, images, productName }: ProductGalleryProps) {
  const usableImages = images.filter((image) => image.url)
  const total = usableImages.length

  // Use a wider virtual index range: -1, 0, 1, ..., total-1, total
  // where -1 is a clone of total-1, and total is a clone of 0
  const [virtualIndex, setVirtualIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [animating, setAnimating] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useRef(0)
  const touchRef = useRef({
    startX: 0, startY: 0, currentX: 0,
    locked: false, dirLocked: false,
  })
  const trackRef = useRef<HTMLDivElement>(null)
  const jumping = useRef(false)

  // Real index (0 to total-1) for thumbnails
  const realIndex = ((virtualIndex % total) + total) % total

  // Get image for any virtual index (with clones at boundaries)
  const imgAt = (vi: number) => usableImages[((vi % total) + total) % total]

  // Compute track offset: center the virtualIndex slide
  const getOffset = useCallback(
    (vi: number) => -(vi + 1) * containerWidth.current,
    [],
  )

  const [offset, setOffset] = useState(() => getOffset(0))

  // When virtualIndex changes, move track
  useEffect(() => {
    if (containerRef.current) {
      containerWidth.current = containerRef.current.offsetWidth
    }
    setOffset(getOffset(virtualIndex))
  }, [virtualIndex, getOffset])

  // Handle transition end — jump if at boundary clone
  const onTransitionEnd = useCallback(() => {
    if (jumping.current) return
    if (virtualIndex < 0) {
      // Was at clone of last image, jump to real last
      jumping.current = true
      setAnimating(false)
      setVirtualIndex(total - 1)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          jumping.current = false
          setAnimating(true)
        })
      })
    } else if (virtualIndex >= total) {
      // Was at clone of first image, jump to real first
      jumping.current = true
      setAnimating(false)
      setVirtualIndex(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          jumping.current = false
          setAnimating(true)
        })
      })
    }
  }, [virtualIndex, total])

  // Update width on resize
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    containerWidth.current = el.offsetWidth
    const ro = new ResizeObserver(() => {
      containerWidth.current = el.offsetWidth
      if (!dragging) setOffset(getOffset(virtualIndex))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [dragging, virtualIndex, getOffset])

  const goTo = useCallback((newRealIndex: number) => {
    setVirtualIndex(newRealIndex)
  }, [])

  const goNext = useCallback(() => {
    setVirtualIndex((prev) => prev + 1)
  }, [])

  const goPrev = useCallback(() => {
    setVirtualIndex((prev) => prev - 1)
  }, [])

  // Touch handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setDragging(true)
      setAnimating(false)
      touchRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        currentX: e.touches[0].clientX,
        locked: false,
        dirLocked: false,
      }
    },
    [],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const t = touchRef.current
      const dx = e.touches[0].clientX - t.currentX
      const dy = e.touches[0].clientY - t.startY

      if (!t.locked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        t.locked = true
        t.dirLocked = Math.abs(dx) > Math.abs(dy)
        t.startX = e.touches[0].clientX
        t.currentX = e.touches[0].clientX
        if (!t.dirLocked) {
          setDragging(false)
          setAnimating(true)
          setOffset(getOffset(virtualIndex))
        }
        return
      }
      if (!t.locked || !t.dirLocked) return

      const moveX = e.touches[0].clientX - t.startX
      t.currentX = e.touches[0].clientX
      const baseOffset = getOffset(virtualIndex)
      setOffset(baseOffset + moveX)
    },
    [virtualIndex, getOffset],
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      setDragging(false)
      const t = touchRef.current
      if (!t.dirLocked) {
        setAnimating(true)
        setOffset(getOffset(virtualIndex))
        return
      }
      const dx = e.changedTouches[0].clientX - t.startX
      const threshold = containerWidth.current * 0.18

      setAnimating(true)
      if (Math.abs(dx) > threshold) {
        if (dx < 0) setVirtualIndex((prev) => prev + 1)
        else setVirtualIndex((prev) => prev - 1)
      } else {
        setOffset(getOffset(virtualIndex))
      }
    },
    [virtualIndex, getOffset],
  )

  // Render all slides with 2 buffer clones: [-1, 0, 1, ..., total-1, total]
  const renderSlides = () => {
    const slides = []
    for (let vi = -1; vi <= total; vi++) {
      slides.push({
        img: imgAt(vi),
        key: `${imgAt(vi).id}-${vi}`,
        left: `${(vi + 1) * 100}%`,
      })
    }
    return slides
  }

  if (!usableImages.length) {
    return (
      <div className="product-detail-gallery">
        <div className="product-gallery-stage">
          <div className="product-image-fallback">{productName}</div>
        </div>
      </div>
    )
  }

  const slides = renderSlides()

  return (
    <div className="product-detail-gallery">
      <div
        className="product-gallery-stage"
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
        ref={containerRef}
      >
        <div
          className="gallery-track"
          ref={trackRef}
          onTransitionEnd={onTransitionEnd}
          style={{
            transform: `translate3d(${offset}px, 0, 0)`,
            transition: animating && !dragging
              ? 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : 'none',
          }}
        >
          {slides.map(({ img, key, left }) => (
            <div className="gallery-slide" key={key} style={{ left }}>
              <img
                alt={img.alt || productName}
                draggable={false}
                height={img.height || 1254}
                src={img.url}
                width={img.width || 1254}
              />
            </div>
          ))}
        </div>

        {total > 1 ? (
          <>
            <button
              aria-label="Ảnh trước"
              className="gallery-nav gallery-nav-prev"
              onClick={goPrev}
              type="button"
            >
              ‹
            </button>
            <button
              aria-label="Ảnh tiếp theo"
              className="gallery-nav gallery-nav-next"
              onClick={goNext}
              type="button"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="product-gallery-thumbnails" aria-label="Ảnh sản phẩm">
          {usableImages.map((image, i) => (
            <button
              aria-label={`Xem ảnh sản phẩm ${i + 1}`}
              aria-pressed={i === realIndex}
              className={i === realIndex ? 'is-active' : undefined}
              key={image.id}
              onClick={() => goTo(i)}
              type="button"
            >
              <img
                alt=""
                draggable={false}
                height={image.height || 1254}
                src={image.url}
                width={image.width || 1254}
              />
            </button>
          ))}
        </div>
      ) : null}

      {discountPercent ? <span className="product-sale-badge">-{discountPercent}%</span> : null}
      {usableImages[realIndex]?.url ? (
        <a
          className="product-zoom-button"
          href={usableImages[realIndex].url}
          rel="noreferrer"
          target="_blank"
          aria-label="Xem ảnh lớn"
        >
          <Search size={20} />
        </a>
      ) : null}
    </div>
  )
}
