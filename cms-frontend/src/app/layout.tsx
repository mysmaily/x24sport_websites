import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'
import Script from 'next/script'
import 'photoswipe/style.css'
import './styles.css'
import './mayaocaulong.css'
import './mayaopickleball.css'
import './mayaobongchuyen.css'
import './mayaobongro.css'
import './mayaochaybo.css'
import './mayaobongda.css'
import './mayaobongda-audience.css'
import { getAnalyticsSettings } from '../lib/analytics'
import { SITE_LOGO_PATH } from '../lib/seo'
import { getTenantContext } from '../lib/tenant'

const pickleballBodyFont = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
})

const pickleballDisplayFont = Barlow_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const tenantHeadingFont = Barlow_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const tenantBodyFont = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-base',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantContext()
  const ryno = tenant.slug === 'rynosport'
  const badminton = tenant.slug === 'mayaocaulong'
  const pickleball = tenant.slug === 'mayaopickleball'
  const volleyball = tenant.slug === 'mayaobongchuyen'
  const basketball = tenant.slug === 'mayaobongro'
  const running = tenant.slug === 'mayaochaybo'
  const football = tenant.slug === 'mayaobongda'
  const description = ryno
    ? 'Khám phá trang phục thể thao và dịch vụ đặt áo đội tại RynoSport.'
    : badminton || pickleball || volleyball || basketball || running || football
      ? tenant.description
    : tenant.description
  const tenantOgImage = {
    mayaocaulong: {
      url: '/images/mayaocaulong/og-share.webp',
      alt: 'Đội cầu lông mặc áo thi đấu đặt may MayaoCauLong',
    },
    mayaopickleball: {
      url: '/images/mayaopickleball/og-share.webp',
      alt: 'Đội pickleball mặc đồng phục đặt may MayaoPickleball',
    },
    mayaobongchuyen: {
      url: '/images/mayaobongchuyen/og-share.webp',
      alt: 'Đội bóng chuyền mặc đồng phục đặt may MayaoBongChuyen',
    },
    mayaobongro: {
      url: '/images/mayaobongro/og-share.webp',
      alt: 'Đội bóng rổ mặc đồng phục thiết kế riêng',
    },
    mayaochaybo: {
      url: '/images/mayaochaybo/og-share.webp',
      alt: 'Đội chạy bộ mặc áo thiết kế riêng',
    },
    mayaobongda: {
      url: '/images/mayaobongda/og-share.webp',
      alt: 'Mẫu áo bóng đá thiết kế riêng MayaoBongDa',
    },
  } as const
  const mayaoOgImage = tenant.slug in tenantOgImage ? tenantOgImage[tenant.slug as keyof typeof tenantOgImage] : null
  const ogImage = ryno
    ? '/images/rynosport/hero.png'
    : mayaoOgImage?.url || SITE_LOGO_PATH
  const title = badminton
    ? 'MayaoCauLong.vn - Áo cầu lông đặt may cho CLB'
    : pickleball
      ? 'MayaoPickleball.vn - Áo pickleball đặt may cho CLB'
      : volleyball
        ? 'MayaoBongChuyen.vn - Áo bóng chuyền đặt may'
        : basketball
          ? 'MayaoBongRo.vn - Áo bóng rổ thiết kế riêng'
          : running
            ? 'MayaoChayBo.vn - Áo chạy bộ thiết kế riêng'
            : football
              ? 'MayaoBongDa.vn - Áo bóng đá thiết kế riêng'
      : `${tenant.name}${ryno ? ' -' : ' —'} Trang phục thể thao`
  return {
    metadataBase: new URL(`https://${tenant.domain}`),
    title: badminton || pickleball || volleyball || basketball || running || football ? title : { default: title, template: `%s | ${tenant.name}` },
    description,
    alternates: { canonical: '/' },
    icons: {
      icon: [
        { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website', locale: 'vi_VN', siteName: tenant.name,
      title,
      description,
      images: [{ url: ogImage, width: ryno ? 864 : mayaoOgImage ? 1200 : 1200, height: ryno ? 1821 : mayaoOgImage ? 630 : 158, alt: mayaoOgImage?.alt || (ryno ? 'Trang phục thể thao RynoSport' : `Logo ${tenant.name}`) }],
    },
    twitter: { card: 'summary_large_image' },
    robots: process.env.SITE_ENV === 'preview' ? { index: false, follow: false } : undefined,
  }
}

function getMetaPixelId(analytics: Awaited<ReturnType<typeof getAnalyticsSettings>>) {
  const pixelId = analytics?.metaPixelEnabled && analytics.metaPixelId?.trim()
    ? analytics.metaPixelId.trim()
    : ''
  return /^\d{5,32}$/.test(pixelId) ? pixelId : null
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tenant = await getTenantContext()
  const analytics = await getAnalyticsSettings()
  const measurementId =
    analytics?.ga4Enabled && analytics.gaMeasurementId?.trim()
      ? analytics.gaMeasurementId.trim()
      : null
  const metaPixelId = getMetaPixelId(analytics)

  return <html className={`${pickleballBodyFont.variable} ${pickleballDisplayFont.variable} ${tenantHeadingFont.variable} ${tenantBodyFont.variable}`} lang="vi"><head><link rel="preconnect" href="https://static.x24sport.vn" crossOrigin="anonymous" /><link rel="preconnect" href="https://cdn.x24sport.vn" crossOrigin="anonymous" /></head><body className={`tenant-${tenant.slug}`}>{measurementId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" /><Script id="ga4-tag" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`}</Script></> : null}{metaPixelId ? <><Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(metaPixelId)}); fbq('track', 'PageView');`}</Script><noscript><img alt="" height="1" src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`} style={{ display: 'none' }} width="1" /></noscript></> : null}{children}</body></html>
}
