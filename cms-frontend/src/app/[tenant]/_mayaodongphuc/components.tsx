import { ArrowRight, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { Be_Vietnam_Pro, Noto_Sans } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { UniformCategory, UniformProduct } from './lib'
import { productBadge, productCategory, productColors, productImages, productMaterial } from './lib'
import styles from './mayaodongphuc.module.css'
import { UniformHeader } from './site-header'

const heading = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['500', '600', '700', '800'], variable: '--v2-heading', display: 'swap' })
const body = Noto_Sans({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'], variable: '--v2-body', display: 'swap' })

export function uniformPublicCopy(value?: string) {
  return value?.replace(/cấu hình/gi, 'thiết kế') || ''
}

export function UniformLogo() {
  return <Link className={styles.logo} href="/" aria-label="May Áo Đồng Phục — Trang chủ"><span>M</span><div><strong>MAY ÁO</strong><small>ĐỒNG PHỤC</small></div></Link>
}

export function UniformShell({ categories, children, consultationEnabled }: { categories: UniformCategory[]; children: ReactNode; consultationEnabled: boolean }) {
  const actionHref = consultationEnabled ? '/#bao-gia' : '/san-pham/'
  const publicCategories = categories.map((category) => ({ ...category, description: uniformPublicCopy(category.description) }))
  return <div className={`${styles.site} ${heading.variable} ${body.variable}`}>
    <a className={styles.skip} href="#main-content">Đi đến nội dung chính</a>
    <UniformHeader categories={publicCategories} consultationEnabled={consultationEnabled} />
    <main id="main-content">{children}</main>
    <footer className={styles.footer}><div className={styles.footerTop}><div><UniformLogo /><p>Xưởng may đồng phục theo yêu cầu, làm rõ từng điểm chốt trước khi phát hành lệnh may.</p></div><div><h2>Mẫu tham khảo</h2>{publicCategories.slice(0, 4).map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}>{item.name}</Link>)}</div><div><h2>Làm việc với xưởng</h2><Link href="/#quy-trinh">Quy trình sản xuất</Link><Link href="/#vat-lieu">Spec, vật liệu & size</Link><Link href="/blog/">Hướng dẫn đặt may</Link><Link href={actionHref}>{consultationEnabled ? 'Gửi brief' : 'Xem mẫu tham khảo'}</Link></div><div className={styles.footerBadge}><ShieldCheck aria-hidden="true" /><strong>SPEC<br />READY</strong><small>MDP / 2026</small></div></div><div className={styles.footerBottom}><span>© May Áo Đồng Phục</span><span>May theo spec đã xác nhận.</span></div></footer>
  </div>
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className={styles.breadcrumbs} aria-label="Đường dẫn"><Link href="/">Trang chủ</Link>{items.map((item) => <span key={item.label}>/ {item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>)}</nav>
}

export function UniformProductCard({ product, eager = false }: { product: UniformProduct; eager?: boolean }) {
  const image = productImages(product)[0]
  const category = productCategory(product)
  const badge = productBadge(product)
  return <article className={styles.productCard}><Link className={styles.productImage} href={`/san-pham/${product.slug}/`}>{image?.url ? <Image alt={image.alt || product.name} fill loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" src={image.url} /> : null}{badge ? <span>{badge}</span> : null}<i><ArrowRight aria-hidden="true" /></i></Link><div className={styles.productMeta}><p><span>{product.sku || 'MẪU ĐỒNG PHỤC'}</span><span>{productMaterial(product)}</span></p><h3><Link href={`/san-pham/${product.slug}/`}>{product.name}</Link></h3><div><b>Báo giá theo yêu cầu</b><span className={styles.swatches} aria-label="Bảng màu gợi ý">{productColors(product).map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span></div>{category ? <Link className={styles.cardCategoryLink} href={`/danh-muc/${category.slug}/`}>{category.name}</Link> : null}</div></article>
}

export function TrustPill() { return <span className={styles.trustPill}><ClipboardCheck aria-hidden="true" /> Brief rõ trước khi báo giá</span> }
