import 'dotenv/config'
import { createHash } from 'node:crypto'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { relationID } from '../src/util/tenantIdentity'

type Doc = Record<string, any>
type ItemSpec = {
  children?: ItemSpec[]
  description?: string
  featured?: boolean
  href?: string
  iconKey?: string
  key: string
  label: string
  targetCategorySlug?: string
  view?: ViewSpec
}
type ViewSpec = {
  filterKey: string
  key: string
  label: string
  path: string
}
type Manifest = { items: ItemSpec[]; tenantSlug: string }

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const requestedTenant = args.find((arg) => arg.startsWith('--tenant='))?.slice('--tenant='.length)
const cutoverTenant = args.find((arg) => arg.startsWith('--cutover='))?.slice('--cutover='.length)
const legacyTenant = args.find((arg) => arg.startsWith('--legacy='))?.slice('--legacy='.length)
const publishMenuTenant = args.find((arg) => arg.startsWith('--publish-menu='))?.slice('--publish-menu='.length)
const readyMenuTenant = args.find((arg) => arg.startsWith('--ready-menu='))?.slice('--ready-menu='.length)

const MASTER_SLUGS = ['x24sport', 'pndsport'] as const
const TENANT_ORDER = [
  'rynosport',
  'x24sport',
  'pndsport',
  'mayaodongphuc',
  'dongphucx24',
  'mayaocaulong',
  'mayaopickleball',
  'mayaobongro',
  'mayaochaybo',
  'mayaobongda',
]

const SPORT_BY_TENANT: Record<string, { key: string; name: string; masterSlug: string }> = {
  mayaobongda: { key: 'sport.football', name: 'Bóng đá', masterSlug: 'bong-da' },
  mayaocaulong: { key: 'sport.badminton', name: 'Cầu lông', masterSlug: 'cau-long' },
  mayaopickleball: { key: 'sport.pickleball', name: 'Pickleball', masterSlug: 'pickleball' },
  mayaobongchuyen: { key: 'sport.volleyball', name: 'Bóng chuyền', masterSlug: 'bong-chuyen' },
  mayaobongro: { key: 'sport.basketball', name: 'Bóng rổ', masterSlug: 'bong-ro' },
  mayaochaybo: { key: 'sport.running', name: 'Chạy bộ', masterSlug: 'chay-bo' },
  mayaodongphuc: { key: 'business.uniform', name: 'Đồng phục', masterSlug: 'dong-phuc' },
  dongphucx24: { key: 'business.uniform', name: 'Đồng phục', masterSlug: 'dong-phuc' },
}

const custom = (key: string, label: string, href: string, extras: Partial<ItemSpec> = {}): ItemSpec => ({
  href,
  key,
  label,
  ...extras,
})

const group = (key: string, label: string, children: ItemSpec[]): ItemSpec => ({ children, key, label })

const view = (
  key: string,
  label: string,
  path: string,
  filterKey: string,
  extras: Partial<ItemSpec> = {},
): ItemSpec => ({
  key,
  label,
  view: { filterKey, key, label, path },
  ...extras,
})

const relation = (value: unknown) => relationID(value as Parameters<typeof relationID>[0])

async function allDocs(payload: any, collection: string, where: Doc, depth = 0) {
  const docs: Doc[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await payload.find({ collection, where, depth, limit: 100, page, draft: true, overrideAccess: true })
    docs.push(...result.docs)
    totalPages = result.totalPages || 1
    page += 1
  } while (page <= totalPages)
  return docs
}

async function uniqueDoc(payload: any, collection: string, where: Doc, depth = 0) {
  const docs = await allDocs(payload, collection, where, depth)
  if (docs.length > 1) throw new Error(`${collection} không unique cho ${JSON.stringify(where)}.`)
  return docs[0]
}

async function tenantBySlug(payload: any, slug: string) {
  const tenant = await uniqueDoc(payload, 'tenants', { slug: { equals: slug } })
  if (!tenant) throw new Error(`Không tìm thấy tenant ${slug}.`)
  return tenant
}

async function categoriesForTenant(payload: any, tenantID: number | string) {
  return allDocs(payload, 'product-categories', { tenant: { equals: tenantID } }, 1)
}

function parentID(category: Doc) {
  return relation(category.parent)
}

function categoryItem(category: Doc, index: number): ItemSpec {
  return {
    description: category.description || '',
    key: `category-${category.slug || category.id}`,
    label: category.navigationLabel || category.name,
    targetCategorySlug: category.slug,
    featured: index === 0 && category.group === 'collection',
  }
}

