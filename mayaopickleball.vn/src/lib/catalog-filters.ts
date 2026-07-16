export type CatalogFilter = {
  label: string
  href: string
  slug: string
  group: 'type' | 'color'
  tag: string
  title: string
  description: string
}

export const catalogTypeFilters: CatalogFilter[] = [
  {
    label: 'Áo sát nách',
    href: '/ao-pickleball-sat-nach',
    slug: 'ao-pickleball-sat-nach',
    group: 'type',
    tag: 'không tay',
    title: 'Áo pickleball sát nách | MayaoPickleball',
    description: 'Mẫu áo pickleball sát nách đặt may cho CLB, đội phong trào, in tên số và logo theo yêu cầu.',
  },
  {
    label: 'Áo cổ trụ',
    href: '/ao-pickleball-co-tru',
    slug: 'ao-pickleball-co-tru',
    group: 'type',
    tag: 'cổ bẻ tay ngắn',
    title: 'Áo pickleball cổ trụ | MayaoPickleball',
    description: 'Mẫu áo pickleball cổ trụ đặt may cho đội nhóm, form thi đấu gọn và dễ in logo CLB.',
  },
  {
    label: 'Áo cổ tròn',
    href: '/ao-pickleball-co-tron',
    slug: 'ao-pickleball-co-tron',
    group: 'type',
    tag: 'cổ tròn',
    title: 'Áo pickleball cổ tròn | MayaoPickleball',
    description: 'Mẫu áo pickleball cổ tròn nhẹ, thoáng, phù hợp đội pickleball nam nữ và giải phong trào.',
  },
]

export const catalogColorFilters: CatalogFilter[] = [
  { label: 'Áo màu đỏ', href: '/ao-pickleball-mau-do', slug: 'ao-pickleball-mau-do', group: 'color', tag: 'đỏ', title: 'Áo pickleball màu đỏ | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball màu đỏ đặt may cho CLB, đội thi đấu và trường lớp.' },
  { label: 'Áo màu xanh', href: '/ao-pickleball-mau-xanh', slug: 'ao-pickleball-mau-xanh', group: 'color', tag: 'xanh', title: 'Áo pickleball màu xanh | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball màu xanh, xanh navy, xanh ngọc và các phối màu nổi bật.' },
  { label: 'Áo màu đen', href: '/ao-pickleball-mau-den', slug: 'ao-pickleball-mau-den', group: 'color', tag: 'đen', title: 'Áo pickleball màu đen | MayaoPickleball', description: 'Mẫu áo pickleball màu đen đặt may, dễ phối logo và tên số cho đội nhóm.' },
  { label: 'Áo màu trắng', href: '/ao-pickleball-mau-trang', slug: 'ao-pickleball-mau-trang', group: 'color', tag: 'trắng', title: 'Áo pickleball màu trắng | MayaoPickleball', description: 'Mẫu áo pickleball màu trắng sáng, sạch, phù hợp đồng phục CLB và trường lớp.' },
  { label: 'Áo màu vàng', href: '/ao-pickleball-mau-vang', slug: 'ao-pickleball-mau-vang', group: 'color', tag: 'vàng', title: 'Áo pickleball màu vàng | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball màu vàng đặt may, nổi bật trên sân và dễ nhận diện đội.' },
  { label: 'Áo màu hồng', href: '/ao-pickleball-mau-hong', slug: 'ao-pickleball-mau-hong', group: 'color', tag: 'hồng', title: 'Áo pickleball màu hồng | MayaoPickleball', description: 'Mẫu áo pickleball màu hồng, hồng pastel và phối màu trẻ trung cho đội nhóm.' },
  { label: 'Áo màu cam', href: '/ao-pickleball-mau-cam', slug: 'ao-pickleball-mau-cam', group: 'color', tag: 'cam', title: 'Áo pickleball màu cam | MayaoPickleball', description: 'Mẫu áo pickleball màu cam đặt may cho đội muốn tông màu năng lượng và nổi bật.' },
  { label: 'Áo màu tím', href: '/ao-pickleball-mau-tim', slug: 'ao-pickleball-mau-tim', group: 'color', tag: 'tím', title: 'Áo pickleball màu tím | MayaoPickleball', description: 'Mẫu áo pickleball màu tím đặt may, phối logo và tên số theo nhận diện đội.' },
  { label: 'Áo gradient', href: '/ao-pickleball-gradient', slug: 'ao-pickleball-gradient', group: 'color', tag: 'gradient', title: 'Áo pickleball gradient | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball gradient, chuyển màu hiện đại cho CLB và đội thi đấu.' },
]

export const catalogFilters = [...catalogTypeFilters, ...catalogColorFilters]

export function getCatalogFilterBySlug(slug: string) {
  return catalogFilters.find((filter) => filter.slug === slug) || null
}
