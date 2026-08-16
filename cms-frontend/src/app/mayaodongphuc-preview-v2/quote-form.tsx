'use client'

import { ArrowRight, Check, Upload } from 'lucide-react'
import { FormEvent, useState } from 'react'
import styles from '../[tenant]/_mayaodongphuc/mayaodongphuc.module.css'

export function V2QuoteForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [phone, setPhone] = useState('')
  const invalidPhone = phoneTouched && phone.replace(/\D/g, '').length < 9

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPhoneTouched(true)
    if (phone.replace(/\D/g, '').length < 9) return
    setSubmitted(true)
  }

  if (submitted) return <div className={styles.success} role="status"><Check /><div><strong>Brief mẫu đã được ghi nhận</strong><p>Ở website chính thức, yêu cầu sẽ được chuyển tới đội tư vấn sau khi kênh liên hệ được cấu hình.</p></div><button onClick={() => setSubmitted(false)} type="button">Tạo brief khác</button></div>

  return <form className={`${styles.quoteForm} ${compact ? styles.compactForm : ''}`} onSubmit={submit}>
    <div><label htmlFor="v2-name">Tên người liên hệ <b>*</b></label><input autoComplete="name" id="v2-name" name="name" placeholder="Nguyễn Minh Anh" required /></div>
    <div><label htmlFor="v2-phone">Số điện thoại <b>*</b></label><input aria-describedby={invalidPhone ? 'v2-phone-error' : undefined} aria-invalid={invalidPhone} autoComplete="tel" id="v2-phone" inputMode="tel" name="phone" onBlur={() => setPhoneTouched(true)} onChange={(event) => setPhone(event.target.value)} placeholder="09xx xxx xxx" value={phone} required />{invalidPhone ? <small className={styles.fieldError} id="v2-phone-error">Vui lòng nhập số điện thoại hợp lệ.</small> : null}</div>
    {!compact ? <div><label htmlFor="v2-industry">Nhóm nhu cầu <b>*</b></label><select defaultValue="" id="v2-industry" name="industry" required><option value="" disabled>Chọn lĩnh vực</option><option>Doanh nghiệp</option><option>F&B</option><option>Trường học</option><option>Bảo hộ</option><option>Y tế & dịch vụ</option><option>Sự kiện & đội nhóm</option></select></div> : null}
    <div><label htmlFor="v2-quantity">Số lượng dự kiến</label><input id="v2-quantity" inputMode="numeric" min="1" name="quantity" placeholder="Ví dụ: 50" type="number" /></div>
    {!compact ? <label className={styles.upload} htmlFor="v2-file"><Upload /><span><strong>Logo hoặc mẫu tham khảo</strong><small>PNG, JPG, PDF — tối đa 10MB</small></span><input accept=".png,.jpg,.jpeg,.pdf" id="v2-file" name="reference" type="file" /></label> : null}
    <button type="submit">Gửi brief tư vấn <ArrowRight /></button><p className={styles.formNote}>Bản demo tương tác, chưa gửi dữ liệu ra ngoài.</p>
  </form>
}
