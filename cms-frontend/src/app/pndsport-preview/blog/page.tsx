import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Breadcrumbs, QuoteBand } from '../components'
import { posts, previewBase } from '../data'
import styles from '../pnd.module.css'

export const metadata: Metadata = { title: 'Góc tư vấn', description: 'Kinh nghiệm chọn mẫu, chuẩn bị thiết kế, size và đặt áo thể thao đội nhóm.' }

export default function BlogPage() {
  return <><Breadcrumbs items={[{ label: 'Góc tư vấn' }]} /><section className={styles.pageHero}><div className={styles.pageHeroInner}><div><span className={styles.eyebrow}>Kiến thức hữu ích</span><h1>Góc tư vấn PND</h1><p>Hướng dẫn ngắn, thực tế để đội trưởng chọn mẫu, chuẩn bị nhận diện và tổng hợp thông tin đặt áo.</p></div><aside>03 bài</aside></div></section>
    <section className={styles.section}><div className={styles.sectionInner}><div className={styles.filterBar}><Link className={styles.active} href={`${previewBase}/blog`}>Tất cả</Link><Link href={`${previewBase}/blog`}>Kinh nghiệm đặt áo</Link><Link href={`${previewBase}/blog`}>Thiết kế & nhận diện</Link><Link href={`${previewBase}/blog`}>Size & chất liệu</Link></div><div className={styles.blogGrid}>{posts.map((post) => <article className={styles.postCard} key={post.slug}><Link className={styles.postImage} href={`${previewBase}/blog/${post.slug}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.image} alt="" /></Link><div className={styles.postBody}><span>{post.category}</span><h3><Link href={`${previewBase}/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.excerpt}</p><small>{post.read} đọc · <Link href={`${previewBase}/blog/${post.slug}`}>Đọc bài <ArrowRight size={11} /></Link></small></div></article>)}</div><QuoteBand compact /></div></section></>
}

