import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const tenantSlug = 'x24sport'

const categories = [
  {
    name: 'Bóng đá', slug: 'bong-da', description: 'Áo bóng đá, giày, quả bóng và phụ kiện cho đội bóng, câu lạc bộ.', order: 10,
    children: ['Áo bóng đá', 'Giày bóng đá', 'Quả bóng đá', 'Phụ kiện bóng đá'],
  },
  {
    name: 'Bóng chuyền', slug: 'bong-chuyen', description: 'Áo bóng chuyền, giày, quả bóng và phụ kiện cho đội nam, nữ và giải phong trào.', order: 20,
    children: ['Áo bóng chuyền', 'Giày bóng chuyền', 'Quả bóng chuyền', 'Phụ kiện bóng chuyền'],
  },
  {
    name: 'Bóng rổ', slug: 'bong-ro', description: 'Áo bóng rổ, giày, quả bóng và phụ kiện với ngôn ngữ thiết kế mạnh.', order: 30,
    children: ['Áo bóng rổ', 'Giày bóng rổ', 'Quả bóng rổ', 'Phụ kiện bóng rổ'],
  },
  {
    name: 'Cầu lông', slug: 'cau-long', description: 'Áo cầu lông, giày và phụ kiện cho cá nhân, câu lạc bộ hoặc đội nhóm.', order: 40,
    children: ['Áo cầu lông', 'Giày cầu lông', 'Phụ kiện cầu lông'],
  },
  {
    name: 'Pickleball', slug: 'pickleball', description: 'Áo pickleball, giày và phụ kiện cho câu lạc bộ và nhóm bạn.', order: 50,
    children: ['Áo pickleball', 'Giày pickleball', 'Phụ kiện pickleball'],
  },
  {
    name: 'Chạy bộ', slug: 'chay-bo', description: 'Áo chạy bộ, giày chạy bộ và phụ kiện cho câu lạc bộ hoặc sự kiện.', order: 60,
    children: ['Áo chạy bộ', 'Giày chạy bộ', 'Phụ kiện chạy bộ'],
  },
] as const

const navigation = [
  { label: 'Trang chủ', href: '/' },
  ...categories.map((category) => ({ label: category.name, href: `/danh-muc/${category.slug}` })),
  { label: 'Tất cả sản phẩm', href: '/san-pham' },
]

const slugify = (value: string) =>
  value.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

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
    const { children: _children, ...categoryData } = category
    const data = { ...categoryData, group: 'sport' as const, tenant: tenant.id }
    const parent = existing.docs[0]
      ? await payload.update({ collection: 'product-categories', id: existing.docs[0].id, data })
      : await payload.create({ collection: 'product-categories', data })

    for (const [index, name] of category.children.entries()) {
      const slug = slugify(name)
      const child = await payload.find({
        collection: 'product-categories',
        limit: 1,
        where: { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: slug } }] },
      })
      const childData = {
        name,
        slug,
        description: `${name} X24Sport cho nhu cầu thi đấu, luyện tập và đội nhóm.`,
        group: 'sport' as const,
        parent: parent.id,
        order: category.order + index + 1,
        tenant: tenant.id,
      }
      if (child.docs[0]) {
        await payload.update({ collection: 'product-categories', id: child.docs[0].id, data: childData })
      } else {
        await payload.create({ collection: 'product-categories', data: childData })
      }
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
