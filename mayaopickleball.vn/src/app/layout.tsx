import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'
import Script from 'next/script'

import { getAnalyticsSettings } from '../lib/content'
import './styles.css'

const bodyFont = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
})

const displayFont = Barlow_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MayaoPickleball.vn - Áo pickleball đặt may cho CLB',
  description: 'Đồng phục pickleball đặt may, in tên số, logo và thiết kế theo màu đội cho CLB, trường lớp, doanh nghiệp.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const analytics = await getAnalyticsSettings()
  const measurementId =
    analytics?.ga4Enabled && analytics.gaMeasurementId?.trim()
      ? analytics.gaMeasurementId.trim()
      : null

  return (
    <html className={`${bodyFont.variable} ${displayFont.variable}`} data-scroll-behavior="smooth" lang="vi">
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
