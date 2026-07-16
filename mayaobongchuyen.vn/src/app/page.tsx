import { ArrowUpRight, BadgeCheck, Droplets, Flame, Palette, PencilRuler, Phone, Search, ShieldCheck } from 'lucide-react'
import { formatPrice, getHomeData } from '../lib/content'

export default async function Home() {
  const { products, posts, settings, categories } = await getHomeData()
  const navigation = settings.navigation || []
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
          <a
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/16 text-white transition duration-200 hover:-translate-y-px hover:border-[rgba(238,43,36,.8)]"
            href="/ao-bong-chuyen"
            aria-label="Tìm kiếm"
          >
            <Search size={21} />
          </a>
        </div>
      </header>

      <section className="relative min-h-[min(660px,calc(100dvh-72px))] overflow-hidden bg-[#f5f6f4] md:min-h-[min(660px,calc(100dvh-82px))]" aria-label="Banner may áo bóng chuyền">
        <div
          className="absolute inset-0 bg-cover bg-left bg-no-repeat after:absolute after:inset-0 after:bg-[linear-gradient(90deg,transparent_0%,transparent_43%,rgba(255,255,255,.78)_58%,#fff_74%),linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.22))] after:content-['']"
          style={{ backgroundImage: "url('/images/volleyball-team-hero.png')" }}
        />
        <div className="relative z-10 ml-auto flex min-h-[min(660px,calc(100dvh-72px))] max-w-[650px] flex-col justify-center px-6 py-[34px] text-[#0d1422] md:min-h-[min(660px,calc(100dvh-82px))] md:px-[clamp(24px,5vw,82px)] md:py-[50px]">
          <p className="mb-[18px] text-[clamp(24px,2.3vw,40px)] font-black uppercase leading-[0.95] text-[var(--sport-green)]">May áo bóng chuyền</p>
          <h1 className="mb-[18px] text-[clamp(36px,4.3vw,70px)] font-black uppercase leading-[0.92] text-[#0b1423]">
            Thiết kế theo yêu cầu
            <span className="block">Dấu ấn riêng</span>
            <em className="block leading-[1.05] text-[var(--sport-green)]">của đội bạn!</em>
          </h1>
          <p className="mb-6 max-w-[520px] text-[17px] leading-[1.5] font-[650] text-[#4c5563]">Đồng phục bóng chuyền đặt may, in tên số và logo theo màu đội.</p>
          <div className="mb-6 grid max-w-[560px] grid-cols-2 gap-px border border-[rgba(71,133,62,.58)] p-[18px] sm:grid-cols-4">
            {heroFeatures.map(({ icon: Icon, label }) => (
              <div className="flex min-h-24 flex-col items-center justify-center gap-2 text-center text-[#253040]" key={label}>
                <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-[var(--accent)] text-[var(--accent)]">
                  <Icon size={25} />
                </span>
                <strong className="max-w-[92px] text-[13px] leading-[1.15]">{label}</strong>
              </div>
            ))}
          </div>
          <a
            className="inline-flex min-h-12 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black uppercase text-white"
            href="/dat-may-theo-yeu-cau"
          >
            Đặt may <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="absolute bottom-[22px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_0_3px_rgba(0,0,0,.12)]" />
          <span className="h-3 w-3 rounded-full bg-white/80" />
        </div>
      </section>

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

      <section id="products" className="px-[clamp(20px,5vw,76px)] py-[58px]">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Mẫu đã làm</p>
            <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Mẫu áo bóng chuyền nổi bật</h2>
          </div>
        </div>
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <article className="border border-[var(--line)] bg-white/6" key={product.id}>
              <div
                className={`relative flex h-[280px] items-center justify-center ${
                  index === 0
                    ? 'bg-[linear-gradient(135deg,#f97316,#7c2d12)]'
                    : index === 1
                      ? 'bg-[linear-gradient(135deg,#2563eb,#111827)]'
                      : 'bg-[linear-gradient(135deg,#f6c445,#111827)] text-[#111]'
                }`}
              >
                <Flame size={48} />
                <span className="absolute right-7 bottom-[26px] text-[42px] font-black">{String(index + 7).padStart(2, '0')}</span>
              </div>
              <div className="p-[22px]">
                <p className="mb-2 text-xs font-black text-[var(--accent)]">{product.sku}</p>
                <h3 className="mb-2.5 text-[23px]">{product.name}</h3>
                <span className="leading-[1.55] text-[var(--muted)]">{product.shortDescription}</span>
                <strong className="mt-4 block text-2xl">{formatPrice(product.price)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="flex items-center gap-6 bg-[var(--accent)] px-[clamp(20px,5vw,76px)] py-[58px] text-white">
        <ShieldCheck size={30} />
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

      <footer id="contact" className="border-t border-[var(--line)] bg-[#05070c] px-[clamp(20px,5vw,76px)] py-[58px]">
        <p className="font-black uppercase text-[var(--accent)]">Custom volleyball teamwear</p>
        <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">San sang len mau cho doi cua ban.</h2>
        <a className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black text-white" href="/lien-he">
          Goi tu van
        </a>
      </footer>
    </main>
  )
}
