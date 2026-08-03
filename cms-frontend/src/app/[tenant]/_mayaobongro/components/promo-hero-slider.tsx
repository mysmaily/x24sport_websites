import { LoaderCircle } from 'lucide-react'

import styles from './promo-hero-slider.module.css'

type PromoSlide = {
  alt: string
  height: number
  mobileSrc: string
  src: string
  width: number
}

const slides: PromoSlide[] = [
  {
    alt: 'Đội bóng rổ học sinh mặc đồng phục xanh thi đấu trên sân ngoài trời cùng huấn luyện viên',
    height: 821,
    mobileSrc: '/images/mayaobongro/home/basketball-team-outdoor-mobile.webp',
    src: '/images/mayaobongro/home/basketball-team-outdoor-wide.webp',
    width: 1916,
  },
  {
    alt: 'Hai cầu thủ trẻ mặc đồng phục bóng rổ xanh tím trong buổi tập tại nhà thi đấu',
    height: 821,
    mobileSrc: '/images/mayaobongro/home/basketball-team-indoor-mobile.webp',
    src: '/images/mayaobongro/home/basketball-team-indoor-wide.webp',
    width: 1915,
  },
  {
    alt: 'Cầu thủ mặc đồng phục bóng rổ xanh navy chuyển hồng dẫn bóng trên sân ngoài trời',
    height: 821,
    mobileSrc: '/images/mayaobongro/home/basketball-player-navy-magenta-mobile.webp',
    src: '/images/mayaobongro/home/basketball-player-navy-magenta-wide.webp',
    width: 1915,
  },
]

export function PromoHeroSlider() {
  return (
    <section aria-label="Hình ảnh may áo bóng rổ thiết kế riêng" className={styles.slider} data-count={slides.length}>
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
    </section>
  )
}