function categoryTreeItems(categories: Doc[]): ItemSpec[] {
  const children = new Map<string, Doc[]>()
  categories.forEach((category) => {
    const parent = parentID(category)
    if (parent === undefined) return
    const current = children.get(String(parent)) || []
    current.push(category)
    children.set(String(parent), current)
  })
  return categories
    .filter((category) => category.group === 'sport' && parentID(category) === undefined)
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
    .map((category, index) => ({
      ...categoryItem(category, index),
      children: (children.get(String(category.id)) || [])
        .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
        .map(categoryItem),
    }))
}

const badmintonTypes = [
  ['sleeveless', 'Áo sát nách', '/ao-cau-long-sat-nach/', 'type.sleeveless'],
  ['polo', 'Áo cổ trụ', '/ao-cau-long-co-tru/', 'type.polo'],
  ['crew-neck', 'Áo cổ tròn', '/ao-cau-long-co-tron/', 'type.crew-neck'],
] as const
const pickleballTypes = [
  ['sleeveless', 'Áo sát nách', '/ao-pickleball-sat-nach/', 'type.sleeveless'],
  ['polo', 'Áo cổ trụ', '/ao-pickleball-co-tru/', 'type.polo'],
  ['crew-neck', 'Áo cổ tròn', '/ao-pickleball-co-tron/', 'type.crew-neck'],
] as const
const colors = [
  ['red', 'đỏ', 'do'],
  ['blue', 'xanh', 'xanh'],
  ['black', 'đen', 'den'],
  ['white', 'trắng', 'trang'],
  ['yellow', 'vàng', 'vang'],
  ['pink', 'hồng', 'hong'],
  ['orange', 'cam', 'cam'],
  ['purple', 'tím', 'tim'],
  ['gradient', 'gradient', 'gradient'],
] as const

const runningColors = [
  ['black', 'đen', 'den'],
  ['white', 'trắng', 'trang'],
  ['blue', 'xanh', 'xanh'],
  ['red', 'đỏ', 'do'],
  ['yellow', 'vàng', 'vang'],
  ['orange', 'cam', 'cam'],
  ['pink', 'hồng', 'hong'],
  ['purple', 'tím', 'tim'],
  ['gradient', 'gradient', 'gradient'],
] as const

function racketManifest(tenantSlug: 'mayaocaulong' | 'mayaopickleball'): Manifest {
  const badminton = tenantSlug === 'mayaocaulong'
  const prefix = badminton ? 'cau-long' : 'pickleball'
  const types = badminton ? badmintonTypes : pickleballTypes
  const utility = badminton
    ? [
        custom('order', 'Đặt may', '/dat-may-ao-cau-long'),
        custom('pricing', 'Bảng giá', '/bang-gia-may-ao-cau-long'),
        custom('fabric-size', 'Vải & Size', '/chat-lieu-va-bang-size-ao-cau-long'),
        custom('made-samples', 'Mẫu đã làm', '/mau-da-lam'),
        custom('blog', 'Blog', '/blog'),
      ]
    : [
        custom('order', 'Đặt may', '/dat-may-ao-pickleball'),
        custom('pricing', 'Bảng giá', '/bang-gia-may-ao-pickleball'),
        custom('fabric-size', 'Vải & Size', '/chat-lieu-va-bang-size-ao-pickleball'),
        custom('made-samples', 'Mẫu đã làm', '/mau-da-lam'),
        custom('blog', 'Blog', '/blog'),
      ]
  return {
    tenantSlug,
    items: [
      {
        ...custom('catalog', 'Mẫu áo', '/san-pham'),
        children: [
          group('catalog-types', 'Kiểu áo', types.map(([key, label, path, filterKey]) =>
            view(`${prefix}.type.${key}`, label, path, filterKey))),
          group('catalog-colors', 'Màu phổ biến', colors.map(([key, label, slug]) =>
            view(`${prefix}.color.${key}`, `Áo màu ${label}`, `/ao-${prefix}-mau-${slug}/`, `color.${key}`))),
        ],
      },
      ...utility,
    ],
  }
}

