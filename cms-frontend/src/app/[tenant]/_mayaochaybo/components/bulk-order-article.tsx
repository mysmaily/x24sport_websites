import { ChevronRight, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { WebContent } from '../lib/cms'
import { rewriteLegacyHtml } from '../lib/legacy-content'
import { canonical, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'
import { JsonLd } from './json-ld'

const HERO_IMAGE = 'https://static.x24sport.vn/mayaochaybo/wp-1078-may-ao-chay-bo-so-luong-lon-thumbnail.jpg'

export function BulkOrderArticle({ content }: { content: WebContent }) {
  return <article className="section-shell mcb-bulk-article">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') }, { '@type': 'ListItem', position: 2, name: 'Kinh nghiệm chạy bộ', item: canonical('/blog/') }, { '@type': 'ListItem', position: 3, name: content.title, item: canonical(content.legacyPath) }] }} />

    <nav className="mcb-article-breadcrumb" aria-label="Đường dẫn trang">
      <Link href="/">Trang chủ</Link>
      <ChevronRight aria-hidden="true" size={13} />
      <Link href="/blog/">Kinh nghiệm chạy bộ</Link>
      <ChevronRight aria-hidden="true" size={13} />
      <span>{content.title}</span>
    </nav>

    <header className="mcb-bulk-hero">
      <div className="mcb-bulk-hero-copy">
        <p>Đặt may cho đội và sự kiện</p>
        <h1>{content.title}</h1>
        <p>Giải pháp đặt áo từ 50 sản phẩm cho công ty, câu lạc bộ và giải chạy, với thiết kế, logo và chất liệu theo nhu cầu thực tế.</p>
        <a className="mcb-bulk-hero-cta" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={18} /> Nhận báo giá</a>
      </div>
      <div className="mcb-bulk-hero-media">
        <Image
          alt="Mẫu áo chạy bộ đặt may số lượng lớn cho đội nhóm"
          fill
          priority
          sizes="(max-width: 767px) calc(100vw - 32px), 42vw"
          src={HERO_IMAGE}
        />
      </div>
    </header>

    <ul className="mcb-bulk-facts" aria-label="Thông tin đặt may">
      <li><strong>Từ 50 áo</strong><span>Phù hợp đơn hàng tập thể</span></li>
      <li><strong>Tùy chỉnh thiết kế</strong><span>Màu sắc, logo và thông điệp</span></li>
      <li><strong>Báo giá theo số lượng</strong><span>Trao đổi rõ trước khi sản xuất</span></li>
    </ul>

    <div className="mcb-bulk-content-layout">
      <div className="prose mcb-bulk-prose" dangerouslySetInnerHTML={{ __html: rewriteLegacyHtml(content.contentHtml) }} />
      <aside className="mcb-bulk-contact">
        <h2>Cần báo giá theo số lượng?</h2>
        <p>Gửi số lượng, kiểu áo và thời gian cần nhận để đội ngũ tư vấn phương án phù hợp.</p>
        <a className="mcb-bulk-zalo" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={18} /> Nhận báo giá</a>
        <a className="mcb-bulk-call" href={`tel:${PHONE_VALUE}`}><Phone aria-hidden="true" size={18} /> Gọi {PHONE_DISPLAY}</a>
      </aside>
    </div>
  </article>
}
