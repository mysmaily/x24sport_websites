import type { Product } from '../lib/cms'

import { ProductCard } from './product-card'

export function ProductGrid({ products, priorityImages = true }: { products: Product[]; priorityImages?: boolean }) {
  if (!products.length) return <div className="mabd-product-grid-empty" role="status"><b>Chưa tìm thấy mẫu phù hợp.</b><p>Thử một tên mẫu, mã áo hoặc màu sắc khác.</p></div>
  return <div className="mabd-product-grid">{products.map((product, index) => <ProductCard index={index} key={product.id} priority={priorityImages && index < 4} product={product} />)}</div>
}
