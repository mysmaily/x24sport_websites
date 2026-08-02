import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'

import styles from './promo-hero-slider.module.css'

type PromoSlide = {
  alt: string
  src: string
}

const slides: PromoSlide[] = [
  {
    alt: 'Áo chạy bộ gradient thiết kế riêng cho đội nhóm với chất vải co giãn, thoáng khí và may theo đội',
    src: '/images/mayaochaybo/home/running-promo-gradient-fabric-wide.webp',
  },
  {
    alt: 'Áo chạy bộ màu trắng phong cách Việt Nam có thể in logo đội, tên nhóm, số áo và duyệt mẫu trước',
    src: '/images/mayaochaybo/home/running-promo-vietnam-wide.webp',
  },
  {
    alt: 'Áo ba lỗ chạy bộ race day nhẹ, khô nhanh, đủ size cho đội chạy và sự kiện',
    src: '/images/mayaochaybo/home/running-promo-singlet-wide.webp',
  },
]

export function PromoHeroSlider() {
  return (
    <section aria-label="Hình ảnh may áo chạy bộ thiết kế riêng" className={styles.slider}>
      <div aria-hidden="true" className={styles.loader}><LoaderCircle size={28} /></div>
      {slides.map((slide, index) => (
        <Image
          alt={slide.alt}
          className={styles.image}
          fill
          key={slide.src}
          priority={index === 0}
          sizes="100vw"
          src={slide.src}
          unoptimized
        />
      ))}
      <div aria-hidden="true" className={styles.readableOverlay} />
      <div aria-hidden="true" className={styles.dots}>
        {slides.map((slide) => <span key={slide.src} />)}
      </div>
    </section>
  )
}
