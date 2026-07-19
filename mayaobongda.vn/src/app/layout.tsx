import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SITE_NAME, SITE_URL } from '@/lib/site'

import './globals.css'

const display = Barlow_Condensed({ subsets: ['latin', 'vietnamese'], variable: '--font-heading', weight: ['500', '600', '700', '800'], display: 'swap' })
const body = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], variable: '--font-body-base', weight: ['400', '500', '600', '700'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'May Áo Bóng Đá Thiết Kế Trực Tiếp Tại Xưởng | X24 Sport', template: `%s | ${SITE_NAME}` },
  description: 'Mẫu áo bóng đá thiết kế và áo không logo cho đội bóng, câu lạc bộ, công ty và giải phong trào.',
  alternates: { canonical: '/' },
  icons: { icon: '/site-mark.svg' },
  openGraph: { locale: 'vi_VN', siteName: SITE_NAME, type: 'website' },
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