function runningManifest(): Manifest {
  const samples = [
    custom('new-samples', 'Mẫu mới', '/san-pham/', { iconKey: 'sparkles' }),
    custom('popular-samples', 'Xem nhiều', '/mau-ao-chay-bo-duoc-xem-nhieu/', { iconKey: 'eye' }),
    view('running.type.custom', 'Áo chạy bộ thiết kế', '/may-ao-chay-bo-thiet-ke-rieng-x24/', 'type.custom', { iconKey: 'palette' }),
    view('running.type.sleeved', 'Áo chạy bộ có tay', '/ao-chay-bo-co-tay/', 'type.sleeved', { iconKey: 'shirt' }),
    view('running.type.sleeveless', 'Áo chạy bộ sát nách', '/ao-chay-bo-sat-nach/', 'type.sleeveless', { iconKey: 'activity' }),
    view('running.collection.vn-flag', 'Áo chạy bộ cờ đỏ sao vàng', '/ao-chay-bo-co-do-sao-vang/', 'collection.vn-flag', { iconKey: 'flag' }),
  ]
  return {
    tenantSlug: 'mayaochaybo',
    items: [
      group('samples', 'Mẫu áo', samples),
      group('colors', 'Màu áo', runningColors.map(([key, label, slug]) =>
        view(`running.color.${key}`, `Áo màu ${label}`, `/mau-sac/${slug}/`, `color.${key}`))),
      custom('pricing', 'Bảng giá', '/bang-gia-may-ao-chay-bo/'),
      custom('logos', 'Logo đội chạy', '/logo-doi-chay/'),
      custom('blog', 'Kinh nghiệm', '/blog/'),
      custom('about', 'Về chúng tôi', '/gioi-thieu/'),
      custom('contact', 'Liên hệ', '/lien-he/'),
    ],
  }
}

function basketballManifest(): Manifest {
  return {
    tenantSlug: 'mayaobongro',
    items: [
      custom('samples', 'Mẫu áo', '/san-pham/'),
      custom('made-samples', 'Mẫu đã làm', '/mau-da-lam/'),
      custom('logos', 'Logo team', '/logo-team/'),
      custom('order', 'Đặt may', '/dat-may-ao-bong-ro/'),
      custom('pricing', 'Bảng giá', '/bang-gia-may-ao-bong-ro/'),
      custom('fabric-size', 'Vải & size', '/chat-lieu-va-bang-size-ao-bong-ro/'),
      custom('contact', 'Liên hệ', '/lien-he/'),
    ],
  }
}

function rynoManifest(): Manifest {
  return {
    tenantSlug: 'rynosport',
    items: [
      custom('home', 'Trang chủ', '/'),
      custom('products', 'Sản phẩm', '/san-pham/'),
      custom('team-order', 'Đặt áo đội', '/lien-he/'),
    ],
  }
}

const dongPhucCategories = [
  ['dong-phuc-cong-ty', 'Đồng phục công ty', 'Polo, sơ mi và áo khoác theo nhận diện đội ngũ.'],
  ['dong-phuc-nha-hang-fnb', 'Nhà hàng & F&B', 'Phân vai rõ ràng giữa phục vụ, pha chế và bếp.'],
  ['ao-lop-truong-hoc', 'Áo lớp & trường học', 'Mẫu trẻ, dễ nhận diện và thuận tiện gom size.'],
  ['team-building-su-kien', 'Team building & sự kiện', 'Màu sắc nổi bật cho hoạt động tập thể và sự kiện.'],
  ['dong-phuc-bao-ho-ky-thuat', 'Bảo hộ & kỹ thuật', 'Chọn mẫu theo công việc, điều kiện sử dụng và nhận diện.'],
  ['dong-phuc-y-te-dich-vu', 'Y tế & dịch vụ', 'Phom gọn, màu dịu và nhận diện chuyên nghiệp.'],
] as const

function dongPhucX24Manifest(): Manifest {
  return {
    tenantSlug: 'dongphucx24',
    items: [
      group('categories', 'Danh mục', dongPhucCategories.map(([slug, label, description]) => ({
        description,
        key: `category-${slug}`,
        label,
        targetCategorySlug: slug,
      }))),
      custom('products', 'Sản phẩm', '/san-pham/'),
      custom('solutions', 'Giải pháp', '/#giai-phap'),
      custom('process', 'Quy trình', '/#quy-trinh'),
      custom('materials', 'Vật liệu & size', '/#vat-lieu'),
      custom('selected', 'Mẫu đã chọn', '/#cam-hung'),
    ],
  }
}

