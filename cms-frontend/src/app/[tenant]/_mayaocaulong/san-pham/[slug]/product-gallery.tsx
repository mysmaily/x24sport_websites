'use client'

import { useState } from 'react'
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
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = usableImages[activeIndex] || usableImages[0]

  return (
    <div className="product-detail-gallery">
      <div className="product-gallery-stage">
        {activeImage?.url ? (
          <img
            key={activeImage.id}
            alt={activeImage.alt || productName}
            height={activeImage.height || 1254}
            src={activeImage.url}
            width={activeImage.width || 1254}
          />
        ) : (
          <div className="product-image-fallback">{productName}</div>
        )}
      </div>

      {usableImages.length > 1 ? (
        <div className="product-gallery-thumbnails" aria-label="Ảnh sản phẩm">
          {usableImages.map((image, index) => (
            <button
              aria-label={`Xem ảnh sản phẩm ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? 'is-active' : undefined}
              key={image.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <img
                alt=""
                height={image.height || 1254}
                src={image.url}
                width={image.width || 1254}
              />
            </button>
          ))}
        </div>
      ) : null}

      {discountPercent ? <span className="product-sale-badge">-{discountPercent}%</span> : null}
      {activeImage?.url ? (
        <a className="product-zoom-button" href={activeImage.url} target="_blank" rel="noreferrer" aria-label="Xem ảnh lớn">
          <Search size={20} />
        </a>
      ) : null}
    </div>
  )
}
