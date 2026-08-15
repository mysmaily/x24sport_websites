import { ArrowRight, ClipboardCheck, Layers3, Palette, Ruler } from 'lucide-react'
import Link from 'next/link'

import { getCategories, getPostsPage, getProductsPage } from '../../../lib/content'
import { JsonLd } from '../../_components/json-ld'
import { ProductGrid, QuoteBand, SectionHeading, TrustStrip } from '../../pndsport-preview/components'
import styles from '../../pndsport-preview/pnd.module.css'
import { categoryImage, postImage, toPndProduct } from './lib'
import { PndShell } from './shell'

const process = [
  { icon: ClipboardCheck, step: '01', title: 'Gửi nhu cầu', text: 'Môn thể thao, số lượng, màu đội, logo và mốc thời gian dự kiến.' },
  { icon: Palette, step: '02', title: 'Chọn hướng thiết kế', text: 'Bắt đầu từ mẫu có sẵn hoặc mô tả ý tưởng nhận diện riêng.' },
  { icon: Ruler, step: '03', title: 'Chốt thông tin', text: 'Kiểm tra màu, logo, tên số, size và các chi tiết đã trao đổi.' },
  { icon: Layers3, step: '04', title: 'Xác nhận phương án', text: 'Nhận báo giá theo cấu hình và xác nhận trước khi sản xuất.' },
]

export async function PndHomePage() {
  const [categories, productResult, postResult] = await Promise.all([
    getCategories(),
    getProductsPage({ limit: 8, sort: '-viewCount' }),
    getPostsPage(1, 3),
  ])
  const products = productResult.products.map(toPndProduct)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://pndsport.vn/#organization', name: 'PND Sport Việt Nam', url: 'https://pndsport.vn/', logo: 'https://pndsport.vn/images/pndsport/logo.webp', contactPoint: { '@type': 'ContactPoint', telephone: '+84-989-353-247', contactType: 'customer service', availableLanguage: 'Vietnamese' } },
      { '@type': 'WebSite', '@id': 'https://pndsport.vn/#website', name: 'PND Sport Việt Nam', url: 'https://pndsport.vn/', publisher: { '@id': 'https://pndsport.vn/#organization' }, inLanguage: 'vi-VN' },
    ],
  }

  return <PndShell>
    <JsonLd data={structuredData} />
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}><span className={styles.eyebrow}>Thiết kế cho đội hình của bạn</span><h1>Trang phục thể thao <em>mang bản sắc riêng.</em></h1><p>Khám phá mẫu theo từng môn, chọn một điểm bắt đầu và gửi yêu cầu để điều chỉnh màu sắc, logo, tên số theo đội.</p><div className={styles.heroActions}><Link href="/san-pham/">Khám phá sản phẩm <ArrowRight size={17} /></Link><a href="https://zalo.me/0989353247" target="_blank" rel="noreferrer">Gửi yêu cầu thiết kế</a></div></div>
        <div className={styles.heroVisual}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/brand/hero-teamwear-arena-20260803.webp" alt="Đội hình thể thao đa môn trong trang phục đồng bộ" fetchPriority="high" /><div className={styles.heroStat}><div><strong>{String(categories.length).padStart(2, '0')}</strong><span>Nhóm danh mục chính</span></div><div><strong>Giá từ</strong><span>Hiển thị rõ trên từng mẫu</span></div></div></div>
      </div>
    </section>
    <TrustStrip />

    <section className={styles.section}><div className={styles.sectionInner}><SectionHeading eyebrow="Khám phá theo môn" title="Chọn đúng sân chơi, tìm mẫu nhanh hơn" note="Danh mục được tổ chức theo bộ môn để đội nhóm tìm đúng mẫu cần tham khảo." href="/san-pham/" />
      <div className={styles.categoryGrid}>{categories.map((category, index) => <Link className={styles.categoryCard} href={`/danh-muc/${category.slug}/`} key={category.slug}><div className={styles.categoryCardImage}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={categoryImage(category, index)} alt={`Trang phục ${category.name}`} loading="lazy" /></div><div className={styles.categoryCardCopy}><strong>{category.name}</strong><span>Kho mẫu tham khảo</span></div></Link>)}</div>
    </div></section>

    <section className={`${styles.section} ${styles.sectionWhite}`}><div className={styles.sectionInner}><SectionHeading eyebrow="Mẫu được quan tâm" title="Bắt đầu từ mẫu, điều chỉnh theo đội" note="Mỗi sản phẩm công khai mức giá thấp nhất; cấu hình thực tế được báo giá sau khi xác nhận." href="/san-pham/" linkLabel="Xem kho mẫu" />{products.length ? <ProductGrid items={products} base="" /> : <p className={styles.emptyState}>Sản phẩm đang được cập nhật.</p>}</div></section>

    <section className={styles.section}><div className={`${styles.sectionInner} ${styles.storyGrid}`}><div className={styles.storyLead}><div><span className={styles.eyebrow}>Từ ý tưởng đến phương án</span><h2>Một luồng đặt áo dễ hiểu cho cả đội.</h2></div><p>Mỗi bước giúp đội chọn mẫu, chuẩn bị thông tin và gửi yêu cầu báo giá rõ ràng hơn.</p></div><div className={styles.processGrid}>{process.map(({ icon: Icon, step, title, text }) => <article key={step}><Icon size={20} /><b>{step}</b><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <QuoteBand />

    {postResult.docs.length ? <section className={`${styles.section} ${styles.sectionWhite}`}><div className={styles.sectionInner}><SectionHeading eyebrow="Góc tư vấn PND" title="Biết đủ trước khi chốt mẫu" note="Hướng dẫn phục vụ trực tiếp quá trình lựa chọn, thiết kế và đặt áo." href="/blog/" linkLabel="Xem tất cả bài viết" /><div className={styles.blogGrid}>{postResult.docs.map((post, index) => <article className={styles.postCard} key={post.id}><Link className={styles.postImage} href={`/blog/${post.slug}/`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={postImage(post, index)} alt="" loading="lazy" /></Link><div className={styles.postBody}><span>Góc tư vấn</span><h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3><p>{post.excerpt}</p><small><Link href={`/blog/${post.slug}/`}>Đọc bài viết</Link></small></div></article>)}</div></div></section> : null}
  </PndShell>
}
