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
    alt: 'Bộ sưu tập áo bóng đá 2026 với mẫu áo trắng cam xanh, tuỳ chọn cổ áo, size và in tên số theo đội',
    src: '/images/mayaobongda/home/football-2026-collection-orange-wide.webp',
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
