import { relationID } from './tenantIdentity'

type DocumentData = Record<string, unknown> | null | undefined

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const stableKeyPattern = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/

export const isStableKey = (value: unknown) => stableKeyPattern.test(clean(value))

export const isInternalCatalogPath = (value: unknown) => {
  const path = clean(value)
  return /^\/(?:[a-z0-9][a-z0-9-]*\/)*$/.test(path)
}

export const isAllowedNavigationURL = (value: unknown) => {
  const url = clean(value)
  if (!url) return false
  if (url.startsWith('/') && !url.startsWith('//')) return true
  if (url.startsWith('#')) return true

  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export const buildTenantCompositeIdentity = ({
  data,
  originalDoc,
  outputField,
  parts,
}: {
  data?: DocumentData
  originalDoc?: DocumentData
  outputField: string
  parts: string[]
}) => {
  const tenant = relationID((data?.tenant ?? originalDoc?.tenant) as Parameters<typeof relationID>[0])
  const values = parts.map((field) => {
    const value = data?.[field] ?? originalDoc?.[field]
    return relationID(value as Parameters<typeof relationID>[0]) ?? clean(value)
  })

  if (!tenant || values.some((value) => value === undefined || value === '')) return {}

  return {
    [outputField]: [tenant, ...values].map(String).join(':'),
  }
}

export const sameRelation = (left: unknown, right: unknown) => {
  const leftID = relationID(left as Parameters<typeof relationID>[0])
  const rightID = relationID(right as Parameters<typeof relationID>[0])
  return leftID !== undefined && rightID !== undefined && String(leftID) === String(rightID)
}
