export type SportCategory = {
  slug: string
  index: string
  name: string
  eyebrow: string
  description: string
  tone: string
  image: string
  parentSlug?: string
}

export type CategoryMenuGroup = {
  slug: string
  name: string
  children: Array<{ slug: string; name: string }>
}

export type ProductPreview = {
  id?: number | string
  slug: string
  name: string
  category: string
  categorySlug: string
  categorySlugs?: string[]
  type: string
  image: string
  price?: number | null
  compareAtPrice?: number | null
  currency?: string
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder'
}

export const categories: SportCategory[] = [
  {
    slug: 'bong-da', index: '01', name: 'Bóng đá', eyebrow: 'Tốc độ · Đồng đội', tone: '#ff5b35',
    description: 'Áo bóng đá, giày, quả bóng và phụ kiện cho đội bóng, câu lạc bộ.',
    image: '/images/football.jpg',
  },
  {
    slug: 'cau-long', index: '02', name: 'Cầu lông', eyebrow: 'Linh hoạt · Nhẹ thoáng', tone: '#a7df3d',
    description: 'Áo cầu lông, giày và phụ kiện cho cá nhân, câu lạc bộ hoặc đội nhóm.',
    image: '/images/badminton.jpg',
  },
  {
    slug: 'bong-chuyen', index: '03', name: 'Bóng chuyền', eyebrow: 'Bứt phá · Bền bỉ', tone: '#5d8cff',
    description: 'Áo bóng chuyền, giày, quả bóng và phụ kiện cho đội nam, nữ và giải phong trào.',
    image: '/images/volleyball.jpg',
  },
  {
    slug: 'bong-ro', index: '04', name: 'Bóng rổ', eyebrow: 'Năng lượng · Cá tính', tone: '#ffb52e',
    description: 'Áo bóng rổ, giày, quả bóng và phụ kiện với ngôn ngữ thiết kế mạnh.',
    image: '/images/basketball.jpg',
  },
  {
    slug: 'pickleball', index: '05', name: 'Pickleball', eyebrow: 'Hiện đại · Kết nối', tone: '#20c997',
    description: 'Áo pickleball, giày và phụ kiện cho câu lạc bộ và nhóm bạn.',
    image: '/images/pickleball.jpg',
  },
  {
    slug: 'chay-bo', index: '06', name: 'Chạy bộ', eyebrow: 'Chuyển động · Tự do', tone: '#d66bff',
    description: 'Áo chạy bộ, giày chạy bộ và phụ kiện cho câu lạc bộ hoặc sự kiện.',
    image: '/images/running.jpg',
  },
  {
    slug: 'gaming', index: '07', name: 'Gaming', eyebrow: 'Thi đấu · Bản sắc', tone: '#ff6b2c',
    description: 'Áo gaming và esports thiết kế theo màu sắc, logo và nhận diện riêng của đội tuyển.',
    image: '/images/categories/gaming.webp',
  },
  {
    slug: 'bi-a', index: '08', name: 'Bi-a', eyebrow: 'Tập trung · Lịch lãm', tone: '#36b37e',
    description: 'Áo Bi-a và polo thi đấu với phom gọn, lịch sự cho câu lạc bộ và giải đấu.',
    image: '/images/categories/bi-a.webp',
  },
  {
    slug: 'dong-phuc', index: '09', name: 'Đồng Phục', eyebrow: 'Đồng bộ · Nhận diện', tone: '#ef6a2e',
    description: 'Đồng phục thể thao thiết kế cho đội nhóm, câu lạc bộ, trường học và sự kiện.',
    image: '/images/categories/dong-phuc.webp',
  },
]

