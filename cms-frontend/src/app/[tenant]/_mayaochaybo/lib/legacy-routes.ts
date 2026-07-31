export const POST_CATEGORIES = [
  { slug: 'chua-phan-loai', title: 'Kiến thức áo chạy bộ', description: 'Tổng hợp kinh nghiệm chọn, thiết kế và đặt may áo chạy bộ.', posts: ['ao-chay-bo-ba-lo-hay-ao-co-tay-nen-chon-loai-nao-cho-doi-nhom','chat-lieu-ao-chay-bo-tot-nhat-cach-chon-vai-phu-hop-cho-runner','cach-thiet-ke-mau-ao-chay-bo','ao-singlet-chay-bo-x24-sport','may-ao-chay-bo-so-luong-lon','xuong-may-ao-chay-bo-theo-yeu-cau','thiet-ke-ao-chay-bo-dep-cho-nhom','ao-chay-noi-bo-dong-phuc-chay-bo-cong-ty','ao-chay-bo-half-marathon','ao-chay-bo-marathon','ao-chay-bo-team-building','ao-chay-bo-giai-chay','ao-chay-bo-nhom','ao-chay-bo-ca-nhan','ao-chay-bo-dep-lua-chon-hoan-hao'] },
  { slug: 'khach-hang-tieu-bieu', title: 'Khách hàng tiêu biểu', description: 'Những mẫu áo và câu chuyện thiết kế riêng cho đội chạy, doanh nghiệp và câu lạc bộ.', posts: ['thiet-ke-ao-chay-bo-cho-team-ceo-1992-dau-an-rieng-tren-moi-cung-duong','hanh-trinh-thiet-ke-ao-chay-bo-rieng-cho-an-bien-runner'] },
  { slug: 'kien-thuc-dat-may', title: 'Kiến thức đặt may áo chạy bộ', description: 'Hướng dẫn về chất liệu, kiểu áo, thiết kế và quy trình đặt may cho đội nhóm.', posts: ['quy-trinh-dat-may-ao-chay-bo-tai-may-ao-chay-bo-vn-chi-voi-3-buoc','ao-chay-bo-ba-lo-hay-ao-co-tay-nen-chon-loai-nao-cho-doi-nhom','chat-lieu-ao-chay-bo-tot-nhat-cach-chon-vai-phu-hop-cho-runner','nen-in-gi-tren-ao-chay-bo-10-y-tuong-giup-doi-nhom-noi-bat-hon','10-ly-do-nen-dat-may-ao-chay-bo-rieng-cho-clb','may-ao-chay-bo-theo-yeu-cau-tu-5-ao'] },
  { slug: 'mau-ao-chay-bo', title: 'Mẫu áo chạy bộ đẹp', description: 'Gợi ý phối màu và mẫu áo chạy bộ dành cho câu lạc bộ, giải chạy và đội nhóm.', posts: ['top-20-mau-ao-chay-bo-mau-xanh-dep-duoc-yeu-thich-nhat-2026','cac-mau-ao-chay-bo-gradient-duoc-yeu-thich-nhat-cho-clb-va-doi-nhom','mau-ao-chay-bo-zenix-moi-ra-mat'] },
] as const

export function postCategoryFromPath(path: string) {
  return POST_CATEGORIES.find((item) => path === `/category/${item.slug}/`)
}

export function isIndexableContent(kind: 'page' | 'post', path: string) {
  return kind === 'post' || path === '/chat-lieu-vai/'
}
