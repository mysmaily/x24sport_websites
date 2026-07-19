import { ArrowRight, Shirt } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { productImages, type Product } from '@/lib/cms'

const priceFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

function formatPrice(value: number) {
  return `${priceFormatter.format(value)}đ`
}

export function ProductCard({ product }: { product: Product; index?: number }) {
  const image = productImages(product)[0]
  const href = product.legacyPath || `/${product.slug}/`

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_20px_55px_rgba(15,23,42,.10)]">
      <Link className="relative block aspect-[4/5] overflow-hidden bg-slate-100" href={href} aria-label={`Xem ${product.name}`}>
        {image?.url ? (
          <Image
            alt={image.alt || product.name}
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={image.url}
          />
        ) : (
          <span className="grid h-full place-items-center text-slate-300" aria-hidden="true"><Shirt size={64} strokeWidth={1.2} /></span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-brand shadow-sm backdrop-blur">Running / X24</span>
      </Link>
      <div className="p-4 sm:p-5">
        <p className="mb-2 text-xs font-bold text-slate-500">May theo màu, logo & cự ly của đội</p>
        <h3 className="line-clamp-2 font-display text-2xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-[1.65rem]">
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {typeof product.price === 'number' ? (
            <span className="flex min-w-0 flex-col">
              <strong className="text-base font-black text-brand">{formatPrice(product.price)}</strong>
              {typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price ? <del className="text-xs font-semibold text-slate-400">{formatPrice(product.compareAtPrice)}</del> : null}
            </span>
          ) : <span className="text-xs font-bold text-slate-500">Giá đang cập nhật</span>}
          <Link className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-black text-brand transition hover:bg-orange-50" href={href}>Xem mẫu <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </div>
    </article>
  )
}
