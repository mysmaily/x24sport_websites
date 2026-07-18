export type SportCategory = {
  slug: string
  index: string
  name: string
  eyebrow: string
  description: string
  tone: string
  image: string
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
    description: 'Áo đấu, quần thi đấu và bộ đồng phục cho đội bóng, câu lạc bộ.',
    image: '/images/football.jpg',
  },
  {
    slug: 'cau-long', index: '02', name: 'Cầu lông', eyebrow: 'Linh hoạt · Nhẹ thoáng', tone: '#a7df3d',
    description: 'Áo cổ tròn, polo và set thi đấu cho cá nhân hoặc đội nhóm.',
    image: '/images/badminton.jpg',
  },
  {
    slug: 'bong-chuyen', index: '03', name: 'Bóng chuyền', eyebrow: 'Bứt phá · Bền bỉ', tone: '#5d8cff',
    description: 'Đồng phục thi đấu cho đội nam, nữ và các giải phong trào.',
    image: '/images/volleyball.jpg',
  },
  {
    slug: 'bong-ro', index: '04', name: 'Bóng rổ', eyebrow: 'Năng lượng · Cá tính', tone: '#ffb52e',
    description: 'Jersey, tank top và quần thi đấu với ngôn ngữ thiết kế mạnh.',
    image: '/images/basketball.jpg',
  },
  {
    slug: 'pickleball', index: '05', name: 'Pickleball', eyebrow: 'Hiện đại · Kết nối', tone: '#20c997',
    description: 'Áo chơi, polo và váy thể thao cho câu lạc bộ và nhóm bạn.',
    image: '/images/pickleball.jpg',
  },
  {
    slug: 'chay-bo', index: '06', name: 'Chạy bộ', eyebrow: 'Chuyển động · Tự do', tone: '#d66bff',
    description: 'Áo chạy, singlet và đồng phục cho câu lạc bộ hoặc sự kiện.',
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

export const products: ProductPreview[] = [
  { slug: 'ao-thi-dau-bong-da', name: 'Áo thi đấu bóng đá', category: 'Bóng đá', categorySlug: 'bong-da', type: 'Áo đội tuyển', image: '/images/football.jpg' },
  { slug: 'polo-cau-long', name: 'Polo cầu lông', category: 'Cầu lông', categorySlug: 'cau-long', type: 'Polo thể thao', image: '/images/badminton.jpg' },
  { slug: 'set-bong-chuyen', name: 'Set bóng chuyền', category: 'Bóng chuyền', categorySlug: 'bong-chuyen', type: 'Đồng phục đội', image: '/images/volleyball.jpg' },
  { slug: 'jersey-bong-ro', name: 'Jersey bóng rổ', category: 'Bóng rổ', categorySlug: 'bong-ro', type: 'Jersey thi đấu', image: '/images/basketball.jpg' },
  { slug: 'polo-pickleball', name: 'Polo pickleball', category: 'Pickleball', categorySlug: 'pickleball', type: 'Polo câu lạc bộ', image: '/images/pickleball.jpg' },
  { slug: 'singlet-chay-bo', name: 'Singlet chạy bộ', category: 'Chạy bộ', categorySlug: 'chay-bo', type: 'Áo sự kiện', image: '/images/running.jpg' },
  { slug: 'ao-khoi-dong', name: 'Áo khởi động đội', category: 'Bóng đá', categorySlug: 'bong-da', type: 'Training top', image: '/images/football.jpg' },
  { slug: 'ao-cau-long-co-tron', name: 'Áo cầu lông cổ tròn', category: 'Cầu lông', categorySlug: 'cau-long', type: 'Áo thi đấu', image: '/images/badminton.jpg' },
]

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug)
}