async function footballManifest(payload: any, tenant: Doc, categories: Doc[]): Promise<Manifest> {
  const bySlug = new Map(categories.map((category) => [category.slug, category]))
  const types: ItemSpec[] = [
    custom('all-products', 'Tất cả mẫu áo', '/san-pham/', { description: 'Xem toàn bộ mẫu áo đang có tại xưởng', iconKey: 'grid' }),
    ...[
      ['ao-thiet-ke', 'Mẫu thiết kế', 'Mẫu riêng, dễ chỉnh màu, logo và tên số', 'palette'],
      ['cau-lac-bo', 'Áo CLB nổi tiếng', 'Mẫu lấy cảm hứng từ các CLB hàng đầu', 'shield'],
      ['doi-tuyen', 'Áo đội tuyển quốc gia', 'Mẫu áo các đội tuyển bóng đá quốc gia', 'flag'],
    ].flatMap(([slug, label, description, iconKey]) => bySlug.has(slug)
      ? [{ key: `type-${slug}`, label, description, iconKey, targetCategorySlug: slug }]
      : []),
  ]
  const collections = categories
    .filter((category) => /(?:thiet-ke-)(20\d{2})$/.test(category.slug) && Number(category.productCount || 0) > 0)
    .sort((left, right) => Number(right.slug.match(/20\d{2}/)?.[0] || 0) - Number(left.slug.match(/20\d{2}/)?.[0] || 0))
  const collectionItems: ItemSpec[] = collections.map((category, index) => ({
    description: index === 0
      ? 'Bộ sưu tập mới nhất đang được ưu tiên'
      : `Bộ sưu tập thiết kế năm ${category.slug.match(/20\d{2}/)?.[0] || ''}`,
    featured: index === 0,
    iconKey: index === 0 ? 'flame' : 'calendar',
    key: `collection-${category.slug}`,
    label: `Mẫu thiết kế ${index === 0 ? 'mới ' : ''}${category.slug.match(/20\d{2}/)?.[0] || ''}`,
    targetCategorySlug: category.slug,
  }))
  const audienceData = [
    ['ao-bong-da-doi-bong-cau-lac-bo', 'Đội bóng & CLB phong trào', '/ao-bong-da-doi-bong-cau-lac-bo/', 'Đội phủi, FC, nhóm bạn và CLB địa phương', 'users'],
    ['ao-bong-da-truong-hoc-sinh-vien', 'Trường học & sinh viên', '/ao-bong-da-truong-hoc-sinh-vien/', 'Đội lớp, khoa, trường và CLB sinh viên', 'graduation'],
    ['ao-bong-da-cong-ty', 'Công ty & doanh nghiệp', '/thiet-ke-ao-bong-da-cong-ty/', 'Đội nội bộ, team building và hội thao', 'building'],
    ['ao-bong-da-cong-ty-ngan-hang', 'Ngân hàng', '/thiet-ke-ao-bong-da-ngan-hang/', 'Đội chi nhánh và giải bóng đá ngành', 'landmark'],
    ['ao-bong-da-giai-phong-trao', 'Giải đấu & hội thao', '/ao-bong-da-giai-phong-trao/', 'Đồng phục thi đấu và áo ban tổ chức', 'trophy'],
  ]
  const audiences = audienceData.flatMap(([slug, label, href, description, iconKey]) =>
    Number(bySlug.get(slug)?.productCount || 0) > 0
      ? [custom(`audience-${slug}`, label, href, { description, iconKey })]
      : [])
  return {
    tenantSlug: tenant.slug,
    items: [
      group('product-types', 'Theo mẫu áo', types),
      group('collections', 'Bộ sưu tập thiết kế', collectionItems),
      group('audiences', 'Đặt may theo đối tượng', audiences),
      ...(collectionItems[0]
        ? [{
            ...collectionItems[0],
            description: undefined,
            featured: false,
            iconKey: undefined,
            key: 'featured-collection',
            label: collectionItems[0].label.replace('Mẫu thiết kế mới ', 'Mẫu thiết kế '),
          }]
        : []),
      custom('pricing', 'Bảng giá', '/bang-gia-may-ao-bong-da/'),
      custom('fabric', 'Chất liệu vải', '/chat-lieu-vai/'),
      custom('affiliate', 'Cộng tác viên', '/cong-tac-vien/'),
      custom('blog', 'Tin tức', '/blog/'),
    ],
  }
}

async function uniformWorkshopManifest(categories: Doc[]): Promise<Manifest> {
  const ordered = [...categories]
    .filter((category) => category.status !== 'retired')
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
  return {
    tenantSlug: 'mayaodongphuc',
    items: [
      group('solutions', 'Giải pháp', ordered.map(categoryItem)),
      custom('process', 'Quy trình', '/#quy-trinh'),
      custom('materials', 'Vật liệu', '/#vat-lieu'),
      custom('standards', 'Tiêu chuẩn', '/#tieu-chuan'),
      custom('blog', 'Tư vấn', '/blog/'),
    ],
  }
}

async function masterManifest(tenantSlug: 'x24sport' | 'pndsport', categories: Doc[]): Promise<Manifest> {
  const items = categoryTreeItems(categories)
  if (tenantSlug === 'x24sport') {
    items.push(custom('blog', 'Blog', '/blog/'), custom('contact', 'Liên hệ', '/lien-he/'))
  }
  return { tenantSlug, items }
}

