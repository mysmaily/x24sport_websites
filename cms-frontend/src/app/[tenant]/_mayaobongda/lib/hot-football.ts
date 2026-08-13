export const HOT_FOOTBALL_YEAR = new Date().getFullYear()
export const HOT_FOOTBALL_PATH = `/mau-ao-bong-da-hot-${HOT_FOOTBALL_YEAR}/`
export const HOT_FOOTBALL_TITLE = `Các Mẫu Áo Bóng Đá Hot ${HOT_FOOTBALL_YEAR}`
export const HOT_FOOTBALL_DESCRIPTION = `Tham khảo các mẫu áo bóng đá hot ${HOT_FOOTBALL_YEAR} được nhiều khách xem để chọn thiết kế, phối màu, logo và tên số cho đội bóng.`

export function isCurrentHotFootballPath(path: string) {
  return path === HOT_FOOTBALL_PATH
}
