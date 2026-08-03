import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { ProductCard } from '../_components/product-card'
import { SiteHeader } from '../_components/site-header'
import { FloatingContact, PageFooter } from '../_components/store-footer'
import { getCategories, getProductsPage } from '../../lib/content'
import { getTenantContext } from '../../lib/tenant'

export async function GenericTenantHomePage() {
  const [tenant, categories, { products }] = await Promise.all([
    getTenantContext(),
    getCategories(),
    getProductsPage({ limit: 8 }),
  ])

  return <div className="page-shell">
    <SiteHeader />
    <main id="noi-dung" className="catalog-page">
      <section className="catalog-banner">
        <div>
          <p>{tenant.name}</p>
          <h1>{tenant.name}</h1>
          <span>{tenant.description}</span>
        </div>
        <Link href="/san-pham/">Xem sản phẩm <ArrowRight size={18} /></Link>
      </section>
      <div className="catalog-body site-container">
        {categories.length > 0 ? <nav className="subcategory-links" aria-label="Danh mục sản phẩm">
          {categories.map((category) => <Link href={`/danh-muc/${category.slug}/`} key={category.slug}>{category.name}</Link>)}
        </nav> : null}
        <div className="catalog-count"><span>Sản phẩm mới</span><strong>{products.length} sản phẩm</strong></div>
        {products.length > 0
          ? <div className="product-grid catalog-grid">{products.map((product, index) => <ProductCard product={product} headingLevel={2} imagePriority={index < 2} key={product.slug} />)}</div>
          : <section className="catalog-no-results" role="status"><h2>Sản phẩm đang được cập nhật</h2><p>Liên hệ để được tư vấn mẫu phù hợp với nhu cầu của bạn.</p></section>}
      </div>
    </main>
    <PageFooter />
    <FloatingContact />
  </div>
}
