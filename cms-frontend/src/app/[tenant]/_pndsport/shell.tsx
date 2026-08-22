import type { ReactNode } from 'react'

import { getCategoryNavigation } from '../../../lib/content'
import { getTenantNavigationState } from '../../../lib/navigation'
import { SiteShell } from '../../pndsport-preview/components'

const legacyCategorySlug = (href: string, key: string) => {
  const slug = href.split('/').filter(Boolean).at(-1) || key
  return ({ gaming: 'ao-gaming', 'bi-a': 'ao-bi-a' } as Record<string, string>)[slug] || slug
}

export async function PndShell({ children }: { children: ReactNode }) {
  const [legacyCategories, navigationState] = await Promise.all([
    getCategoryNavigation(),
    getTenantNavigationState(),
  ])
  const categories = navigationState.mode === 'cms' && navigationState.ready
    ? navigationState.cmsNodes.filter((item) => item.kind === 'category' && item.href).map((item) => ({
        children: item.children.filter((child) => child.href).map((child) => ({
          name: child.label,
          slug: legacyCategorySlug(child.href!, child.key),
        })),
        name: item.label,
        slug: legacyCategorySlug(item.href!, item.key),
      }))
    : legacyCategories
  return <SiteShell
    base=""
    imageLogo
    navigationCategories={categories}
    showDraftNotice={false}
    showMobileBar={false}
  >{children}</SiteShell>
}
