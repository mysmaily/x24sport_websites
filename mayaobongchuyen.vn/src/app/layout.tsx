import type { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  title: 'May Ao Bong Chuyen',
  description: 'Dong phuc bong chuyen dat may cho cau lac bo va doi thi dau.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
