import { Cron } from 'croner'

import { getLocalReportDate, sendDailyGa4TrafficReport } from '../src/analytics/dailyReport'
import { getGa4Timezone } from '../src/analytics/ga4'
import { cleanupProductViewDetails } from '../src/analytics/productViews'
import configPromise from '../src/payload.config'
import { getPayload } from 'payload'

async function runOnce() {
  const result = await sendDailyGa4TrafficReport()
  const payload = await getPayload({ config: configPromise })
  const retentionDays = Number.parseInt(process.env.PRODUCT_VIEW_RETENTION_DAYS || '90', 10)
  await cleanupProductViewDetails({ payload, retentionDays })
  console.log(`[ga4-report] Sent report for ${result.date} with ${result.reports.length} tenants.`)
}

async function main() {
  const cronPattern = process.env.GA4_REPORT_CRON || '0 23 * * *'
  const timezone = getGa4Timezone()

  if (process.env.GA4_REPORT_RUN_ON_STARTUP === 'true') {
    await runOnce()
  }

  const job = new Cron(
    cronPattern,
    {
      timezone,
    },
    async () => {
      try {
        await runOnce()
      } catch (error) {
        console.error('[ga4-report] Failed to send scheduled report.', error)
      }
    },
  )

  console.log(
    `[ga4-report] Scheduler is running. Next report date basis: ${getLocalReportDate()}. Timezone: ${timezone}. Pattern: ${cronPattern}. Next run: ${job.nextRun()?.toISOString() ?? 'unknown'}`,
  )
}

main().catch((error) => {
  console.error('[ga4-report] Scheduler failed to start.', error)
  process.exitCode = 1
})
