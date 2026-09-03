import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { categories, getCategory, products } from './data'
import { ProductCard } from './home'
import { DongPhucX24Shell } from './shell'
import styles from './dongphucx24.module.css'

export function getDongPhucX24CatalogMetadata(categorySlug?: string): Metadata {
  const category = getCategory(categorySlug)
  const hasProducts = !category || products.some((product) => product.category === category.slug)
  const title = category ? `${category.name} | Đồng Phục X24` : 'Catalog đồng phục công ty, lớp, F&B & sự kiện | Đồng Phục X24'
  const description = category?.description || 'Khám phá mẫu đồng phục công ty, nhà hàng, trường học, team building, bảo hộ và dịch vụ để phát triển theo nhận diện riêng.'
  const path = category ? `/danh-muc/${category.slug}/` : '/san-pham/'
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `https://dongphucx24.vn${path}` },
    openGraph: { title, description, url: `https://dongphucx24.vn${path}` },
    robots: hasProducts ? undefined : { index: false, follow: true },
  }
}

export function DongPhucX24CatalogPage({ categorySlug }: { categorySlug?: string }) {
  const category = getCategory(categorySlug)
  const visibleProducts = category ? products.filter((product) => product.category === category.slug) : products
  return <DongPhucX24Shell><main className={styles.catalogPage} id="main-content">
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Trang chủ</Link><span>/</span>{category ? <><Link href="/san-pham/">Sản phẩm</Link><span>/</span><b>{category.name}</b></> : <b>Sản phẩm</b>}</nav>
    <header className={styles.catalogIntro}><div><span>CATALOG / {String(visibleProducts.length).padStart(2, '0')} MẪU</span><h1>{category?.name || 'Mẫu áo đồng phục thiết kế theo yêu cầu'}</h1><p>{category?.description || 'Chọn mẫu áo gần đúng, sau đó điều chỉnh màu sắc, in thêu logo, chất liệu, form và size theo yêu cầu của tổ chức.'}</p></div><Link href="/#nhan-tu-van">Chuẩn bị yêu cầu đặt may <ArrowRight aria-hidden="true" /></Link></header>
    <div className={styles.filterBar}><div>{categories.map((item) => <Link aria-current={item.slug === categorySlug ? 'page' : undefined} href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}</div><details className={styles.filterMenu}><summary><SlidersHorizontal aria-hidden="true" /> Nhóm khác</summary><div>{categories.map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}</div></details></div>
    {visibleProducts.length ? <div className={styles.productGrid}>{visibleProducts.map((product, index) => <ProductCard key={product.slug} priority={index < 4} product={product} />)}</div> : <section className={styles.emptyState}><h2>Chưa có mẫu trong nhóm này</h2><p>Hãy xem toàn bộ catalog hoặc cho X24 biết loại đồng phục cần may để được gợi ý mẫu phù hợp.</p><Link href="/san-pham/">Xem toàn bộ mẫu</Link></section>}
  </main></DongPhucX24Shell>
}
