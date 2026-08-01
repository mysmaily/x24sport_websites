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
  slug?: string
  sku: string
  price: number
  compareAtPrice?: number
  shortDescription: string
  gallery?: Array<{ url?: string; alt?: string; width?: number; height?: number; searchTags?: Array<{ value?: string }> }>
  searchTags?: Array<{ value?: string }>
  categories?: Array<ProductCategory | string>
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
  telegramChatId?: string
  analytics?: {
    ga4Enabled?: boolean
    gaMeasurementId?: string
    gaPropertyId?: string
    dailyTelegramReportEnabled?: boolean
    metaPixelEnabled?: boolean
    metaPixelId?: string
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

const fallbackPages: Record<string, PageContent> = {
  'ao-bong-chuyen': {
    id: 'fallback-ao-bong-chuyen',
    title: 'Áo bóng chuyền',
    slug: 'ao-bong-chuyen',
    heroTitle: 'Áo bóng chuyền thiết kế theo màu đội',
    heroText: 'Đặt may áo bóng chuyền cho câu lạc bộ, trường lớp và đội thi đấu với logo, tên số và phối màu riêng.',
    sections: [
      { heading: 'Thiết kế theo đội hình', body: 'Lên màu áo, logo, tên số và chi tiết nhận diện để đội có một bộ trang phục thống nhất.' },
      { heading: 'Chất liệu thi đấu', body: 'Ưu tiên vải thể thao nhẹ, nhanh khô, co giãn và thoải mái khi vận động liên tục.' },
      { heading: 'Tư vấn trước khi may', body: 'Hỗ trợ chọn form áo, phối màu, size và số lượng phù hợp với ngân sách của đội.' },
    ],
  },
  'dat-may-theo-yeu-cau': {
    id: 'fallback-dat-may-theo-yeu-cau',
    title: 'Đặt may theo yêu cầu',
    slug: 'dat-may-theo-yeu-cau',
    heroTitle: 'Đặt may áo bóng chuyền theo yêu cầu',
    heroText: 'Gửi ý tưởng màu sắc, logo, tên đội và số lượng để được tư vấn mẫu áo phù hợp trước khi sản xuất.',
    sections: [
      { heading: 'Nhận brief nhanh', body: 'Trao đổi nhu cầu sử dụng, deadline, số lượng và phong cách thiết kế mong muốn.' },
      { heading: 'Duyệt mẫu rõ ràng', body: 'Chốt bố cục áo, tên số, logo và màu sắc trước khi chuyển sang khâu may in.' },
      { heading: 'May theo size đội', body: 'Tổng hợp size cho từng thành viên để bộ áo khi nhận mặc vừa và đồng bộ.' },
    ],
  },
  'bang-gia': {
    id: 'fallback-bang-gia',
    title: 'Bảng giá',
    slug: 'bang-gia',
    heroTitle: 'Bảng giá may áo bóng chuyền',
    heroText: 'Chi phí phụ thuộc chất liệu, số lượng, kiểu in và mức độ tùy biến trên từng mẫu áo.',
    sections: [
      { heading: 'Số lượng đặt may', body: 'Đơn hàng càng rõ số lượng và size càng dễ tối ưu giá cho đội.' },
      { heading: 'Chi tiết in ấn', body: 'Tên số, logo, nhà tài trợ và họa tiết toàn thân sẽ được tư vấn theo nhu cầu thực tế.' },
      { heading: 'Tối ưu ngân sách', body: 'Có thể cân đối chất liệu, kiểu cổ áo và độ phức tạp thiết kế để phù hợp ngân sách.' },
    ],
  },
  'chat-lieu-size': {
    id: 'fallback-chat-lieu-size',
    title: 'Chất liệu & Size',
    slug: 'chat-lieu-size',
    heroTitle: 'Chất liệu và bảng size áo bóng chuyền',
    heroText: 'Tham khảo chất vải thể thao, form áo và cách gom size trước khi đặt may cho cả đội.',
    sections: [
      { heading: 'Vải thể thao', body: 'Chọn chất liệu thoáng, nhẹ, nhanh khô và giữ màu tốt khi sử dụng thường xuyên.' },
      { heading: 'Form áo thi đấu', body: 'Tư vấn form nam, nữ, libero hoặc áo đội để phù hợp cách vận động trên sân.' },
      { heading: 'Gom size đội', body: 'Chuẩn bị chiều cao, cân nặng hoặc áo mẫu để tư vấn size chính xác hơn.' },
    ],
  },
  'mau-da-lam': {
    id: 'fallback-mau-da-lam',
    title: 'Mẫu đã làm',
    slug: 'mau-da-lam',
    heroTitle: 'Mẫu áo bóng chuyền đã thực hiện',
    heroText: 'Xem các hướng phối màu và ý tưởng thiết kế để chọn phong cách phù hợp cho đội của bạn.',
    sections: [
      { heading: 'Màu đội nổi bật', body: 'Tham khảo cách phối màu để áo dễ nhận diện khi thi đấu và chụp hình.' },
      { heading: 'Logo và tên số', body: 'Các chi tiết nhận diện được đặt ở vị trí dễ nhìn, cân đối với bố cục áo.' },
      { heading: 'Ý tưởng tùy biến', body: 'Có thể phát triển mẫu mới dựa trên màu sắc, biểu tượng hoặc tinh thần riêng của đội.' },
    ],
  },
  blog: {
    id: 'fallback-blog',
    title: 'Blog',
    slug: 'blog',
    heroTitle: 'Kinh nghiệm chọn áo bóng chuyền',
    heroText: 'Gợi ý chọn chất liệu, phối màu, size và cách chuẩn bị thông tin khi đặt may áo bóng chuyền.',
    sections: [
      { heading: 'Chọn áo cho đội', body: 'Ưu tiên sự thoải mái, độ bền và nhận diện đội rõ ràng khi thi đấu.' },
      { heading: 'Chuẩn bị thiết kế', body: 'Gom logo, tên đội, danh sách tên số và màu chủ đạo trước khi yêu cầu tư vấn.' },
      { heading: 'Bảo quản sau khi nhận', body: 'Giặt phơi đúng cách giúp áo giữ form và màu sắc tốt hơn.' },
    ],
  },
}

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
  { label: 'Bảng giá', href: '/bang-gia-may-ao-bong-chuyen/' },
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

export async function hasProductInterestForm() {
  try {
    const slug = await getTenantSlug()
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const settings = await fetchDocs<StoreSettings>(`/api/store-settings?${tenantFilter}&limit=1&depth=0`)
    return Boolean(settings[0]?.telegramChatId?.trim())
  } catch {
    return false
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
  const fallbackPage = fallbackPages[pageSlug]

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
      page: page || fallbackPage,
      settings: settings[0] || { id: 'fallback-settings', siteName: fallbackTenant.name, navigation: fallbackNavigation },
      categories: categories.length ? categories : fallbackCategories,
      products: products.length ? products : fallbackProducts,
    }
  } catch {
    return {
      tenant: fallbackTenant,
      page: fallbackPage,
      settings: { id: 'fallback-settings', siteName: fallbackTenant.name, navigation: fallbackNavigation },
      categories: fallbackCategories,
      products: fallbackProducts,
    }
  }
}

