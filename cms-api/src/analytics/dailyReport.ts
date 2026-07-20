import configPromise from '../payload.config'
import { getPayload } from 'payload'

import { fetchGa4SessionsForDate, getGa4Timezone } from './ga4'
import { sendTelegramMessage } from './telegram'

type TenantRelation = {
  id?: number | string
  slug?: string | null
  domains?: Array<{ domain?: string | null }> | null
}

type AnalyticsSettings = {
  ga4Enabled?: boolean | null
  gaMeasurementId?: string | null
  gaPropertyId?: string | null
  dailyTelegramReportEnabled?: boolean | null
}

type StoreSettingsDoc = {
  siteName?: string | null
  tenant?: number | string | TenantRelation | null
  analytics?: AnalyticsSettings | null
}

type TenantTrafficReport = {
  domain: string
  sessions: number
}

function formatDateDisplay(date: string) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function getLocalReportDate(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: getGa4Timezone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.format(now)
}

function formatDomain(settings: StoreSettingsDoc) {
  const tenant =
    typeof settings.tenant === 'object' && settings.tenant
      ? settings.tenant
      : undefined
  const firstDomain = tenant?.domains?.find((item) => item?.domain)?.domain?.trim()
  if (firstDomain) return firstDomain
  if (tenant?.slug) return tenant.slug
  return settings.siteName?.trim() || 'tenant-khong-xac-dinh'
}

export async function getDailyGa4TrafficReport(date: string): Promise<TenantTrafficReport[]> {
  const payload = await getPayload({ config: configPromise })
  const settingsResult = await payload.find({
    collection: 'store-settings',
    depth: 1,
    limit: 100,
  })

  const reports = await Promise.all(
    settingsResult.docs.map(async (settings) => {
      const typedSettings = settings as StoreSettingsDoc
      if (!typedSettings.analytics?.dailyTelegramReportEnabled) {
        return null
      }

      const propertyId = typedSettings.analytics?.gaPropertyId?.trim()

      if (!propertyId) {
        return null
      }

      const sessions = await fetchGa4SessionsForDate({
        propertyId,
        date,
      })

      return {
        domain: formatDomain(typedSettings),
        sessions,
      } satisfies TenantTrafficReport
    }),
  )

  return reports.filter((item): item is TenantTrafficReport => Boolean(item))
}

export function buildDailyGa4ReportMessage({
  date,
  reports,
}: {
  date: string
  reports: TenantTrafficReport[]
}) {
  const lines = [formatDateDisplay(date)]

  if (!reports.length) {
    lines.push('Chưa có tenant nào bật báo cáo GA4 hằng ngày.')
    return lines.join('\n')
  }

  for (const report of reports.sort((left, right) => left.domain.localeCompare(right.domain, 'vi'))) {
    lines.push(`${report.domain} có ${report.sessions} lượt truy cập`)
  }

  return lines.join('\n')
}

export async function sendDailyGa4TrafficReport({
  date = getLocalReportDate(),
  dryRun = false,
}: {
  date?: string
  dryRun?: boolean
} = {}) {
  const reports = await getDailyGa4TrafficReport(date)
  const message = buildDailyGa4ReportMessage({ date, reports })

  if (!dryRun) {
    await sendTelegramMessage(message)
  }

  return {
    date,
    dryRun,
    message,
    reports,
  }
}
