import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://x24sport.vn'),
  title: { default: 'X24Sport — Trang phục cho mọi chuyển động', template: '%s | X24Sport' },
  description: 'Khám phá trang phục bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.',
  robots: process.env.SITE_ENV === 'preview' ? { index: false, follow: false } : undefined,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>
}
