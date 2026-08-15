import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs, QuoteBand } from '../../components'
import { posts, previewBase } from '../../data'
import styles from '../../pnd.module.css'

export const metadata: Metadata = { title: 'Cách chọn áo thể thao cho đội nhóm' }

export default function BlogPostPage() {
  const post = posts[0]
  return <><Breadcrumbs items={[{ label: 'Góc tư vấn', href: `${previewBase}/blog` }, { label: post.title }]} /><div className={styles.articleLayout}><article className={styles.article}><span>{post.category} · {post.read} đọc</span><h1>{post.title}</h1><p className={styles.articleLead}>Một bộ áo phù hợp không bắt đầu từ việc chọn mẫu đẹp nhất, mà từ việc xác định đội sẽ dùng áo trong hoàn cảnh nào.</p>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.image} alt="Các mẫu áo thể thao để đội nhóm tham khảo" /><h2>1. Xác định đúng môn và cách sử dụng</h2><p>Áo thi đấu, áo tập luyện và áo dùng cho sự kiện có thể cần form, chất liệu và cách trình bày nhận diện khác nhau. Hãy ghi rõ môn thể thao, tần suất sử dụng và nhóm người mặc trước khi chọn mẫu.</p><h2>2. Chốt một bảng màu ngắn</h2><p>Nên bắt đầu với một màu chính, một màu phụ và màu dùng cho tên số. Nếu đội đã có logo, màu trong logo là căn cứ tốt để tạo sự đồng bộ.</p><h2>3. Chuẩn bị danh sách thành viên</h2><ul><li>Họ tên hoặc tên in trên áo.</li><li>Số áo nếu có.</li><li>Size dự kiến của từng người.</li><li>Ghi chú riêng cần bộ phận tư vấn kiểm tra.</li></ul><h2>4. Gửi ngân sách và số lượng dự kiến</h2><p>Giá hiển thị trên sản phẩm là mức khởi điểm. Báo giá cuối cùng phụ thuộc vào cấu hình được xác nhận, vì vậy số lượng và yêu cầu tùy chỉnh nên được gửi ngay từ đầu.</p><QuoteBand compact /></article><aside className={styles.articleAside}><h2>Trong bài viết</h2><a href="#">Môn và cách sử dụng</a><a href="#">Bảng màu của đội</a><a href="#">Danh sách thành viên</a><a href="#">Ngân sách dự kiến</a><h2>Bài tiếp theo</h2>{posts.slice(1).map((item) => <Link href={`${previewBase}/blog/${item.slug}`} key={item.slug}>{item.title}</Link>)}</aside></div></>
}

