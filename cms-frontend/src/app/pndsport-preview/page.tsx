import { ArrowRight, ClipboardCheck, Layers3, Palette, Ruler } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductGrid, QuoteBand, SectionHeading, TrustStrip } from './components'
import { categories, posts, previewBase, products } from './data'
import styles from './pnd.module.css'

export const metadata: Metadata = {
  title: { absolute: 'PND Sport Việt Nam — Bản thiết kế' },
}

const process = [
  { icon: ClipboardCheck, step: '01', title: 'Gửi nhu cầu', text: 'Môn thể thao, số lượng, màu đội, logo và mốc thời gian dự kiến.' },
  { icon: Palette, step: '02', title: 'Chọn hướng thiết kế', text: 'Bắt đầu từ mẫu có sẵn hoặc mô tả ý tưởng nhận diện riêng.' },
  { icon: Ruler, step: '03', title: 'Chốt thông tin', text: 'Kiểm tra màu, logo, tên số, size và các chi tiết đã trao đổi.' },
  { icon: Layers3, step: '04', title: 'Xác nhận phương án', text: 'Nhận báo giá theo cấu hình và xác nhận trước khi sản xuất.' },
]

export default function PndPreviewHomePage() {
  return <>
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}><span className={styles.eyebrow}>Thiết kế cho đội hình của bạn</span><h1>Trang phục thể thao <em>mang bản sắc riêng.</em></h1><p>Khám phá mẫu theo từng môn, chọn một điểm bắt đầu và gửi yêu cầu để điều chỉnh màu sắc, logo, tên số theo đội.</p><div className={styles.heroActions}><Link href={`${previewBase}/danh-muc/bong-da`}>Khám phá sản phẩm <ArrowRight size={17} /></Link><a href="https://zalo.me/0989353247" target="_blank" rel="noreferrer">Gửi yêu cầu thiết kế</a></div></div>
        <div className={styles.heroVisual}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/brand/hero-teamwear-arena-20260803.webp" alt="Đội hình thể thao đa môn trong trang phục đồng bộ" /><div className={styles.heroStat}><div><strong>09</strong><span>Nhóm danh mục chính</span></div><div><strong>Giá từ</strong><span>Hiển thị rõ trên từng mẫu</span></div></div></div>
      </div>
    </section>
    <TrustStrip />

    <section className={styles.section}><div className={styles.sectionInner}><SectionHeading eyebrow="Khám phá theo môn" title="Chọn đúng sân chơi, tìm mẫu nhanh hơn" note="Taxonomy gọn theo nhu cầu mua sắm; không lặp lại các nhóm danh mục kỹ thuật." href={`${previewBase}/danh-muc/bong-da`} />
      <div className={styles.categoryGrid}>{categories.map((category) => <Link className={styles.categoryCard} href={`${previewBase}/danh-muc/${category.slug}`} key={category.slug}><div className={styles.categoryCardImage}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={category.image} alt={`Trang phục ${category.name}`} loading="lazy" /></div><div className={styles.categoryCardCopy}><strong>{category.name}</strong><span>Kho mẫu tham khảo</span></div></Link>)}</div>
    </div></section>

    <section className={`${styles.section} ${styles.sectionWhite}`}><div className={styles.sectionInner}><SectionHeading eyebrow="Mẫu được quan tâm" title="Bắt đầu từ mẫu, điều chỉnh theo đội" note="Mỗi sản phẩm công khai mức giá thấp nhất; cấu hình thực tế được báo giá sau khi xác nhận." href={`${previewBase}/danh-muc/bong-da`} linkLabel="Xem kho mẫu" /><ProductGrid items={products} /></div></section>

    <section className={styles.section}><div className={`${styles.sectionInner} ${styles.storyGrid}`}><div className={styles.storyLead}><div><span className={styles.eyebrow}>Từ ý tưởng đến phương án</span><h2>Một luồng đặt áo dễ hiểu cho cả đội.</h2></div><p>Trang web không ép khách mua ngay. Mỗi điểm chạm đều giúp chọn mẫu, chuẩn bị thông tin và gửi yêu cầu báo giá rõ ràng hơn.</p></div><div className={styles.processGrid}>{process.map(({ icon: Icon, step, title, text }) => <article key={step}><Icon size={20} /><b>{step}</b><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <QuoteBand />

    <section className={`${styles.section} ${styles.sectionWhite}`}><div className={styles.sectionInner}><SectionHeading eyebrow="Góc tư vấn PND" title="Biết đủ trước khi chốt mẫu" note="Nội dung hướng dẫn phục vụ trực tiếp quá trình lựa chọn, thiết kế và đặt áo." href={`${previewBase}/blog`} linkLabel="Xem tất cả bài viết" /><div className={styles.blogGrid}>{posts.map((post) => <article className={styles.postCard} key={post.slug}><Link className={styles.postImage} href={`${previewBase}/blog/${post.slug}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.image} alt="" loading="lazy" /></Link><div className={styles.postBody}><span>{post.category}</span><h3><Link href={`${previewBase}/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><small>{post.read} đọc</small></div></article>)}</div></div></section>
  </>
}
