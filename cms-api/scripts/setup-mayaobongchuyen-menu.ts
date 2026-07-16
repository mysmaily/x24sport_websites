import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const tenantSlug = 'mayaobongchuyen'

const categories = [
  {
    name: 'Áo bóng chuyền nam',
    slug: 'ao-bong-chuyen-nam',
    group: 'type',
    order: 10,
    description: 'Mẫu áo bóng chuyền cho đội nam, CLB nam và giải phong trào.',
  },
  {
    name: 'Áo bóng chuyền nữ',
    slug: 'ao-bong-chuyen-nu',
    group: 'type',
    order: 20,
    description: 'Mẫu áo bóng chuyền cho đội nữ, CLB nữ và đồng phục tập thể.',
  },
  {
    name: 'Áo đội/CLB',
    slug: 'ao-doi-clb',
    group: 'type',
    order: 30,
    description: 'Đặt may áo bóng chuyền theo màu đội, logo, tên số và nhà tài trợ.',
  },
  { name: 'Áo bóng chuyền màu đỏ', slug: 'ao-bong-chuyen-mau-do', group: 'color', order: 110 },
  { name: 'Áo bóng chuyền màu xanh', slug: 'ao-bong-chuyen-mau-xanh', group: 'color', order: 120 },
  { name: 'Áo bóng chuyền màu đen', slug: 'ao-bong-chuyen-mau-den', group: 'color', order: 130 },
  { name: 'Áo bóng chuyền màu trắng', slug: 'ao-bong-chuyen-mau-trang', group: 'color', order: 140 },
  { name: 'Áo bóng chuyền màu vàng', slug: 'ao-bong-chuyen-mau-vang', group: 'color', order: 150 },
  { name: 'Áo bóng chuyền màu hồng', slug: 'ao-bong-chuyen-mau-hong', group: 'color', order: 160 },
] as const

const navigation = [
  { label: 'Áo bóng chuyền', href: '/ao-bong-chuyen' },
  { label: 'Đặt may theo yêu cầu', href: '/dat-may-theo-yeu-cau' },
  { label: 'Bảng giá', href: '/bang-gia' },
  { label: 'Chất liệu & Size', href: '/chat-lieu-size' },
  { label: 'Mẫu đã làm', href: '/mau-da-lam' },
  { label: 'Liên hệ', href: '/lien-he' },
]