async function buildManifest(payload: any, tenant: Doc): Promise<Manifest> {
  const categories = await categoriesForTenant(payload, tenant.id)
  if (tenant.slug === 'rynosport') return rynoManifest()
  if (tenant.slug === 'x24sport' || tenant.slug === 'pndsport') return masterManifest(tenant.slug, categories)
  if (tenant.slug === 'mayaodongphuc') return uniformWorkshopManifest(categories)
  if (tenant.slug === 'dongphucx24') return dongPhucX24Manifest()
  if (tenant.slug === 'mayaocaulong' || tenant.slug === 'mayaopickleball') return racketManifest(tenant.slug)
  if (tenant.slug === 'mayaobongro') return basketballManifest()
  if (tenant.slug === 'mayaochaybo') return runningManifest()
  if (tenant.slug === 'mayaobongda') return footballManifest(payload, tenant, categories)
  throw new Error(`Tenant ${tenant.slug} chưa có manifest an toàn.`)
}

function flatten(items: ItemSpec[], parentKey = '', depth = 0): Array<Record<string, string | number>> {
  return items.flatMap((item, order) => [
    {
      depth,
      href: item.href || item.view?.path || '',
      key: item.key,
      label: item.label,
      order,
      parentKey,
      target: item.targetCategorySlug ? 'category' : item.view ? 'catalogView' : item.href ? 'customUrl' : 'group',
    },
    ...flatten(item.children || [], item.key, depth + 1),
  ])
}

async function ensureDongPhucCategories(payload: any, tenant: Doc) {
  for (const [index, [slug, name, description]] of dongPhucCategories.entries()) {
    const existing = await uniqueDoc(payload, 'product-categories', {
      and: [{ tenant: { equals: tenant.id } }, { slug: { equals: slug } }],
    })
    const data = {
      tenant: tenant.id,
      name,
      slug,
      description,
      group: 'type',
      legacyPath: `/danh-muc/${slug}/`,
      navigationLabel: name,
      navigationOrder: index,
      order: index,
      showInNavigation: true,
      status: 'active',
    }
    if (existing) await payload.update({ collection: 'product-categories', id: existing.id, data, overrideAccess: true })
    else await payload.create({ collection: 'product-categories', data, overrideAccess: true })
  }
}

async function upsertTaxonomies(payload: any) {
  const unique = new Map(Object.values(SPORT_BY_TENANT).map((item) => [item.key, item]))
  const result = new Map<string, Doc>()
  for (const taxonomy of unique.values()) {
    const existing = await uniqueDoc(payload, 'catalog-taxonomies', { key: { equals: taxonomy.key } })
    const data = { key: taxonomy.key, kind: taxonomy.key.startsWith('sport.') ? 'sport' : 'category', name: taxonomy.name, status: 'active' }
    const doc = existing
      ? await payload.update({ collection: 'catalog-taxonomies', id: existing.id, data, overrideAccess: true })
      : await payload.create({ collection: 'catalog-taxonomies', data, overrideAccess: true })
    result.set(taxonomy.key, doc)
  }
  return result
}

async function upsertView(payload: any, tenant: Doc, viewSpec: ViewSpec, taxonomy: Doc | undefined) {
  const existing = await uniqueDoc(payload, 'catalog-views', {
    and: [{ tenant: { equals: tenant.id } }, { key: { equals: viewSpec.key } }],
  })
  const filterGroup = viewSpec.filterKey.startsWith('color.')
    ? { colorKeys: [{ key: viewSpec.filterKey }] }
    : viewSpec.filterKey.startsWith('type.')
      ? { productTypeKeys: [{ key: viewSpec.filterKey }] }
      : { searchTagKeys: [{ key: viewSpec.filterKey }] }
  const data = {
    tenant: tenant.id,
    key: viewSpec.key,
    path: viewSpec.path,
    title: viewSpec.label,
    heading: viewSpec.label,
    taxonomy: taxonomy ? [taxonomy.id] : [],
    filters: filterGroup,
    matchMode: 'all',
    indexPolicy: 'indexable',
    canonicalPath: viewSpec.path,
    includeInSitemap: true,
    enabled: true,
  }
  return existing
    ? payload.update({ collection: 'catalog-views', id: existing.id, data, draft: false, overrideAccess: true })
    : payload.create({ collection: 'catalog-views', data, draft: false, overrideAccess: true })
}

