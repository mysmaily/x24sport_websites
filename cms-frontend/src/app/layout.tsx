import type { Metadata } from 'next'
import Script from 'next/script'
import './styles.css'
import './mayaocaulong.css'
import { getAnalyticsSettings } from '../lib/analytics'
import { SITE_LOGO_PATH } from '../lib/seo'
import { getTenantContext } from '../lib/tenant'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantContext()
  const ryno = tenant.slug === 'rynosport'
  const badminton = tenant.slug === 'mayaocaulong'
  const description = ryno
    ? 'Khám phá trang phục thể thao và dịch vụ đặt áo đội tại RynoSport.'
    : badminton
      ? tenant.description
    : tenant.description
  const ogImage = ryno ? '/images/rynosport/hero.png' : badminton ? '/images/mayaocaulong/badminton-team-hero.png?v=20260728b' : SITE_LOGO_PATH
  const title = badminton ? 'MayaoCauLong.vn - Áo cầu lông đặt may cho CLB' : `${tenant.name}${ryno ? ' -' : ' —'} Trang phục thể thao`
  return {
    metadataBase: new URL(`https://${tenant.domain}`),
    title: badminton ? title : { default: title, template: `%s | ${tenant.name}` },
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
      images: [{ url: ogImage, width: ryno ? 864 : badminton ? 1672 : 1200, height: ryno ? 1821 : badminton ? 941 : 158, alt: badminton ? 'Đội cầu lông mặc áo thi đấu đặt may MayaoCauLong' : ryno ? 'Trang phục thể thao RynoSport' : `Logo ${tenant.name}` }],
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

  return <html lang="vi"><head><link rel="preconnect" href="https://static.x24sport.vn" crossOrigin="anonymous" /><link rel="preconnect" href="https://cdn.x24sport.vn" crossOrigin="anonymous" /></head><body className={`tenant-${tenant.slug}`}>{measurementId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" /><Script id="ga4-tag" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`}</Script></> : null}{metaPixelId ? <><Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(metaPixelId)}); fbq('track', 'PageView');`}</Script><noscript><img alt="" height="1" src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`} style={{ display: 'none' }} width="1" /></noscript></> : null}{children}</body></html>
}
