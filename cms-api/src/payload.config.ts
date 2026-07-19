import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
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

export default buildConfig({
  admin: {
    user: Users.slug,
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
        media: {},
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
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    }),
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
