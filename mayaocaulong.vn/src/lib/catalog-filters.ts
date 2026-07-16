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
    href: '/ao-cau-long-sat-nach',
    slug: 'ao-cau-long-sat-nach',
    group: 'type',
    tag: 'không tay',
    title: 'Áo cầu lông sát nách | MayaoCauLong',
    description: 'Mẫu áo cầu lông sát nách đặt may cho CLB, đội phong trào, in tên số và logo theo yêu cầu.',
  },
  {
    label: 'Áo cổ trụ',
    href: '/ao-cau-long-co-tru',
    slug: 'ao-cau-long-co-tru',
    group: 'type',
    tag: 'cổ bẻ tay ngắn',
    title: 'Áo cầu lông cổ trụ | MayaoCauLong',
    description: 'Mẫu áo cầu lông cổ trụ đặt may cho đội nhóm, form thi đấu gọn và dễ in logo CLB.',
  },
  {
    label: 'Áo cổ tròn',
    href: '/ao-cau-long-co-tron',
    slug: 'ao-cau-long-co-tron',
    group: 'type',
    tag: 'cổ tròn',
    title: 'Áo cầu lông cổ tròn | MayaoCauLong',
    description: 'Mẫu áo cầu lông cổ tròn nhẹ, thoáng, phù hợp đội cầu lông nam nữ và giải phong trào.',
  },
]

export const catalogColorFilters: CatalogFilter[] = [
  { label: 'Áo màu đỏ', href: '/ao-cau-long-mau-do', slug: 'ao-cau-long-mau-do', group: 'color', tag: 'đỏ', title: 'Áo cầu lông màu đỏ | MayaoCauLong', description: 'Tổng hợp mẫu áo cầu lông màu đỏ đặt may cho CLB, đội thi đấu và trường lớp.' },
  { label: 'Áo màu xanh', href: '/ao-cau-long-mau-xanh', slug: 'ao-cau-long-mau-xanh', group: 'color', tag: 'xanh', title: 'Áo cầu lông màu xanh | MayaoCauLong', description: 'Tổng hợp mẫu áo cầu lông màu xanh, xanh navy, xanh ngọc và các phối màu nổi bật.' },
  { label: 'Áo màu đen', href: '/ao-cau-long-mau-den', slug: 'ao-cau-long-mau-den', group: 'color', tag: 'đen', title: 'Áo cầu lông màu đen | MayaoCauLong', description: 'Mẫu áo cầu lông màu đen đặt may, dễ phối logo và tên số cho đội nhóm.' },
  { label: 'Áo màu trắng', href: '/ao-cau-long-mau-trang', slug: 'ao-cau-long-mau-trang', group: 'color', tag: 'trắng', title: 'Áo cầu lông màu trắng | MayaoCauLong', description: 'Mẫu áo cầu lông màu trắng sáng, sạch, phù hợp đồng phục CLB và trường lớp.' },
  { label: 'Áo màu vàng', href: '/ao-cau-long-mau-vang', slug: 'ao-cau-long-mau-vang', group: 'color', tag: 'vàng', title: 'Áo cầu lông màu vàng | MayaoCauLong', description: 'Tổng hợp mẫu áo cầu lông màu vàng đặt may, nổi bật trên sân và dễ nhận diện đội.' },
  { label: 'Áo màu hồng', href: '/ao-cau-long-mau-hong', slug: 'ao-cau-long-mau-hong', group: 'color', tag: 'hồng', title: 'Áo cầu lông màu hồng | MayaoCauLong', description: 'Mẫu áo cầu lông màu hồng, hồng pastel và phối màu trẻ trung cho đội nhóm.' },
  { label: 'Áo màu cam', href: '/ao-cau-long-mau-cam', slug: 'ao-cau-long-mau-cam', group: 'color', tag: 'cam', title: 'Áo cầu lông màu cam | MayaoCauLong', description: 'Mẫu áo cầu lông màu cam đặt may cho đội muốn tông màu năng lượng và nổi bật.' },
  { label: 'Áo màu tím', href: '/ao-cau-long-mau-tim', slug: 'ao-cau-long-mau-tim', group: 'color', tag: 'tím', title: 'Áo cầu lông màu tím | MayaoCauLong', description: 'Mẫu áo cầu lông màu tím đặt may, phối logo và tên số theo nhận diện đội.' },
  { label: 'Áo gradient', href: '/ao-cau-long-gradient', slug: 'ao-cau-long-gradient', group: 'color', tag: 'gradient', title: 'Áo cầu lông gradient | MayaoCauLong', description: 'Tổng hợp mẫu áo cầu lông gradient, chuyển màu hiện đại cho CLB và đội thi đấu.' },
]

export const catalogFilters = [...catalogTypeFilters, ...catalogColorFilters]

export function getCatalogFilterBySlug(slug: string) {
  return catalogFilters.find((filter) => filter.slug === slug) || null
}
