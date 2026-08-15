import {
  ArrowRight,
  ChevronDown,
  Grid2X2,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from './pnd.module.css'
import { categories, formatPrice, previewBase, type PreviewProduct } from './data'

type NavigationCategory = { name: string; slug: string }

export type PreviewVariant = 'v1' | 'v2' | 'v3'

export function Brand({ base = previewBase, variant = 'v1', imageLogo = false }: { base?: string; variant?: PreviewVariant; imageLogo?: boolean }) {
  return <Link className={styles.brand} href={base || '/'} aria-label="PND Sport Việt Nam - Trang chủ">
    {variant === 'v1' && !imageLogo
      ? <><strong>PND SPORT</strong><span>VIỆT NAM</span></>
      // eslint-disable-next-line @next/next/no-img-element
      : <img src="/images/pndsport/logo.webp" alt="PND Sport Việt Nam" />}
  </Link>
}

export function SiteShell({ children, base = previewBase, variant = 'v1', navigationCategories = categories, imageLogo = false, showDraftNotice = true, showMobileBar = true }: { children: ReactNode; base?: string; variant?: PreviewVariant; navigationCategories?: readonly NavigationCategory[]; imageLogo?: boolean; showDraftNotice?: boolean; showMobileBar?: boolean }) {
  const variantClass = variant === 'v2' ? styles.v2 : variant === 'v3' ? styles.v3 : ''
  return <div className={`${styles.site} ${variantClass}`} data-preview-variant={variant}>
    <a className={styles.skipLink} href="#pnd-main">Bỏ qua đến nội dung</a>
    <div className={styles.notice}><span>PND SPORT VIỆT NAM</span><p>Tư vấn mẫu, màu sắc và báo giá theo nhu cầu thực tế</p><a href="tel:0989353247"><Phone size={14} /> 0989 353 247</a></div>
    <header className={styles.header}>
      <div className={styles.headerMain}>
        <Brand base={base} variant={variant} imageLogo={imageLogo} />
        <form action={`${base}/san-pham`} className={styles.search} method="get" role="search"><Search size={18} /><input aria-label="Tìm sản phẩm" name="q" placeholder="Tìm theo môn thể thao, mã mẫu..." /><button type="submit">Tìm</button></form>
        <a className={styles.headerCta} href="https://zalo.me/0989353247" target="_blank" rel="noreferrer"><MessageCircle size={18} /><span>Gửi yêu cầu thiết kế</span></a>
        <details className={styles.mobileMenu}><summary aria-label="Mở menu"><Menu /></summary><nav>{navigationCategories.map((item) => <Link href={`${base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}<Link href={`${base}/blog`}>Góc tư vấn</Link></nav></details>
      </div>
      <nav className={styles.nav} aria-label="Danh mục chính">
        <Link className={styles.allCategories} href={`${base}/danh-muc/bong-da`}><Grid2X2 size={17} /> Danh mục <ChevronDown size={15} /></Link>
        {navigationCategories.slice(0, 8).map((item) => <Link href={`${base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}
        <Link href={`${base}/blog`}>Góc tư vấn</Link>
      </nav>
    </header>
    <main id="pnd-main">{children}</main>
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div><Brand base={base} variant={variant} imageLogo={imageLogo} /><p>Kho mẫu trang phục thể thao và dịch vụ tư vấn thiết kế, báo giá theo đội nhóm.</p></div>
        <div><h2>Môn thể thao</h2>{navigationCategories.slice(0, 5).map((item) => <Link href={`${base}/danh-muc/${item.slug}`} key={item.slug}>{item.name}</Link>)}</div>
        <div><h2>Hỗ trợ lựa chọn</h2><Link href={`${base}/blog`}>Góc tư vấn</Link><Link href={`${base}/thiet-ke-ao-bong-da-doi-nhom`}>Thiết kế theo yêu cầu</Link><a href="tel:0989353247">Hotline 0989 353 247</a></div>
        <div className={styles.footerContact}><h2>Bắt đầu yêu cầu</h2><p>Gửi mẫu tham khảo, số lượng, màu đội và thời gian dự kiến để nhận tư vấn.</p><a href="https://zalo.me/0989353247" target="_blank" rel="noreferrer">Nhắn Zalo <ArrowRight size={16} /></a></div>
      </div>
      <div className={styles.footerBottom}><span>© PND Sport Việt Nam</span>{showDraftNotice ? <span>Nội dung đang ở trạng thái bản nháp chờ xác minh.</span> : <span>Tư vấn thiết kế và báo giá theo cấu hình thực tế.</span>}</div>
    </footer>
    {showMobileBar ? <div className={styles.mobileBar}><a href="tel:0989353247"><Phone size={17} /> Gọi tư vấn</a><a href="https://zalo.me/0989353247" target="_blank" rel="noreferrer"><MessageCircle size={17} /> Gửi yêu cầu</a></div> : null}
  </div>
}

export function Breadcrumbs({ items, base = previewBase }: { items: Array<{ label: string; href?: string }>; base?: string }) {
  return <nav className={styles.breadcrumbs} aria-label="Đường dẫn"><Link href={base || '/'}>Trang chủ</Link>{items.map((item) => <span key={item.label}><b>/</b>{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>
}

export function SectionHeading({ eyebrow, title, note, href, linkLabel = 'Xem tất cả' }: { eyebrow: string; title: string; note?: string; href?: string; linkLabel?: string }) {
  return <div className={styles.sectionHeading}><div><span>{eyebrow}</span><h2>{title}</h2>{note ? <p>{note}</p> : null}</div>{href ? <Link href={href}>{linkLabel}<ArrowRight size={17} /></Link> : null}</div>
}

export function ProductCard({ product, base = previewBase }: { product: PreviewProduct; base?: string }) {
  return <article className={styles.productCard}>
    <Link className={styles.productImage} href={`${base}/san-pham/${product.slug}`}>
      {product.badge ? <span>{product.badge}</span> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.image} alt={product.name} loading="lazy" />
    </Link>
    <div className={styles.productMeta}><p>{product.category}<span>{product.code}</span></p><h3><Link href={`${base}/san-pham/${product.slug}`}>{product.name}</Link></h3><div className={styles.priceRow}><div><small>Giá từ</small><strong>{formatPrice(product.price)}</strong></div><Link href={`${base}/san-pham/${product.slug}`} aria-label={`Xem ${product.name}`}><ArrowRight size={17} /></Link></div></div>
  </article>
}

export function ProductGrid({ items, base = previewBase }: { items: PreviewProduct[]; base?: string }) {
  return <div className={styles.productGrid}>{items.map((product, index) => <ProductCard product={product} base={base} key={`${product.slug}-${index}`} />)}</div>
}

export function QuoteBand({ compact = false }: { compact?: boolean }) {
  return <section className={`${styles.quoteBand} ${compact ? styles.quoteBandCompact : ''}`}>
    <div><span><Sparkles size={16} /> Thiết kế theo yêu cầu</span><h2>Có mẫu trong đầu? Gửi yêu cầu để cùng hoàn thiện.</h2><p>Chuẩn bị môn thể thao, màu chủ đạo, logo, số lượng và mốc thời gian dự kiến.</p></div>
    <div className={styles.quoteActions}><a href="https://zalo.me/0989353247" target="_blank" rel="noreferrer">Gửi qua Zalo <ArrowRight size={17} /></a><a href="tel:0989353247"><Phone size={17} /> 0989 353 247</a></div>
  </section>
}

export function TrustStrip() {
  return <div className={styles.trustStrip}>
    <div><Sparkles /><span><b>Tùy chỉnh nhận diện</b><small>Màu, logo, tên và số</small></span></div>
    <div><ShieldCheck /><span><b>Xác nhận trước sản xuất</b><small>Kiểm tra nội dung đã chốt</small></span></div>
    <div><MessageCircle /><span><b>Tư vấn theo nhu cầu</b><small>Đội nhóm, CLB, doanh nghiệp</small></span></div>
  </div>
}
