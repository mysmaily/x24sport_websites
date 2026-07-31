export type CatalogFilter = {
  label: string
  href: string
  slug: string
  group: 'type' | 'color'
  tag: string
  title: string
  description: string
  guidance: string[]
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
    guidance: [
      'Phù hợp đội thích cảm giác thoáng vai, nhẹ tay khi giao bóng và di chuyển liên tục.',
      'Có thể phối màu nổi, thêm logo CLB, tên số và slogan giải đấu.',
      'Nên chốt size kỹ vì form sát nách cần vừa vai và không rộng nách quá mức.',
    ],
  },
  {
    label: 'Áo cổ trụ',
    href: '/ao-pickleball-co-tru',
    slug: 'ao-pickleball-co-tru',
    group: 'type',
    tag: 'cổ bẻ tay ngắn',
    title: 'Áo pickleball cổ trụ | MayaoPickleball',
    description: 'Mẫu áo pickleball cổ trụ đặt may cho đội nhóm, form thi đấu gọn và dễ in logo CLB.',
    guidance: [
      'Hợp CLB, doanh nghiệp và đội thi đấu cần vẻ chỉn chu khi chụp ảnh hoặc trao giải.',
      'Cổ trụ dễ đặt logo ngực, logo tay áo và tên đội ở mặt sau.',
      'Có thể chọn form nam nữ đồng bộ nhưng vẫn giữ độ thoải mái khi vào sân.',
    ],
  },
  {
    label: 'Áo cổ tròn',
    href: '/ao-pickleball-co-tron',
    slug: 'ao-pickleball-co-tron',
    group: 'type',
    tag: 'cổ tròn',
    title: 'Áo pickleball cổ tròn | MayaoPickleball',
    description: 'Mẫu áo pickleball cổ tròn nhẹ, thoáng, phù hợp đội pickleball nam nữ và giải phong trào.',
    guidance: [
      'Dễ mặc cho đội đông người, trường lớp và nhóm chơi phong trào.',
      'Phù hợp thiết kế trẻ, màu sáng, số áo lớn và họa tiết thể thao.',
      'Nên chọn chất vải thoáng để áo nhẹ khi chơi ngoài trời.',
    ],
  },
]

