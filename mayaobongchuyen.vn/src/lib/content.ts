import { headers } from 'next/headers'

type ApiList<T> = { docs: T[] }

export type Tenant = {
  id: string
  name: string
  slug: string
  brand?: { headline?: string; subheadline?: string; accentColor?: string }
}

export type Product = {
  id: string
  name: string
  sku: string
  price: number
  compareAtPrice?: number
  shortDescription: string
}

export type Post = { id: string; title: string; slug: string; excerpt: string }

export type PageContent = {
  id: string
  title: string
  slug: string
  heroTitle: string
  heroText: string
  sections?: Array<{ heading: string; body: string }>
}

export type NavItem = {
  label: string
  href: string
  columns?: Array<{
    label: string
    items?: Array<{ label: string; href: string }>
  }>
}

export type StoreSettings = {
  id: string
  siteName: string
  contactPhone?: string
  zaloUrl?: string
  analytics?: {
    ga4Enabled?: boolean
    gaMeasurementId?: string
    gaPropertyId?: string
    dailyTelegramReportEnabled?: boolean
  }
  navigation?: NavItem[]
}

export type ProductCategory = {
  id: string
  name: string
  slug: string
  group: 'type' | 'color'
  description?: string
  order?: number
}

const fallbackTenant: Tenant = {
  id: 'fallback-mayaobongchuyen',
  name: 'May Ao Bong Chuyen',
  slug: 'mayaobongchuyen',
  brand: {
    headline: 'Dong phuc bong chuyen cho doi hinh bung suc',
    subheadline: 'Ao thi dau dat may, mau manh, chat vai nhanh kho va tuy bien logo CLB.',
    accentColor: '#f6c445',
  },
}

const fallbackProducts: Product[] = [
  { id: '1', name: 'Spike Grid Jersey', sku: 'MBC-SPIKE-01', price: 199000, compareAtPrice: 249000, shortDescription: 'Ao bong chuyen co tim, pattern luoi san dau.' },
  { id: '2', name: 'Libero Contrast Tee', sku: 'MBC-LIBERO-02', price: 215000, compareAtPrice: 265000, shortDescription: 'Mau libero tuong phan cao, de nhan dien.' },
  { id: '3', name: 'Power Serve Kit', sku: 'MBC-POWER-03', price: 269000, compareAtPrice: 319000, shortDescription: 'Bo ao quan co so, ten doi va nha tai tro.' },
]

const fallbackPosts: Post[] = [
  { id: '1', title: 'Cach len mau ao bong chuyen', slug: 'len-mau-ao-bong-chuyen', excerpt: 'Chon block mau va pattern giup doi hinh noi bat tren san.' },
  { id: '2', title: 'Size chart cho doi thi dau', slug: 'size-chart-doi-thi-dau', excerpt: 'Cach gom size nhanh cho doi nam, nu va libero.' },
]

const fallbackNavigation: NavItem[] = [
  {
    label: 'Áo bóng chuyền',
    href: '/ao-bong-chuyen',
    columns: [
      {
        label: 'Theo loại áo',
        items: [
          { label: 'Áo bóng chuyền nam', href: '/ao-bong-chuyen-nam' },
          { label: 'Áo bóng chuyền nữ', href: '/ao-bong-chuyen-nu' },
          { label: 'Áo đội/CLB', href: '/ao-doi-clb' },
        ],
      },
      {
        label: 'Theo màu sắc',
        items: [
          { label: 'Màu đỏ', href: '/ao-bong-chuyen-mau-do' },
          { label: 'Màu xanh', href: '/ao-bong-chuyen-mau-xanh' },
          { label: 'Màu đen', href: '/ao-bong-chuyen-mau-den' },
          { label: 'Màu trắng', href: '/ao-bong-chuyen-mau-trang' },
          { label: 'Màu vàng', href: '/ao-bong-chuyen-mau-vang' },
          { label: 'Màu hồng', href: '/ao-bong-chuyen-mau-hong' },
        ],
      },
    ],
  },
  { label: 'Đặt may theo yêu cầu', href: '/dat-may-theo-yeu-cau' },
  { label: 'Bảng giá', href: '/bang-gia' },
  { label: 'Chất liệu & Size', href: '/chat-lieu-size' },
  { label: 'Mẫu đã làm', href: '/mau-da-lam' },
  { label: 'Liên hệ', href: '/lien-he' },
]

