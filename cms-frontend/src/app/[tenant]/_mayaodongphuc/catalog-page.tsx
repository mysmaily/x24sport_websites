import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronDown, Palette, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

import styles from './mayaodongphuc.module.css'
import { Breadcrumbs, UniformProductCard } from './components'
import { getUniformCategories, getUniformCategory, getUniformColorFilters, getUniformProducts, isIndexableUniformColorSlug, uniformColorLabelFromSlug } from './lib'
import { MayAoDongPhucShell } from './shell'

type Search = { mau?: string; page?: string; sort?: string }

const CATEGORY_CONTENT: Record<string, {
  description: string
  summary: string
  sections: Array<{ title: string; text: string }>
}> = {
  'dong-phuc-da-ngoai-team-building': {
    description: 'Mẫu áo đồng phục dã ngoại, áo team building và company outing cho doanh nghiệp, trường lớp, câu lạc bộ; dễ đổi màu, thêm logo và điều chỉnh theo hoạt động thực tế.',
    summary: 'Tập hợp các mẫu áo đồng phục dã ngoại và team building phù hợp cho công ty, lớp học, câu lạc bộ hoặc đội nhóm cần hình ảnh đồng bộ khi đi picnic, du lịch, outing và hoạt động gắn kết.',
    sections: [
      { title: 'Dễ nhận diện trong hoạt động đông người', text: 'Màu áo, đường phối và vị trí logo được ưu tiên để cả đội nổi bật trong ảnh tập thể, trò chơi ngoài trời và khu vực sự kiện.' },
      { title: 'Thoải mái cho lịch trình di chuyển', text: 'Có thể chọn chất liệu thoáng, nhẹ, nhanh khô hoặc giữ form tốt tùy theo chương trình dã ngoại, team building bãi biển, resort hay hoạt động nội bộ.' },
      { title: 'Bắt đầu từ mẫu có sẵn, chỉnh theo đội nhóm', text: 'Khách hàng có thể chọn một mẫu gần đúng, sau đó đổi màu thương hiệu, thêm slogan, logo công ty, tên lớp hoặc thông điệp riêng trước khi báo giá.' },
    ],
  },
}

export async function getMayAoDongPhucCatalogMetadata(categorySlug?: string, search: Search = {}, colorSlug?: string): Promise<Metadata> {
  const category = categorySlug ? await getUniformCategory(categorySlug) : undefined
  if (categorySlug && !category) return { title: 'Không tìm thấy danh mục' }
  const page = Math.max(1, Number(search.page) || 1)
  const activeColorSlug = colorSlug || search.mau
  const colorLabel = uniformColorLabelFromSlug(activeColorSlug)
  const categoryContent = categorySlug ? CATEGORY_CONTENT[categorySlug] : undefined
  const title = `${category?.name || 'Mẫu đồng phục'}${colorLabel ? ` ${colorLabel}` : ''}${page > 1 ? ` — Trang ${page}` : ''}`
  const description = colorLabel
    ? `Khám phá các mẫu ${title.toLocaleLowerCase('vi-VN')} có thể điều chỉnh theo logo, nhận diện và hoạt động thực tế của tổ chức.`
    : categoryContent?.description || category?.description || 'Khám phá mẫu đồng phục theo bối cảnh sử dụng và chọn một mẫu phù hợp để phát triển theo nhận diện tổ chức.'
  const path = category ? `/danh-muc/${category.slug}/` : '/san-pham/'
  const colorPath = colorSlug && isIndexableUniformColorSlug(colorSlug) ? `${path}${colorSlug}/` : path
  const canonical = page > 1 ? `${colorPath}?page=${page}` : colorPath
  const queryColorRobots = search.mau && !colorSlug ? { index: false, follow: true } : undefined
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical }, robots: queryColorRobots }
}

