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
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_20px_55px_rgba(15,23,42,.10)]">
      <Link className="relative block aspect-square overflow-hidden bg-slate-100" href={href} aria-label={`Xem ${product.name}`}>
        {image?.url ? (
          <Image
            alt={image.alt || product.name}
            className="object-contain transition duration-500 group-hover:scale-[1.025]"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            src={image.url}
          />
        ) : (
          <span className="grid h-full place-items-center text-slate-300" aria-hidden="true"><Shirt size={64} strokeWidth={1.2} /></span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h3 className="line-clamp-2 min-h-[42px] font-display text-[18px] font-bold leading-[1.15] tracking-tight text-slate-950">
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className="mt-3 grid gap-1.5 border-t border-slate-100 pt-3 sm:mt-5 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:pt-4">
          {typeof product.price === 'number' ? (
            <span className="flex max-w-full min-w-0 flex-nowrap items-baseline gap-0.5 whitespace-nowrap tabular-nums">
              {typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price ? <del className="text-[12px] font-semibold text-slate-400 sm:text-sm">{formatPrice(product.compareAtPrice)}</del> : null}
              <strong className="text-[14px] font-black text-brand sm:text-base">{formatPrice(product.price)}</strong>
            </span>
          ) : <span className="text-xs font-bold text-slate-500">Giá đang cập nhật</span>}
          <Link className="inline-flex min-h-9 items-center gap-1 self-start rounded-lg text-xs font-black text-brand transition hover:text-brand-dark sm:min-h-11 sm:px-2 sm:text-sm" href={href}>Xem mẫu <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </div>
    </article>
  )
}
