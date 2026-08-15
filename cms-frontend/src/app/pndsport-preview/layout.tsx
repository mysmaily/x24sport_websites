import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiteShell } from './components'

export const metadata: Metadata = {
  title: { default: 'PND Sport Việt Nam — Bản thiết kế', template: '%s | PND Sport Việt Nam' },
  description: 'Bản thiết kế giao diện PND Sport Việt Nam.',
  robots: { index: false, follow: false },
}

export default function PndPreviewLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}