async function upsertMenu(payload: any, tenant: Doc) {
  const existing = await uniqueDoc(payload, 'navigation-menus', {
    and: [
      { tenant: { equals: tenant.id } },
      { key: { equals: 'primary' } },
      { location: { equals: 'header' } },
    ],
  })
  const data = {
    tenant: tenant.id,
    key: 'primary',
    location: 'header',
    status: existing?.status === 'published' ? 'published' : 'ready',
    revision: Number(existing?.revision || 1),
    manifestHash: existing?.manifestHash || '',
    lastValidatedAt: existing?.lastValidatedAt,
  }
  return existing
    ? payload.update({ collection: 'navigation-menus', id: existing.id, data, draft: false, overrideAccess: true })
    : payload.create({ collection: 'navigation-menus', data, draft: false, overrideAccess: true })
}

type ManifestNode = {
  children: ManifestNode[]
  href: string
  key: string
  kind: string
  label: string
  order: number
}

function relationDoc(value: unknown): Doc | undefined {
  return value && typeof value === 'object' ? value as Doc : undefined
}

function itemHref(item: Doc) {
  if (item.targetType === 'category') {
    const category = relationDoc(item.targetCategory)
    return category?.legacyPath || (category?.slug ? `/danh-muc/${category.slug}/` : '')
  }
  if (item.targetType === 'catalogView') return relationDoc(item.targetCatalogView)?.path || ''
  if (item.targetType === 'page') {
    const slug = relationDoc(item.targetPage)?.slug
    return slug ? `/${slug}/` : ''
  }
  if (item.targetType === 'customUrl') return item.customUrl || ''
  return ''
}

async function menuManifest(payload: any, menu: Doc) {
  const items = (await allDocs(payload, 'navigation-items', {
    and: [{ menu: { equals: menu.id } }, { enabled: { equals: true } }],
  }, 2)).filter((item) => item._status === 'published')
  const nodes = new Map<string, ManifestNode>()
  const children = new Map<string, Doc[]>()
  for (const item of items) {
    const parent = relation(item.parent)
    const parentKey = parent === undefined ? '' : String(parent)
    children.set(parentKey, [...(children.get(parentKey) || []), item])
  }
  const build = (parentKey: string): ManifestNode[] => (children.get(parentKey) || [])
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
    .map((item) => {
      const node: ManifestNode = {
        children: [],
        href: itemHref(item),
        key: item.key,
        kind: item.targetType || 'group',
        label: item.label,
        order: Number(item.order || 0),
      }
      nodes.set(String(item.id), node)
      node.children = build(String(item.id))
      return node
    })
  const roots = build('')
  const flattened: Array<Record<string, string | number>> = []
  const walk = (entries: ManifestNode[], depth: number, parentKey: string) => {
    entries.forEach((node, order) => {
      flattened.push({ depth, href: node.href, key: node.key, kind: node.kind, label: node.label, order, parentKey })
      walk(node.children, depth + 1, node.key)
    })
  }
  walk(roots, 0, '')
  const serialized = JSON.stringify(flattened)
  return { hash: createHash('sha256').update(serialized).digest('hex'), manifest: flattened }
}

async function finalizeMenu(payload: any, menu: Doc) {
  const current = await menuManifest(payload, menu)
  if (!current.manifest.length) throw new Error(`Menu ${menu.id} không có item publish để xác nhận.`)
  const changed = menu.manifestHash !== current.hash
  return payload.update({
    collection: 'navigation-menus',
    id: menu.id,
    data: {
      manifestHash: current.hash,
      revision: changed && menu.manifestHash ? Number(menu.revision || 1) + 1 : Number(menu.revision || 1),
      lastValidatedAt: new Date().toISOString(),
    },
    draft: false,
    overrideAccess: true,
  })
}

async function changeMenuLifecycle(payload: any, tenantSlug: string, status: 'ready' | 'published') {
  const tenant = await tenantBySlug(payload, tenantSlug)
  const menu = await uniqueDoc(payload, 'navigation-menus', {
    and: [
      { tenant: { equals: tenant.id } },
      { key: { equals: 'primary' } },
      { location: { equals: 'header' } },
    ],
  }, 1)
  if (!menu) throw new Error(`${tenantSlug}: chưa có menu primary/header.`)
  const current = await menuManifest(payload, menu)
  if (!menu.manifestHash || current.hash !== menu.manifestHash) {
    throw new Error(`${tenantSlug}: manifest hash chưa được xác nhận hoặc đã thay đổi.`)
  }
  if (apply) {
    await payload.update({ collection: 'navigation-menus', id: menu.id, data: { status }, draft: false, overrideAccess: true })
  }
  return { tenantSlug, status, revision: menu.revision, manifestHash: menu.manifestHash, itemCount: current.manifest.length }
}

