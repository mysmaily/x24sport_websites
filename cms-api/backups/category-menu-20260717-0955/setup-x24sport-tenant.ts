import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const tenantSlug = 'x24sport'

const categories = [
  { name: 'Bóng đá', slug: 'bong-da', description: 'Áo đấu, quần thi đấu và bộ đồng phục cho đội bóng, câu lạc bộ.', order: 10 },
  { name: 'Cầu lông', slug: 'cau-long', description: 'Áo cổ tròn, polo và set thi đấu cho cá nhân hoặc đội nhóm.', order: 20 },
  { name: 'Bóng chuyền', slug: 'bong-chuyen', description: 'Đồng phục thi đấu cho đội nam, nữ và các giải phong trào.', order: 30 },
  { name: 'Bóng rổ', slug: 'bong-ro', description: 'Jersey, tank top và quần thi đấu cho đội bóng rổ.', order: 40 },
  { name: 'Pickleball', slug: 'pickleball', description: 'Áo chơi, polo và trang phục cho câu lạc bộ và nhóm bạn.', order: 50 },
  { name: 'Chạy bộ', slug: 'chay-bo', description: 'Áo chạy, singlet và đồng phục cho câu lạc bộ hoặc sự kiện.', order: 60 },
] as const

const navigation = [
  { label: 'Trang chủ', href: '/' },
  ...categories.map((category) => ({ label: `Áo ${category.name}`, href: `/danh-muc/${category.slug}` })),
  { label: 'Tất cả sản phẩm', href: '/san-pham' },
]

const run = async () => {
  const payload = await getPayload({ config })
  const tenantResult = await payload.find({
    collection: 'tenants',
    limit: 1,
    where: { slug: { equals: tenantSlug } },
  })

  const tenant = tenantResult.docs[0] || await payload.create({
    collection: 'tenants',
    data: {
      name: 'X24Sport',
      slug: tenantSlug,
      domains: [{ domain: 'x24sport.vn' }, { domain: 'next.x24sport.vn' }],
      brand: {
        headline: 'Trang phục cho mọi chuyển động',
        subheadline: 'Trang phục thể thao thiết kế theo yêu cầu cho đội nhóm và câu lạc bộ.',
        primaryColor: '#080808',
        accentColor: '#ed642d',
        style: 'arenix-inspired',
      },
    },
  })

  for (const category of categories) {
    const existing = await payload.find({
      collection: 'product-categories',
      limit: 1,
      where: { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: category.slug } }] },
    })
    const data = { ...category, group: 'sport' as const, tenant: tenant.id }
    if (existing.docs[0]) {
      await payload.update({ collection: 'product-categories', id: existing.docs[0].id, data })
    } else {
      await payload.create({ collection: 'product-categories', data })
    }
  }

  const settings = await payload.find({
    collection: 'store-settings',
    limit: 1,
    where: { tenant: { equals: tenant.id } },
  })
  const settingsData = {
    siteName: 'X24Sport',
    contactPhone: '0989 353 247',
    zaloUrl: 'https://zalo.me/0989353247',
    navigation,
    tenant: tenant.id,
  }
  if (settings.docs[0]) {
    await payload.update({ collection: 'store-settings', id: settings.docs[0].id, data: settingsData })
  } else {
    await payload.create({ collection: 'store-settings', data: settingsData })
  }

  console.log(`Configured tenant ${tenantSlug} with ${categories.length} sport categories.`)
}

run().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
