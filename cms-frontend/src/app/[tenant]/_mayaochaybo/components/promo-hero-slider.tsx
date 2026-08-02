import { LoaderCircle } from 'lucide-react'

import styles from './promo-hero-slider.module.css'

type PromoSlide = {
  alt: string
  mobileSrc: string
  src: string
}

const slides: PromoSlide[] = [
  {
    alt: 'Áo chạy bộ màu trắng phong cách Việt Nam có thể in logo đội, tên nhóm, số áo và duyệt mẫu trước',
    mobileSrc: '/images/mayaochaybo/home/running-promo-vietnam-mobile.webp',
    src: '/images/mayaochaybo/home/running-promo-vietnam-wide.webp',
  },
  {
    alt: 'Áo ba lỗ chạy bộ race day nhẹ, khô nhanh, đủ size cho đội chạy và sự kiện',
    mobileSrc: '/images/mayaochaybo/home/running-promo-singlet-mobile.webp',
    src: '/images/mayaochaybo/home/running-promo-singlet-wide.webp',
  },
]

export function PromoHeroSlider() {
  return (
    <section aria-label="Hình ảnh may áo chạy bộ thiết kế riêng" className={styles.slider} data-count={slides.length}>
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
              height={809}
              loading={index === 0 ? 'eager' : 'lazy'}
              src={slide.src}
              width={1942}
            />
          </picture>
        </div>
      ))}
      <div aria-hidden="true" className={styles.readableOverlay} />
      <div aria-hidden="true" className={styles.dots}>
        {slides.map((slide) => <span key={slide.src} />)}
      </div>
    </section>
  )
}
