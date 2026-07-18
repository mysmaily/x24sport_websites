import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${display.variable} ${body.variable}`} lang="vi">
      <body>
        <a className="skip-link" href="#main">Bỏ qua đến nội dung</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
