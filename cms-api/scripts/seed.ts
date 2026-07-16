import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

type TenantSeed = {
  slug: string
  name: string
  domain: string
  style: 'flevo-inspired' | 'arenix-inspired'
  headline: string
  subheadline: string
  products: Array<{
    name: string
    sku: string
    sport: 'badminton' | 'volleyball' | 'football' | 'basketball' | 'running' | 'pickleball'
    price: number
    shortDescription: string
  }>
}

const tenants: TenantSeed[] = [
  {
    slug: 'mayaocaulong',
    name: 'May Ao Cau Long',
    domain: 'mayaocaulong.vn',
    style: 'flevo-inspired',
    headline: 'Ao cau long dat may cho doi hinh thi dau',
    subheadline: 'Thiet ke sac net, chat vai thoang, form chuyen dong cho cau lac bo va giai phong trao.',
    products: [
      { name: 'Falcon Court Jersey', sku: 'MCL-FALCON-01', sport: 'badminton', price: 189000, shortDescription: 'Ao cau long co tron, vai nhe, phoi mau manh cho doi nam nu.' },
      { name: 'Smash Pro Polo', sku: 'MCL-SMASH-02', sport: 'badminton', price: 229000, shortDescription: 'Polo thi dau chat mat chim, co dung, in ten so theo yeu cau.' },
      { name: 'Feather Team Set', sku: 'MCL-FEATHER-03', sport: 'badminton', price: 249000, shortDescription: 'Bo ao quan cau long dong bo cho giai noi bo va team cong ty.' },
    ],
  },
  {
    slug: 'mayaobongchuyen',
    name: 'May Ao Bong Chuyen',
    domain: 'mayaobongchuyen.vn',
    style: 'arenix-inspired',
    headline: 'Dong phuc bong chuyen cho doi hinh bung suc',
    subheadline: 'Mau ao thi dau day nang luong, be mat nhanh kho, tuy bien mau sac va logo CLB.',
    products: [
      { name: 'Spike Grid Jersey', sku: 'MBC-SPIKE-01', sport: 'volleyball', price: 199000, shortDescription: 'Ao bong chuyen co tim, hoat tiet luoi san dau, form gon.' },
      { name: 'Libero Contrast Tee', sku: 'MBC-LIBERO-02', sport: 'volleyball', price: 215000, shortDescription: 'Mau libero tuong phan cao, de nhan dien, vai co gian tot.' },
      { name: 'Power Serve Kit', sku: 'MBC-POWER-03', sport: 'volleyball', price: 269000, shortDescription: 'Bo thi dau ao quan theo so ao, logo, ten doi va nha tai tro.' },
    ],
  },
]

const richText = (text: string) => {
  const format: '' = ''
  return {
  root: {
    type: 'root',
    format,
    direction: null,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        format,
        direction: null,
        indent: 0,
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      },
    ],
  },
  }
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const run = async () => {
  const payload = await getPayload({ config })
  const email = process.env.PAYLOAD_SEED_EMAIL || 'admin@hacadostore.local'
  const password = process.env.PAYLOAD_SEED_PASSWORD || 'change-this-password'

  const createdTenants = []

  for (const tenant of tenants) {
    const existing = await payload.find({
      collection: 'tenants',
      limit: 1,
      where: { slug: { equals: tenant.slug } },
    })

    const doc =
      existing.docs[0] ||
      (await payload.create({
        collection: 'tenants',
        data: {
          name: tenant.name,
          slug: tenant.slug,
          domains: [{ domain: tenant.domain }],
          brand: {
            headline: tenant.headline,
            subheadline: tenant.subheadline,
            primaryColor: tenant.style === 'flevo-inspired' ? '#111827' : '#080b12',
            accentColor: tenant.style === 'flevo-inspired' ? '#f43f5e' : '#f6c445',
            style: tenant.style,
          },
        },
      }))

    createdTenants.push(doc)

    const settingsExists = await payload.find({
      collection: 'store-settings',
      limit: 1,
      where: { tenant: { equals: doc.id } },
    })

    if (!settingsExists.docs[0]) {
      await payload.create({
        collection: 'store-settings',
        data: {
          siteName: tenant.name,
          contactPhone: '0900 000 000',
          zaloUrl: 'https://zalo.me/0900000000',
          navigation: [
            { label: 'San pham', href: '#products' },
            { label: 'Blog', href: '#blog' },
            { label: 'Lien he', href: '#contact' },
          ],
          tenant: doc.id,
        },
      })
    }

    for (const product of tenant.products) {
      const existingProduct = await payload.find({
        collection: 'products',
        limit: 1,
        where: { sku: { equals: product.sku } },
      })

      if (!existingProduct.docs[0]) {
        await payload.create({
          collection: 'products',
          data: {
            ...product,
            slug: slugify(product.name),
            compareAtPrice: product.price + 50000,
            description: richText(product.shortDescription),
            badges: [{ label: 'Dat may' }, { label: 'In ten so' }],
            featured: true,
            tenant: doc.id,
          },
        })
      }
    }

    const pageExists = await payload.find({
      collection: 'pages',
      limit: 1,
      where: { and: [{ slug: { equals: 'home' } }, { tenant: { equals: doc.id } }] },
    })

    if (!pageExists.docs[0]) {
      await payload.create({
        collection: 'pages',
        data: {
          title: 'Trang chu',
          slug: 'home',
          heroTitle: tenant.headline,
          heroText: tenant.subheadline,
          sections: [
            { heading: 'Tu van mau rieng', body: 'Doi ngu thiet ke len concept theo mau sac, logo va tinh than cua tung doi.' },
            { heading: 'San xuat linh hoat', body: 'Nhan don so luong nho den lon, toi uu chat vai va ky thuat in theo ngan sach.' },
          ],
          tenant: doc.id,
        },
      })
    }

    for (const title of ['Cach chon vai ao thi dau', 'Checklist dat dong phuc cho giai dau']) {
      const slug = `${tenant.slug}-${slugify(title)}`
      const postExists = await payload.find({ collection: 'posts', limit: 1, where: { slug: { equals: slug } } })
      if (!postExists.docs[0]) {
        await payload.create({
          collection: 'posts',
          data: {
            title,
            slug,
            excerpt: 'Nhung luu y de dong phuc dep, ben va dung deadline khi dat may cho ca doi.',
            body: richText('Hay chot size, logo, mau chu dao va ngay can giao truoc khi vao san xuat de han che sua mau.'),
            publishedAt: new Date().toISOString(),
            tenant: doc.id,
          },
        })
      }
    }
  }

  const existingAdmin = await payload.find({
    collection: 'users',
    limit: 1,
    where: { email: { equals: email } },
  })

  if (!existingAdmin.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: 'Hacado Admin',
        role: 'super_admin',
        tenants: createdTenants.map((tenant) => ({ tenant: tenant.id })),
      },
    })
  }

  console.log(`Seeded ${createdTenants.length} tenants. Admin email: ${email}`)
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error)
  process.exit(1)
})
