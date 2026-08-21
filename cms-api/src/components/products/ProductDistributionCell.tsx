'use client'

import type { DefaultCellComponentProps } from 'payload'

import styles from './ProductDistributionCell.module.scss'

type Relation = number | string | { id?: number | string; name?: string; slug?: string }
type Distribution = {
  sourceTenant?: Relation
  sourceTenantLabel?: string
  status?: string
  targetTenant?: Relation
  targetTenantLabel?: string
}

const labels: Record<string, string> = {
  blocked: 'Bị chặn',
  draft_created: 'Bản nháp',
  needs_review: 'Chờ duyệt',
  published: 'Đã đăng',
  ready: 'Sẵn sàng',
}

const distributionDocs = (value: unknown): Distribution[] => {
  if (!value || typeof value !== 'object' || !('docs' in value)) return []
  const docs = (value as { docs?: unknown }).docs
  return Array.isArray(docs) ? docs.filter((doc): doc is Distribution => Boolean(doc) && typeof doc === 'object') : []
}

const tenantName = (tenant: Relation | undefined) => {
  if (tenant && typeof tenant === 'object') return tenant.name || tenant.slug || 'Website khác'
  return tenant ? `Website #${tenant}` : 'Website khác'
}

function DistributionCell({ cellData, direction }: DefaultCellComponentProps & { direction: 'inbound' | 'outbound' }) {
  const distributions = distributionDocs(cellData)

  if (!distributions.length) return <span className={styles.empty}>—</span>

  return (
    <div className={styles.cell}>
      {distributions.map((distribution, index) => {
        const status = distribution.status || 'ready'
        const tenant = direction === 'outbound' ? distribution.targetTenant : distribution.sourceTenant
        const label = direction === 'outbound' ? distribution.targetTenantLabel : distribution.sourceTenantLabel
        const stateClass = status === 'draft_created' ? styles.draft : status === 'needs_review' ? styles.review : status === 'blocked' ? styles.blocked : ''
        return (
          <span className={`${styles.item} ${stateClass}`} key={`${label || tenantName(tenant)}-${status}-${index}`} title={labels[status] || status}>
            <span className={styles.name}>{label || tenantName(tenant)} · {labels[status] || status}</span>
          </span>
        )
      })}
    </div>
  )
}

export function ProductOutboundDistributionCell(props: DefaultCellComponentProps) {
  return <DistributionCell {...props} direction="outbound" />
}

export function ProductInboundDistributionCell(props: DefaultCellComponentProps) {
  return <DistributionCell {...props} direction="inbound" />
}

export function ProductDistributionSummaryCell({ cellData }: DefaultCellComponentProps) {
  const summary = typeof cellData === 'string' ? cellData.trim() : ''
  return summary ? <span className={styles.summary}>{summary}</span> : <span className={styles.empty}>—</span>
}
