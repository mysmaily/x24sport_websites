import type { Metadata } from 'next'
import './styles.css'
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><head><link rel="preconnect" href="https://static.x24sport.vn" crossOrigin="anonymous" /><link rel="preconnect" href="https://cdn.x24sport.vn" crossOrigin="anonymous" /></head><body>{children}</body></html>
}
