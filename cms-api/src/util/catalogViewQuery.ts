import type { Where } from 'payload'

type KeyRow = { key?: string | null }

export type CatalogViewFilters = {
  audienceKeys?: KeyRow[] | null
  categoryKeys?: KeyRow[] | null
  colorKeys?: KeyRow[] | null
  productTypeKeys?: KeyRow[] | null
  searchTagKeys?: KeyRow[] | null
  sportKey?: string | null
}

const uniqueKeys = (rows?: KeyRow[] | null) =>
  Array.from(
    new Set(
      (rows || [])
        .map((row) => row.key?.trim())
        .filter((key): key is string => Boolean(key)),
    ),
  )

const exactConditions = (path: string, keys: string[], matchMode: 'all' | 'any'): Where[] => {
  if (!keys.length) return []
  if (matchMode === 'any') return [{ [path]: { in: keys } }]
  return keys.map((key) => ({ [path]: { equals: key } }))
}

export const buildCatalogViewProductWhere = ({
  filters,
  matchMode = 'all',
}: {
  filters?: CatalogViewFilters | null
  matchMode?: 'all' | 'any'
}): Where => {
  if (!filters) return {}

  const tagKeys = uniqueKeys([
    ...(filters.searchTagKeys || []),
    ...(filters.productTypeKeys || []),
    ...(filters.audienceKeys || []),
    ...(filters.colorKeys || []),
    ...(filters.sportKey ? [{ key: filters.sportKey }] : []),
  ])
  const conditions = [
    ...exactConditions('categories.taxonomy.key', uniqueKeys(filters.categoryKeys), matchMode),
    ...exactConditions('searchTags.key', tagKeys, matchMode),
  ]

  if (!conditions.length) return {}
  return matchMode === 'any' ? { or: conditions } : { and: conditions }
}
