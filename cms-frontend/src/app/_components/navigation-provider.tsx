'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { NavigationNode, NavigationState } from '../../lib/navigation'

const fallbackState: NavigationState = {
  cmsNodes: [],
  mode: 'legacy',
  ready: false,
  tenantSlug: '',
}

const NavigationContext = createContext<NavigationState>(fallbackState)

export function NavigationProvider({ children, state }: { children: ReactNode; state: NavigationState }) {
  return <NavigationContext.Provider value={state}>{children}</NavigationContext.Provider>
}

export function useTenantNavigation() {
  return useContext(NavigationContext)
}

export function useActiveNavigation(fallback: NavigationNode[]) {
  const state = useTenantNavigation()
  return state.mode === 'cms' && state.ready ? state.cmsNodes : fallback
}
