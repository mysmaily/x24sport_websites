import type { Metadata } from 'next'
import Script from 'next/script'

import { getAnalyticsSettings } from '../lib/content'
import './styles.css'

export const metadata: Metadata = {
  title: 'May Ao Bong Chuyen',
  description: 'Dong phuc bong chuyen dat may cho cau lac bo va doi thi dau.',
}

function getMetaPixelId(analytics: Awaited<ReturnType<typeof getAnalyticsSettings>>) {
  const pixelId = analytics?.metaPixelEnabled && analytics.metaPixelId?.trim()
    ? analytics.metaPixelId.trim()
    : ''
  return /^\d{5,32}$/.test(pixelId) ? pixelId : null
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const analytics = await getAnalyticsSettings()
  const measurementId =
    analytics?.ga4Enabled && analytics.gaMeasurementId?.trim()
      ? analytics.gaMeasurementId.trim()
      : null
  const metaPixelId = getMetaPixelId(analytics)

  return (
    <html lang="vi">
      <body>
        {measurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
              strategy="afterInteractive"
            />
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
        {children}
      </body>
    </html>
  )
}
