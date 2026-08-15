import type { ProductPreview, SportCategory } from '../../../lib/catalog'
import type { CmsProduct, CmsWebContent } from '../../../lib/content'
import type { PreviewProduct } from '../../pndsport-preview/data'

export const pndPostImages = [
  '/images/categories/football-teamwear-promo.webp',
  '/images/categories/badminton-teamwear-promo.webp',
  '/images/categories/volleyball-teamwear-promo.webp',
  '/images/categories/dong-phuc.webp',
] as const

export type PndLanding = {
  categorySlug: string
  slug: string
  title: string
  lead: string
  audience: string
}

export const pndLandings: PndLanding[] = [
  { categorySlug: 'bong-da', slug: 'thiet-ke-ao-bong-da-doi-nhom', title: 'Thiết kế áo bóng đá cho đội nhóm', lead: 'Chọn mẫu áo bóng đá, phối màu đội, thêm logo, tên và số áo trước khi yêu cầu báo giá.', audience: 'đội bóng, câu lạc bộ, lớp học và giải phong trào' },
  { categorySlug: 'cau-long', slug: 'thiet-ke-ao-cau-long-doi-nhom', title: 'Thiết kế áo cầu lông cho đội nhóm', lead: 'Tham khảo mẫu cầu lông và chuẩn bị màu sắc, logo, danh sách size cho câu lạc bộ.', audience: 'câu lạc bộ, nhóm chơi và đội thi đấu cầu lông' },
  { categorySlug: 'bong-chuyen', slug: 'thiet-ke-ao-bong-chuyen-doi-nhom', title: 'Thiết kế áo bóng chuyền cho đội nhóm', lead: 'Chọn mẫu đồng bộ cho đội hình và gửi yêu cầu về màu, logo, tên số cùng số lượng.', audience: 'đội bóng chuyền trường học, câu lạc bộ và giải đấu' },
  { categorySlug: 'pickleball', slug: 'thiet-ke-ao-pickleball-doi-nhom', title: 'Thiết kế áo pickleball cho đội nhóm', lead: 'Tìm mẫu pickleball phù hợp rồi điều chỉnh nhận diện cho nhóm chơi, câu lạc bộ hoặc sự kiện.', audience: 'nhóm chơi, câu lạc bộ và giải pickleball' },
  { categorySlug: 'chay-bo', slug: 'thiet-ke-ao-chay-bo-doi-nhom', title: 'Thiết kế áo chạy bộ cho đội nhóm', lead: 'Chuẩn bị mẫu, màu sắc và nội dung nhận diện cho câu lạc bộ, doanh nghiệp hoặc giải chạy.', audience: 'câu lạc bộ chạy, doanh nghiệp và ban tổ chức sự kiện' },
  { categorySlug: 'bong-ro', slug: 'thiet-ke-ao-bong-ro-doi-nhom', title: 'Thiết kế áo bóng rổ cho đội nhóm', lead: 'Khám phá mẫu bóng rổ và gửi màu đội, logo, tên số để xây dựng phương án đồng bộ.', audience: 'đội bóng rổ, trường học và câu lạc bộ phong trào' },
  { categorySlug: 'ao-gaming', slug: 'thiet-ke-ao-gaming-doi-nhom', title: 'Thiết kế áo gaming cho đội tuyển', lead: 'Chọn phong cách áo thi đấu và gửi bộ nhận diện để tư vấn bố cục logo, tên và nickname.', audience: 'đội tuyển esports, gaming house và câu lạc bộ' },
  { categorySlug: 'ao-bi-a', slug: 'thiet-ke-ao-bia-doi-nhom', title: 'Thiết kế áo bi-a cho đội nhóm', lead: 'Tham khảo áo bi-a và polo thi đấu, sau đó gửi màu sắc, logo câu lạc bộ và số lượng.', audience: 'câu lạc bộ, cơ thủ và đơn vị tổ chức giải bi-a' },
  { categorySlug: 'dong-phuc', slug: 'thiet-ke-dong-phuc-the-thao-doi-nhom', title: 'Thiết kế đồng phục thể thao đội nhóm', lead: 'Chọn mẫu theo hoạt động và hoàn thiện màu sắc, logo, tên số cho một hình ảnh đồng bộ.', audience: 'đội nhóm, trường học, doanh nghiệp và sự kiện' },
]

export function getPndLanding(slug: string) {
  return pndLandings.find((landing) => landing.slug === slug)
}

export function toPndProduct(product: ProductPreview): PreviewProduct {
  return {
    slug: product.slug,
    name: product.name,
    code: product.sku || String(product.id || 'PND'),
    category: product.category,
    price: product.price || 0,
    image: product.image,
    tone: product.type || 'Thiết kế theo yêu cầu',
  }
}

export function cmsProductCategory(product: CmsProduct) {
  return (product.categories || []).find((category): category is Exclude<typeof category, number | string> => typeof category === 'object')
}

export function categoryImage(category: SportCategory, index: number) {
  return category.image || pndPostImages[index % pndPostImages.length]
}

export function postImage(_post: CmsWebContent, index: number) {
  return pndPostImages[index % pndPostImages.length]
}
