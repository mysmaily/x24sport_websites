'use client'

import { ArrowRight, Check, Upload } from 'lucide-react'
import { FormEvent, useState } from 'react'

import styles from './studio.module.css'

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return <div className={styles.quoteSuccess} role="status">
      <span><Check aria-hidden="true" /></span>
      <div><strong>Đã ghi nhận yêu cầu mẫu</strong><p>Ở website chính thức, yêu cầu này sẽ được chuyển đến bộ phận tư vấn sau khi thông tin liên hệ được cấu hình.</p></div>
      <button onClick={() => setSubmitted(false)} type="button">Gửi yêu cầu khác</button>
    </div>
  }

  return <form className={`${styles.quoteForm} ${compact ? styles.quoteFormCompact : ''}`} onSubmit={submit}>
    <div className={styles.formField}><label htmlFor="quote-name">Anh/chị tên gì?</label><input autoComplete="name" id="quote-name" name="name" placeholder="Nguyễn Minh Anh" required /></div>
    <div className={styles.formField}><label htmlFor="quote-phone">Số điện thoại</label><input autoComplete="tel" id="quote-phone" inputMode="tel" name="phone" placeholder="09xx xxx xxx" required /></div>
    {!compact ? <div className={styles.formField}><label htmlFor="quote-industry">Nhu cầu đồng phục</label><select defaultValue="" id="quote-industry" name="industry" required><option disabled value="">Chọn nhóm nhu cầu</option><option>Doanh nghiệp</option><option>F&B</option><option>Trường học</option><option>Bảo hộ</option><option>Y tế & dịch vụ</option><option>Sự kiện & đội nhóm</option></select></div> : null}
    <div className={styles.formField}><label htmlFor="quote-quantity">Số lượng dự kiến</label><input id="quote-quantity" inputMode="numeric" min="1" name="quantity" placeholder="Ví dụ: 50" type="number" /></div>
    {!compact ? <label className={styles.fileField} htmlFor="quote-file"><Upload aria-hidden="true" /><span><strong>Đính kèm logo hoặc mẫu tham khảo</strong><small>PNG, JPG, PDF — tối đa 10MB</small></span><input accept=".png,.jpg,.jpeg,.pdf" id="quote-file" name="reference" type="file" /></label> : null}
    <button className={styles.submitButton} type="submit">Gửi yêu cầu tư vấn <ArrowRight aria-hidden="true" /></button>
    <p className={styles.formNote}>Đây là bản mô phỏng tương tác, chưa gửi dữ liệu ra ngoài.</p>
  </form>
}

