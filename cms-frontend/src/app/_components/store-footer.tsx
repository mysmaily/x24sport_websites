import Link from 'next/link'
import { MessageCircle, Phone, Search, Shirt } from 'lucide-react'

import type { SportCategory } from '../../lib/catalog'
import { contactItems } from '../../lib/contact'
import { getCategories } from '../../lib/content'
import { Logo } from './site-header'

export function StoreFooter({ categories }: { categories: SportCategory[] }) {
  return (
    <footer className="store-footer" id="lien-he">
      <div className="site-container">
        <form className="footer-search" action="/san-pham" role="search">
          <input name="q" placeholder="Tìm kiếm sản phẩm…" aria-label="Tìm sản phẩm" autoComplete="off" />
          <button aria-label="Tìm kiếm"><Search size={22} /></button>
        </form>
        <div className="footer-main">
          <div className="footer-about">
            <Logo />
            <p><strong>X24 Sport - Xưởng May Đồ Thể Thao</strong></p>
            <div className="footer-contact-list">
              {contactItems.map((item) => {
                const Icon = item.icon
                const content = <><Icon size={17} /><span><strong>{item.label}:</strong> {item.value}</span></>
                return item.href
                  ? <a href={item.href} key={`${item.label}-${item.value}`}>{content}</a>
                  : <p key={`${item.label}-${item.value}`}>{content}</p>
              })}
            </div>
          </div>
          <div><h3>Danh mục</h3>{categories.slice(0, 4).map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}>{category.name}</Link>)}</div>
          <div><h3>Khám phá</h3>{categories.slice(4).map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}>{category.name}</Link>)}<Link href="/san-pham">Tất cả sản phẩm</Link><Link href="/blog/">Blog thể thao</Link></div>
          <div><h3>Hỗ trợ</h3><a href="/#quy-trinh">Cách đặt hàng</a><a href="tel:0989353247">Tư vấn thiết kế</a><Link href="/lien-he/">Kênh liên hệ</Link></div>
        </div>
        <div className="support-cards">
          <a href="tel:0989353247"><Phone /><span><small>Tư vấn nhanh</small><strong>0989 353 247</strong></span></a>
          <a href="tel:0989353247"><MessageCircle /><span><small>Trao đổi yêu cầu</small><strong>Tư vấn đội nhóm</strong></span></a>
          <a href="/#bo-mon"><Shirt /><span><small>Khám phá</small><strong>9 nhóm sản phẩm</strong></span></a>
        </div>
        <div className="footer-bottom"><span>© 2026 X24Sport. All rights reserved.</span><span>Trang phục cho mọi chuyển động.</span></div>
      </div>
    </footer>
  )
}

export async function PageFooter() {
  const categories = await getCategories()
  return <StoreFooter categories={categories} />
}

export function FloatingContact() {
  return (
    <div className="floating-contact" aria-label="Liên hệ nhanh">
      <a href="tel:0989353247" aria-label="Gọi X24Sport"><Phone /></a>
      <Link href="/lien-he/" aria-label="Xem kênh liên hệ X24Sport"><MessageCircle /></Link>
    </div>
  )
}
