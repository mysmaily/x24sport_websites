import Image from 'next/image'
import Link from 'next/link'
import type { ProductPreview } from '../../lib/catalog'

const formatPrice = (value?: number | null, currency = 'VND') =>
  typeof value === 'number' && value > 0
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    : 'Liên hệ'

export function ProductCard({ product, headingLevel = 3, imagePriority = false }: { product: ProductPreview; headingLevel?: 2 | 3; imagePriority?: boolean }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article className="product-card catalog-card">
      <Link className="product-image" href={`/${product.slug}/`}>
        <Image src={product.image} alt={product.name} width={900} height={900}
          fetchPriority={imagePriority ? 'high' : 'auto'} loading={imagePriority ? 'eager' : 'lazy'}
          sizes="(max-width: 700px) 48vw, (max-width: 1100px) 24vw, 18vw" />
        {product.stockStatus === 'outofstock' && <span className="product-badge">Tạm hết hàng</span>}
      </Link>
      <div className="product-info">
        <Heading><Link href={`/${product.slug}/`}>{product.name}</Link></Heading>
        <div className="product-prices">
          {Boolean(product.compareAtPrice && product.compareAtPrice > 0) && <del>{formatPrice(product.compareAtPrice, product.currency)}</del>}
          <strong>{formatPrice(product.price, product.currency)}</strong>
        </div>
      </div>
    </article>
  )
}
