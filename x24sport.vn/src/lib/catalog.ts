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
  children: Array<{ slug: string; name: string; description?: string }>
}

export type CategorySeoProfile = {
  role: 'parent' | 'child' | 'standalone'
  title: string
  description: string
  intro: string
  parent?: { slug: string; name: string }
  siblings: Array<{ slug: string; name: string; description?: string }>
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
    slug: 'ao-gaming', index: '07', name: 'Áo Gaming', eyebrow: 'Thi đấu · Bản sắc', tone: '#ff6b2c',
    description: 'Áo gaming và esports thiết kế theo màu sắc, logo và nhận diện riêng của đội tuyển.',
    image: '/images/categories/gaming.webp',
  },
  {
    slug: 'ao-bi-a', index: '08', name: 'Áo Bi-a', eyebrow: 'Tập trung · Lịch lãm', tone: '#36b37e',
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
      { slug: 'ao-bong-da', name: 'Áo bóng đá', description: 'Áo bóng đá thiết kế theo yêu cầu, áo đá banh in tên số, áo đội bóng và đồng phục câu lạc bộ.' },
      { slug: 'giay-bong-da', name: 'Giày bóng đá', description: 'Giày bóng đá sân cỏ nhân tạo, sân futsal và phụ kiện giày cho luyện tập, thi đấu.' },
      { slug: 'qua-bong-da', name: 'Quả bóng đá', description: 'Quả bóng đá tập luyện, thi đấu phong trào, phù hợp đội bóng, trường học và câu lạc bộ.' },
      { slug: 'phu-kien-bong-da', name: 'Phụ kiện bóng đá', description: 'Phụ kiện bóng đá cho đội nhóm: tất, băng đội trưởng, túi, bảo hộ và đồ dùng sân bóng.' },
    ],
  },
  {
    slug: 'bong-chuyen',
    name: 'Bóng chuyền',
    children: [
      { slug: 'ao-bong-chuyen', name: 'Áo bóng chuyền', description: 'Áo bóng chuyền nam nữ, áo libero, áo đội tuyển và đồng phục giải phong trào.' },
      { slug: 'giay-bong-chuyen', name: 'Giày bóng chuyền', description: 'Giày bóng chuyền hỗ trợ bật nhảy, bám sân và vận động cường độ cao.' },
      { slug: 'qua-bong-chuyen', name: 'Quả bóng chuyền', description: 'Quả bóng chuyền tập luyện, thi đấu, bóng chuyền hơi và bóng cho đội nhóm.' },
      { slug: 'phu-kien-bong-chuyen', name: 'Phụ kiện bóng chuyền', description: 'Phụ kiện bóng chuyền: bó gối, tất, túi, băng cổ tay và đồ dùng luyện tập.' },
    ],
  },
  {
    slug: 'bong-ro',
    name: 'Bóng rổ',
    children: [
      { slug: 'ao-bong-ro', name: 'Áo bóng rổ', description: 'Áo bóng rổ jersey, áo ba lỗ bóng rổ, đồng phục đội bóng và áo in tên số.' },
      { slug: 'giay-bong-ro', name: 'Giày bóng rổ', description: 'Giày bóng rổ hỗ trợ cổ chân, độ bám sân và phong cách thi đấu cá tính.' },
      { slug: 'qua-bong-ro', name: 'Quả bóng rổ', description: 'Quả bóng rổ luyện tập, thi đấu, bóng indoor và outdoor cho đội nhóm.' },
      { slug: 'phu-kien-bong-ro', name: 'Phụ kiện bóng rổ', description: 'Phụ kiện bóng rổ: tất, băng tay, túi, bóng và đồ dùng luyện tập.' },
    ],
  },
  {
    slug: 'cau-long',
    name: 'Cầu lông',
    children: [
      { slug: 'ao-cau-long', name: 'Áo cầu lông', description: 'Áo cầu lông nam nữ, áo đội nhóm, áo câu lạc bộ và áo giải phong trào.' },
      { slug: 'giay-cau-long', name: 'Giày cầu lông', description: 'Giày cầu lông nhẹ, bám sân, hỗ trợ di chuyển nhanh và đổi hướng liên tục.' },
      { slug: 'phu-kien-cau-long', name: 'Phụ kiện cầu lông', description: 'Phụ kiện cầu lông: vớ, túi, băng cổ tay, phụ kiện sân và đồ dùng thi đấu.' },
    ],
  },
  {
    slug: 'pickleball',
    name: 'Pickleball',
    children: [
      { slug: 'ao-pickleball', name: 'Áo pickleball', description: 'Áo pickleball, polo pickleball, váy áo câu lạc bộ và đồng phục đội nhóm.' },
      { slug: 'giay-pickleball', name: 'Giày pickleball', description: 'Giày pickleball bám sân, ổn định cổ chân và phù hợp di chuyển ngang liên tục.' },
      { slug: 'phu-kien-pickleball', name: 'Phụ kiện pickleball', description: 'Phụ kiện pickleball cho luyện tập và thi đấu: vớ, túi, băng tay và đồ dùng sân.' },
    ],
  },
  {
    slug: 'chay-bo',
    name: 'Chạy bộ',
    children: [
      { slug: 'ao-chay-bo', name: 'Áo chạy bộ', description: 'Áo chạy bộ, singlet chạy bộ, áo sự kiện marathon và đồng phục câu lạc bộ chạy.' },
      { slug: 'giay-chay-bo', name: 'Giày chạy bộ', description: 'Giày chạy bộ cho luyện tập, race day, chạy road và chạy bộ phong trào.' },
      { slug: 'phu-kien-chay-bo', name: 'Phụ kiện chạy bộ', description: 'Phụ kiện chạy bộ: vớ, túi, nón, băng đô và đồ dùng cho runner.' },
    ],
  },
  { slug: 'ao-gaming', name: 'Áo Gaming', children: [] },
  { slug: 'ao-bi-a', name: 'Áo Bi-a', children: [] },
  {
    slug: 'dong-phuc',
    name: 'Đồng Phục',
    children: [
      { slug: 'dong-phuc-cong-ty', name: 'Đồng Phục Công Ty', description: 'Đồng phục công ty thiết kế đồng bộ cho văn phòng, sự kiện, team building và nhận diện thương hiệu.' },
      { slug: 'dong-phuc-lop-truong-hoc', name: 'Đồng Phục Lớp - Trường Học', description: 'Đồng phục lớp, trường học và câu lạc bộ học sinh với thiết kế riêng theo tập thể.' },
      { slug: 'dong-phuc-tre-em', name: 'Đồng Phục Trẻ Em', description: 'Đồng phục trẻ em cho trường học, đội nhóm, sự kiện và hoạt động thể thao.' },
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
      description: child.description || `${child.name} X24Sport cho nhu cầu thi đấu, luyện tập và đội nhóm.`,
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

export function getCategoryMenuGroup(slug: string) {
  return categoryMenu.find((group) => group.slug === slug)
}

export function getCategoryParentGroup(slug: string) {
  return categoryMenu.find((group) => group.children.some((child) => child.slug === slug))
}

function lowerFirst(value: string) {
  return value.charAt(0).toLocaleLowerCase('vi-VN') + value.slice(1)
}

function categoryListLabel(items: Array<{ name: string }>) {
  if (items.length <= 1) return items[0]?.name || ''
  const names = items.map((item) => lowerFirst(item.name))
  return `${names.slice(0, -1).join(', ')} và ${names[names.length - 1]}`
}

export function getCategorySeoProfile(category: SportCategory): CategorySeoProfile {
  const group = getCategoryMenuGroup(category.slug)
  if (group?.children.length) {
    const childLabel = categoryListLabel(group.children)
    return {
      role: 'parent',
      title: `${category.name}: ${childLabel}`,
      description: `${category.name} tại X24Sport gồm ${childLabel} cho luyện tập, thi đấu và đội nhóm.`,
      intro: `Khám phá danh mục ${category.name} với các nhóm sản phẩm ${childLabel}. Trang này đóng vai trò tổng hợp để bạn chọn nhanh đúng sản phẩm theo nhu cầu: áo thi đấu, giày, bóng hoặc phụ kiện.`,
      siblings: group.children,
    }
  }

  const parent = getCategoryParentGroup(category.slug)
  if (parent) {
    const child = parent.children.find((item) => item.slug === category.slug)
    const introBySlug: Record<string, string> = {
      'ao-bong-chuyen': 'Bộ sưu tập áo bóng chuyền thiết kế cho đội nam, đội nữ và giải phong trào. Chọn mẫu áo thi đấu, áo libero hoặc đồng phục in tên số theo màu sắc riêng của đội.',
    }
    const siblings = parent.children
    return {
      role: 'child',
      title: `${category.name} thiết kế theo yêu cầu`,
      description: child?.description || category.description || `${category.name} tại X24Sport cho luyện tập, thi đấu và đội nhóm.`,
      intro: introBySlug[category.slug] || child?.description || category.description || `Bộ sưu tập ${category.name} thuộc danh mục ${parent.name}, tập trung vào đúng nhóm sản phẩm bạn đang tìm.`,
      parent: { slug: parent.slug, name: parent.name },
      siblings,
    }
  }

  return {
    role: 'standalone',
    title: category.name,
    description: category.description || `${category.name} tại X24Sport cho luyện tập, thi đấu và đội nhóm.`,
    intro: category.description || `Khám phá danh mục ${category.name} tại X24Sport.`,
    siblings: [],
  }
}