const fallbackCategories: ProductCategory[] = [
  { id: 'ao-bong-chuyen-nam', name: 'Áo bóng chuyền nam', slug: 'ao-bong-chuyen-nam', group: 'type', description: 'Mẫu áo cho đội nam và CLB nam.', order: 10 },
  { id: 'ao-bong-chuyen-nu', name: 'Áo bóng chuyền nữ', slug: 'ao-bong-chuyen-nu', group: 'type', description: 'Mẫu áo cho đội nữ và CLB nữ.', order: 20 },
  { id: 'ao-doi-clb', name: 'Áo đội/CLB', slug: 'ao-doi-clb', group: 'type', description: 'Đặt may theo logo, màu đội, tên số.', order: 30 },
  { id: 'ao-bong-chuyen-mau-do', name: 'Màu đỏ', slug: 'ao-bong-chuyen-mau-do', group: 'color', order: 110 },
  { id: 'ao-bong-chuyen-mau-xanh', name: 'Màu xanh', slug: 'ao-bong-chuyen-mau-xanh', group: 'color', order: 120 },
  { id: 'ao-bong-chuyen-mau-den', name: 'Màu đen', slug: 'ao-bong-chuyen-mau-den', group: 'color', order: 130 },
  { id: 'ao-bong-chuyen-mau-trang', name: 'Màu trắng', slug: 'ao-bong-chuyen-mau-trang', group: 'color', order: 140 },
  { id: 'ao-bong-chuyen-mau-vang', name: 'Màu vàng', slug: 'ao-bong-chuyen-mau-vang', group: 'color', order: 150 },
  { id: 'ao-bong-chuyen-mau-hong', name: 'Màu hồng', slug: 'ao-bong-chuyen-mau-hong', group: 'color', order: 160 },
]

const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

async function fetchDocs<T>(path: string): Promise<T[]> {
  const response = await fetch(`${apiUrl}${path}`, { cache: 'no-store' })
  if (!response.ok) return []
  const data = (await response.json()) as ApiList<T>
  return data.docs || []
}

export async function getAnalyticsSettings() {
  try {
    const slug = await getTenantSlug()
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const settings = await fetchDocs<StoreSettings>(`/api/store-settings?${tenantFilter}&limit=1`)
    return settings[0]?.analytics
  } catch {
    return undefined
  }
}

export async function getTenantSlug() {
  const headerStore = await headers()
  const host = headerStore.get('host')?.replace(/^www\./, '')
  if (host?.includes('mayaobongchuyen.vn')) return 'mayaobongchuyen'
  return process.env.TENANT_SLUG || 'mayaobongchuyen'
}

export async function getHomeData() {
  const slug = await getTenantSlug()

  try {
    const [tenant] = await fetchDocs<Tenant>(`/api/tenants?where[slug][equals]=${slug}&limit=1`)
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const [products, posts, settings, categories] = await Promise.all([
      fetchDocs<Product>(`/api/products?${tenantFilter}&where[featured][equals]=true&limit=6`),
      fetchDocs<Post>(`/api/posts?${tenantFilter}&sort=-publishedAt&limit=3`),
      fetchDocs<StoreSettings>(`/api/store-settings?${tenantFilter}&limit=1`),
      fetchDocs<ProductCategory>(`/api/product-categories?${tenantFilter}&sort=order&limit=30`),
    ])

    return {
      tenant: tenant || fallbackTenant,
      products: products.length ? products : fallbackProducts,
      posts: posts.length ? posts : fallbackPosts,
      settings: settings[0] || { id: 'fallback-settings', siteName: fallbackTenant.name, navigation: fallbackNavigation },
      categories: categories.length ? categories : fallbackCategories,
    }
  } catch {
    return {
      tenant: fallbackTenant,
      products: fallbackProducts,
      posts: fallbackPosts,
      settings: { id: 'fallback-settings', siteName: fallbackTenant.name, navigation: fallbackNavigation },
      categories: fallbackCategories,
    }
  }
}

export async function getPageData(pageSlug: string) {
  const slug = await getTenantSlug()

  try {
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const [[tenant], [page], settings, categories, products] = await Promise.all([
      fetchDocs<Tenant>(`/api/tenants?where[slug][equals]=${slug}&limit=1`),
      fetchDocs<PageContent>(`/api/pages?${tenantFilter}&where[slug][equals]=${pageSlug}&limit=1`),
      fetchDocs<StoreSettings>(`/api/store-settings?${tenantFilter}&limit=1`),
      fetchDocs<ProductCategory>(`/api/product-categories?${tenantFilter}&sort=order&limit=30`),
      fetchDocs<Product>(`/api/products?${tenantFilter}&where[featured][equals]=true&limit=6`),
    ])

    return {
      tenant: tenant || fallbackTenant,
      page,
      settings: settings[0] || { id: 'fallback-settings', siteName: fallbackTenant.name, navigation: fallbackNavigation },
      categories: categories.length ? categories : fallbackCategories,
      products: products.length ? products : fallbackProducts,
    }
  } catch {
    return {
      tenant: fallbackTenant,
      page: undefined,
      settings: { id: 'fallback-settings', siteName: fallbackTenant.name, navigation: fallbackNavigation },
      categories: fallbackCategories,
      products: fallbackProducts,
    }
  }
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
