import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Menu, Phone, Search } from 'lucide-react'

import type { ProductPreview, SportCategory } from '../../lib/catalog'
import { getCategories, getCategory, getProductsPage } from '../../lib/content'

const money = (value?: number | null, currency = 'VND') => typeof value === 'number' && value > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value) : 'Liên hệ'

export function RynoHeader() {
  return <header className="ryno-store-header"><Link href="/" className="ryno-logo">RYNO<span>SPORT</span></Link><nav><Link href="/san-pham/">Sản phẩm</Link><Link href="/danh-muc/bong-da/">Bóng đá</Link><Link href="/danh-muc/cau-long/">Cầu lông</Link><Link href="/danh-muc/bong-chuyen/">Bóng chuyền</Link><Link href="/danh-muc/pickleball/">Pickleball</Link></nav><a href="tel:0989371161"><Phone size={16} />098 937 11 61</a><Menu className="ryno-store-menu" /></header>
}

function RynoFooter() { return <footer className="ryno-store-footer"><strong>RYNO<span>SPORT</span></strong><p>Trang phục thể thao cho tinh thần đồng đội.</p><a href="tel:0989371161">Tư vấn 098 937 11 61</a></footer> }

function RynoCard({ product }: { product: ProductPreview }) {
  return <article className="ryno-product-card"><Link className="ryno-product-image" href={`/${product.slug}/`}><Image src={product.image} alt={product.name} width={900} height={900} sizes="(max-width: 720px) 50vw, (max-width: 1080px) 33vw, 25vw" /></Link><div><span>{product.category}</span><h2><Link href={`/${product.slug}/`}>{product.name}</Link></h2><p>{product.compareAtPrice && <del>{money(product.compareAtPrice, product.currency)}</del>}<b>{money(product.price, product.currency)}</b></p></div></article>
}

function RynoCatalogBody({ title, description, categories, products, activeSlug }: { title: string; description: string; categories: SportCategory[]; products: ProductPreview[]; activeSlug?: string }) {
  return <main className="ryno-catalog"><section className="ryno-catalog-intro"><p>RYNOSPORT / BỘ SƯU TẬP</p><h1>{title}</h1><span>{description}</span></section><section className="ryno-catalog-content"><div className="ryno-catalog-toolbar"><nav aria-label="Danh mục RynoSport"><Link className={!activeSlug ? 'active' : undefined} href="/san-pham/">Tất cả</Link>{categories.map((category) => <Link className={activeSlug === category.slug ? 'active' : undefined} href={`/danh-muc/${category.slug}/`} key={category.slug}>{category.name}</Link>)}</nav><form action="/san-pham/"><label className="sr-only" htmlFor="ryno-search">Tìm sản phẩm</label><input id="ryno-search" name="q" placeholder="Tìm mẫu áo..." /><button aria-label="Tìm kiếm"><Search size={17} /></button></form></div><div className="ryno-result-label"><span>{activeSlug ? `Bộ sưu tập ${title}` : 'Tất cả mẫu đang có'}</span><b>{products.length} sản phẩm</b></div>{products.length ? <div className="ryno-product-grid">{products.map((product) => <RynoCard product={product} key={product.slug} />)}</div> : <div className="ryno-empty"><h2>Danh mục đang được bổ sung</h2><Link href="/san-pham/">Xem toàn bộ sản phẩm <ArrowRight /></Link></div>}</section></main>
}

export async function RynoProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const search = await searchParams
  const [{ products }, categories] = await Promise.all([getProductsPage({ limit: 60, query: search.q?.trim() }), getCategories()])
  return <div className="ryno-store"><RynoHeader /><RynoCatalogBody title="Sản phẩm RynoSport" description="Khám phá trang phục thể thao dành cho đội nhóm, câu lạc bộ và những người luôn muốn tiến lên." categories={categories} products={products} /><RynoFooter /></div>
}

export async function RynoCategoryPage({ slug }: { slug: string }) {
  const [category, categories] = await Promise.all([getCategory(slug), getCategories()])
  if (!category) return null
  const { products } = await getProductsPage({ categorySlug: slug, limit: 60 })
  return <div className="ryno-store"><RynoHeader /><RynoCatalogBody title={category.name} description={category.description || `Mẫu trang phục ${category.name.toLowerCase()} được chọn cho đội hình của bạn.`} categories={categories} products={products} activeSlug={slug} /><RynoFooter /></div>
}
