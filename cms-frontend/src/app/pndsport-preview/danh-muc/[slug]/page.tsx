import type { Metadata } from 'next'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

import { Breadcrumbs, ProductGrid, QuoteBand } from '../../components'
import { categories, previewBase, products } from '../../data'
import styles from '../../pnd.module.css'

export const metadata: Metadata = { title: 'Áo bóng đá thiết kế theo đội', description: 'Khám phá mẫu áo bóng đá và gửi yêu cầu điều chỉnh màu, logo, tên số.' }

export default function CategoryPage() {
  return <><Breadcrumbs items={[{ label: 'Sản phẩm' }, { label: 'Bóng đá' }]} /><section className={styles.pageHero}><div className={styles.pageHeroInner}><div><span className={styles.eyebrow}>Danh mục sản phẩm</span><h1>Áo bóng đá</h1><p>Kho mẫu để đội bóng chọn hướng thiết kế ban đầu. Giá công khai là mức thấp nhất của sản phẩm.</p></div><aside>Kho mẫu</aside></div></section><section className={styles.section}><div className={styles.sectionInner}><div className={styles.filterBar}><button className={styles.active}>Tất cả mẫu</button><button>Áo nam</button><button>Áo nữ</button><button>Trẻ em</button><button>Không logo</button><button><SlidersHorizontal size={14} /> Bộ lọc <ChevronDown size={13} /></button></div><div className={styles.catalogLayout}><aside className={styles.catalogAside}><h2>Nhóm sản phẩm</h2>{categories.map((item) => <Link href={`${previewBase}/danh-muc/${item.slug}`} key={item.slug}>{item.name}<span>→</span></Link>)}</aside><div><div className={styles.catalogMainHeader}><span>Hiển thị 8 mẫu trong bản thiết kế</span><span>Sắp xếp: Mới cập nhật</span></div><ProductGrid items={[...products, ...products]} /><nav className={styles.pagination} aria-label="Phân trang"><a href="#">1</a><a href="#">2</a><a href="#">3</a><a href="#">→</a></nav></div></div><QuoteBand compact /></div></section></>
}
