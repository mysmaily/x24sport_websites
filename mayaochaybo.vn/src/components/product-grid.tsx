import type { Product } from '@/lib/cms'

import { ProductCard } from './product-card'

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600"><b className="text-slate-950">Chưa tìm thấy mẫu phù hợp.</b><p className="mt-2">Thử một tên hoặc màu sắc khác.</p></div>
  return <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{products.map((product, index) => <ProductCard index={index} key={product.id} product={product} />)}</div>
}
