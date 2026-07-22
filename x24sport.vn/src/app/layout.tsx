import type { Metadata } from 'next'
import Script from 'next/script'
import './styles.css'
import { getAnalyticsSettings } from '../lib/analytics'
import { SITE_LOGO_PATH } from '../lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://x24sport.vn'),
  title: { default: 'X24Sport — Xưởng may đồ thể thao', template: '%s | X24Sport' },
  description: 'Khám phá trang phục bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website', locale: 'vi_VN', siteName: 'X24Sport',
    title: 'X24Sport — Trang phục cho mọi chuyển động',
    description: 'Trang phục thể thao thiết kế theo yêu cầu cho đội, câu lạc bộ và cộng đồng vận động.',
    images: [{ url: SITE_LOGO_PATH, width: 1200, height: 158, alt: 'Logo X24Sport' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: process.env.SITE_ENV === 'preview' ? { index: false, follow: false } : undefined,
}

function getMetaPixelId(analytics: Awaited<ReturnType<typeof getAnalyticsSettings>>) {
  const pixelId = analytics?.metaPixelEnabled && analytics.metaPixelId?.trim()
    ? analytics.metaPixelId.trim()
    : ''
  return /^\d{5,32}$/.test(pixelId) ? pixelId : null
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const analytics = await getAnalyticsSettings()
  const measurementId =
    analytics?.ga4Enabled && analytics.gaMeasurementId?.trim()
      ? analytics.gaMeasurementId.trim()
      : null
  const metaPixelId = getMetaPixelId(analytics)

  return <html lang="vi"><head><link rel="preconnect" href="https://static.x24sport.vn" crossOrigin="anonymous" /><link rel="preconnect" href="https://cdn.x24sport.vn" crossOrigin="anonymous" /></head><body>{measurementId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" /><Script id="ga4-tag" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`}</Script></> : null}{metaPixelId ? <><Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(metaPixelId)}); fbq('track', 'PageView');`}</Script><noscript><img alt="" height="1" src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`} style={{ display: 'none' }} width="1" /></noscript></> : null}{children}</body></html>
}