async function upsertItems({
  categories,
  items,
  menu,
  payload,
  taxonomy,
  tenant,
}: {
  categories: Doc[]
  items: ItemSpec[]
  menu: Doc
  payload: any
  taxonomy?: Doc
  tenant: Doc
}) {
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]))
  const existingItems = await allDocs(payload, 'navigation-items', { menu: { equals: menu.id } })
  const existingByKey = new Map(existingItems.map((item) => [item.key, item]))
  const desiredKeys = new Set<string>()

  const visit = async (specs: ItemSpec[], parent: Doc | undefined) => {
    for (const [order, spec] of specs.entries()) {
      desiredKeys.add(spec.key)
      const category = spec.targetCategorySlug ? categoriesBySlug.get(spec.targetCategorySlug) : undefined
      if (spec.targetCategorySlug && !category) throw new Error(`${tenant.slug}: thiếu category ${spec.targetCategorySlug}.`)
      const catalogView = spec.view ? await upsertView(payload, tenant, spec.view, taxonomy) : undefined
      const targetType = category ? 'category' : catalogView ? 'catalogView' : spec.href ? 'customUrl' : 'group'
      const data = {
        tenant: tenant.id,
        menu: menu.id,
        parent: parent?.id,
        order,
        enabled: true,
        key: spec.key,
        label: spec.label,
        description: spec.description || '',
        iconKey: spec.iconKey || '',
        featured: Boolean(spec.featured),
        targetType,
        targetCategory: category?.id,
        targetCatalogView: catalogView?.id,
        customUrl: spec.href,
        childrenSource: 'static',
      }
      const existing = existingByKey.get(spec.key)
      const item = existing
        ? await payload.update({ collection: 'navigation-items', id: existing.id, data, draft: false, overrideAccess: true })
        : await payload.create({ collection: 'navigation-items', data, draft: false, overrideAccess: true })
      await visit(spec.children || [], item)
    }
  }
  await visit(items, undefined)
  for (const stale of existingItems.filter((item) => !desiredKeys.has(item.key))) {
    await payload.update({ collection: 'navigation-items', id: stale.id, data: { enabled: false }, draft: false, overrideAccess: true })
  }
}

async function updateMode(payload: any, tenantSlug: string, navigationMode: 'legacy' | 'cms') {
  const tenant = await tenantBySlug(payload, tenantSlug)
  const settings = await uniqueDoc(payload, 'store-settings', { tenant: { equals: tenant.id } })
  if (!settings) throw new Error(`${tenantSlug}: không có Store Settings để đổi mode.`)
  if (navigationMode === 'cms') {
    const menu = await uniqueDoc(payload, 'navigation-menus', {
      and: [
        { tenant: { equals: tenant.id } },
        { key: { equals: 'primary' } },
        { location: { equals: 'header' } },
        { status: { equals: 'published' } },
      ],
    }, 1)
    if (!menu || menu._status !== 'published') throw new Error(`${tenantSlug}: menu chưa được publish.`)
    const current = await menuManifest(payload, menu)
    if (!menu.manifestHash || current.hash !== menu.manifestHash || !current.manifest.length) {
      throw new Error(`${tenantSlug}: manifest menu không đạt gate hash.`)
    }
  }
  if (apply) {
    await payload.update({ collection: 'store-settings', id: settings.id, data: { navigationMode }, overrideAccess: true })
  }
  return { tenantSlug, navigationMode, settingsID: settings.id }
}

