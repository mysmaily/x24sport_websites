import { ArrowRight, CalendarDays, GraduationCap, ShieldCheck, Trophy, UsersRound } from 'lucide-react'
import Link from 'next/link'

import { TenantPromoHero, type TenantPromoHeroSlide } from '../../../_components/tenant-promo-hero'
import { BASKETBALL_AUDIENCES } from '../lib/basketball-audiences'
import { ZALO_URL } from '../lib/site'
import styles from './legacy-home-banner.module.css'

const iconBySlug: Record<string, typeof GraduationCap> = {
  'lop-truong-hoc': GraduationCap,
  'clb-doi-bong-phong-trao': UsersRound,
  'giai-dau-su-kien': CalendarDays,
  'doi-tuyen-chuyen-nghiep': Trophy,
}

const bannerAudienceSlugs = new Set([
  'lop-truong-hoc',
  'clb-doi-bong-phong-trao',
  'giai-dau-su-kien',
  'doi-tuyen-chuyen-nghiep',
])

const heroSlides: TenantPromoHeroSlide[] = [
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

export function LegacyHomeBanner() {
  return (
    <TenantPromoHero ariaLabel="Hình ảnh may áo bóng rổ thiết kế riêng" slides={heroSlides}>
      <div className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.badge}>
            <ShieldCheck aria-hidden="true" size={17} /> May theo nhận diện riêng · Duyệt maket trước
          </p>
          <h1 className={styles.headline}>
            Áo bóng rổ thiết kế riêng cho đội của bạn.
          </h1>
          <p className={styles.lead}>
            Chọn nhóm phù hợp để xem mẫu, checklist đặt may và cách chuẩn bị logo, tên số, size cho lớp, CLB, giải đấu hoặc đội tuyển.
          </p>
        </div>

        <div className={styles.audienceGrid}>
          {BASKETBALL_AUDIENCES.filter((audience) => bannerAudienceSlugs.has(audience.slug)).map((audience) => {
            const Icon = iconBySlug[audience.slug]
            return (
              <Link
                className={styles.audienceCard}
                href={audience.path}
                key={audience.slug}
              >
                <span className={styles.audienceIcon}>
                  <Icon aria-hidden="true" size={19} />
                </span>
                <h2 className={styles.audienceTitle}>{audience.shortTitle}</h2>
                <span className={styles.audienceLink}>
                  Xem gợi ý <ArrowRight aria-hidden="true" size={14} />
                </span>
              </Link>
            )
          })}
        </div>

        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/san-pham/">
            Xem mẫu áo bóng rổ <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <a className={styles.secondaryAction} href={ZALO_URL} rel="noreferrer" target="_blank">
            Nhắn tư vấn thiết kế
          </a>
        </div>
      </div>
    </TenantPromoHero>
  )
}
