import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'

type PromoSlide = {
  alt: string
  src: string
}

const slides: PromoSlide[] = [
  {
    alt: 'Khuyến mãi áo bóng đá thiết kế từ 119K, miễn phí thiết kế và in tên số',
    src: '/images/mayaobongda/home/football-promo-119k-blue-wide.webp',
  },
  {
    alt: 'Đặt áo bóng đá thiết kế riêng, gửi logo đội để nhận maket nhanh và duyệt trước khi may',
    src: '/images/mayaobongda/home/football-custom-mockup-fast-wide.webp',
  },
]

export function PromoHeroSlider() {
  return (
    <section aria-label="Khuyến mãi áo bóng đá" className="promo-hero-slider">
      <div aria-hidden="true" className="promo-hero-loader"><LoaderCircle size={28} /></div>
      {slides.map((slide, index) => (
        <Image
          alt={slide.alt}
          className="promo-hero-image"
          fill
          key={slide.src}
          priority={index === 0}
          sizes="100vw"
          src={slide.src}
        />
      ))}
      <div aria-hidden="true" className="promo-hero-readable-overlay" />
      <div aria-hidden="true" className="promo-hero-dots">
        {slides.map((slide) => <span key={slide.src} />)}
      </div>
    </section>
  )
}
