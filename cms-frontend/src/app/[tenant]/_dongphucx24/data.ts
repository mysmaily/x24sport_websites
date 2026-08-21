export type DemoCategory = {
  name: string
  slug: string
  eyebrow: string
  description: string
  image: string
}

export type DemoProduct = {
  name: string
  slug: string
  sku: string
  category: string
  image: string
  alt: string
  material: string
  useCase: string
  accent: string
}

export const categories: DemoCategory[] = [
  { name: 'Đồng phục công ty', slug: 'dong-phuc-cong-ty', eyebrow: 'Văn phòng · Showroom', description: 'Polo, sơ mi và áo khoác theo nhận diện đội ngũ.', image: 'https://static.x24sport.vn/mayaodongphuc/ao-polo-dong-phuc-cong-ty-trang-kem-phoi-teal-hinh-hoc-anh-chinh-7120ed5192d2.webp' },
  { name: 'Nhà hàng & F&B', slug: 'dong-phuc-nha-hang-fnb', eyebrow: 'Cafe · Nhà hàng · Bếp', description: 'Phân vai rõ ràng giữa phục vụ, pha chế và bếp.', image: 'https://static.x24sport.vn/mayaodongphuc/set-dong-phuc-fnb-casual-dining-xanh-sand-anh-chinh-c547caf446a4.webp' },
  { name: 'Áo lớp & trường học', slug: 'ao-lop-truong-hoc', eyebrow: 'Lớp · CLB · Trung tâm', description: 'Mẫu trẻ, dễ nhận diện và thuận tiện gom size.', image: 'https://static.x24sport.vn/mayaodongphuc/ao-lop-polo-xanh-hong-vang-thiet-ke-rieng-anh-chinh-32742c27445b.webp' },
  { name: 'Team building & sự kiện', slug: 'team-building-su-kien', eyebrow: 'Outing · Activation', description: 'Màu sắc nổi bật cho hoạt động tập thể và sự kiện.', image: 'https://static.x24sport.vn/mayaodongphuc/ao-thun-cam-kem-song-team-building-anh-chinh-319d0628df2a.webp' },
  { name: 'Bảo hộ & kỹ thuật', slug: 'dong-phuc-bao-ho-ky-thuat', eyebrow: 'Kho · Xưởng · Hiện trường', description: 'Chọn mẫu theo công việc, điều kiện sử dụng và nhận diện.', image: '/images/mayaodongphuc/workwear-olive.webp' },
  { name: 'Y tế & dịch vụ', slug: 'dong-phuc-y-te-dich-vu', eyebrow: 'Spa · Clinic · Chăm sóc', description: 'Phom gọn, màu dịu và nhận diện chuyên nghiệp.', image: '/images/mayaodongphuc/healthcare-tunic.webp' },
]

