import type { Metadata } from 'next'
import { Barlow_Condensed, Be_Vietnam_Pro } from 'next/font/google'
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
  title: 'MayaoCauLong.vn - Áo cầu lông đặt may cho CLB',
  description: 'Đồng phục cầu lông đặt may, in tên số, logo và thiết kế theo màu đội cho CLB, trường lớp, doanh nghiệp.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${bodyFont.variable} ${displayFont.variable}`} data-scroll-behavior="smooth" lang="vi">
      <body>{children}</body>
    </html>
  )
}
