import { sendDailyGa4TrafficReport } from '../src/analytics/dailyReport'

function readArg(flag: string) {
  const index = process.argv.findIndex((item) => item === flag)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

async function main() {
  const date = readArg('--date')
  const dryRun = process.argv.includes('--dry-run')
  const result = await sendDailyGa4TrafficReport({ date, dryRun })

  console.log(result.message)
  console.log(`\nReported tenants: ${result.reports.length}`)
  console.log(`Mode: ${result.dryRun ? 'dry-run' : 'telegram'}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
