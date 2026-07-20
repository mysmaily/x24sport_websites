import type { Metadata } from 'next'
import Script from 'next/script'

import { getAnalyticsSettings } from '../lib/content'
import './styles.css'

export const metadata: Metadata = {
  title: 'May Ao Bong Chuyen',
  description: 'Dong phuc bong chuyen dat may cho cau lac bo va doi thi dau.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const analytics = await getAnalyticsSettings()
  const measurementId =
    analytics?.ga4Enabled && analytics.gaMeasurementId?.trim()
      ? analytics.gaMeasurementId.trim()
      : null

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
        {children}
      </body>
    </html>
  )
}
