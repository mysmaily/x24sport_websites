import Link from 'next/link'
import { ChevronDown, Palette, Shirt } from 'lucide-react'

type CatalogNavItem = {
  href: string
  label: string
}

export function CatalogDiscoveryNav({
  activeKind,
  allHref,
  allLabel,
  items,
}: {
  activeKind: 'products' | 'logos'
  allHref: string
  allLabel: string
  items: CatalogNavItem[]
}) {
  return (
    <div className="catalog-filter-toolbar">
      <nav className="filter-links" aria-label={activeKind === 'logos' ? 'Mẫu logo theo bộ môn' : 'Danh mục bộ môn'}>
        <Link className="active" href={allHref}>{allLabel}</Link>
        {items.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
      <details className="catalog-type-filter">
        <summary>
          Loại nội dung
          <ChevronDown aria-hidden="true" size={16} />
        </summary>
        <nav className="catalog-type-options" aria-label="Loại nội dung">
          <Link className={activeKind === 'products' ? 'active' : undefined} href="/san-pham/">
            <Shirt aria-hidden="true" size={18} />
            <span><strong>Sản phẩm</strong><small>Áo, giày, bóng và phụ kiện</small></span>
          </Link>
          <Link className={activeKind === 'logos' ? 'active' : undefined} href="/mau-logo/">
            <Palette aria-hidden="true" size={18} />
            <span><strong>Mẫu logo</strong><small>Ý tưởng nhận diện theo bộ môn</small></span>
          </Link>
        </nav>
      </details>
    </div>
  )
}
