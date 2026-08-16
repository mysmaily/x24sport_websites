export const previewBase = '/mayaodongphuc-preview'

export type PreviewProduct = {
  slug: string
  name: string
  code: string
  category: string
  image: string
  material: string
  colors: string[]
  badge?: string
}

export const industries = [
  { code: '01', name: 'Doanh nghiệp', slug: 'dong-phuc-doanh-nghiep', note: 'Polo, sơ mi và áo khoác theo nhận diện thương hiệu.' },
  { code: '02', name: 'F&B', slug: 'dong-phuc-fnb', note: 'Trang phục theo vai trò cho quán cà phê, nhà hàng và khách sạn.' },
  { code: '03', name: 'Trường học', slug: 'dong-phuc-truong-hoc', note: 'Giải pháp đồng bộ cho học sinh, giáo viên và hoạt động tập thể.' },
  { code: '04', name: 'Bảo hộ', slug: 'dong-phuc-bao-ho', note: 'Thiết kế thực dụng cho nhà máy, kỹ sư và đội vận hành.' },
  { code: '05', name: 'Y tế & dịch vụ', slug: 'dong-phuc-y-te-dich-vu', note: 'Form gọn, dễ vận động cho phòng khám, spa và dịch vụ.' },
  { code: '06', name: 'Sự kiện & đội nhóm', slug: 'dong-phuc-su-kien-doi-nhom', note: 'Áo nhận diện cho chiến dịch, chương trình và cộng đồng.' },
] as const

export const productTypes = ['Polo', 'Áo thun', 'Sơ mi', 'Áo khoác', 'Tạp dề', 'Vest & công sở', 'Phụ kiện'] as const

export const products: PreviewProduct[] = [
  {
    slug: 'polo-doanh-nghiep-atelier-01',
    name: 'Polo doanh nghiệp Atelier 01',
    code: 'MDP-PL-001',
    category: 'Đồng phục doanh nghiệp',
    image: '/images/mayaodongphuc-preview/polo-navy.webp',
    material: 'Vải polo dệt mắt nhỏ',
    colors: ['#122239', '#eee4ce', '#e45b2f'],
    badge: 'Mẫu chủ đạo',
  },
  {
    slug: 'set-dong-phuc-fnb-clay-02',
    name: 'Set đồng phục F&B Clay 02',
    code: 'MDP-FB-002',
    category: 'Đồng phục F&B',
    image: '/images/mayaodongphuc-preview/fnb-apron.webp',
    material: 'Cotton phối canvas',
    colors: ['#eee6d6', '#b94f2d', '#2b2a28'],
    badge: 'Phối theo vai trò',
  },
  {
    slug: 'ao-bao-ho-field-03',
    name: 'Áo bảo hộ Field 03',
    code: 'MDP-BH-003',
    category: 'Đồng phục bảo hộ',
    image: '/images/mayaodongphuc-preview/workwear-olive.webp',
    material: 'Vải ripstop bền mặt',
    colors: ['#585640', '#172033', '#d85b28'],
  },
  {
    slug: 'so-mi-cong-so-line-04',
    name: 'Sơ mi công sở Line 04',
    code: 'MDP-SM-004',
    category: 'Đồng phục doanh nghiệp',
    image: '/images/mayaodongphuc-preview/office-shirt.webp',
    material: 'Poplin bề mặt mịn',
    colors: ['#f4f0e6', '#172239', '#e35b2d'],
  },
  {
    slug: 'ao-dich-vu-sage-05',
    name: 'Áo dịch vụ Sage 05',
    code: 'MDP-DV-005',
    category: 'Y tế & dịch vụ',
    image: '/images/mayaodongphuc-preview/healthcare-tunic.webp',
    material: 'Vải co giãn nhẹ',
    colors: ['#aeb5a2', '#f0eadc'],
    badge: 'Form mới',
  },
  {
    slug: 'ao-su-kien-signal-06',
    name: 'Áo sự kiện Signal 06',
    code: 'MDP-SK-006',
    category: 'Sự kiện & đội nhóm',
    image: '/images/mayaodongphuc-preview/event-tee.webp',
    material: 'Cotton jersey',
    colors: ['#f1eadb', '#1955a6', '#ed642f'],
  },
]

export const featuredProduct = products[0]

