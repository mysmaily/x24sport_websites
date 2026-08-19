import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

import styles from './mayaodongphuc.module.css'
import { Breadcrumbs, UniformProductCard } from './components'
import { getUniformCategories, getUniformCategory, getUniformProducts } from './lib'
import { MayAoDongPhucShell } from './shell'

type Search = { page?: string; sort?: string }

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

export async function getMayAoDongPhucCatalogMetadata(categorySlug?: string, search: Search = {}): Promise<Metadata> {
  const category = categorySlug ? await getUniformCategory(categorySlug) : undefined
  if (categorySlug && !category) return { title: 'Không tìm thấy danh mục' }
  const page = Math.max(1, Number(search.page) || 1)
  const categoryContent = categorySlug ? CATEGORY_CONTENT[categorySlug] : undefined
  const title = `${category?.name || 'Mẫu đồng phục'}${page > 1 ? ` — Trang ${page}` : ''}`
  const description = categoryContent?.description || category?.description || 'Khám phá mẫu đồng phục theo bối cảnh sử dụng và chọn một mẫu phù hợp để phát triển theo nhận diện tổ chức.'
  const path = category ? `/danh-muc/${category.slug}/` : '/san-pham/'
  const canonical = page > 1 ? `${path}?page=${page}` : path
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } }
}

export async function MayAoDongPhucCatalogPage({ categorySlug, search = {} }: { categorySlug?: string; search?: Search }) {
  const page = Math.max(1, Number(search.page) || 1)
  const sort = search.sort === 'oldest' ? 'createdAt' : '-featured,-createdAt'
  const [category, categories, result] = await Promise.all([
    categorySlug ? getUniformCategory(categorySlug) : Promise.resolve(undefined),
    getUniformCategories(),
    getUniformProducts({ categorySlug, page, limit: 18, sort }),
  ])
  if (categorySlug && !category) notFound()
  if (page > 1 && page > result.totalPages) notFound()
  const title = category?.name || 'Tất cả mẫu đồng phục'
  const basePath = category ? `/danh-muc/${category.slug}/` : '/san-pham/'
  const categoryContent = category?.slug ? CATEGORY_CONTENT[category.slug] : undefined
  const heroDescription = categoryContent?.description || category?.description || 'Chọn theo môi trường và vai trò sử dụng. Mỗi mẫu là một điểm khởi đầu để điều chỉnh theo nhận diện riêng.'
  const resultLabel = category ? 'mẫu phù hợp' : 'mẫu đồng phục'

  return <MayAoDongPhucShell>
    <section className={styles.categoryHero}><Breadcrumbs items={category ? [{ label: 'Catalog', href: '/san-pham/' }, { label: category.name }] : [{ label: 'Catalog' }]} /><div><span>CATALOG / {category ? String(category.order || 1).padStart(2, '0') : 'ALL'}</span><h1>{title}</h1><p>{heroDescription}</p><aside><b>{String(result.totalDocs).padStart(2, '0')}</b><span>{resultLabel}</span></aside></div></section>
    <section className={styles.catalogPage}><nav className={styles.filterRow} aria-label="Lọc và sắp xếp catalog"><Link aria-current={!category ? 'page' : undefined} className={!category ? styles.activeFilter : undefined} href="/san-pham/">Tất cả</Link>{categories.map((item) => <Link aria-current={item.slug === category?.slug ? 'page' : undefined} className={item.slug === category?.slug ? styles.activeFilter : undefined} href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}<span className={styles.sortLabel}><SlidersHorizontal aria-hidden="true" /> Sắp xếp</span><Link aria-current={search.sort !== 'oldest' ? 'page' : undefined} className={search.sort !== 'oldest' ? styles.activeSort : undefined} href={basePath}>Đề xuất</Link><Link aria-current={search.sort === 'oldest' ? 'page' : undefined} className={search.sort === 'oldest' ? styles.activeSort : undefined} href={`${basePath}?sort=oldest`}>Cũ trước</Link></nav><div className={styles.catalogSummary}><p>Đang hiển thị <b>{result.totalDocs} {resultLabel}</b></p><span>Sắp xếp: {search.sort === 'oldest' ? 'Cũ trước' : 'Đề xuất'}</span></div>{result.docs.length ? <div className={styles.categoryGrid}>{result.docs.map((product, index) => <UniformProductCard eager={index < 3} key={product.id} product={product} />)}</div> : <div className={styles.catalogCta}><div><span>DANH MỤC ĐANG BỔ SUNG</span><h2>Khám phá các bối cảnh đồng phục khác.</h2></div><Link href="/san-pham/">Xem toàn bộ catalog <ArrowRight /></Link></div>}{result.totalPages > 1 ? <nav className={styles.pagination} aria-label="Phân trang">{Array.from({ length: result.totalPages }, (_, index) => index + 1).map((value) => <Link aria-current={value === page ? 'page' : undefined} href={`${basePath}${value > 1 ? `?page=${value}` : ''}`} key={value}>{value}</Link>)}</nav> : null}{categoryContent ? <section className={styles.categorySeoBlock} aria-labelledby="category-seo-heading"><div><span>GỢI Ý CHỌN MẪU</span><h2 id="category-seo-heading">Áo đồng phục dã ngoại và team building cho đội nhóm</h2><p>{categoryContent.summary}</p></div><div>{categoryContent.sections.map((section) => <article key={section.title}><h3>{section.title}</h3><p>{section.text}</p></article>)}</div></section> : null}<div className={styles.catalogCta}><div><span>CẦN MỘT HƯỚNG KHÁC?</span><h2>Bắt đầu từ nhu cầu thật của đội ngũ.</h2></div><Link href="/#quy-trinh">Xem quy trình <ArrowRight /></Link></div></section>
  </MayAoDongPhucShell>
}
