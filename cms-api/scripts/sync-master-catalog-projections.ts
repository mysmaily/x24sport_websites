import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import {
  syncMasterCatalogProjections,
  type ProjectionPayload,
} from '../src/services/masterCatalogProjection'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const retryBlocked = args.includes('--retry-blocked')
const targetSlugs = args
  .filter((arg) => arg.startsWith('--target='))
  .map((arg) => arg.slice('--target='.length))
  .filter(Boolean)
const distributionIDs = args
  .filter((arg) => arg.startsWith('--distribution-id='))
  .map((arg) => arg.slice('--distribution-id='.length))
  .filter(Boolean)

async function run() {
  const payload = await getPayload({ config })
  const summary = await syncMasterCatalogProjections({
    apply,
    distributionIDs: distributionIDs.length ? distributionIDs : undefined,
    payload: payload as unknown as ProjectionPayload,
    retryBlocked,
    targetSlugs: targetSlugs.length ? targetSlugs : undefined,
  })
  console.log(JSON.stringify(summary, null, 2))
  return summary.blocked > 0 ? 1 : 0
}

run().then((exitCode) => process.exit(exitCode)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
