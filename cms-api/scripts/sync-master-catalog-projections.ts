import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import {
  syncMasterCatalogProjections,
  type ProjectionPayload,
} from '../src/services/masterCatalogProjection'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
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
    targetSlugs: targetSlugs.length ? targetSlugs : undefined,
  })
  console.log(JSON.stringify(summary, null, 2))
  if (summary.blocked > 0) process.exitCode = 1
}

run().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exitCode = 1
})
