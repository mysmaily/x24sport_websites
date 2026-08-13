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
    <section className={`${styles.banner}${className ? ` ${className}` : ''}`}>
      <div aria-label={ariaLabel} className={styles.slider} data-count={slides.length} data-promo-hero-slider role="group">
        <div aria-hidden="true" className={styles.loader}><LoaderCircle size={28} /></div>
        {slides.map((slide, index) => (
          <div className={styles.slide} key={slide.src} style={{ animationDelay: `${index * 5}s` }}>
            <picture className={styles.picture}>
              <source media="(max-width: 1023px)" srcSet={slide.mobileSrc} />
              <img
                alt={slide.alt}
                className={styles.image}
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
        <div aria-hidden="true" className={styles.readableOverlay} data-promo-hero-overlay />
        <div aria-hidden="true" className={styles.dots}>
          {slides.map((slide) => <span key={slide.src} />)}
        </div>
      </div>
      <div className={`section-shell ${styles.content}`} data-promo-hero-content>{children}</div>
    </section>
  )
}
