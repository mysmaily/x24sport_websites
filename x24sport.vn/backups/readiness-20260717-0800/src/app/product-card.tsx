import Image from 'next/image'
import Link from 'next/link'
import type { ProductPreview } from '../../lib/catalog'

const formatPrice = (value?: number | null, currency = 'VND') =>
  typeof value === 'number'
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    : 'Liên hệ'

export function ProductCard({ product }: { product: ProductPreview }) {
  return (
    <article className="product-card catalog-card">
      <Link className="product-image" href={`/${product.slug}/`}>
        <Image src={product.image} alt={product.name} width={900} height={900}
          sizes="(max-width: 700px) 48vw, (max-width: 1100px) 24vw, 18vw" />
        {product.stockStatus === 'outofstock' && <span className="product-badge">Tạm hết hàng</span>}
      </Link>
      <div className="product-info">
        <h3><Link href={`/${product.slug}/`}>{product.name}</Link></h3>
        <div className="product-prices">
          {product.compareAtPrice && <del>{formatPrice(product.compareAtPrice, product.currency)}</del>}
          <strong>{formatPrice(product.price, product.currency)}</strong>
        </div>
      </div>
    </article>
  )
}
