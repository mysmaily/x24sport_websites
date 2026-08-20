#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const apply = process.argv.includes('--apply')
const inputArg = process.argv.find((arg) => arg.startsWith('--input='))
const statusArg = process.argv.find((arg) => arg.startsWith('--status='))
const inputPath = inputArg
  ? inputArg.slice('--input='.length)
  : 'mayaodongphuc.com.vn/content-strategy/batch-01-web-content.json'
const statusOverride = statusArg?.slice('--status='.length)

const cmsUrl = (process.env.CMS_API_URL || 'https://cms.x24sport.vn').replace(/\/$/, '')
const tenantSlug = process.env.TENANT_SLUG || 'mayaodongphuc'
const apiKey = process.env.PAYLOAD_API_KEY
const authCollection = process.env.PAYLOAD_AUTH_COLLECTION || 'users'

if (!apiKey) {
  console.error('Missing PAYLOAD_API_KEY. Source the tenant REST env before running this script.')
  process.exit(1)
}

const headers = {
  Authorization: `${authCollection} API-Key ${apiKey}`,
  'Content-Type': 'application/json',
}

async function api(pathname, init = {}) {
  const response = await fetch(`${cmsUrl}${pathname}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${init.method || 'GET'} ${pathname} returned ${response.status}: ${body}`)
  }
  return response.json()
}

function query(params) {
  return new URLSearchParams(params).toString()
}

async function resolveTenant() {
  const params = query({
    'where[slug][equals]': tenantSlug,
    limit: '1',
    depth: '0',
  })
  const result = await api(`/api/tenants?${params}`)
  const tenant = result.docs?.[0]
  if (!tenant) throw new Error(`Tenant "${tenantSlug}" was not found.`)
  return tenant
}

async function findExisting(doc) {
  const params = query({
    'where[tenant.slug][equals]': tenantSlug,
    'where[sourceId][equals]': doc.sourceId,
    limit: '1',
    depth: '0',
  })
  const bySource = await api(`/api/web-content?${params}`)
  if (bySource.docs?.[0]) return bySource.docs[0]

  const slugParams = query({
    'where[tenant.slug][equals]': tenantSlug,
    'where[slug][equals]': doc.slug,
    limit: '1',
    depth: '0',
  })
  const bySlug = await api(`/api/web-content?${slugParams}`)
  return bySlug.docs?.[0]
}

function toPayload(doc, tenantId) {
  return {
    tenant: tenantId,
    title: doc.title,
    slug: doc.slug,
    kind: 'post',
    legacyPath: doc.legacyPath,
    contentHtml: doc.contentHtml,
    excerpt: doc.excerpt,
    publicationStatus: statusOverride || doc.publicationStatus || 'draft',
    sourceSystem: doc.sourceSystem,
    sourceId: doc.sourceId,
    sourceModifiedAt: doc.sourceModifiedAt,
  }
}

const absoluteInput = path.resolve(inputPath)
const docs = JSON.parse(await fs.readFile(absoluteInput, 'utf8'))
const tenant = await resolveTenant()
const summary = []

for (const doc of docs) {
  const existing = await findExisting(doc)
  const payload = toPayload(doc, tenant.id)
  const action = existing ? 'update' : 'create'
  summary.push({ action, slug: doc.slug, id: existing?.id || null, status: payload.publicationStatus })

  if (!apply) continue

  if (existing) {
    await api(`/api/web-content/${existing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  } else {
    await api('/api/web-content', { method: 'POST', body: JSON.stringify(payload) })
  }
}

console.log(JSON.stringify({ apply, tenant: tenantSlug, input: absoluteInput, docs: summary }, null, 2))