export const products: DemoProduct[] = [
  { name: 'Polo công ty trắng kem phối teal hình học', slug: 'polo-cong-ty-trang-kem-phoi-teal', sku: 'DPX24-PO-001', category: 'dong-phuc-cong-ty', image: 'https://static.x24sport.vn/mayaodongphuc/ao-polo-dong-phuc-cong-ty-trang-kem-phoi-teal-hinh-hoc-anh-chinh-7120ed5192d2.webp', alt: 'Mẫu polo đồng phục công ty trắng kem phối teal', material: 'Vải polo được tư vấn theo tần suất mặc', useCase: 'Văn phòng & tiếp khách', accent: '#0f766e' },
  { name: 'Polo công ty xanh da trời nhạt thanh lịch', slug: 'polo-cong-ty-xanh-da-troi-nhat', sku: 'DPX24-PO-002', category: 'dong-phuc-cong-ty', image: 'https://static.x24sport.vn/mayaodongphuc/ao-polo-dong-phuc-cong-ty-xanh-da-troi-nhat-thanh-lich-anh-chinh-0f443e422378.webp', alt: 'Mẫu polo đồng phục công ty xanh da trời nhạt', material: 'Phom polo gọn, tùy chỉnh màu nhận diện', useCase: 'Showroom & dịch vụ', accent: '#7dd3fc' },
  { name: 'Polo công ty navy sọc chéo đa màu', slug: 'polo-cong-ty-navy-soc-cheo', sku: 'DPX24-PO-003', category: 'dong-phuc-cong-ty', image: 'https://static.x24sport.vn/mayaodongphuc/ao-polo-dong-phuc-cong-ty-navy-soc-cheo-da-mau-anh-chinh-d0dbe62aec8d.webp', alt: 'Mẫu polo navy sọc chéo đa màu', material: 'Phối màu và logo theo bộ nhận diện', useCase: 'Kinh doanh & sự kiện', accent: '#172554' },
  { name: 'Polo công ty navy phối teal hiện đại', slug: 'polo-cong-ty-navy-teal', sku: 'DPX24-PO-004', category: 'dong-phuc-cong-ty', image: 'https://static.x24sport.vn/mayaodongphuc/ao-polo-dong-phuc-cong-ty-navy-teal-hien-dai-anh-chinh-92cbeee349b8.webp', alt: 'Mẫu polo công ty navy phối teal', material: 'Tùy chỉnh cổ, bo tay và vị trí logo', useCase: 'Đội ngũ doanh nghiệp', accent: '#14b8a6' },
  { name: 'Set F&B casual dining xanh sand', slug: 'set-fnb-casual-dining-xanh-sand', sku: 'DPX24-FB-001', category: 'dong-phuc-nha-hang-fnb', image: 'https://static.x24sport.vn/mayaodongphuc/set-dong-phuc-fnb-casual-dining-xanh-sand-anh-chinh-c547caf446a4.webp', alt: 'Set đồng phục nhà hàng xanh sand', material: 'Set theo vai trò phục vụ và quản lý', useCase: 'Nhà hàng', accent: '#64748b' },
  { name: 'Set F&B kiosk teal vàng', slug: 'set-fnb-kiosk-teal-vang', sku: 'DPX24-FB-002', category: 'dong-phuc-nha-hang-fnb', image: 'https://static.x24sport.vn/mayaodongphuc/set-dong-phuc-fnb-kiosk-teal-vang-anh-chinh-c94716a1523c.webp', alt: 'Set đồng phục kiosk teal vàng', material: 'Màu nhận diện nổi bật trong không gian bán hàng', useCase: 'Kiosk & take-away', accent: '#0f766e' },
  { name: 'Set F&B buffet wine charcoal', slug: 'set-fnb-buffet-wine-charcoal', sku: 'DPX24-FB-003', category: 'dong-phuc-nha-hang-fnb', image: 'https://static.x24sport.vn/mayaodongphuc/set-dong-phuc-fnb-buffet-wine-charcoal-anh-chinh-92096338af65.webp', alt: 'Set đồng phục buffet wine charcoal', material: 'Phối set và phụ kiện theo từng vị trí', useCase: 'Buffet & tiệc', accent: '#7f1d1d' },
  { name: 'Set F&B bakery cocoa beige', slug: 'set-fnb-bakery-cocoa-beige', sku: 'DPX24-FB-004', category: 'dong-phuc-nha-hang-fnb', image: 'https://static.x24sport.vn/mayaodongphuc/set-dong-phuc-fnb-bakery-cocoa-beige-anh-chinh-22b796e0bd91.webp', alt: 'Set đồng phục bakery cocoa beige', material: 'Áo và tạp dề đồng bộ nhận diện', useCase: 'Bakery & cafe', accent: '#92400e' },
  { name: 'Áo lớp polo xanh hồng vàng thiết kế riêng', slug: 'ao-lop-polo-xanh-hong-vang', sku: 'DPX24-SC-001', category: 'ao-lop-truong-hoc', image: 'https://static.x24sport.vn/mayaodongphuc/ao-lop-polo-xanh-hong-vang-thiet-ke-rieng-anh-chinh-32742c27445b.webp', alt: 'Áo lớp polo xanh hồng vàng', material: 'Phối màu, logo và tên lớp theo yêu cầu', useCase: 'Lớp học & CLB', accent: '#ec4899' },
  { name: 'Áo lớp polo kem xanh thiết kế riêng', slug: 'ao-lop-polo-kem-xanh', sku: 'DPX24-SC-002', category: 'ao-lop-truong-hoc', image: 'https://static.x24sport.vn/mayaodongphuc/ao-lop-polo-kem-xanh-thiet-ke-rieng-anh-chinh-eaa78d6e41a4.webp', alt: 'Áo lớp polo kem xanh', material: 'Phom dễ mặc và thuận tiện gom size', useCase: 'Trường học & trung tâm', accent: '#22c55e' },
  { name: 'Áo thun trắng xanh splash team building', slug: 'ao-thun-trang-xanh-splash-team-building', sku: 'DPX24-TB-001', category: 'team-building-su-kien', image: 'https://static.x24sport.vn/mayaodongphuc/ao-thun-trang-xanh-splash-da-ngoai-anh-chinh-6002f161f916.webp', alt: 'Áo thun trắng xanh splash team building', material: 'Chất liệu thoáng nhẹ cho hoạt động ngoài trời', useCase: 'Company outing', accent: '#2563eb' },
  { name: 'Áo thun cam kem họa tiết sóng', slug: 'ao-thun-cam-kem-hoa-tiet-song', sku: 'DPX24-TB-002', category: 'team-building-su-kien', image: 'https://static.x24sport.vn/mayaodongphuc/ao-thun-cam-kem-song-team-building-anh-chinh-319d0628df2a.webp', alt: 'Áo thun cam kem họa tiết sóng', material: 'Màu sự kiện và thông điệp được tùy chỉnh', useCase: 'Team building & sự kiện', accent: '#fe590d' },
]

export function getCategory(slug?: string) {
  return categories.find((category) => category.slug === slug)
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug)
}
