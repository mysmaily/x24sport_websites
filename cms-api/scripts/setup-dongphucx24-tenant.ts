import 'dotenv/config'

import { randomBytes } from 'node:crypto'
import { chmod, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { getPayload } from 'payload'

type Doc = Record<string, any>

const TARGET_SLUG = 'dongphucx24'
const SERVICE_EMAIL = 'dongphucx24-rest@internal.invalid'
const args = new Set(process.argv.slice(2))
const apply = args.has('--apply') || process.env.APPLY === '1'
const secretFile = process.argv.find((arg) => arg.startsWith('--secret-file='))?.slice('--secret-file='.length)
  || process.env.SECRET_FILE

async function allDocs(payload: any, collection: string, where: Doc) {
  const result = await payload.find({ collection, where, depth: 0, limit: 100, overrideAccess: true })
  return result.docs as Doc[]
}

async function run() {
  if (apply && !secretFile) throw new Error('Apply mode requires SECRET_FILE or --secret-file=<absolute path>.')

  const configPath = pathToFileURL(path.resolve(process.cwd(), 'src/payload.config.ts')).href
  const { default: config } = await import(configPath)
  const payload: any = await getPayload({ config })
  const [existingTenant] = await allDocs(payload, 'tenants', { slug: { equals: TARGET_SLUG } })
  const [existingUser] = await allDocs(payload, 'users', { email: { equals: SERVICE_EMAIL } })
  const existingSettings = existingTenant
    ? await allDocs(payload, 'store-settings', { tenant: { equals: existingTenant.id } })
    : []

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      targetExists: Boolean(existingTenant),
      settingsExist: Boolean(existingSettings[0]),
      serviceUserExists: Boolean(existingUser),
      plannedDomainCount: 2,
    }, null, 2))
    return
  }

  const tenantData = {
    name: 'Đồng Phục X24',
    slug: TARGET_SLUG,
    domains: [{ domain: 'dongphucx24.vn' }, { domain: 'www.dongphucx24.vn' }],
    brand: {
      headline: 'Đồng phục đúng bối cảnh, đúng nhận diện',
      subheadline: 'Giải pháp đồng phục theo ngành nghề, vai trò và nhu cầu sử dụng thực tế.',
      primaryColor: '#17202a',
      accentColor: '#fe590d',
      style: 'flevo-inspired' as const,
    },
  }
  const tenant = existingTenant
    ? await payload.update({ collection: 'tenants', id: existingTenant.id, data: tenantData, overrideAccess: true })
    : await payload.create({ collection: 'tenants', data: tenantData, overrideAccess: true })

  const settingsData = {
    tenant: tenant.id,
    siteName: 'Đồng Phục X24',
    navigation: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Doanh nghiệp', href: '/danh-muc/dong-phuc-doanh-nghiep/' },
      { label: 'Nhà hàng & F&B', href: '/danh-muc/dong-phuc-nha-hang-fnb/' },
      { label: 'Trường học', href: '/danh-muc/dong-phuc-truong-hoc/' },
      { label: 'Sự kiện & đội nhóm', href: '/danh-muc/dong-phuc-su-kien-doi-nhom/' },
      { label: 'Bảo hộ lao động', href: '/danh-muc/dong-phuc-bao-ho-lao-dong/' },
      { label: 'Y tế & dịch vụ', href: '/danh-muc/dong-phuc-y-te-dich-vu/' },
      { label: 'Tất cả mẫu', href: '/san-pham/' },
    ],
  }
  const [settings] = await allDocs(payload, 'store-settings', { tenant: { equals: tenant.id } })
  if (settings) await payload.update({ collection: 'store-settings', id: settings.id, data: settingsData, overrideAccess: true })
  else await payload.create({ collection: 'store-settings', data: settingsData, overrideAccess: true })

  const apiKey = typeof existingUser?.apiKey === 'string' && existingUser.apiKey.length > 20
    ? existingUser.apiKey
    : randomBytes(32).toString('hex')
  const userData = {
    email: SERVICE_EMAIL,
    name: 'Đồng Phục X24 REST',
    role: 'tenant_admin' as const,
    tenants: [{ tenant: tenant.id }],
    enableAPIKey: true,
    apiKey,
    ...(!existingUser ? { password: randomBytes(32).toString('base64url') } : {}),
  }
  if (existingUser) await payload.update({ collection: 'users', id: existingUser.id, data: userData, overrideAccess: true })
  else await payload.create({ collection: 'users', data: userData, overrideAccess: true })

  const secret = [
    'CMS_API_URL=https://cms.x24sport.vn',
    `TENANT_SLUG=${TARGET_SLUG}`,
    `PAYLOAD_API_USER=${SERVICE_EMAIL}`,
    `PAYLOAD_API_KEY=${apiKey}`,
    'PAYLOAD_AUTH_COLLECTION=users',
    '',
  ].join('\n')
  await writeFile(secretFile!, secret, { mode: 0o600 })
  await chmod(secretFile!, 0o600)

  console.log(JSON.stringify({
    mode: 'apply',
    tenantId: tenant.id,
    settings: settings ? 'updated' : 'created',
    serviceUser: SERVICE_EMAIL,
    secretWritten: true,
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
