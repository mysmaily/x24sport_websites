import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { preload } from 'react-dom'

import styles from './tenant-promo-hero.module.css'

export type TenantPromoHeroSlide = {
  alt: string
  height: number
  mobileSrc: string
  src: string
  width: number
}

type TenantPromoHeroProps = {
  ariaLabel: string
  children: ReactNode
  className?: string
  slides: TenantPromoHeroSlide[]
}

export function TenantPromoHero({ ariaLabel, children, className, slides }: TenantPromoHeroProps) {
  const firstSlide = slides[0]
  if (firstSlide) {
    preload(firstSlide.mobileSrc, {
      as: 'image',
      fetchPriority: 'high',
      media: '(max-width: 1023px)',
      type: 'image/webp',
    })
    preload(firstSlide.src, {
      as: 'image',
      fetchPriority: 'high',
      media: '(min-width: 1024px)',
      type: 'image/webp',
    })
  }

  return (
    <section className={`tenant-promo-hero ${styles.banner}${className ? ` ${className}` : ''}`} data-promo-hero>
      <div aria-label={ariaLabel} className={`tenant-promo-slider ${styles.slider}`} data-count={slides.length} data-promo-hero-slider role="group">
        <div aria-hidden="true" className={`tenant-promo-loader ${styles.loader}`}><LoaderCircle size={28} /></div>
        {slides.map((slide, index) => (
          <div className={`tenant-promo-slide ${styles.slide}`} data-promo-hero-slide key={slide.src} style={{ animationDelay: `${index * 5}s` }}>
            <picture className={`tenant-promo-picture ${styles.picture}`}>
              <source media="(max-width: 1023px)" srcSet={slide.mobileSrc} />
              <img
                alt={slide.alt}
                className={`tenant-promo-image ${styles.image}`}
                decoding="async"
                data-promo-hero-image
                fetchPriority={index === 0 ? 'high' : 'auto'}
                height={slide.height}
                loading={index === 0 ? 'eager' : 'lazy'}
                src={slide.src}
                width={slide.width}
              />
            </picture>
          </div>
        ))}
        <div aria-hidden="true" className={`tenant-promo-readable-overlay ${styles.readableOverlay}`} data-promo-hero-overlay />
        <div aria-hidden="true" className={`tenant-promo-dots ${styles.dots}`}>
          {slides.map((slide) => <span key={slide.src} />)}
        </div>
      </div>
      <div className={`section-shell tenant-promo-content ${styles.content}`} data-promo-hero-content>{children}</div>
    </section>
  )
}
