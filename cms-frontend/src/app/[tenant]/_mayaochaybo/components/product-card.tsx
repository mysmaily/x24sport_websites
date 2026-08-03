import { ArrowRight, MessageCircle, Shirt } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { productImages, productPath, type Product } from '../lib/cms'
import { ZALO_URL } from '../lib/site'

const priceFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

function formatPrice(value: number) {
  return `${priceFormatter.format(value)}đ`
}

export function ProductCard({ product }: { product: Product; index?: number }) {
  const image = productImages(product)[0]
  const href = productPath(product)
  const price = typeof product.price === 'number' && product.price > 0 ? product.price : null

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_20px_55px_rgba(15,23,42,.10)]">
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
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <h3 className="line-clamp-2 min-h-[38px] font-display text-[16px] font-bold leading-[1.15] tracking-tight text-slate-950 sm:min-h-[42px] sm:text-[18px]">
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className="mt-2 grid gap-2 border-t border-slate-100 pt-2">
          {price ? (
            <span className="flex max-w-full min-w-0 flex-nowrap items-baseline gap-0.5 whitespace-nowrap tabular-nums">
              {typeof product.compareAtPrice === 'number' && product.compareAtPrice > price ? <del className="text-[12px] font-semibold text-slate-400 sm:text-sm">{formatPrice(product.compareAtPrice)}</del> : null}
              <strong className="text-[14px] font-black text-brand sm:text-base">{formatPrice(price)}</strong>
            </span>
          ) : <span className="text-xs font-bold text-slate-500">Mẫu tham khảo</span>}
          <div className="flex items-center justify-between gap-2">
            <Link className="inline-flex min-h-8 items-center gap-1 self-start rounded-lg text-xs font-black text-brand transition hover:text-brand-dark sm:min-h-10 sm:text-sm" href={href}>Xem mẫu <ArrowRight aria-hidden="true" size={15} /></Link>
            <a className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-orange-50 px-2 text-xs font-black text-brand transition hover:bg-brand hover:text-white sm:min-h-10" href={ZALO_URL} rel="noreferrer" target="_blank" aria-label={`Gửi mẫu ${product.name} qua Zalo`}>
              <MessageCircle aria-hidden="true" size={14} />
              Zalo
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
