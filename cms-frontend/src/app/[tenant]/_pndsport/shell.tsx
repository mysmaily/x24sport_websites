import type { ReactNode } from 'react'

import { getCategories } from '../../../lib/content'
import { SiteShell } from '../../pndsport-preview/components'

export async function PndShell({ children }: { children: ReactNode }) {
  const categories = await getCategories()
  return <SiteShell
    base=""
    imageLogo
    navigationCategories={categories}
    showDraftNotice={false}
    showMobileBar={false}
  >{children}</SiteShell>
}
