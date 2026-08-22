import { ArrowUpRight, BadgeCheck, Droplets, Flame, Palette, PencilRuler, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { TenantPromoHero, type TenantPromoHeroSlide } from '../../_components/tenant-promo-hero'
import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'
import { fallbackNavigation, formatPrice, getHomeData, productHref, type Product } from './lib/content'

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

function ProductCard({ index, product }: { index: number; product: Product }) {
  const href = productHref(product)
  const image = product.gallery?.find((item) => item.url)

  return (
    <article className="mbc-product-card border border-[var(--line)] bg-white/6" key={product.id}>
      <a className="mbc-product-card-media" href={href}>
        <img alt={productAlt(product)} className="mbc-product-card-image" height={image?.height || 941} loading={index < 2 ? 'eager' : 'lazy'} src={productImage(product)} width={image?.width || 1672} />
        <span className="mbc-product-card-badge"><Flame aria-hidden="true" size={18} /> {String(index + 1).padStart(2, '0')}</span>
      </a>
      <div className="p-[22px]">
        <p className="mb-2 text-xs font-black text-[var(--accent)]">{product.sku}</p>
        <h3 className="mb-2.5 text-[18px]"><a href={href}>{product.name}</a></h3>
        <span className="leading-[1.55] text-[var(--muted)]">{product.shortDescription}</span>
        <strong className="mt-4 block text-2xl">{formatPrice(product.price)}</strong>
      </div>
    </article>
  )
}

export default async function Home() {
  const { hotProducts, newProducts, posts, categories } = await getHomeData()
  const typeCategories = categories.filter((category) => category.group === 'type')
  const colorCategories = categories.filter((category) => category.group === 'color')
  const heroFeatures = [
    { icon: PencilRuler, label: 'Thiết kế theo yêu cầu' },
    { icon: BadgeCheck, label: 'In logo đội nhóm' },
    { icon: Palette, label: 'Màu sắc theo mẫu' },
    { icon: Droplets, label: 'Chất liệu cao cấp' },
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
      <SiteHeader legacyNavigation={fallbackNavigation} />

      <TenantPromoHero ariaLabel="Banner may áo bóng chuyền thiết kế riêng" className="mbc-home-hero" slides={heroBanners}>
        <div className="mbc-home-hero-copy max-w-[650px]">
          <p className="mb-[18px] text-[clamp(24px,2.3vw,40px)] font-black uppercase leading-[0.95] text-[var(--sport-green)]">May áo bóng chuyền</p>
          <h1 className="mb-[18px] text-[clamp(36px,4.3vw,70px)] font-black uppercase leading-[0.92] text-white">
            Thiết kế theo yêu cầu
            <span className="block">Dấu ấn riêng</span>
            <em className="block leading-[1.05] text-[var(--sport-green)]">của đội bạn!</em>
          </h1>
          <p className="mb-6 max-w-[520px] text-[17px] leading-[1.5] font-[650] text-[#d6dde8]">Đồng phục bóng chuyền đặt may, in tên số và logo theo màu đội.</p>
          <div className="mb-6 grid max-w-[560px] grid-cols-2 gap-px border border-[rgba(71,133,62,.58)] p-[18px] sm:grid-cols-4">
            {heroFeatures.map(({ icon: Icon, label }) => (
              <div className="flex min-h-24 flex-col items-center justify-center gap-2 bg-black/20 text-center text-white" key={label}>
                <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-[var(--accent)] text-[var(--accent)]">
                  <Icon aria-hidden="true" size={25} />
                </span>
                <strong className="max-w-[92px] text-[13px] leading-[1.15]">{label}</strong>
              </div>
            ))}
          </div>
          <a
            className="inline-flex min-h-12 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black uppercase text-white"
            href="/lien-he/"
          >
            Đặt may <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        </div>
      </TenantPromoHero>

      <section
        id="custom-order"
        className="grid grid-cols-1 gap-px border-y border-[var(--line)] px-0 py-0 md:grid-cols-3"
      >
        {[
          ['01', 'Tư vấn mẫu theo màu đội'],
          ['02', 'Chốt chất vải, form và size'],
          ['03', 'In tên số, logo, sponsor'],
        ].map(([number, text]) => (
          <article className="min-h-[170px] bg-white/4 p-6" key={number}>
            <span className="font-black text-[var(--accent)]">{number}</span>
            <h2 className="mt-[18px] text-[28px] leading-[1.05]">{text}</h2>
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
                <a className="block min-h-[142px] border border-[var(--line)] p-[18px]" href={`/${category.slug}/`} id={category.slug} key={category.id}>
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
                  href={`/${category.slug}/`}
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
            Xem thêm mẫu <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        </div>
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {newProducts.map((product, index) => <ProductCard index={index} key={product.id} product={product} />)}
        </div>
      </section>

      <section id="pricing" className="flex items-center gap-6 bg-[var(--accent)] px-[clamp(20px,5vw,76px)] py-[58px] text-white">
        <ShieldCheck aria-hidden="true" size={30} />
        <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Bảng giá gộp theo số lượng, chất vải và mức in tên số/logo.</h2>
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

      <SiteFooter />
    </main>
  )
}
