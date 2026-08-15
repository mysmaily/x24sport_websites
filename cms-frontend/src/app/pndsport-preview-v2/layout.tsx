import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { SiteShell } from '../pndsport-preview/components'

const base = '/pndsport-preview-v2'

export const metadata: Metadata = {
  title: { absolute: 'PND Sport Việt Nam V2' },
  description: 'Phương án giao diện V2 dùng frontend-design.',
  robots: { index: false, follow: false },
}

export default function PndPreviewV2Layout({ children }: { children: ReactNode }) {
  return <SiteShell base={base} variant="v2">{children}</SiteShell>
}
