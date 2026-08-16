import type { ReactNode } from 'react'

import { getCategoryNavigation } from '../../../lib/content'
import { SiteShell } from '../../pndsport-preview/components'

export async function PndShell({ children }: { children: ReactNode }) {
  const categories = await getCategoryNavigation()
  return <SiteShell
    base=""
    imageLogo
    navigationCategories={categories}
    showDraftNotice={false}
    showMobileBar={false}
  >{children}</SiteShell>
}
