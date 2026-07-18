type RelationValue = number | string | { id?: number | string } | null | undefined

export const relationID = (value: RelationValue): number | string | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object') return value.id
  return undefined
}

const clean = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const buildTenantIdentity = ({
  data,
  originalDoc,
}: {
  data?: Record<string, unknown> | null
  originalDoc?: Record<string, unknown> | null
}) => {
  const tenant = relationID((data?.tenant ?? originalDoc?.tenant) as RelationValue)
  const slug = clean(data?.slug ?? originalDoc?.slug)
  const sourceSystem = clean(data?.sourceSystem ?? originalDoc?.sourceSystem)
  const sourceId = clean(data?.sourceId ?? originalDoc?.sourceId)
  const legacyPath = clean(data?.legacyPath ?? originalDoc?.legacyPath)

  if (!tenant) return {}

  const prefix = String(tenant)
  return {
    ...(slug ? { tenantSlugKey: `${prefix}:${slug}` } : {}),
    ...(sourceSystem && sourceId
      ? { tenantSourceKey: `${prefix}:${sourceSystem}:${sourceId}` }
      : {}),
    ...(legacyPath ? { tenantLegacyPathKey: `${prefix}:${legacyPath}` } : {}),
  }
}
