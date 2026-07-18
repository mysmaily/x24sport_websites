export type CatalogLanding = {
  slug: string
  path: string
  label: string
  query: string
  title: string
  description: string
  metaDescription?: string
  aliases?: string[]
}

export type CatalogColorLanding = CatalogLanding & { swatch: string }

export const STUDENT_CATALOG_LANDING: CatalogLanding = {
  slug: 'ao-bong-ro-hoc-sinh',
  path: '/san-pham/ao-bong-ro-hoc-sinh/',
  label: 'Học sinh',
  query: 'học sinh',
  title: 'Các mẫu áo bóng rổ học sinh',
  description: 'Tổng hợp mẫu áo bóng rổ dành cho đội lớp và trường học, có thể điều chỉnh màu, logo, tên và số theo danh sách của đội.',
  aliases: ['áo bóng rổ học sinh', 'mẫu áo bóng rổ học sinh'],
}

export const CATALOG_COLOR_LANDINGS: CatalogColorLanding[] = [
  {
    slug: 'ao-bong-ro-mau-xanh',
    path: '/san-pham/ao-bong-ro-mau-xanh/',
    label: 'Xanh',
    query: 'xanh',
    title: 'Các mẫu áo bóng rổ màu xanh',
    description: 'Khám phá các mẫu áo bóng rổ màu xanh từ tông đậm đến tông sáng, có thể trao đổi lại màu phối, logo, tên và số theo đội.',
    swatch: 'bg-gradient-to-br from-sky-400 to-blue-700',
  },
  {
    slug: 'ao-bong-ro-mau-do',
    path: '/san-pham/ao-bong-ro-mau-do/',
    label: 'Đỏ',
    query: 'đỏ',
    title: 'Các mẫu áo bóng rổ màu đỏ',
    description: 'Xem các mẫu áo bóng rổ màu đỏ và những cách phối đỏ với tông sáng hoặc tối, có thể tùy chỉnh logo, tên và số cho đội.',
    swatch: 'bg-gradient-to-br from-red-400 to-red-700',
  },
  {
    slug: 'ao-bong-ro-mau-vang',
    path: '/san-pham/ao-bong-ro-mau-vang/',
    label: 'Vàng',
    query: 'vàng',
    title: 'Các mẫu áo bóng rổ màu vàng',
    description: 'Tổng hợp các mẫu áo bóng rổ màu vàng với nhiều kiểu phối tương phản, dùng làm điểm bắt đầu để trao đổi thiết kế đồng phục cho đội.',
    swatch: 'bg-gradient-to-br from-amber-300 to-yellow-500',
  },
  {
    slug: 'ao-bong-ro-mau-cam',
    path: '/san-pham/ao-bong-ro-mau-cam/',
    label: 'Cam',
    query: 'cam',
    title: 'Các mẫu áo bóng rổ màu cam',
    description: 'Khám phá các mẫu áo bóng rổ màu cam, từ phối cam chủ đạo đến cam làm điểm nhấn, có thể điều chỉnh theo màu nhận diện của đội.',
    swatch: 'bg-gradient-to-br from-orange-300 to-orange-600',
  },
  {
    slug: 'ao-bong-ro-mau-tim',
    path: '/san-pham/ao-bong-ro-mau-tim/',
    label: 'Tím',
    query: 'tím',
    title: 'Các mẫu áo bóng rổ màu tím',
    description: 'Xem các mẫu áo bóng rổ màu tím và những phương án phối tím đậm, tím sáng hoặc tương phản để phát triển thiết kế riêng cho đội.',
    swatch: 'bg-gradient-to-br from-violet-400 to-purple-700',
  },
  {
    slug: 'ao-bong-ro-mau-den',
    path: '/san-pham/ao-bong-ro-mau-den/',
    label: 'Đen',
    query: 'đen',
    title: 'Các mẫu áo bóng rổ màu đen',
    description: 'Tổng hợp các mẫu áo bóng rổ màu đen với nhiều màu nhấn khác nhau, có thể thay logo, tên, số và màu phối theo nhu cầu thực tế.',
    swatch: 'bg-gradient-to-br from-slate-600 to-black',
  },
  {
    slug: 'ao-bong-ro-gradient',
    path: '/san-pham/ao-bong-ro-gradient/',
    label: 'Gradient',
    query: 'gradient',
    title: 'Các mẫu áo bóng rổ gradient chuyển màu',
    description: '',
    metaDescription: 'Tổng hợp thiết kế áo bóng rổ gradient theo nhiều bảng màu, phù hợp cho đội lớp, câu lạc bộ và giải đấu.',
    swatch: 'bg-gradient-to-br from-cyan-400 via-violet-500 to-orange-400',
    aliases: ['chuyển màu', 'mẫu chuyển màu'],
  },
]

export const CATALOG_LANDINGS: CatalogLanding[] = [STUDENT_CATALOG_LANDING, ...CATALOG_COLOR_LANDINGS]

function normalizeCatalogQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function getCatalogLandingBySlug(slug: string) {
  return CATALOG_LANDINGS.find((landing) => landing.slug === slug)
}

export function getCatalogLandingByQuery(query: string) {
  const normalized = normalizeCatalogQuery(query)
  return CATALOG_LANDINGS.find((landing) => {
    const terms = [landing.query, landing.label, `màu ${landing.query}`, `áo bóng rổ màu ${landing.query}`, ...(landing.aliases || [])]
    return terms.some((term) => normalizeCatalogQuery(term) === normalized)
  })
}
