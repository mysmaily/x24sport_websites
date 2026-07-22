import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'
import Script from 'next/script'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getAnalyticsSettings } from '@/lib/cms'
import { SITE_URL } from '@/lib/site'

import './globals.css'

const display = Barlow_Condensed({ subsets: ['latin', 'vietnamese'], variable: '--font-heading', weight: ['500', '600', '700', '800'], display: 'swap' })
const body = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], variable: '--font-body-base', weight: ['400', '500', '600', '700'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'May Áo Bóng Rổ Thiết Kế Riêng | X24 Sport', template: '%s | May Áo Bóng Rổ' },
  description: 'Mẫu đồng phục bóng rổ và dịch vụ đặt may thiết kế riêng cho đội, câu lạc bộ và trường học.',
  alternates: { canonical: '/' },
  openGraph: { locale: 'vi_VN', siteName: 'May Áo Bóng Rổ', type: 'website' },
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
