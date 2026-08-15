import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiteShell } from '../pndsport-preview/components'

const base = '/pndsport-preview-v3'

export const metadata: Metadata = {
  title: { absolute: 'PND Sport Việt Nam V3' },
  description: 'Phương án giao diện V3 dùng design-taste-frontend.',
  robots: { index: false, follow: false },
}

export default function PndPreviewV3Layout({ children }: { children: ReactNode }) {
  return <SiteShell base={base} variant="v3">{children}</SiteShell>
}
