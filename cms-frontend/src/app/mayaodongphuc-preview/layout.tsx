import type { Metadata } from 'next'
import { Afacad, Bricolage_Grotesque, IBM_Plex_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { PreviewShell } from './components'
import './preview-global.css'

const bodyFont = Afacad({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--mdp-font-body',
  display: 'swap',
})

const displayFont = Bricolage_Grotesque({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700', '800'],
  variable: '--mdp-font-display',
  display: 'swap',
})

const monoFont = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--mdp-font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { absolute: 'May Áo Đồng Phục — Bản thiết kế' },
  description: 'Bản thiết kế giao diện cho mayaodongphuc.com.vn.',
  robots: { index: false, follow: false },
}

export default function MayAoDongPhucPreviewLayout({ children }: { children: ReactNode }) {
  return <div className={`mdp-preview-root ${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}><PreviewShell>{children}</PreviewShell></div>
}
