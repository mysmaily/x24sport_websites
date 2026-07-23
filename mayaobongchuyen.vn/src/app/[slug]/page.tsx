import { ArrowLeft, ArrowUpRight, Phone, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'
import { formatPrice, getPageData } from '../../lib/content'

type RouteProps = {
  params: Promise<{ slug: string }>
}

type PageData = Awaited<ReturnType<typeof getPageData>>

const defaultOgImage = {
  url: '/images/volleyball-team-hero.png',
  width: 1672,
  height: 941,
  alt: 'Đội bóng chuyền mặc đồng phục đặt may MayaoBongChuyen',
}

const buildMenu = ({ settings, categories }: PageData) => {
  const typeCategories = categories.filter((category) => category.group === 'type')
  const colorCategories = categories.filter((category) => category.group === 'color')

  return (settings.navigation || []).map((item) =>
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
}

export async function generateMetadata({ params }: RouteProps) {
  const { slug } = await params
  const { page, tenant } = await getPageData(slug)

  if (!page) return {}

  return {
    title: `${page.title} | ${tenant.name}`,
    description: page.heroText,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${page.title} | ${tenant.name}`,
      description: page.heroText,
      images: [defaultOgImage],
      type: 'website',
      url: `/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} | ${tenant.name}`,
      description: page.heroText,
      images: [defaultOgImage.url],
    },
  }
}

export default async function CmsPage({ params }: RouteProps) {
  const { slug } = await params
  const data = await getPageData(slug)
  const { tenant, page, products } = data

  if (!page) notFound()

  const menu = buildMenu(data)

  return (
    <main>
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b-[3px] border-[var(--accent)] bg-[#080909] px-4 shadow-[0_10px_28px_rgba(0,0,0,.22)] md:h-[82px] md:px-[clamp(20px,5vw,92px)]">
        <a className="flex items-center gap-3 uppercase" href="/">
          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--accent),#911410)] text-[13px] font-black text-white shadow-[14px_0_0_-7px_rgba(238,43,36,.32)] md:h-11 md:w-11">
            VB
          </span>
          <span className="text-base font-black italic text-white md:text-[clamp(16px,1.25vw,22px)]">{tenant.name}</span>
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
        <a
          className="inline-flex h-11 w-11 items-center justify-center border border-white/16 text-white transition duration-200 hover:-translate-y-px hover:border-[rgba(238,43,36,.8)]"
          href="/lien-he"
          aria-label="Lien he"
        >
          <Phone size={18} />
        </a>
      </header>

      <section className="border-b border-[var(--line)] px-[clamp(20px,5vw,76px)] py-[clamp(42px,7vw,96px)]">
        <a className="mb-[38px] inline-flex items-center gap-2 text-[var(--muted)]" href="/">
          <ArrowLeft size={18} />
          Trang chủ
        </a>
        <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">May áo bóng chuyền</p>
        <h1 className="max-w-[980px] text-[clamp(42px,6vw,88px)] font-black leading-[0.9]">{page.heroTitle}</h1>
        <p className="max-w-[720px] text-[19px] leading-[1.7] text-[var(--muted)]">{page.heroText}</p>
        <a className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black text-white" href="/lien-he">
          Nhận tư vấn <ArrowUpRight size={18} />
        </a>
      </section>

      <section className="grid grid-cols-1 gap-px px-[clamp(20px,5vw,76px)] md:grid-cols-3">
        {(page.sections || []).map((section, index) => (
          <article className="min-h-[230px] bg-white/5 p-7" key={section.heading}>
            <span className="font-black text-[var(--accent)]">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="my-[18px] text-[28px] leading-[1.05]">{section.heading}</h2>
            <p className="leading-[1.6] text-[var(--muted)]">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-[var(--line)] px-[clamp(20px,5vw,76px)] py-[58px]">
        <div className="mb-[30px] flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="mb-[14px] text-xs font-black uppercase text-[var(--accent)]">Mẫu tham khảo</p>
            <h2 className="max-w-[820px] text-[clamp(34px,5vw,66px)] leading-[0.95]">Mẫu áo bóng chuyền nổi bật</h2>
          </div>
        </div>
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 3).map((product, index) => (
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
                <ShieldCheck size={44} />
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
    </main>
  )
}
