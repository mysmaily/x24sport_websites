import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const tenantSlug = 'mayaobongchuyen'
const apply = process.argv.slice(2).includes('--apply')

const categories = [
  {
    name: 'Áo bóng chuyền nam',
    slug: 'ao-bong-chuyen-nam',
    group: 'type',
    order: 10,
    description: 'Mẫu áo bóng chuyền cho đội nam, CLB nam và giải phong trào.',
    legacyPath: '/ao-bong-chuyen-nam/',
  },
  {
    name: 'Áo bóng chuyền nữ',
    slug: 'ao-bong-chuyen-nu',
    group: 'type',
    order: 20,
    description: 'Mẫu áo bóng chuyền cho đội nữ, CLB nữ và đồng phục tập thể.',
    legacyPath: '/ao-bong-chuyen-nu/',
  },
  {
    name: 'Áo đội/CLB',
    slug: 'ao-doi-clb',
    group: 'type',
    order: 30,
    description: 'Đặt may áo bóng chuyền theo màu đội, logo, tên số và nhà tài trợ.',
    legacyPath: '/ao-doi-clb/',
  },
  { name: 'Áo bóng chuyền màu đỏ', slug: 'ao-bong-chuyen-mau-do', group: 'color', order: 110, legacyPath: '/ao-bong-chuyen-mau-do/' },
  { name: 'Áo bóng chuyền màu xanh', slug: 'ao-bong-chuyen-mau-xanh', group: 'color', order: 120, legacyPath: '/ao-bong-chuyen-mau-xanh/' },
  { name: 'Áo bóng chuyền màu đen', slug: 'ao-bong-chuyen-mau-den', group: 'color', order: 130, legacyPath: '/ao-bong-chuyen-mau-den/' },
  { name: 'Áo bóng chuyền màu trắng', slug: 'ao-bong-chuyen-mau-trang', group: 'color', order: 140, legacyPath: '/ao-bong-chuyen-mau-trang/' },
  { name: 'Áo bóng chuyền màu vàng', slug: 'ao-bong-chuyen-mau-vang', group: 'color', order: 150, legacyPath: '/ao-bong-chuyen-mau-vang/' },
  { name: 'Áo bóng chuyền màu hồng', slug: 'ao-bong-chuyen-mau-hong', group: 'color', order: 160, legacyPath: '/ao-bong-chuyen-mau-hong/' },
] as const

const navigation = [
  { label: 'Áo bóng chuyền', href: '/ao-bong-chuyen/' },
  { label: 'Đặt may theo yêu cầu', href: '/dat-may-theo-yeu-cau/' },
  { label: 'Bảng giá', href: '/bang-gia-may-ao-bong-chuyen/' },
  { label: 'Chất liệu & Size', href: '/chat-lieu-size/' },
  { label: 'Mẫu đã làm', href: '/mau-da-lam/' },
  { label: 'Liên hệ', href: '/lien-he/' },
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
    slug: 'bang-gia-may-ao-bong-chuyen',
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
    overrideAccess: true,
    where: { slug: { equals: tenantSlug } },
  })

  const tenant = tenantResult.docs[0]
  if (!tenant) throw new Error(`Tenant not found: ${tenantSlug}`)

  const report: Array<{ action: 'create' | 'update'; collection: string; key: string }> = []

  for (const category of categories) {
    const existing = await payload.find({
      collection: 'product-categories',
      limit: 1,
      overrideAccess: true,
      where: { and: [{ slug: { equals: category.slug } }, { tenant: { equals: tenant.id } }] },
    })

    const current = existing.docs[0]
    report.push({ action: current ? 'update' : 'create', collection: 'product-categories', key: category.slug })
    if (!apply) continue
    const data = {
      ...category,
      navigationLabel: category.name,
      navigationOrder: category.order,
      showInNavigation: true,
      status: 'active' as const,
      tenant: tenant.id,
    }
    if (current) {
      await payload.update({ collection: 'product-categories', id: current.id, data, overrideAccess: true })
    } else {
      await payload.create({ collection: 'product-categories', data, overrideAccess: true })
    }
  }

  const settingsResult = await payload.find({
    collection: 'store-settings',
    limit: 1,
    overrideAccess: true,
    where: { tenant: { equals: tenant.id } },
  })

  const currentSettings = settingsResult.docs[0]
  report.push({ action: currentSettings ? 'update' : 'create', collection: 'store-settings', key: tenantSlug })
  if (apply && currentSettings) {
    await payload.update({
      collection: 'store-settings',
      id: currentSettings.id,
      data: {
        contactPhone: '0989353247',
        navigation,
        navigationMode: currentSettings.navigationMode || 'legacy',
        siteName: currentSettings.siteName || tenant.name,
        tenant: tenant.id,
        zaloUrl: 'https://zalo.me/0989353247',
      },
      overrideAccess: true,
    })
  } else if (apply) {
    await payload.create({
      collection: 'store-settings',
      data: {
        siteName: tenant.name,
        contactPhone: '0989353247',
        zaloUrl: 'https://zalo.me/0989353247',
        navigationMode: 'legacy',
        navigation,
        tenant: tenant.id,
      },
      overrideAccess: true,
    })
  }

  for (const page of pages) {
    const existingPage = await payload.find({
      collection: 'pages',
      limit: 1,
      overrideAccess: true,
      where: { and: [{ slug: { equals: page.slug } }, { tenant: { equals: tenant.id } }] },
    })

    const data = { ...page, tenant: tenant.id }
    const current = existingPage.docs[0]
    report.push({ action: current ? 'update' : 'create', collection: 'pages', key: page.slug })

    if (!apply) continue
    if (current) {
      await payload.update({
        collection: 'pages',
        id: current.id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'pages',
        data,
        overrideAccess: true,
      })
    }
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    tenantSlug,
    categories: categories.length,
    navigationItems: navigation.length,
    pages: pages.length,
    changes: report,
    destructiveOperations: 0,
    productMutations: 0,
  }, null, 2))
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
