import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { WebContent } from './collections/WebContent'
import { Media } from './collections/Media'
import { MigrationRuns } from './collections/MigrationRuns'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { ProductCategories } from './collections/ProductCategories'
import { Products } from './collections/Products'
import { StoreSettings } from './collections/StoreSettings'
import { Tenants } from './collections/Tenants'
import { TenantPinterestConnections } from './collections/TenantPinterestConnections'
import type { Config } from './payload-types'
import { isSuperAdmin } from './access/roles'
import { migrations } from './migrations'
import { generateR2FileURL, getR2Endpoint, isR2StorageEnabled } from './storage/r2'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const tenantPersistenceProvider = '/components/admin/TenantPersistenceProvider#TenantPersistenceProvider'

const placeTenantPersistenceInsideTenantContext: Plugin = (incomingConfig) => {
  const providers = incomingConfig.admin?.components?.providers || []
  const otherProviders = providers.filter((provider) => {
    if (!provider) {
      return true
    }

    return typeof provider === 'string'
      ? provider !== tenantPersistenceProvider
      : !('path' in provider) || provider.path !== tenantPersistenceProvider
  })

  if (incomingConfig.admin?.components) {
    incomingConfig.admin.components.providers = [...otherProviders, tenantPersistenceProvider]
  }

  return incomingConfig
}

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      beforeDashboard: ['/components/admin/DashboardWelcome#DashboardWelcome'],
      beforeNav: ['/components/admin/SidebarBrand#SidebarBrand'],
      graphics: {
        Icon: '/components/admin/X24Brand#X24Icon',
        Logo: '/components/admin/X24Brand#X24Logo',
      },
      providers: [tenantPersistenceProvider],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Tenants,
    TenantPinterestConnections,
    Media,
    MigrationRuns,
    ProductCategories,
    Products,
    Pages,
    Posts,
    WebContent,
    StoreSettings,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    prodMigrations: migrations,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    multiTenantPlugin<Config>({
      cleanupAfterTenantDelete: false,
      collections: {
        media: {
          // Media may be shared explicitly across tenants. Collection access is
          // implemented in Media.ts; the plugin's single-tenant filters would
          // otherwise hide shared records from relationship fields.
          useBaseFilter: false,
          useTenantAccess: false,
        },
        'migration-runs': {},
        pages: {},
        posts: {},
        'tenant-pinterest-connections': {},
        'web-content': {},
        'product-categories': {},
        products: {},
        'store-settings': { isGlobal: true },
      },
      tenantsSlug: 'tenants',
      i18n: {
        translations: {
          en: {
            'assign-tenant-button-label': 'Gán website',
            'assign-tenant-modal-title': 'Gán "{{title}}" vào website',
            'field-assignedTenant-label': 'Website được gán',
            'nav-tenantSelector-label': 'Website đang làm việc',
          },
        },
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
    placeTenantPersistenceInsideTenantContext,
    s3Storage({
      alwaysInsertFields: true,
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: generateR2FileURL,
          prefix: '',
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        },
        endpoint: getR2Endpoint(),
        forcePathStyle: true,
        region: 'auto',
      },
      enabled: isR2StorageEnabled(),
    }),
  ],
})
