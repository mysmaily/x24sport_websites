import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

import styles from './mayaodongphuc.module.css'
import { Breadcrumbs, UniformProductCard } from './components'
import { getUniformCategories, getUniformCategory, getUniformProducts } from './lib'
import { MayAoDongPhucShell } from './shell'

type Search = { page?: string; sort?: string }

export async function getMayAoDongPhucCatalogMetadata(categorySlug?: string, search: Search = {}): Promise<Metadata> {
  const category = categorySlug ? await getUniformCategory(categorySlug) : undefined
  if (categorySlug && !category) return { title: 'Không tìm thấy danh mục' }
  const page = Math.max(1, Number(search.page) || 1)
  const title = `${category?.name || 'Mẫu đồng phục'}${page > 1 ? ` — Trang ${page}` : ''}`
  const description = category?.description || 'Khám phá mẫu đồng phục theo bối cảnh sử dụng và chọn một cấu trúc để phát triển theo nhận diện tổ chức.'
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

  return <MayAoDongPhucShell>
    <section className={styles.categoryHero}><Breadcrumbs items={category ? [{ label: 'Catalog', href: '/san-pham/' }, { label: category.name }] : [{ label: 'Catalog' }]} /><div><span>CATALOG / {category ? String(category.order || 1).padStart(2, '0') : 'ALL'}</span><h1>{title}</h1><p>{category?.description || 'Chọn theo môi trường và vai trò sử dụng. Mỗi mẫu là một điểm khởi đầu để điều chỉnh theo nhận diện riêng.'}</p><aside><b>{String(result.totalDocs).padStart(2, '0')}</b><span>mẫu cấu hình</span></aside></div></section>
    <section className={styles.catalogPage}><nav className={styles.filterRow} aria-label="Lọc theo bối cảnh"><Link className={!category ? styles.activeFilter : undefined} href="/san-pham/">Tất cả</Link>{categories.map((item) => <Link className={item.slug === category?.slug ? styles.activeFilter : undefined} href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}<Link href={`${basePath}?sort=oldest`}><SlidersHorizontal /> Sắp xếp</Link></nav><div className={styles.catalogSummary}><p>Đang hiển thị <b>{result.totalDocs} mẫu</b> có thể cấu hình</p><span>Sắp xếp: {search.sort === 'oldest' ? 'Cũ trước' : 'Đề xuất'}</span></div>{result.docs.length ? <div className={styles.categoryGrid}>{result.docs.map((product, index) => <UniformProductCard eager={index < 3} key={product.id} product={product} />)}</div> : <div className={styles.catalogCta}><div><span>DANH MỤC ĐANG BỔ SUNG</span><h2>Khám phá các bối cảnh đồng phục khác.</h2></div><Link href="/san-pham/">Xem toàn bộ catalog <ArrowRight /></Link></div>}{result.totalPages > 1 ? <nav className={styles.pagination} aria-label="Phân trang">{Array.from({ length: result.totalPages }, (_, index) => index + 1).map((value) => <Link aria-current={value === page ? 'page' : undefined} href={`${basePath}${value > 1 ? `?page=${value}` : ''}`} key={value}>{value}</Link>)}</nav> : null}<div className={styles.catalogCta}><div><span>CẦN MỘT HƯỚNG KHÁC?</span><h2>Bắt đầu từ nhu cầu thật của đội ngũ.</h2></div><Link href="/#quy-trinh">Xem quy trình <ArrowRight /></Link></div></section>
  </MayAoDongPhucShell>
}
