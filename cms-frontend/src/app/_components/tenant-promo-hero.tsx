import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

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
  slides: TenantPromoHeroSlide[]
}

export function TenantPromoHero({ ariaLabel, children, slides }: TenantPromoHeroProps) {
  return (
    <section className={styles.banner}>
      <div aria-label={ariaLabel} className={styles.slider} data-count={slides.length} role="group">
        <div aria-hidden="true" className={styles.loader}><LoaderCircle size={28} /></div>
        {slides.map((slide, index) => (
          <div className={styles.slide} key={slide.src} style={{ animationDelay: `${index * 5}s` }}>
            <picture className={styles.picture}>
              <source media="(max-width: 1023px)" srcSet={slide.mobileSrc} />
              <img
                alt={slide.alt}
                className={styles.image}
                decoding="async"
                fetchPriority={index === 0 ? 'high' : 'auto'}
                height={slide.height}
                loading={index === 0 ? 'eager' : 'lazy'}
                src={slide.src}
                width={slide.width}
              />
            </picture>
          </div>
        ))}
        <div aria-hidden="true" className={styles.readableOverlay} />
        <div aria-hidden="true" className={styles.dots}>
          {slides.map((slide) => <span key={slide.src} />)}
        </div>
      </div>
      <div className={`section-shell ${styles.content}`}>{children}</div>
    </section>
  )
}
