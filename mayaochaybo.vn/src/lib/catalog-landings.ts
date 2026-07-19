export type CatalogLanding = {
  slug: string
  path: string
  navLabel: string
  heading: string
  title: string
  description: string
  group: 'type' | 'color'
  swatch?: string
}

export const TYPE_LANDINGS: CatalogLanding[] = [
  {
    slug: 'ao-chay-bo-co-do-sao-vang',
    path: '/ao-chay-bo-co-do-sao-vang/',
    navLabel: 'Áo cờ đỏ sao vàng',
    heading: 'Áo chạy bộ cờ đỏ sao vàng',
    title: 'Áo Chạy Bộ Cờ Đỏ Sao Vàng Thiết Kế Theo Yêu Cầu',
    description: 'Khám phá mẫu áo chạy bộ cờ đỏ sao vàng dành cho giải chạy, sự kiện và đội nhóm; hỗ trợ tùy chỉnh logo, tên và thông điệp riêng.',
    group: 'type',
  },
  {
    slug: 'ao-chay-bo-co-tay',
    path: '/ao-chay-bo-co-tay/',
    navLabel: 'Áo chạy bộ có tay',
    heading: 'Áo chạy bộ có tay',
    title: 'Áo Chạy Bộ Có Tay Cho Công Ty, Giải Chạy & Đội Nhóm',
    description: 'Bộ sưu tập áo chạy bộ có tay cho công ty, giải chạy, event và đội nhóm, với nhiều phối màu và thiết kế có thể tùy chỉnh theo yêu cầu.',
    group: 'type',
  },
  {
    slug: 'ao-chay-bo-sat-nach',
    path: '/ao-chay-bo-sat-nach/',
    navLabel: 'Áo chạy bộ sát nách',
    heading: 'Áo chạy bộ sát nách',
    title: 'Áo Chạy Bộ Sát Nách Thiết Kế Cho Đội & Giải Chạy',
    description: 'Chọn mẫu áo chạy bộ sát nách thoáng nhẹ cho câu lạc bộ, đội nhóm và giải chạy; tùy chỉnh màu sắc, logo và thông tin sự kiện.',
    group: 'type',
  },
  {
    slug: 'may-ao-chay-bo-thiet-ke-rieng-x24',
    path: '/may-ao-chay-bo-thiet-ke-rieng-x24/',
    navLabel: 'Áo chạy bộ thiết kế riêng',
    heading: 'Áo chạy bộ thiết kế riêng',
    title: 'May Áo Chạy Bộ Thiết Kế Riêng Cho Công Ty & Event',
    description: 'Đặt may áo chạy bộ thiết kế riêng cho công ty, giải chạy, event và đội nhóm; phát triển mẫu theo màu thương hiệu, logo và thông điệp riêng.',
    group: 'type',
  },
]

export const COLOR_LANDINGS: CatalogLanding[] = [
  ['den', 'đen', '#111827', 'mạnh mẽ và dễ phối nhận diện'],
  ['trang', 'trắng', '#f8fafc', 'tối giản, sáng và dễ làm nổi bật logo'],
  ['xanh', 'xanh', '#1688e8', 'năng động cho đội nhóm và giải chạy'],
  ['do', 'đỏ', '#e11d48', 'nổi bật, giàu năng lượng trên đường chạy'],
  ['vang', 'vàng', '#fbbf24', 'rực rỡ và dễ nhận diện từ xa'],
  ['cam', 'cam', '#f97316', 'trẻ trung, nổi bật cho event'],
  ['hong', 'hồng', '#ec4899', 'tươi mới cho đội nhóm và chiến dịch'],
  ['tim', 'tím', '#7c3aed', 'cá tính và khác biệt'],
  ['gradient', 'gradient', 'linear-gradient(135deg,#f97316 0%,#ec4899 48%,#2563eb 100%)', 'chuyển màu hiện đại và giàu chuyển động'],
].map(([slug, color, swatch, benefit]) => ({
  slug,
  path: `/mau-sac/${slug}/`,
  navLabel: `Áo màu ${color}`,
  heading: `Áo chạy bộ màu ${color}`,
  title: `Áo Chạy Bộ Màu ${color.charAt(0).toUpperCase()}${color.slice(1)} Thiết Kế Theo Yêu Cầu`,
  description: `Khám phá mẫu áo chạy bộ màu ${color} ${benefit}; có thể tùy chỉnh logo, tên và nội dung cho công ty, giải chạy hoặc đội nhóm.`,
  group: 'color' as const,
  swatch,
}))

export const CATALOG_LANDINGS = [...TYPE_LANDINGS, ...COLOR_LANDINGS]

export function getCatalogLanding(slug?: string | null, path?: string | null) {
  return CATALOG_LANDINGS.find((item) => item.slug === slug || item.path === path)
}
