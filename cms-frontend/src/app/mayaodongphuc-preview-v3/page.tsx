import { ArrowDownRight, ArrowRight, Check, Circle, Scissors, Shirt, SwatchBook } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { industries, products } from '../mayaodongphuc-preview/data'
import { ProductCard, v3Base } from './components'
import { V3QuoteForm } from './quote-form'
import styles from './v3.module.css'

export default function V3Home() {
  return <>
    <section className={styles.hero}><span className={styles.issue}>A NEW UNIFORM JOURNAL · 01</span><h1>May một hình ảnh <span className={styles.inlineImage}><Image alt="Chi tiết đội ngũ mặc đồng phục tại studio" fill fetchPriority="high" loading="eager" sizes="240px" src="/images/mayaodongphuc-preview/hero-atelier.webp" /></span> để mọi người <i>cùng thuộc về.</i></h1><div className={styles.heroBottom}><p>Chúng tôi bắt đầu từ người mặc và công việc của họ. Kiểu áo, vật liệu và màu sắc đến sau — như những câu trả lời có lý do.</p><Link href="#brief">Kể về đội ngũ của bạn <ArrowDownRight /></Link><div className={styles.liveMark}><i /><span>STUDIO NOTE<br />MỖI BRIEF LÀ MỘT BẢN RIÊNG</span></div></div></section>

    <section className={styles.contextSection}><div className={styles.editorialHead}><span>01 / CHỌN BỐI CẢNH</span><h2>Ai sẽ mặc?<br /><i>Họ đang làm gì?</i></h2><p>Hai câu hỏi nhỏ để tránh bắt đầu bằng một mẫu áo vô danh.</p></div><div className={styles.contextGrid}>{industries.map((item, index) => <Link className={styles.contextCard} href={`${v3Base}/danh-muc/${item.slug}`} key={item.slug}><span>{item.code}</span><div><h3>{item.name}</h3><p>{item.note}</p></div><ArrowDownRight /><i style={{ '--n': index } as React.CSSProperties} /></Link>)}</div></section>

    <section className={styles.collection}><div className={styles.editorialHead}><span>02 / THE STARTING PIECES</span><h2>Những phom dáng<br /><i>để bắt đầu đối thoại.</i></h2><p>Không phải mẫu đóng sẵn. Đây là cấu trúc để chất liệu, nhận diện và công năng cùng tìm được tiếng nói.</p></div><div className={styles.editorialProducts}><ProductCard eager large product={products[0]} /><div className={styles.productPair}><ProductCard eager product={products[1]} /><ProductCard product={products[2]} /></div><ProductCard large product={products[3]} /></div><Link className={styles.textCta} href={`${v3Base}/danh-muc/dong-phuc-doanh-nghiep`}>Đi vào bộ sưu tập <ArrowRight /></Link></section>

    <section className={styles.manifesto} id="cach-lam"><div className={styles.manifestoImage}><Image alt="Không gian thiết kế và may mẫu đồng phục" fill sizes="(max-width: 760px) 100vw, 44vw" src="/images/mayaodongphuc-preview/hero-atelier.webp" /><span>THE WORKROOM / 2026</span></div><div className={styles.manifestoCopy}><span>03 / CÁCH CHÚNG TÔI LÀM</span><blockquote>“Một chiếc áo tốt không khiến người ta nghĩ về chiếc áo. Nó giúp họ tự tin làm phần việc của mình.”</blockquote><ol><li><span>01</span><div><h3>Nghe bối cảnh</h3><p>Vai trò, môi trường, nhịp vận động và hình ảnh cần đại diện.</p></div></li><li><span>02</span><div><h3>Biên tập giải pháp</h3><p>Giữ những lựa chọn có lý do, bỏ những chi tiết chỉ để trang trí.</p></div></li><li><span>03</span><div><h3>Duyệt trước khi may</h3><p>Thiết kế, vật liệu, logo và size đều có điểm xác nhận rõ.</p></div></li></ol></div></section>

    <section className={styles.materials} id="vat-lieu"><div className={styles.editorialHead}><span>04 / MATERIAL NOTES</span><h2>Vật liệu là cách<br /><i>chiếc áo cư xử.</i></h2></div><div className={styles.materialList}><article><span>01</span><SwatchBook /><h3>Polo dệt mắt nhỏ</h3><p>Bề mặt gọn, thoáng vừa, giữ hình ảnh chỉn chu qua một ngày dài.</p></article><article><span>02</span><Scissors /><h3>Canvas</h3><p>Có cấu trúc, bền mặt, phù hợp cho tạp dề và chi tiết cần điểm tựa.</p></article><article><span>03</span><Shirt /><h3>Ripstop</h3><p>Nhẹ và thực dụng, dành cho đội ngũ thường xuyên di chuyển hoặc vận hành.</p></article></div></section>

    <section className={styles.note} id="ghi-chu"><Circle /><p>Một hệ đồng phục tốt phải nhận ra được thương hiệu — nhưng vẫn để người mặc được là chính họ.</p><span>WORKROOM PRINCIPLE / 01</span></section>

    <section className={styles.brief} id="brief"><div><span>05 / BEGIN WITH A NOTE</span><h2>Đừng gửi một đơn hàng.<br /><i>Hãy gửi một câu chuyện.</i></h2><p>Kể ngắn về đội ngũ, thời gian và điều bạn muốn họ đại diện. Phần còn lại là việc của một quy trình tốt.</p><ul><li><Check /> Không cần biết trước tên vải</li><li><Check /> Không cần có sẵn thiết kế</li><li><Check /> Có điểm duyệt trước sản xuất</li></ul></div><V3QuoteForm /></section>
  </>
}
