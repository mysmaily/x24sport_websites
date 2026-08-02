import { LoaderCircle } from 'lucide-react'

import styles from './promo-hero-slider.module.css'

type PromoSlide = {
  alt: string
  mobileSrc: string
  src: string
}

const slides: PromoSlide[] = [
  {
    alt: 'Khuyến mãi áo bóng đá thiết kế từ 119K, miễn phí thiết kế và in tên số',
    mobileSrc: '/images/mayaobongda/home/football-promo-119k-blue-mobile.webp',
    src: '/images/mayaobongda/home/football-promo-119k-blue-wide.webp',
  },
  {
    alt: 'Đặt áo bóng đá thiết kế riêng với mẫu áo trắng cam xanh, nhận maket nhanh và duyệt trước khi may',
    mobileSrc: '/images/mayaobongda/home/football-custom-mockup-reference-fabric-mobile.webp',
    src: '/images/mayaobongda/home/football-custom-mockup-reference-fabric-wide.webp',
  },
]

export function PromoHeroSlider() {
  return (
    <section aria-label="Khuyến mãi áo bóng đá" className={styles.slider}>
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
