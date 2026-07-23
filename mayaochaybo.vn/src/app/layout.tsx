import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'
import Script from 'next/script'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getAnalyticsSettings } from '@/lib/cms'
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/site'

import './globals.css'

const display = Barlow_Condensed({ subsets: ['latin', 'vietnamese'], variable: '--font-heading', weight: ['500', '600', '700', '800'], display: 'swap' })
const body = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], variable: '--font-body-base', weight: ['400', '500', '600', '700'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'May Áo Chạy Bộ Thiết Kế Riêng | X24 Sport', template: '%s | May Áo Chạy Bộ' },
  description: 'Mẫu áo chạy bộ và dịch vụ đặt may thiết kế riêng cho câu lạc bộ, giải chạy, đội nhóm và doanh nghiệp.',
  alternates: { canonical: '/' },
  icons: { icon: '/site-mark.svg' },
  verification: { google: 'fnhKiL9Rctw1zJnJ1zCk8LW29qner565-foaFXo2Vug' },
  openGraph: { images: [DEFAULT_OG_IMAGE], locale: 'vi_VN', siteName: 'May Áo Chạy Bộ', type: 'website' },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE.url] },
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

  return (
    <html className={`${display.variable} ${body.variable}`} lang="vi">
      <body>
        {measurementId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
            <Script id="ga4-tag" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`}
            </Script>
          </>
        ) : null}
        {metaPixelId ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', ${JSON.stringify(metaPixelId)}); fbq('track', 'PageView');`}
            </Script>
            <noscript><img alt="" height="1" src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`} style={{ display: 'none' }} width="1" /></noscript>
          </>
        ) : null}
        <a className="skip-link" href="#main">Bỏ qua đến nội dung</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
