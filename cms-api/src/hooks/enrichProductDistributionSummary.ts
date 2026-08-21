import type { CollectionAfterOperationHook } from 'payload'

type ProductRow = Record<string, unknown> & { id: number | string }

type DistributionRow = {
  sourceProduct?: number | string | { id?: number | string } | null
  sourceTenantLabel?: string | null
  targetProduct?: number | string | { id?: number | string } | null
  targetTenantLabel?: string | null
}

const relationID = (value: DistributionRow['sourceProduct']) =>
  typeof value === 'number' || typeof value === 'string' ? value : value?.id

const labelsFor = (labels: string[]) => [...new Set(labels.filter(Boolean))].join(' · ')

/**
 * The built-in Payload list query loads at depth 0 and does not request Join
 * fields. Supply compact virtual summaries with one query for the full page.
 */
export const enrichProductDistributionSummary: CollectionAfterOperationHook = async ({ operation, req, result }) => {
  if (operation !== 'find' && operation !== 'read') return result
  const requestURL = req.url || req.headers.get('referer') || ''
  const isAdminRequest = requestURL.includes('/admin')

  // Product REST reads are public. Distribution labels are only added to the
  // authenticated/admin rendering path, never to storefront API responses.
  if (!req.user && !isAdminRequest) return result

  const docs = result && typeof result === 'object' && 'docs' in result && Array.isArray(result.docs)
    ? (result.docs as ProductRow[])
    : []
  const productIDs = docs.map((doc) => doc.id).filter(Boolean)

  if (!productIDs.length) return result

  let distributions

  try {
    distributions = await req.payload.find({
      collection: 'catalog-distributions',
      depth: 0,
      limit: 0,
      // The shared admin list can render before Payload resolves a user for its
      // internal list operation. Its request URL is still the protected admin
      // surface, so keep the tenant relationship out of public REST responses
      // while allowing the admin table to render the ledger summary.
      overrideAccess: isAdminRequest,
      pagination: false,
      select: {
        sourceProduct: true,
        sourceTenantLabel: true,
        targetProduct: true,
        targetTenantLabel: true,
      },
      user: req.user,
      where: {
        or: [
          { sourceProduct: { in: productIDs } },
          { targetProduct: { in: productIDs } },
        ],
      },
    })
  } catch {
    // A summary must never make the catalog unavailable if a restricted user
    // has no visibility into catalog distributions.
    return result
  }

  const outbound = new Map<string, string[]>()
  const inbound = new Map<string, string[]>()

  for (const distribution of distributions.docs as DistributionRow[]) {
    const sourceID = relationID(distribution.sourceProduct)
    const targetID = relationID(distribution.targetProduct)

    if (sourceID !== undefined && distribution.targetTenantLabel) {
      outbound.set(String(sourceID), [...(outbound.get(String(sourceID)) || []), distribution.targetTenantLabel])
    }

    if (targetID !== undefined && distribution.sourceTenantLabel) {
      inbound.set(String(targetID), [...(inbound.get(String(targetID)) || []), distribution.sourceTenantLabel])
    }
  }

  for (const product of docs) {
    product.outboundDistributionSummary = labelsFor(outbound.get(String(product.id)) || [])
    product.inboundDistributionSummary = labelsFor(inbound.get(String(product.id)) || [])
  }

  return result
}