async function upsertDistributions(payload: any, tenants: Map<string, Doc>, manifests: Manifest[]) {
  for (const manifest of manifests) {
    const sourceTenant = tenants.get(manifest.tenantSlug)
    const sport = SPORT_BY_TENANT[manifest.tenantSlug]
    if (!sourceTenant || !sport || MASTER_SLUGS.includes(manifest.tenantSlug as typeof MASTER_SLUGS[number])) continue
    const sourceCategories = await categoriesForTenant(payload, sourceTenant.id)
    const sourceCategory = sourceCategories.find((category) => category.group === 'sport' && parentID(category) === undefined)
    const sourceViews = await allDocs(payload, 'catalog-views', { tenant: { equals: sourceTenant.id } })
    for (const masterSlug of MASTER_SLUGS) {
      const targetTenant = tenants.get(masterSlug)
      if (!targetTenant) continue
      const targetCategories = await categoriesForTenant(payload, targetTenant.id)
      const targetCategory = targetCategories.find((category) => category.slug === sport.masterSlug)
      if (sourceCategory && targetCategory) {
        const existing = await uniqueDoc(payload, 'category-distributions', {
          and: [
            { sourceTenant: { equals: sourceTenant.id } },
            { sourceKind: { equals: 'category' } },
            { sourceCategory: { equals: sourceCategory.id } },
            { targetTenant: { equals: targetTenant.id } },
          ],
        })
        const data = {
          sourceTenant: sourceTenant.id,
          sourceKind: 'category',
          sourceCategory: sourceCategory.id,
          targetTenant: targetTenant.id,
          targetCategory: targetCategory.id,
          status: 'ready',
          copyMode: 'manual_locked',
          proposedCopy: { name: targetCategory.name, navigationLabel: targetCategory.navigationLabel || targetCategory.name, path: targetCategory.legacyPath || `/danh-muc/${targetCategory.slug}/` },
        }
        if (existing) await payload.update({ collection: 'category-distributions', id: existing.id, data, overrideAccess: true })
        else await payload.create({ collection: 'category-distributions', data, overrideAccess: true })
      }
      for (const sourceView of sourceViews) {
        const existing = await uniqueDoc(payload, 'category-distributions', {
          and: [
            { sourceTenant: { equals: sourceTenant.id } },
            { sourceKind: { equals: 'catalog_view' } },
            { sourceCatalogView: { equals: sourceView.id } },
            { targetTenant: { equals: targetTenant.id } },
          ],
        })
        const data = {
          sourceTenant: sourceTenant.id,
          sourceKind: 'catalog_view',
          sourceCatalogView: sourceView.id,
          targetTenant: targetTenant.id,
          status: 'ready',
          copyMode: 'auto',
          proposedCopy: { name: sourceView.title, navigationLabel: sourceView.title, path: sourceView.path },
        }
        if (existing) await payload.update({ collection: 'category-distributions', id: existing.id, data, overrideAccess: true })
        else await payload.create({ collection: 'category-distributions', data, overrideAccess: true })
      }
    }
  }
}

async function run() {
  const payload: any = await getPayload({ config })
  if (publishMenuTenant) {
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', change: await changeMenuLifecycle(payload, publishMenuTenant, 'published') }, null, 2))
    return
  }
  if (readyMenuTenant) {
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', change: await changeMenuLifecycle(payload, readyMenuTenant, 'ready') }, null, 2))
    return
  }
  if (cutoverTenant) {
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', change: await updateMode(payload, cutoverTenant, 'cms') }, null, 2))
    return
  }
  if (legacyTenant) {
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', change: await updateMode(payload, legacyTenant, 'legacy') }, null, 2))
    return
  }

  const tenantSlugs = requestedTenant ? [requestedTenant] : TENANT_ORDER
  for (const slug of tenantSlugs) {
    if (!TENANT_ORDER.includes(slug)) throw new Error(`Tenant ${slug} không nằm trong phạm vi backfill đã duyệt.`)
  }
  const tenants = new Map<string, Doc>()
  for (const slug of new Set([...TENANT_ORDER, ...MASTER_SLUGS])) tenants.set(slug, await tenantBySlug(payload, slug))

  if (apply && tenantSlugs.includes('dongphucx24')) await ensureDongPhucCategories(payload, tenants.get('dongphucx24')!)
  const manifests: Manifest[] = []
  for (const slug of tenantSlugs) manifests.push(await buildManifest(payload, tenants.get(slug)!))

  const report = manifests.map((manifest) => ({
    tenantSlug: manifest.tenantSlug,
    itemCount: flatten(manifest.items).length,
    manifest: flatten(manifest.items),
  }))
  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', tenants: report }, null, 2))
    return
  }

  const taxonomies = await upsertTaxonomies(payload)
  const appliedMenus: Array<{ tenantSlug: string; menu: Doc }> = []
  for (const manifest of manifests) {
    const tenant = tenants.get(manifest.tenantSlug)!
    const categories = await categoriesForTenant(payload, tenant.id)
    const taxonomy = taxonomies.get(SPORT_BY_TENANT[manifest.tenantSlug]?.key)
    if (taxonomy) {
      const topCategory = categories.find((category) => category.group === 'sport' && parentID(category) === undefined)
      if (topCategory) {
        await payload.update({ collection: 'product-categories', id: topCategory.id, data: { taxonomy: taxonomy.id }, overrideAccess: true })
      }
    }
    const menu = await upsertMenu(payload, tenant)
    await upsertItems({ categories, items: manifest.items, menu, payload, taxonomy, tenant })
    appliedMenus.push({ tenantSlug: manifest.tenantSlug, menu: await finalizeMenu(payload, menu) })
  }
  await upsertDistributions(payload, tenants, manifests)
  console.log(JSON.stringify({
    mode: 'apply',
    tenants: report.map((entry) => {
      const menu = appliedMenus.find((item) => item.tenantSlug === entry.tenantSlug)?.menu
      return { ...entry, menuStatus: menu?.status, revision: menu?.revision, manifestHash: menu?.manifestHash }
    }),
  }, null, 2))
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exit(1)
})
