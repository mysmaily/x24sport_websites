import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import type { ReactNode } from 'react'

import { V3Shell } from './components'
import './preview-global.css'

const display = Instrument_Serif({ subsets: ['latin'], weight: '400', variable: '--v3-display', display: 'swap' })
const body = Geist({ subsets: ['latin'], variable: '--v3-body', display: 'swap' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--v3-mono', display: 'swap' })

export const metadata: Metadata = { title: { absolute: 'May Áo Đồng Phục V3 — Belonging Studio' }, description: 'Bản thiết kế V3 cho mayaodongphuc.com.vn.', robots: { index: false, follow: false } }

export default function Layout({ children }: { children: ReactNode }) {
  return <div className={`mdp-v3-root ${display.variable} ${body.variable} ${mono.variable}`}><V3Shell>{children}</V3Shell></div>
}
