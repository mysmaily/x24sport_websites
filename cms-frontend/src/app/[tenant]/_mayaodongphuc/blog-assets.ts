const BLOG_COVERS: Record<string, string> = {
  'ao-polo-dong-phuc-cong-ty': '/images/mayaodongphuc/blog/polo-uniform-guide.webp',
  'cac-loai-vai-may-ao-thun-dong-phuc': '/images/mayaodongphuc/blog/fabric-guide.webp',
  'cach-chon-size-ao-dong-phuc-cong-ty': '/images/mayaodongphuc/blog/process-checklist-guide.webp',
  'in-logo-hay-theu-logo-ao-dong-phuc': '/images/mayaodongphuc/blog/logo-technique-guide.webp',
  'dong-phuc-cong-ty-bat-dong-san': '/images/mayaodongphuc/blog/company-uniform-guide.webp',
  'dong-phuc-cong-ty-startup': '/images/mayaodongphuc/blog/company-uniform-guide.webp',
  'dong-phuc-ky-thuat-kho-van': '/images/mayaodongphuc/blog/workwear-logistics-guide.webp',
  'loi-thuong-gap-khi-dat-may-ao-dong-phuc': '/images/mayaodongphuc/blog/process-checklist-guide.webp',
  'mau-ao-dong-phuc-ngan-hang': '/images/mayaodongphuc/blog/polo-uniform-guide.webp',
  'mau-ao-dong-phuc-cong-ty-dep': '/images/mayaodongphuc/blog/sample-grid-guide.webp',
  'mau-ao-dong-phuc-mau-den': '/images/mayaodongphuc/blog/sample-grid-guide.webp',
  'mau-ao-dong-phuc-mau-navy': '/images/mayaodongphuc/blog/polo-uniform-guide.webp',
  'mau-ao-dong-phuc-mau-trang': '/images/mayaodongphuc/blog/sample-grid-guide.webp',
  'mau-ao-dong-phuc-nha-hang-cafe': '/images/mayaodongphuc/blog/fnb-uniform-guide.webp',
  'mau-ao-dong-phuc-team-building': '/images/mayaodongphuc/blog/event-team-guide.webp',
  'mau-ao-polo-dong-phuc-phoi-mau': '/images/mayaodongphuc/blog/polo-uniform-guide.webp',
  'mau-ao-thun-su-kien': '/images/mayaodongphuc/blog/event-team-guide.webp',
  'may-dong-phuc-spa-tham-my-vien': '/images/mayaodongphuc/blog/healthcare-spa-uniform-guide.webp',
  'may-dong-phuc-truong-hoc-trung-tam': '/images/mayaodongphuc/blog/school-uniform-guide.webp',
  'may-ao-dong-phuc-cong-ty': '/images/mayaodongphuc/blog/company-uniform-guide.webp',
  'may-ao-dong-phuc-van-phong': '/images/mayaodongphuc/blog/company-uniform-guide.webp',
  'ao-dong-phuc-showroom-ban-hang': '/images/mayaodongphuc/blog/polo-uniform-guide.webp',
  'ao-dong-phuc-qua-tang-su-kien': '/images/mayaodongphuc/blog/event-team-guide.webp',
  'quy-trinh-dat-may-ao-dong-phuc': '/images/mayaodongphuc/blog/process-checklist-guide.webp',
}

const FALLBACK_COVERS = [
  '/images/mayaodongphuc/blog/company-uniform-guide.webp',
  '/images/mayaodongphuc/blog/polo-uniform-guide.webp',
  '/images/mayaodongphuc/blog/fabric-guide.webp',
  '/images/mayaodongphuc/blog/logo-technique-guide.webp',
  '/images/mayaodongphuc/blog/process-checklist-guide.webp',
  '/images/mayaodongphuc/blog/fnb-uniform-guide.webp',
  '/images/mayaodongphuc/blog/school-uniform-guide.webp',
  '/images/mayaodongphuc/blog/healthcare-spa-uniform-guide.webp',
  '/images/mayaodongphuc/blog/workwear-logistics-guide.webp',
  '/images/mayaodongphuc/event-tee.webp',
  '/images/mayaodongphuc/fnb-apron.webp',
  '/images/mayaodongphuc/office-shirt.webp',
  '/images/mayaodongphuc/healthcare-tunic.webp',
  '/images/mayaodongphuc/workwear-olive.webp',
]

export function blogCover(slug: string, index = 0) {
  return BLOG_COVERS[slug] || FALLBACK_COVERS[index % FALLBACK_COVERS.length]
}
