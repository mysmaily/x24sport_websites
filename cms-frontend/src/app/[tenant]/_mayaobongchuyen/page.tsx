import { ArrowUpRight, BadgeCheck, ClipboardList, Droplets, Flame, Palette, PencilRuler, Phone, Ruler, ShieldCheck, Shirt, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { TenantPromoHero, type TenantPromoHeroSlide } from '../../_components/tenant-promo-hero'
import { HeaderSearch } from './_components/header-search'
import { SiteFooter } from './_components/site-footer'
import { formatPrice, getHomeData, type Product } from './lib/content'

const HERO_IMAGE = '/images/mayaobongchuyen/home/volleyball-team-custom-wide.webp'

const heroBanners: TenantPromoHeroSlide[] = [
  {
    alt: 'Đội bóng chuyền Việt Nam mặc đồng phục đỏ đen trắng thiết kế riêng',
    height: 887,
    mobileSrc: '/images/mayaobongchuyen/home/volleyball-team-custom-wide.webp',
    src: '/images/mayaobongchuyen/home/volleyball-team-custom-wide.webp',
    width: 1774,
  },
  {
    alt: 'Bộ sưu tập áo bóng chuyền xanh đỏ đen trắng trưng bày trong shop',
    height: 819,
    mobileSrc: '/images/mayaobongchuyen/home/volleyball-uniform-display-wide.webp',
    src: '/images/mayaobongchuyen/home/volleyball-uniform-display-wide.webp',
    width: 1920,
  },
  {
    alt: 'Vận động viên bóng chuyền mặc áo xanh trắng đang bật nhảy đập bóng',
    height: 867,
    mobileSrc: '/images/mayaobongchuyen/home/volleyball-spike-action-wide.webp',
    src: '/images/mayaobongchuyen/home/volleyball-spike-action-wide.webp',
    width: 1814,
  },
]

export const metadata: Metadata = {
  title: 'May áo bóng chuyền thiết kế riêng | MayaoBongChuyen',
  description: 'May áo bóng chuyền đặt đội, in tên số, logo, màu CLB và tư vấn chất liệu, form size cho đội thi đấu.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'May áo bóng chuyền thiết kế riêng | MayaoBongChuyen',
    description: 'May áo bóng chuyền đặt đội, in tên số, logo, màu CLB và tư vấn chất liệu, form size cho đội thi đấu.',
    images: [{ url: '/images/mayaobongchuyen/og-share.webp', width: 1200, height: 630, alt: 'Đội bóng chuyền mặc đồng phục đặt may MayaoBongChuyen' }],
    type: 'website',
    url: '/',
  },
}

function productImage(product: Product) {
  return product.gallery?.find((image) => image.url)?.url || HERO_IMAGE
}

function productAlt(product: Product) {
  return product.gallery?.find((image) => image.url)?.alt || `${product.name} đặt may cho đội bóng chuyền`
}

function productSize(product: Product) {
  const image = product.gallery?.find((item) => item.url)
  return { height: image?.height || 900, width: image?.width || 1200 }
}

function ProductCard({ index, product }: { index: number; product: Product }) {
  const href = product.slug ? `/san-pham/${product.slug}/` : '/lien-he'
  const size = productSize(product)

  return (
    <article className="mbc-product-card border border-[var(--line)] bg-white/6" key={product.id}>
      <a className="mbc-product-card-media" href={href}>
        <img alt={productAlt(product)} className="mbc-product-card-image" height={size.height} loading={index < 2 ? 'eager' : 'lazy'} src={productImage(product)} width={size.width} />
        <span className="mbc-product-card-badge"><Flame size={18} /> {String(index + 1).padStart(2, '0')}</span>
      </a>
      <div className="p-[22px]">
        <p className="mb-2 text-xs font-black text-[var(--accent)]">{product.sku}</p>
        <h3 className="mb-2.5 text-[23px]"><a href={href}>{product.name}</a></h3>
        <span className="leading-[1.55] text-[var(--muted)]">{product.shortDescription}</span>
        <strong className="mt-4 block text-2xl">{formatPrice(product.price)}</strong>
      </div>
    </article>
  )
}