const pages = [
  {
    title: 'Áo bóng chuyền',
    slug: 'ao-bong-chuyen',
    heroTitle: 'Áo bóng chuyền đặt may cho đội và CLB',
    heroText: 'Tổng hợp mẫu áo bóng chuyền nam, nữ, áo đội/CLB và các nhóm màu phổ biến để đội dễ chọn mẫu.',
    sections: [
      { heading: 'Chọn theo đội hình', body: 'Tách nhanh mẫu nam, nữ và đội/CLB để chọn form, phối màu và kiểu in phù hợp.' },
      { heading: 'Chọn theo màu sắc', body: 'Nhóm màu đỏ, xanh, đen, trắng, vàng, hồng giúp đội chốt concept nhanh hơn.' },
      { heading: 'Tư vấn đồng bộ', body: 'Có thể lên mẫu theo logo, tên đội, số áo và sponsor trước khi may số lượng lớn.' },
    ],
  },
  {
    title: 'Đặt may theo yêu cầu',
    slug: 'dat-may-theo-yeu-cau',
    heroTitle: 'Đặt may áo bóng chuyền theo yêu cầu',
    heroText: 'Nhận thiết kế, chỉnh mẫu, chốt size và in tên số/logo cho đội bóng chuyền, CLB, trường học và công ty.',
    sections: [
      { heading: 'Gửi ý tưởng', body: 'Gửi logo, màu chủ đạo, số lượng và deadline để được tư vấn mẫu phù hợp.' },
      { heading: 'Chốt demo', body: 'Lên phối màu, vị trí logo, tên số và sponsor trước khi vào sản xuất.' },
      { heading: 'May và giao hàng', body: 'Tối ưu form, chất vải và tiến độ theo ngân sách cũng như lịch thi đấu của đội.' },
    ],
  },
  {
    title: 'Bảng giá',
    slug: 'bang-gia',
    heroTitle: 'Bảng giá may áo bóng chuyền',
    heroText: 'Giá được gộp theo chất vải, số lượng, mức in tên số/logo và yêu cầu thiết kế riêng.',
    sections: [
      { heading: 'Theo số lượng', body: 'Đơn càng nhiều càng dễ tối ưu chi phí thiết kế, in ấn và sản xuất.' },
      { heading: 'Theo chất vải', body: 'Tư vấn chất vải thoáng, nhanh khô, co giãn phù hợp cường độ vận động bóng chuyền.' },
      { heading: 'Theo mức tùy biến', body: 'Tên số, logo, sponsor và pattern riêng sẽ được báo rõ trước khi chốt đơn.' },
    ],
  },
  {
    title: 'Chất liệu & Size',
    slug: 'chat-lieu-size',
    heroTitle: 'Chất liệu và size áo bóng chuyền',
    heroText: 'Hướng dẫn chọn vải, form áo và gom size để cả đội mặc thoải mái khi tập luyện và thi đấu.',
    sections: [
      { heading: 'Vải nhanh khô', body: 'Ưu tiên bề mặt thoáng, nhẹ, ít bám mồ hôi và giữ màu tốt sau nhiều lần giặt.' },
      { heading: 'Form vận động', body: 'Form áo cần đủ gọn nhưng không bó vai, giúp chắn bóng và bật nhảy thoải mái.' },
      { heading: 'Gom size cho đội', body: 'Có bảng size và tư vấn cách đo để hạn chế đổi size sau khi nhận áo.' },
    ],
  },
  {
    title: 'Mẫu đã làm',
    slug: 'mau-da-lam',
    heroTitle: 'Mẫu áo bóng chuyền đã làm',
    heroText: 'Tham khảo các mẫu áo bóng chuyền theo phong cách đội/CLB, phối màu mạnh và dễ in tên số.',
    sections: [
      { heading: 'Mẫu đội nam nữ', body: 'Các kiểu phối màu dễ dùng cho đội nam, đội nữ và đội hỗn hợp.' },
      { heading: 'Mẫu CLB', body: 'Tối ưu nhận diện logo, tên đội và sponsor để lên sân nhìn đồng bộ.' },
      { heading: 'Mẫu theo màu', body: 'Lọc nhanh theo màu đỏ, xanh, đen, trắng, vàng, hồng.' },
    ],
  },
  {
    title: 'Liên hệ',
    slug: 'lien-he',
    heroTitle: 'Liên hệ đặt may áo bóng chuyền',
    heroText: 'Gửi yêu cầu thiết kế, số lượng, ngày cần nhận và thông tin đội để được tư vấn nhanh.',
    sections: [
      { heading: 'Tư vấn mẫu', body: 'Nhận tư vấn phối màu, chất vải và kiểu in theo ngân sách của đội.' },
      { heading: 'Báo giá nhanh', body: 'Báo giá theo số lượng, deadline và mức độ tùy biến.' },
      { heading: 'Theo dõi đơn', body: 'Cập nhật tiến độ thiết kế, sản xuất và giao hàng.' },
    ],
  },
  ...categories.map((category) => ({
    title: category.name,
    slug: category.slug,
    heroTitle: category.name,
    heroText: ('description' in category && category.description) || `Tổng hợp mẫu ${category.name.toLowerCase()} để đội dễ chọn concept và đặt may.`,
    sections: [
      { heading: 'Mẫu phù hợp', body: 'Gợi ý phối màu, form áo và cách đặt logo/tên số cho nhóm mẫu này.' },
      { heading: 'Tùy biến theo đội', body: 'Có thể đổi màu, thêm logo, số áo, tên vận động viên và sponsor.' },
      { heading: 'Đặt may nhanh', body: 'Gửi số lượng, bảng size và ngày cần nhận để được báo giá chính xác.' },
    ],
  })),
]

const run = async () => {
  const payload = await getPayload({ config })

  const tenantResult = await payload.find({
    collection: 'tenants',
    limit: 1,
    where: { slug: { equals: tenantSlug } },
  })

  const tenant = tenantResult.docs[0]
  if (!tenant) throw new Error(`Tenant not found: ${tenantSlug}`)

  const categoryIds = []

  for (const category of categories) {
    const existing = await payload.find({
      collection: 'product-categories',
      limit: 1,
      where: { and: [{ slug: { equals: category.slug } }, { tenant: { equals: tenant.id } }] },
    })

    const data = { ...category, tenant: tenant.id }
    const doc = existing.docs[0]
      ? await payload.update({
          collection: 'product-categories',
          id: existing.docs[0].id,
          data,
        })
      : await payload.create({
          collection: 'product-categories',
          data,
        })

    categoryIds.push(doc.id)
  }

  const settingsResult = await payload.find({
    collection: 'store-settings',
    limit: 1,
    where: { tenant: { equals: tenant.id } },
  })

  if (settingsResult.docs[0]) {
    await payload.update({
      collection: 'store-settings',
      id: settingsResult.docs[0].id,
      data: { navigation, tenant: tenant.id },
    })
  } else {
    await payload.create({
      collection: 'store-settings',
      data: {
        siteName: tenant.name,
        contactPhone: '0900 000 000',
        zaloUrl: 'https://zalo.me/0900000000',
        navigation,
        tenant: tenant.id,
      },
    })
  }

  for (const page of pages) {
    const existingPage = await payload.find({
      collection: 'pages',
      limit: 1,
      where: { and: [{ slug: { equals: page.slug } }, { tenant: { equals: tenant.id } }] },
    })

    const data = { ...page, tenant: tenant.id }

    if (existingPage.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: existingPage.docs[0].id,
        data,
      })
    } else {
      await payload.create({
        collection: 'pages',
        data,
      })
    }
  }

  const productResult = await payload.find({
    collection: 'products',
    limit: 100,
    where: { tenant: { equals: tenant.id } },
  })

  for (const product of productResult.docs) {
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { categories: categoryIds.slice(0, 3) },
    })
  }

  console.log(`Configured ${categories.length} categories, ${navigation.length} menu items, and ${pages.length} pages for ${tenantSlug}.`)
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
