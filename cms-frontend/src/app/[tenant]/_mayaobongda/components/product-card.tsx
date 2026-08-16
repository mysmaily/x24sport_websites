import { ArrowUpRight, Shirt } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { productImages, productPath, type Product } from '../lib/cms'

const priceFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

function formatPrice(value: number) {
  return `${priceFormatter.format(value)}đ`
}

export function ProductCard({ product, index = 0, priority = false }: { product: Product; index?: number; priority?: boolean }) {
  const image = productImages(product)[0]
  const href = productPath(product)

  return (
    <article className="mabd-product-card">
      <Link aria-label={`Xem ${product.name}`} className="mabd-product-card-media" href={href}>
        <span className="mabd-product-card-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        {image?.url ? (
          <Image alt={image.alt || product.name} fill priority={priority} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" src={image.url} />
        ) : (
          <span className="mabd-product-card-empty" aria-hidden="true"><Shirt size={64} strokeWidth={1.2} /></span>
        )}
        <span className="mabd-product-card-view" aria-hidden="true">Xem chi tiết <ArrowUpRight size={15} /></span>
      </Link>

      <div className="mabd-product-card-copy">
        <h3><Link href={href}>{product.name}</Link></h3>
        <div className="mabd-product-card-footer">
          {typeof product.price === 'number' ? (
            <span className="mabd-product-card-price">
              {typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price ? <del>{formatPrice(product.compareAtPrice)}</del> : null}
              <strong>{formatPrice(product.price)}</strong>
            </span>
          ) : <span className="mabd-product-card-pending">Liên hệ báo giá</span>}
          <Link aria-label={`Xem chi tiết ${product.name}`} href={href}><ArrowUpRight aria-hidden="true" size={18} /></Link>
        </div>
      </div>
    </article>
  )
}
