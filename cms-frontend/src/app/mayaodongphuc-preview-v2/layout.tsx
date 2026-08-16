import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Noto_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

import { V2Shell } from './components'
import './preview-global.css'

const heading = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['500', '600', '700', '800'], variable: '--v2-heading', display: 'swap' })
const body = Noto_Sans({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'], variable: '--v2-body', display: 'swap' })

export const metadata: Metadata = {
  title: { absolute: 'May Áo Đồng Phục V2 — Uniform OS' },
  description: 'Bản thiết kế V2 cho mayaodongphuc.com.vn.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <div className={`mdp-v2-root ${heading.variable} ${body.variable}`}><V2Shell>{children}</V2Shell></div>
}
