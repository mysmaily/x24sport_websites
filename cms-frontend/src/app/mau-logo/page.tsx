import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CatalogDiscoveryNav } from '../_components/catalog-discovery-nav'
import { JsonLd } from '../_components/json-ld'
import { ProductCard } from '../_components/product-card'
import { SiteHeader } from '../_components/site-header'
import { FloatingContact, PageFooter } from '../_components/store-footer'
import { logoCollections } from '../../lib/catalog'
import { getProductsPage } from '../../lib/content'
import { breadcrumbSchema } from '../../lib/seo'

export const logoLibraryMetadata: Metadata = {
  title: 'Mẫu logo thể thao',
  description: 'Khám phá mẫu logo bóng đá, bóng chuyền, bóng rổ, pickleball và chạy bộ để chọn phong cách nhận diện phù hợp cho đội nhóm.',
  alternates: { canonical: '/mau-logo/' },
  openGraph: {
    title: 'Mẫu logo thể thao | X24Sport',
    description: 'Kho ý tưởng logo thể thao được phân nhóm rõ theo từng bộ môn.',
    url: '/mau-logo/',
  },
}

export const metadata = logoLibraryMetadata

export default async function LogoLibraryPage() {
  const shelves = await Promise.all(logoCollections.map(async (collection) => ({
    collection,
    result: await getProductsPage({ categorySlug: collection.slug, limit: 5, sort: '-createdAt' }),
  })))
  const availableShelves = shelves.filter((shelf) => shelf.result.products.length > 0)
  const totalDocs = availableShelves.reduce((total, shelf) => total + shelf.result.totalDocs, 0)

  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbSchema([{ name: 'Trang chủ', path: '/' }, { name: 'Mẫu logo', path: '/mau-logo/' }])} />
      <SiteHeader />
      <main id="noi-dung" className="catalog-page logo-library-page">
        <section className="catalog-banner logo-library-banner">
          <div className="catalog-banner-copy">
            <p>Trang chủ / Mẫu logo</p>
            <h1>Kho mẫu logo thể thao</h1>
            <span>Chọn bộ môn, tìm phong cách phù hợp rồi gửi mẫu bạn yêu thích để X24Sport tư vấn.</span>
          </div>
          <Link className="catalog-banner-link" href="/san-pham/">
            Xem sản phẩm <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
        <div className="catalog-body site-container">
          <CatalogDiscoveryNav
            activeKind="logos"
            allHref="/mau-logo/"
            allLabel="Tất cả logo"
            items={availableShelves.map(({ collection }) => ({
              href: `/danh-muc/${collection.slug}/`,
              label: collection.shortName,
            }))}
          />
          <div className="catalog-count logo-library-count">
            <span>Mỗi bộ sưu tập được tách riêng để bạn dễ so sánh đúng phong cách của môn mình chơi.</span>
            <strong>{totalDocs} mẫu logo</strong>
          </div>
          {availableShelves.length > 0
            ? availableShelves.map(({ collection, result }, shelfIndex) => (
              <section className="logo-library-section" style={{ '--logo-tone': collection.tone } as React.CSSProperties} key={collection.slug}>
                <div className="logo-library-heading">
                  <div>
                    <span>{String(shelfIndex + 1).padStart(2, '0')}</span>
                    <div>
                      <h2>{collection.name}</h2>
                      <p>{collection.description}</p>
                    </div>
                  </div>
                  <Link href={`/danh-muc/${collection.slug}/`}>
                    Xem {result.totalDocs} mẫu <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                </div>
                <div className="product-grid catalog-grid logo-library-grid">
                  {result.products.map((product, index) => (
                    <ProductCard
                      product={{ ...product, category: collection.shortName }}
                      imagePriority={shelfIndex === 0 && index < 2}
                      showCategory
                      key={product.slug}
                    />
                  ))}
                </div>
              </section>
            ))
            : <section className="catalog-no-results" role="status">
              <h2>Mẫu logo đang được cập nhật</h2>
              <p>Bạn vẫn có thể xem sản phẩm hoặc liên hệ để nhận tư vấn thiết kế theo yêu cầu.</p>
              <Link href="/san-pham/">Xem sản phẩm</Link>
            </section>}
        </div>
      </main>
      <PageFooter />
      <FloatingContact />
    </div>
  )
}
