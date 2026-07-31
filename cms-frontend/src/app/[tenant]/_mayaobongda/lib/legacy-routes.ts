export const POST_CATEGORY_ARCHIVES = [
  {
    path: '/category/chua-phan-loai/',
    title: 'Tin tức áo bóng đá',
    description: 'Bài viết tư vấn đặt may, quy trình sản xuất và cập nhật mẫu áo bóng đá từ X24 Sport.',
  },
] as const

export function getPostCategoryArchive(path: string) {
  return POST_CATEGORY_ARCHIVES.find((item) => item.path === path)
}

export function isIndexableContent(kind: 'page' | 'post', path: string) {
  if (kind === 'post') return true
  return path !== '/'
}