export async function MayAoDongPhucCatalogPage({ categorySlug, colorSlug, search = {} }: { categorySlug?: string; colorSlug?: string; search?: Search }) {
  if (colorSlug && !isIndexableUniformColorSlug(colorSlug)) notFound()
  const page = Math.max(1, Number(search.page) || 1)
  const sort = search.sort === 'oldest' ? 'createdAt' : '-featured,-createdAt'
  const activeColorSlug = colorSlug || search.mau
  const [category, categories, result] = await Promise.all([
    categorySlug ? getUniformCategory(categorySlug) : Promise.resolve(undefined),
    getUniformCategories(),
    getUniformProducts({ categorySlug, colorSlug: activeColorSlug, page, limit: 18, sort }),
  ])
  if (categorySlug && !category) notFound()
  if (page > 1 && page > result.totalPages) notFound()
  const title = category?.name || 'Tất cả mẫu đồng phục'
  const basePath = category ? `/danh-muc/${category.slug}/` : '/san-pham/'
  const colorFilters = await getUniformColorFilters({ basePath, categorySlug, sort })
  const activeColor = colorFilters.find((item) => item.slug === activeColorSlug) || (activeColorSlug ? { label: uniformColorLabelFromSlug(activeColorSlug), slug: activeColorSlug } : undefined)
  if (activeColorSlug && !activeColor?.label) notFound()
  const categoryContent = category?.slug ? CATEGORY_CONTENT[category.slug] : undefined
  const heroDescription = activeColor?.label
    ? `Các mẫu ${title.toLocaleLowerCase('vi-VN')} ${activeColor.label} đang có trong catalog, phù hợp để phát triển thêm logo, slogan và nhận diện riêng.`
    : categoryContent?.description || category?.description || 'Chọn theo môi trường và vai trò sử dụng. Mỗi mẫu là một điểm khởi đầu để điều chỉnh theo nhận diện riêng.'
  const resultLabel = category ? 'mẫu phù hợp' : 'mẫu đồng phục'
  const resultText = activeColor?.label ? `${resultLabel} ${activeColor.label}` : resultLabel
  const sortQuery = search.sort === 'oldest' ? '?sort=oldest' : ''
  const pageHref = (value: number) => {
    const params = new URLSearchParams()
    if (!colorSlug && search.mau) params.set('mau', search.mau)
    if (search.sort === 'oldest') params.set('sort', 'oldest')
    if (value > 1) params.set('page', String(value))
    return `${colorSlug ? `${basePath}${colorSlug}/` : basePath}${params.size ? `?${params}` : ''}`
  }

  return <MayAoDongPhucShell>
    <section className={styles.categoryHero}><Breadcrumbs items={category ? [{ label: 'Catalog', href: '/san-pham/' }, { label: category.name }, ...(activeColor?.label ? [{ label: activeColor.label }] : [])] : [{ label: 'Catalog' }]} /><div><span>CATALOG / {category ? String(category.order || 1).padStart(2, '0') : 'ALL'}</span><h1>{activeColor?.label ? `${title} ${activeColor.label}` : title}</h1><p>{heroDescription}</p><aside><b>{String(result.totalDocs).padStart(2, '0')}</b><span>{resultText}</span></aside></div></section>
    <section className={styles.catalogPage}><nav className={styles.filterRow} aria-label="Lọc catalog theo nhóm"><Link aria-current={!category ? 'page' : undefined} className={!category ? styles.activeFilter : undefined} href="/san-pham/">Tất cả</Link>{categories.map((item) => <Link aria-current={item.slug === category?.slug ? 'page' : undefined} className={item.slug === category?.slug ? styles.activeFilter : undefined} href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}</nav><div className={styles.catalogSummary}><p>Đang hiển thị <b>{result.totalDocs} {resultText}</b></p><div className={styles.catalogTools}><details className={styles.colorFilter}><summary><Palette aria-hidden="true" /><span>{activeColor?.label || 'Lọc theo màu'}</span><ChevronDown aria-hidden="true" /></summary><div className={styles.colorPanel}><Link className={styles.colorAll} href={`${basePath}${sortQuery}`}>Tất cả màu</Link>{colorFilters.map((item) => <Link aria-current={item.slug === activeColorSlug ? 'page' : undefined} href={item.href} key={item.slug}><span>{item.label}</span><small>{item.count}</small></Link>)}</div></details><span className={styles.sortLabel}><SlidersHorizontal aria-hidden="true" /> Sắp xếp</span><Link aria-current={search.sort !== 'oldest' ? 'page' : undefined} className={search.sort !== 'oldest' ? styles.activeSort : undefined} href={colorSlug ? `${basePath}${colorSlug}/` : activeColorSlug ? `${basePath}?mau=${activeColorSlug}` : basePath}>Đề xuất</Link><Link aria-current={search.sort === 'oldest' ? 'page' : undefined} className={search.sort === 'oldest' ? styles.activeSort : undefined} href={colorSlug ? `${basePath}${colorSlug}/?sort=oldest` : activeColorSlug ? `${basePath}?mau=${activeColorSlug}&sort=oldest` : `${basePath}?sort=oldest`}>Cũ trước</Link></div></div>{result.docs.length ? <div className={styles.categoryGrid}>{result.docs.map((product, index) => <UniformProductCard eager={index < 3} key={product.id} product={product} />)}</div> : <div className={styles.catalogCta}><div><span>CHƯA CÓ MẪU PHÙ HỢP</span><h2>Thử màu khác hoặc xem toàn bộ catalog.</h2></div><Link href={basePath}>Xem toàn bộ màu <ArrowRight /></Link></div>}{result.totalPages > 1 ? <nav className={styles.pagination} aria-label="Phân trang">{Array.from({ length: result.totalPages }, (_, index) => index + 1).map((value) => <Link aria-current={value === page ? 'page' : undefined} href={pageHref(value)} key={value}>{value}</Link>)}</nav> : null}{categoryContent ? <section className={styles.categorySeoBlock} aria-labelledby="category-seo-heading"><div><span>GỢI Ý CHỌN MẪU</span><h2 id="category-seo-heading">Áo đồng phục dã ngoại và team building cho đội nhóm</h2><p>{categoryContent.summary}</p></div><div>{categoryContent.sections.map((section) => <article key={section.title}><h3>{section.title}</h3><p>{section.text}</p></article>)}</div></section> : null}<div className={styles.catalogCta}><div><span>CẦN MỘT HƯỚNG KHÁC?</span><h2>Bắt đầu từ nhu cầu thật của đội ngũ.</h2></div><Link href="/#quy-trinh">Xem quy trình <ArrowRight /></Link></div></section>
  </MayAoDongPhucShell>
}