export async function searchProducts(search: string) {
  const slug = await getTenantSlug()
  const query = search.trim()
  if (!query) return []

  try {
    const tenantFilter = `where[tenant.slug][equals]=${slug}`
    const params = new URLSearchParams({
      'where[or][0][name][contains]': query,
      'where[or][1][gallery.searchTags.value][contains]': query,
      'where[or][2][searchTags.value][contains]': query,
      depth: '2',
      limit: '48',
      sort: '-createdAt',
    })
    const products = await fetchDocs<Product>(`/api/products?${tenantFilter}&${params.toString()}`)
    return products.length ? products : fallbackProducts.filter((product) => product.name.toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')))
  } catch {
    return fallbackProducts.filter((product) => product.name.toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')))
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const tenantSlug = await getTenantSlug()
    const params = new URLSearchParams({
      'where[tenant.slug][equals]': tenantSlug,
      'where[slug][equals]': slug,
      'where[publicationStatus][equals]': 'publish',
      depth: '1',
      limit: '1',
    })
    const products = await fetchDocs<Product>(`/api/products?${params.toString()}`)
    return products[0] || null
  } catch {
    return null
  }
}

export function getProductBreadcrumbCategory(product: Product) {
  const categories = (product.categories || []).filter(
    (category): category is ProductCategory => typeof category === 'object',
  )
  if (categories.length) return categories.find((category) => category.group === 'type') || categories[0]

  const text = [
    product.name,
    product.shortDescription,
    ...(product.searchTags || []).map((tag) => tag.value || ''),
    ...(product.gallery || []).flatMap((image) => image.searchTags?.map((tag) => tag.value || '') || []),
  ]
    .join(' ')
    .toLocaleLowerCase('vi-VN')

  return fallbackCategories.find((category) => text.includes(category.slug.replaceAll('-', ' '))) || null
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
