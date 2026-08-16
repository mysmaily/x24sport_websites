import type { ReactNode } from 'react'

import { hasProductInterestForm } from '../../../lib/content'
import { UniformShell } from './components'
import { getUniformCategories } from './lib'

export async function MayAoDongPhucShell({ children }: { children: ReactNode }) {
  const [categories, consultationEnabled] = await Promise.all([getUniformCategories(), hasProductInterestForm()])
  return <UniformShell categories={categories} consultationEnabled={consultationEnabled}>{children}</UniformShell>
}
