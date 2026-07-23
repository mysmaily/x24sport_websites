'use client'

import Image from 'next/image'
import { useState } from 'react'

type GalleryImage = { url: string; alt?: string; width?: number; height?: number }

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0)
  const visible = images.length ? images : [{ url: '/images/football.jpg', alt: name }]
  return (
    <div className="detail-gallery">
      <div className="detail-main-image">
        <Image src={visible[active].url} alt={visible[active].alt || name}
          width={1000} height={1000} fetchPriority={active === 0 ? 'high' : 'auto'} loading={active === 0 ? 'eager' : 'lazy'} sizes="(max-width: 850px) 100vw, 44vw" />
      </div>
      {visible.length > 1 && <div className="detail-thumbs">
        {visible.map((image, index) => <button className={index === active ? 'active' : ''}
          type="button" onClick={() => setActive(index)} key={image.url} aria-label={`Xem ảnh ${index + 1}`}>
          <Image src={image.url} alt="" width={120} height={120} />
        </button>)}
      </div>}
    </div>
  )
}