export default async function Home() {
  const { hotProducts, newProducts, posts, settings, categories } = await getHomeData()
  const navigation = (settings.navigation || []).map((item) =>
    item.label === 'Bảng giá' || item.label === 'Báo giá' ? { ...item, href: '/bang-gia-may-ao-bong-chuyen/' } : item,
  )
  const typeCategories = categories.filter((category) => category.group === 'type')
  const colorCategories = categories.filter((category) => category.group === 'color')
  const menu = navigation.map((item) =>
    item.label.toLowerCase().includes('áo bóng chuyền') && !item.columns?.length
      ? {
          ...item,
          columns: [
            {
              label: 'Theo loại áo',
              items: typeCategories.map((category) => ({ label: category.name, href: `/${category.slug}` })),
            },
            {
              label: 'Theo màu sắc',
              items: colorCategories.map((category) => ({ label: category.name.replace('Áo bóng chuyền ', ''), href: `/${category.slug}` })),
            },
          ],
        }
      : item,
  )
  const heroFeatures = [
    { icon: PencilRuler, label: 'Thiết kế theo yêu cầu' },
    { icon: BadgeCheck, label: 'In logo đội nhóm' },
    { icon: Palette, label: 'Màu sắc theo mẫu' },
    { icon: Droplets, label: 'Tư vấn chất liệu' },
  ]
  const orderSteps = [
    { icon: ClipboardList, title: 'Gửi brief đội bóng', text: 'Logo, màu chủ đạo, số lượng, danh sách tên số và mốc cần nhận nếu đã có.' },
    { icon: Shirt, title: 'Chọn form và chất liệu', text: 'Tư vấn áo thi đấu, áo libero, bộ áo quần và cách phối màu theo đội.' },
    { icon: Ruler, title: 'Gom size trước khi may', text: 'Chuẩn bị size từng thành viên để hạn chế chỉnh sửa sau khi nhận hàng.' },
  ]
  const colorStyles: Record<string, string> = {
    do: 'bg-gradient-to-r from-red-600/70 to-white/5',
    xanh: 'bg-gradient-to-r from-blue-600/75 to-white/5',
    den: 'bg-gradient-to-r from-black/90 to-white/5',
    trang: 'bg-gradient-to-r from-white/90 to-white/5 text-[#111]',
    vang: 'bg-gradient-to-r from-[#f6c445]/90 to-white/5 text-[#111]',
    hong: 'bg-gradient-to-r from-pink-500/80 to-white/5',
  }

  return (
    <main>
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b-[3px] border-[var(--accent)] bg-[#080909] px-4 shadow-[0_10px_28px_rgba(0,0,0,.22)] md:h-[82px] md:px-[clamp(20px,5vw,92px)]">
        <a className="flex min-w-0 items-center gap-3 uppercase md:min-w-[330px]" href="/">
          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--accent),#911410)] text-[13px] font-black text-white shadow-[14px_0_0_-7px_rgba(238,43,36,.32)] md:h-11 md:w-11">
            VB
          </span>
          <span className="inline-flex flex-col justify-center leading-[0.92]">
            <strong className="text-base font-black italic text-white md:text-[clamp(16px,1.25vw,22px)]">MAYAOBONGCHUYEN</strong>
            <small className="hidden text-[13px] font-black tracking-[0.08em] text-[var(--accent)] md:block">.VN</small>
          </span>
        </a>
        <nav className="hidden items-center gap-[clamp(14px,1.55vw,26px)] text-[12.5px] font-black uppercase tracking-[0.02em] text-[#b9b9b9] lg:flex">
          {menu.map((item) => (
            <div className="group relative flex min-h-[82px] items-center" key={item.label}>
              <a className="whitespace-nowrap group-hover:text-[var(--ink)]" href={item.href}>
                {item.label}
              </a>
              {!!item.columns?.length && (
                <div className="pointer-events-none absolute left-1/2 top-[82px] grid min-w-[480px] -translate-x-1/2 translate-y-2 grid-cols-2 gap-7 border border-white/12 border-t-2 border-t-[var(--accent)] bg-[rgba(9,10,10,.97)] p-[22px] opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {item.columns.map((column) => (
                    <div key={column.label}>
                      <strong className="mb-3 block text-xs uppercase text-[var(--accent)]">{column.label}</strong>
                      {column.items?.map((child) => (
                        <a className="block py-2 text-[var(--ink)] hover:text-[var(--accent)]" href={child.href} key={child.label}>
                          {child.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex min-w-0 items-center justify-end gap-2.5 md:min-w-[210px] md:gap-4">
          <a className="inline-flex items-center gap-2.5 whitespace-nowrap text-sm font-extrabold text-[#c7c7c7]" href="tel:0989353247">
            <Phone size={17} />
            <span className="hidden md:inline">0989.353.247</span>
          </a>
          <HeaderSearch />
        </div>
      </header>

      <TenantPromoHero ariaLabel="Banner may áo bóng chuyền thiết kế riêng" className="mbc-home-hero" slides={heroBanners}>
        <div className="mbc-home-hero-copy max-w-full md:max-w-[650px]">
          <p className="mb-[18px] text-[clamp(24px,2.3vw,40px)] font-black uppercase leading-[0.95] text-[var(--sport-green)]">May áo bóng chuyền</p>
          <h1 className="mb-[18px] max-w-[340px] break-words text-[32px] font-black uppercase leading-[0.98] text-white md:max-w-[650px] md:text-[clamp(44px,4.3vw,70px)] md:leading-[0.92]">
            Thiết kế theo yêu cầu
            <span className="block">Dấu ấn riêng</span>
            <em className="block leading-[1.05] text-[var(--sport-green)]">của đội bạn!</em>
          </h1>
          <p className="mb-6 max-w-[340px] text-[16px] leading-[1.5] font-[650] text-[#d6dde8] md:max-w-[520px] md:text-[17px]">Đồng phục bóng chuyền đặt may, in tên số và logo theo màu đội.</p>
          <div className="mbc-home-hero-features mb-6 grid max-w-[340px] grid-cols-2 gap-px border border-[rgba(71,133,62,.58)] p-3 sm:grid-cols-4 md:max-w-[560px] md:p-[18px]">
            {heroFeatures.map(({ icon: Icon, label }) => (
              <div className="flex min-h-24 flex-col items-center justify-center gap-2 bg-black/20 text-center text-white" key={label}>
                <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-[var(--accent)] text-[var(--accent)]">
                  <Icon size={25} />
                </span>
                <strong className="max-w-[112px] text-[12px] leading-[1.15] md:max-w-[92px] md:text-[13px]">{label}</strong>
              </div>
            ))}
          </div>
          <a
            className="inline-flex min-h-12 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black uppercase text-white"
            href="/lien-he"
          >
            Đặt may <ArrowUpRight size={18} />
          </a>
        </div>
      </TenantPromoHero>

      <section
        id="custom-order"
        className="grid grid-cols-1 gap-px border-y border-[var(--line)] px-0 py-0 md:grid-cols-3"
      >
        {orderSteps.map(({ icon: Icon, title, text }) => (
          <article className="flex min-h-[176px] gap-4 bg-white/4 p-6" key={title}>
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[var(--line)] bg-white/8 text-[var(--accent)]">
              <Icon size={24} />
            </span>
            <div>
              <h2 className="text-[25px] leading-[1.08]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="border-b border-[var(--line)] px-[clamp(20px,5vw,76px)] py-[58px]" aria-labelledby="category-heading">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Danh mục</p>
            <h2 id="category-heading" className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">
              Chọn nhanh kiểu áo bóng chuyền
            </h2>
          </div>
        </div>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,.9fr)_minmax(300px,.65fr)]">
          <div>
            <h3 className="mb-4 text-[13px] uppercase text-[var(--accent)]">Theo loại áo</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {typeCategories.map((category) => (
                <a className="block min-h-[142px] border border-[var(--line)] p-[18px]" href={`/${category.slug}`} id={category.slug} key={category.id}>
                  <span className="mb-3 block text-[22px] font-black leading-[1.12]">{category.name}</span>
                  {category.description && <small className="leading-[1.45] text-[var(--muted)]">{category.description}</small>}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-[13px] uppercase text-[var(--accent)]">Theo màu sắc</h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {colorCategories.map((category) => (
                <a
                  className={`flex min-h-[54px] items-center border border-[var(--line)] px-4 font-extrabold ${colorStyles[category.slug.replace('ao-bong-chuyen-mau-', '')] || 'bg-white/5'}`}
                  href={`/${category.slug}`}
                  id={category.slug}
                  key={category.id}
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="hot-products" className="px-[clamp(20px,5vw,76px)] py-[58px]">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Đang được quan tâm</p>
            <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Sản phẩm HOT</h2>
            <p className="mt-4 max-w-[720px] leading-[1.65] text-[var(--muted)]">Những mẫu áo bóng chuyền khách thường mở để tham khảo phối màu, form áo, tên số và tinh thần thiết kế cho đội.</p>
          </div>
        </div>
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {hotProducts.map((product, index) => <ProductCard index={index} key={product.id} product={product} />)}
        </div>
      </section>

      <section id="new-products" className="border-t border-[var(--line)] bg-white px-[clamp(20px,5vw,76px)] py-[58px] text-[#0d1422]">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Mới cập nhật</p>
            <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Sản phẩm mới ra mắt</h2>
            <p className="mt-4 max-w-[720px] leading-[1.65] text-[#5f6876]">Các mẫu vừa cập nhật để đội dễ chọn kiểu áo, phối màu, chất liệu và ý tưởng in ấn cho đơn tiếp theo.</p>
          </div>
          <a className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#d7dce4] px-[18px] font-black text-[#0d1422] hover:border-[var(--accent)] hover:text-[var(--accent)]" href="/tim-kiem/">
            Xem thêm mẫu <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {newProducts.map((product, index) => <ProductCard index={index} key={product.id} product={product} />)}
        </div>
      </section>

      <section id="pricing" className="grid gap-5 bg-[var(--accent)] px-[clamp(20px,5vw,76px)] py-[42px] text-white md:grid-cols-[auto_1fr_auto] md:items-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/30 bg-white/12">
          <ShieldCheck size={30} />
        </span>
        <h2 className="max-w-[820px] text-[clamp(28px,4vw,46px)] leading-[1.02]">Báo giá theo số lượng, chất vải, tên số, logo và mức tùy biến của đội.</h2>
        <a className="inline-flex min-h-12 items-center justify-center gap-2 border border-white bg-white px-5 text-sm font-black text-[#080b12]" href="/bang-gia-may-ao-bong-chuyen/">
          Xem cách tính giá <ArrowUpRight size={18} />
        </a>
      </section>

      <section id="materials-size" className="px-[clamp(20px,5vw,76px)] py-[58px]">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Chất liệu & Size</p>
            <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Hướng dẫn chọn vải, form và size cho cả đội</h2>
          </div>
        </div>
        <div className="grid gap-3.5">
          {posts.map((post) => (
            <article className="grid gap-[18px] border border-[var(--line)] bg-white/6 p-6 md:grid-cols-[.35fr_.65fr_1fr]" key={post.id}>
              <span className="text-xs font-black text-[var(--accent)]">{post.slug}</span>
              <h3 className="text-[23px]">{post.title}</h3>
              <p className="leading-[1.55] text-[var(--muted)]">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mbc-fit-section border-t border-[var(--line)] bg-white text-[#0d1422]">
        <div className="mx-auto grid max-w-[1360px] gap-px md:grid-cols-[.85fr_1.15fr]">
          <div className="mbc-fit-media min-h-[320px] bg-[url('/images/mayaobongchuyen/home/volleyball-spike-action-wide.webp')] bg-cover bg-center" aria-hidden="true" />
          <div className="mbc-fit-content grid content-center gap-6 px-[clamp(20px,4vw,54px)] py-[46px]">
            <p className="text-xs font-black uppercase text-[var(--accent)]">Phù hợp đội nhóm Việt Nam</p>
            <h2 className="max-w-[720px] text-[clamp(28px,3.2vw,44px)] leading-[1.04]">Một brief rõ ràng giúp đội nhận áo đúng màu, đúng tên số và dễ gom size hơn.</h2>
            <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Users, title: 'CLB, trường học, công ty', text: 'Tập trung vào nhận diện đội và nhu cầu thi đấu thực tế.' },
              { icon: Palette, title: 'Màu áo và libero', text: 'Tách màu chủ đạo, màu phụ và áo libero ngay từ đầu.' },
            ].map(({ icon: Icon, title, text }) => (
              <article className="mbc-fit-card rounded-[18px] border border-[#dfe5ec] bg-[#f7fafc] p-5" key={title}>
                <Icon className="text-[var(--accent)]" size={24} />
                <h3 className="mt-4 text-[20px] leading-[1.14]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5f6876]">{text}</p>
              </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
