import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

import { getCategories, getCategory, getProductsPage } from '../../../lib/content'
import { Breadcrumbs, ProductGrid, QuoteBand } from '../../pndsport-preview/components'
import styles from '../../pndsport-preview/pnd.module.css'
import { toPndProduct } from './lib'
import { PndShell } from './shell'

type Search = { page?: string; q?: string; sort?: string }

function pageHref(basePath: string, page: number, search: Search) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (search.q?.trim()) params.set('q', search.q.trim())
  if (search.sort) params.set('sort', search.sort)
  const query = params.toString()
  return `${basePath}${query ? `?${query}` : ''}`
}

export async function getPndCatalogMetadata(categorySlug: string | undefined, search: Search): Promise<Metadata> {
  const category = categorySlug ? await getCategory(categorySlug) : undefined
  if (categorySlug && !category) return { title: 'Không tìm thấy danh mục' }
  const page = Math.max(1, Number(search.page) || 1)
  const basePath = category ? `/danh-muc/${category.slug}/` : '/san-pham/'
  const title = `${category ? category.name : 'Tất cả sản phẩm'}${page > 1 ? ` - Trang ${page}` : ''}`
  const description = category?.description || 'Khám phá mẫu trang phục thể thao PND Sport theo từng bộ môn và gửi yêu cầu thiết kế, phối màu, logo, tên số.'
  const filtered = Boolean(search.q?.trim() || search.sort)
  return {
    title,
    description,
    alternates: { canonical: filtered ? basePath : pageHref(basePath, page, {}) },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: pageHref(basePath, page, {}) },
  }
}

export async function PndCatalogPage({ categorySlug, search }: { categorySlug?: string; search: Search }) {
  const page = Math.max(1, Number(search.page) || 1)
  const sort = search.sort === 'price' ? 'price' : search.sort === 'price-desc' ? '-price' : '-createdAt'
  const [category, categories, result] = await Promise.all([
    categorySlug ? getCategory(categorySlug) : Promise.resolve(undefined),
    getCategories(),
    getProductsPage({ categorySlug, page, limit: 20, query: search.q?.trim(), sort }),
  ])
  if (categorySlug && !category) notFound()
  if (page > 1 && (result.totalPages === 0 || page > result.totalPages)) notFound()
  const title = category?.name || 'Tất cả sản phẩm'
  const basePath = category ? `/danh-muc/${category.slug}/` : '/san-pham/'
  const products = result.products.map(toPndProduct)

  return <PndShell>
    <Breadcrumbs base="" items={category ? [{ label: 'Sản phẩm', href: '/san-pham/' }, { label: category.name }] : [{ label: 'Sản phẩm' }]} />
    <section className={styles.pageHero}><div className={styles.pageHeroInner}><div><span className={styles.eyebrow}>Kho mẫu PND Sport</span><h1>{title}</h1><p>{category?.description || 'Chọn mẫu theo bộ môn. Giá công khai là mức thấp nhất của sản phẩm; báo giá cuối cùng được xác nhận theo cấu hình thực tế.'}</p></div><aside>{result.totalDocs} mẫu</aside></div></section>
    <section className={styles.section}><div className={styles.sectionInner}>
      <nav className={styles.filterBar} aria-label="Lọc theo bộ môn"><Link className={!category ? styles.active : undefined} href="/san-pham/">Tất cả mẫu</Link>{categories.slice(0, 8).map((item) => <Link className={item.slug === category?.slug ? styles.active : undefined} href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}<Link href={`${basePath}?sort=price`}><SlidersHorizontal size={14} /> Giá thấp trước <ChevronDown size={13} /></Link></nav>
      <div className={styles.catalogLayout}><aside className={styles.catalogAside}><h2>Nhóm sản phẩm</h2><Link href="/san-pham/">Tất cả sản phẩm<span>→</span></Link>{categories.map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}<span>→</span></Link>)}</aside><div><div className={styles.catalogMainHeader}><span>{search.q ? `Kết quả cho “${search.q}”` : `Hiển thị ${result.totalDocs} sản phẩm`}</span><form action={basePath}><label className={styles.srOnly} htmlFor="pnd-sort">Sắp xếp</label><select id="pnd-sort" name="sort" defaultValue={search.sort || 'newest'}><option value="newest">Mới cập nhật</option><option value="price">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option></select><button type="submit">Áp dụng</button></form></div>{products.length ? <ProductGrid items={products} base="" /> : <section className={styles.emptyState} role="status"><h2>Chưa tìm thấy sản phẩm phù hợp</h2><p>Hãy thử từ khóa ngắn hơn hoặc xem toàn bộ kho mẫu.</p><Link href="/san-pham/">Xem tất cả sản phẩm</Link></section>}
        {result.totalPages > 1 ? <nav className={styles.pagination} aria-label="Phân trang">{page > 1 ? <Link href={pageHref(basePath, page - 1, search)}>←</Link> : null}{Array.from({ length: Math.min(5, result.totalPages) }, (_, index) => Math.max(1, Math.min(result.totalPages - 4, page - 2)) + index).filter((value) => value <= result.totalPages).map((value) => <Link aria-current={value === page ? 'page' : undefined} className={value === page ? styles.active : undefined} href={pageHref(basePath, value, search)} key={value}>{value}</Link>)}{page < result.totalPages ? <Link href={pageHref(basePath, page + 1, search)}>→</Link> : null}</nav> : null}</div></div>
      <QuoteBand compact />
    </div></section>
  </PndShell>
}