export const categoryMenu: CategoryMenuGroup[] = [
  {
    slug: 'bong-da',
    name: 'Bóng đá',
    children: [
      { slug: 'ao-bong-da', name: 'Áo bóng đá' },
      { slug: 'giay-bong-da', name: 'Giày bóng đá' },
      { slug: 'qua-bong-da', name: 'Quả bóng đá' },
      { slug: 'phu-kien-bong-da', name: 'Phụ kiện bóng đá' },
    ],
  },
  {
    slug: 'bong-chuyen',
    name: 'Bóng chuyền',
    children: [
      { slug: 'ao-bong-chuyen', name: 'Áo bóng chuyền' },
      { slug: 'giay-bong-chuyen', name: 'Giày bóng chuyền' },
      { slug: 'qua-bong-chuyen', name: 'Quả bóng chuyền' },
      { slug: 'phu-kien-bong-chuyen', name: 'Phụ kiện bóng chuyền' },
    ],
  },
  {
    slug: 'bong-ro',
    name: 'Bóng rổ',
    children: [
      { slug: 'ao-bong-ro', name: 'Áo bóng rổ' },
      { slug: 'giay-bong-ro', name: 'Giày bóng rổ' },
      { slug: 'qua-bong-ro', name: 'Quả bóng rổ' },
      { slug: 'phu-kien-bong-ro', name: 'Phụ kiện bóng rổ' },
    ],
  },
  {
    slug: 'cau-long',
    name: 'Cầu lông',
    children: [
      { slug: 'ao-cau-long', name: 'Áo cầu lông' },
      { slug: 'giay-cau-long', name: 'Giày cầu lông' },
      { slug: 'phu-kien-cau-long', name: 'Phụ kiện cầu lông' },
    ],
  },
  {
    slug: 'pickleball',
    name: 'Pickleball',
    children: [
      { slug: 'ao-pickleball', name: 'Áo pickleball' },
      { slug: 'giay-pickleball', name: 'Giày pickleball' },
      { slug: 'phu-kien-pickleball', name: 'Phụ kiện pickleball' },
    ],
  },
  {
    slug: 'chay-bo',
    name: 'Chạy bộ',
    children: [
      { slug: 'ao-chay-bo', name: 'Áo chạy bộ' },
      { slug: 'giay-chay-bo', name: 'Giày chạy bộ' },
      { slug: 'phu-kien-chay-bo', name: 'Phụ kiện chạy bộ' },
    ],
  },
]

const parentDesigns = Object.fromEntries(categories.map((category) => [category.slug, category]))

export const categoryDesigns: SportCategory[] = [
  ...categories,
  ...categoryMenu.flatMap((group, groupIndex) => {
    const parent = parentDesigns[group.slug]
    return group.children.map((child, childIndex) => ({
      slug: child.slug,
      index: `${String(groupIndex + 1).padStart(2, '0')}.${childIndex + 1}`,
      name: child.name,
      eyebrow: parent?.eyebrow || 'Trang phục thể thao',
      description: `${child.name} X24Sport cho nhu cầu thi đấu, luyện tập và đội nhóm.`,
      tone: parent?.tone || '#ed642d',
      image: parent?.image || '/images/football.jpg',
      parentSlug: group.slug,
    }))
  }),
  {
    slug: 'phu-kien',
    index: '10',
    name: 'Phụ kiện',
    eyebrow: 'Hoàn thiện · Đồng bộ',
    description: 'Tổng hợp phụ kiện thể thao theo từng bộ môn tại X24Sport.',
    tone: '#174b94',
    image: '/images/categories/dong-phuc.webp',
  },
]

export const products: ProductPreview[] = [
  { slug: 'ao-thi-dau-bong-da', name: 'Áo thi đấu bóng đá', category: 'Bóng đá', categorySlug: 'bong-da', categorySlugs: ['bong-da', 'ao-bong-da'], type: 'Áo đội tuyển', image: '/images/football.jpg' },
  { slug: 'polo-cau-long', name: 'Polo cầu lông', category: 'Cầu lông', categorySlug: 'cau-long', categorySlugs: ['cau-long', 'ao-cau-long'], type: 'Polo thể thao', image: '/images/badminton.jpg' },
  { slug: 'set-bong-chuyen', name: 'Set bóng chuyền', category: 'Bóng chuyền', categorySlug: 'bong-chuyen', categorySlugs: ['bong-chuyen', 'ao-bong-chuyen'], type: 'Đồng phục đội', image: '/images/volleyball.jpg' },
  { slug: 'jersey-bong-ro', name: 'Jersey bóng rổ', category: 'Bóng rổ', categorySlug: 'bong-ro', categorySlugs: ['bong-ro', 'ao-bong-ro'], type: 'Jersey thi đấu', image: '/images/basketball.jpg' },
  { slug: 'polo-pickleball', name: 'Polo pickleball', category: 'Pickleball', categorySlug: 'pickleball', categorySlugs: ['pickleball', 'ao-pickleball'], type: 'Polo câu lạc bộ', image: '/images/pickleball.jpg' },
  { slug: 'singlet-chay-bo', name: 'Singlet chạy bộ', category: 'Chạy bộ', categorySlug: 'chay-bo', categorySlugs: ['chay-bo', 'ao-chay-bo'], type: 'Áo sự kiện', image: '/images/running.jpg' },
  { slug: 'ao-khoi-dong', name: 'Áo khởi động đội', category: 'Bóng đá', categorySlug: 'bong-da', categorySlugs: ['bong-da', 'ao-bong-da'], type: 'Training top', image: '/images/football.jpg' },
  { slug: 'ao-cau-long-co-tron', name: 'Áo cầu lông cổ tròn', category: 'Cầu lông', categorySlug: 'cau-long', categorySlugs: ['cau-long', 'ao-cau-long'], type: 'Áo thi đấu', image: '/images/badminton.jpg' },
]

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug)
}
