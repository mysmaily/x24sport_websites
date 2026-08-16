'use client'

import { ArrowRight, Check } from 'lucide-react'
import { FormEvent, useState } from 'react'
import styles from './v3.module.css'

export function V3QuoteForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true) }
  if (submitted) return <div className={styles.success} role="status"><Check /><p><strong>Brief mẫu đã nằm trên bàn xưởng.</strong><span>Khi website chính thức được cấu hình, yêu cầu sẽ chuyển đến đội tư vấn.</span></p><button type="button" onClick={() => setSubmitted(false)}>Viết brief khác</button></div>
  return <form className={`${styles.quoteForm} ${compact ? styles.compactForm : ''}`} onSubmit={submit}>
    <div><label htmlFor="v3-name">Tên của bạn <b>*</b></label><input autoComplete="name" id="v3-name" name="name" placeholder="Nguyễn Minh Anh" required /></div>
    <div><label htmlFor="v3-phone">Số điện thoại <b>*</b></label><input autoComplete="tel" id="v3-phone" inputMode="tel" name="phone" pattern="[0-9 +.-]{9,}" placeholder="09xx xxx xxx" required /></div>
    {!compact ? <div><label htmlFor="v3-team">Bạn đang may cho <b>*</b></label><select defaultValue="" id="v3-team" name="team" required><option value="" disabled>Chọn bối cảnh</option><option>Doanh nghiệp</option><option>F&B</option><option>Trường học</option><option>Bảo hộ</option><option>Y tế & dịch vụ</option><option>Sự kiện & đội nhóm</option></select></div> : null}
    <div><label htmlFor="v3-quantity">Số lượng dự kiến</label><input id="v3-quantity" inputMode="numeric" min="1" name="quantity" placeholder="Ví dụ: 50" type="number" /></div>
    <button type="submit">Gửi brief mẫu <ArrowRight /></button><small>Bản demo tương tác, chưa gửi dữ liệu ra ngoài.</small>
  </form>
}