export const catalogColorFilters: CatalogFilter[] = [
  { label: 'Áo màu đỏ', href: '/ao-pickleball-mau-do', slug: 'ao-pickleball-mau-do', group: 'color', tag: 'đỏ', title: 'Áo pickleball màu đỏ | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball màu đỏ đặt may cho CLB, đội thi đấu và trường lớp.', guidance: ['Tông đỏ giúp đội nổi bật trên sân xanh và dễ nhận diện từ xa.', 'Có thể phối thêm trắng, vàng hoặc đen để logo và số áo rõ hơn.', 'Phù hợp giải phong trào, đội doanh nghiệp và CLB muốn màu mạnh.'] },
  { label: 'Áo màu xanh', href: '/ao-pickleball-mau-xanh', slug: 'ao-pickleball-mau-xanh', group: 'color', tag: 'xanh', title: 'Áo pickleball màu xanh | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball màu xanh, xanh navy, xanh ngọc và các phối màu nổi bật.', guidance: ['Màu xanh dễ phối logo CLB, hợp sân ngoài trời và ảnh đội.', 'Có thể chọn xanh navy cho cảm giác chỉn chu hoặc xanh ngọc để trẻ hơn.', 'Nên dùng số áo trắng hoặc vàng nhạt để tăng độ tương phản.'] },
  { label: 'Áo màu đen', href: '/ao-pickleball-mau-den', slug: 'ao-pickleball-mau-den', group: 'color', tag: 'đen', title: 'Áo pickleball màu đen | MayaoPickleball', description: 'Mẫu áo pickleball màu đen đặt may, dễ phối logo và tên số cho đội nhóm.', guidance: ['Màu đen gọn, khỏe và dễ làm nổi logo sáng màu.', 'Phù hợp đội muốn áo ít bám bẩn thị giác khi chơi thường xuyên.', 'Nên thêm mảng màu phụ để áo không bị quá tối khi chụp ảnh tập thể.'] },
  { label: 'Áo màu trắng', href: '/ao-pickleball-mau-trang', slug: 'ao-pickleball-mau-trang', group: 'color', tag: 'trắng', title: 'Áo pickleball màu trắng | MayaoPickleball', description: 'Mẫu áo pickleball màu trắng sáng, sạch, phù hợp đồng phục CLB và trường lớp.', guidance: ['Áo trắng tạo cảm giác sáng, sạch và dễ phối với hầu hết logo đội.', 'Phù hợp trường lớp, CLB mới thành lập hoặc team thích phong cách tối giản.', 'Nên thêm viền màu ở cổ, tay hoặc thân áo để tăng nhận diện.'] },
  { label: 'Áo màu vàng', href: '/ao-pickleball-mau-vang', slug: 'ao-pickleball-mau-vang', group: 'color', tag: 'vàng', title: 'Áo pickleball màu vàng | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball màu vàng đặt may, nổi bật trên sân và dễ nhận diện đội.', guidance: ['Tông vàng dễ thấy trong giải đông đội và khi chụp ảnh ngoài trời.', 'Phối vàng với xanh, đen hoặc trắng giúp áo cân bằng hơn.', 'Phù hợp đội trẻ, trường học và sự kiện phong trào cần năng lượng.'] },
  { label: 'Áo màu hồng', href: '/ao-pickleball-mau-hong', slug: 'ao-pickleball-mau-hong', group: 'color', tag: 'hồng', title: 'Áo pickleball màu hồng | MayaoPickleball', description: 'Mẫu áo pickleball màu hồng, hồng pastel và phối màu trẻ trung cho đội nhóm.', guidance: ['Màu hồng hợp đội nữ, team mix hoặc CLB muốn hình ảnh trẻ trung.', 'Có thể phối trắng, tím hoặc xanh navy để áo cân bằng và dễ mặc hơn.', 'Tên số nên dùng tông đậm để đảm bảo đọc rõ trên nền hồng sáng.'] },
  { label: 'Áo màu cam', href: '/ao-pickleball-mau-cam', slug: 'ao-pickleball-mau-cam', group: 'color', tag: 'cam', title: 'Áo pickleball màu cam | MayaoPickleball', description: 'Mẫu áo pickleball màu cam đặt may cho đội muốn tông màu năng lượng và nổi bật.', guidance: ['Tông cam tạo cảm giác năng lượng, hợp giải giao lưu và hoạt động công ty.', 'Có thể phối trắng, đỏ hoặc xanh đậm để số áo nổi hơn.', 'Nên chốt sắc cam theo logo đội để tránh lệch nhận diện thương hiệu.'] },
  { label: 'Áo màu tím', href: '/ao-pickleball-mau-tim', slug: 'ao-pickleball-mau-tim', group: 'color', tag: 'tím', title: 'Áo pickleball màu tím | MayaoPickleball', description: 'Mẫu áo pickleball màu tím đặt may, phối logo và tên số theo nhận diện đội.', guidance: ['Màu tím tạo cảm giác khác biệt, hợp đội muốn áo không trùng màu phổ biến.', 'Phối tím với trắng, hồng hoặc vàng nhạt giúp họa tiết nhẹ hơn.', 'Nên kiểm tra logo trước khi may để tránh màu logo chìm trên nền tím.'] },
  { label: 'Áo gradient', href: '/ao-pickleball-gradient', slug: 'ao-pickleball-gradient', group: 'color', tag: 'gradient', title: 'Áo pickleball gradient | MayaoPickleball', description: 'Tổng hợp mẫu áo pickleball gradient, chuyển màu hiện đại cho CLB và đội thi đấu.', guidance: ['Gradient hợp đội muốn áo hiện đại, chuyển màu mạnh và nổi trên sân.', 'Nên giữ vùng logo đủ sạch để thương hiệu đội không bị chìm vào họa tiết.', 'Tên số cần tương phản rõ với nền chuyển sắc ở mặt lưng.'] },
]

export const catalogFilters = [...catalogTypeFilters, ...catalogColorFilters]

export function getCatalogFilterBySlug(slug: string) {
  return catalogFilters.find((filter) => filter.slug === slug) || null
}
