import Link from 'next/link'
import type { ReactNode } from 'react'

import { SiteHeader } from '../../_components/site-header'
import { FloatingContact, PageFooter } from '../../_components/store-footer'

type LegalPageProps = {
  children: ReactNode
  description: string
  eyebrow: string
  title: string
}

const legalLinks = [
  { href: '/privacy-policy/', label: 'Chính sách quyền riêng tư' },
  { href: '/terms/', label: 'Điều khoản sử dụng' },
  { href: '/data-deletion/', label: 'Yêu cầu xóa dữ liệu' },
]

export function LegalPage({ children, description, eyebrow, title }: LegalPageProps) {
  return (
    <div className="storefront-page legal-page">
      <SiteHeader />
      <main id="noi-dung">
        <header className="legal-hero">
          <div className="site-container">
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>{description}</span>
            <small>Cập nhật lần cuối: 03/08/2026</small>
          </div>
        </header>

        <div className="legal-layout site-container">
          <aside aria-label="Tài liệu pháp lý">
            <strong>Thông tin pháp lý</strong>
            <nav>
              {legalLinks.map((item) => (
                <Link href={item.href} key={item.href}>{item.label}</Link>
              ))}
            </nav>
            <p>Cần hỗ trợ? Liên hệ <a href="mailto:x24sport.vn@gmail.com">x24sport.vn@gmail.com</a>.</p>
          </aside>
          <article className="legal-article">{children}</article>
        </div>
      </main>
      <PageFooter />
      <FloatingContact />
    </div>
  )
}
