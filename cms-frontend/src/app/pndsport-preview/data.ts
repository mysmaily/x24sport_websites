export const previewBase = '/pndsport-preview'

export type PreviewProduct = {
  slug: string
  name: string
  code: string
  category: string
  price: number
  image: string
  tone: string
  badge?: string
}

export const categories = [
  { slug: 'bong-da', name: 'Bóng đá', count: 824, image: 'https://static.x24sport.vn/x24sport/wp-3201.jpg' },
  { slug: 'cau-long', name: 'Cầu lông', count: 516, image: 'https://static.x24sport.vn/x24sport/wp-3199.jpg' },
  { slug: 'bong-chuyen', name: 'Bóng chuyền', count: 328, image: 'https://static.x24sport.vn/x24sport/wp-3197.jpg' },
  { slug: 'pickleball', name: 'Pickleball', count: 471, image: 'https://static.x24sport.vn/x24sport/wp-3195.jpg' },
  { slug: 'chay-bo', name: 'Chạy bộ', count: 392, image: 'https://static.x24sport.vn/mayaochaybo/wp-610-ao-chay-bo-nam-13-1.jpg' },
  { slug: 'bong-ro', name: 'Bóng rổ', count: 287, image: 'https://static.x24sport.vn/mayaobongro/bo-quan-ao-bong-ro-trang-gradient-nang-dong-x24-br-312-cau-thu-vba-chuyen-nghiep.png' },
  { slug: 'gaming', name: 'Gaming', count: 165, image: 'https://static.x24sport.vn/x24sport/wp-3189.jpg' },
  { slug: 'bia', name: 'Bi-a', count: 214, image: 'https://static.x24sport.vn/x24sport/wp-3187.jpg' },
  { slug: 'dong-phuc', name: 'Đồng phục', count: 291, image: 'https://static.x24sport.vn/x24sport/wp-2066.jpg' },
] as const

export const products: PreviewProduct[] = [
  { slug: 'ao-bong-da-pnd-velocity-01', name: 'Áo bóng đá PND Velocity 01', code: 'PND-FB-001', category: 'Bóng đá', price: 129000, image: 'https://static.x24sport.vn/x24sport/wp-3201.jpg', tone: 'Cam / Đen', badge: 'Mẫu nổi bật' },
  { slug: 'ao-cau-long-pnd-flight-08', name: 'Áo cầu lông PND Flight 08', code: 'PND-BD-008', category: 'Cầu lông', price: 139000, image: 'https://static.x24sport.vn/x24sport/wp-3199.jpg', tone: 'Xanh / Trắng' },
  { slug: 'ao-bong-chuyen-pnd-block-12', name: 'Áo bóng chuyền PND Block 12', code: 'PND-VB-012', category: 'Bóng chuyền', price: 149000, image: 'https://static.x24sport.vn/x24sport/wp-3197.jpg', tone: 'Đỏ / Than' },
  { slug: 'ao-pickleball-pnd-rally-04', name: 'Áo pickleball PND Rally 04', code: 'PND-PB-004', category: 'Pickleball', price: 145000, image: 'https://static.x24sport.vn/x24sport/wp-3195.jpg', tone: 'Trắng / Cam', badge: 'Mới' },
  { slug: 'ao-chay-bo-pnd-pace-13', name: 'Áo chạy bộ PND Pace 13', code: 'PND-RN-013', category: 'Chạy bộ', price: 119000, image: 'https://static.x24sport.vn/mayaochaybo/wp-610-ao-chay-bo-nam-13-1.jpg', tone: 'Xanh navy' },
  { slug: 'ao-bong-ro-pnd-jump-21', name: 'Bộ bóng rổ PND Jump 21', code: 'PND-BK-021', category: 'Bóng rổ', price: 179000, image: 'https://static.x24sport.vn/mayaobongro/bo-quan-ao-bong-ro-trang-gradient-nang-dong-x24-br-312-cau-thu-vba-chuyen-nghiep.png', tone: 'Trắng / Cam' },
  { slug: 'ao-gaming-pnd-core-16', name: 'Áo gaming PND Core 16', code: 'PND-GM-016', category: 'Gaming', price: 159000, image: 'https://static.x24sport.vn/x24sport/wp-3189.jpg', tone: 'Đen / Cam' },
  { slug: 'ao-bia-pnd-break-06', name: 'Áo bi-a PND Break 06', code: 'PND-BI-006', category: 'Bi-a', price: 165000, image: 'https://static.x24sport.vn/x24sport/wp-3187.jpg', tone: 'Đen / Xanh' },
]

export const posts = [
  { slug: 'cach-chon-ao-the-thao-cho-doi-nhom', category: 'Kinh nghiệm đặt áo', title: 'Cách chọn áo thể thao cho đội nhóm: bắt đầu từ môn chơi, form và ngân sách', excerpt: 'Một checklist ngắn giúp đội trưởng thu thập đúng thông tin trước khi gửi yêu cầu thiết kế.', read: '6 phút', image: '/images/categories/football-teamwear-promo.webp' },
  { slug: 'chuan-bi-file-logo-in-ao', category: 'Thiết kế & nhận diện', title: 'Chuẩn bị file logo thế nào để hình in trên áo rõ và đúng màu?', excerpt: 'Phân biệt file vector, ảnh nền trong và các thông tin màu sắc nên gửi cho bộ phận thiết kế.', read: '4 phút', image: '/images/categories/badminton-teamwear-promo.webp' },
  { slug: 'huong-dan-tong-hop-size-doi', category: 'Size & chất liệu', title: 'Cách tổng hợp size áo cho cả đội để hạn chế nhầm lẫn', excerpt: 'Mẫu danh sách đơn giản cho tên, số áo, size và ghi chú của từng thành viên.', read: '5 phút', image: '/images/categories/volleyball-teamwear-promo.webp' },
]

export const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`
