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
  title: { default: 'May Áo Chạy Bộ Thiết Kế Riêng | X24 Sport', template: '%s | May Áo Chạy Bộ' },
  description: 'Mẫu áo chạy bộ và dịch vụ đặt may thiết kế riêng cho câu lạc bộ, giải chạy, đội nhóm và doanh nghiệp.',
  alternates: { canonical: '/' },
  icons: { icon: '/site-mark.svg' },
  verification: { google: 'fnhKiL9Rctw1zJnJ1zCk8LW29qner565-foaFXo2Vug' },
  openGraph: { locale: 'vi_VN', siteName: 'May Áo Chạy Bộ', type: 'website' },
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
