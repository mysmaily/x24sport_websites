'use client'

import { ArrowRight, Check } from 'lucide-react'
import { FormEvent, useState } from 'react'

import styles from './mayaodongphuc.module.css'

type State = 'idle' | 'submitting' | 'success' | 'error'

export function UniformCallbackForm() {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')
  const [startedAt] = useState(() => Date.now())

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    setState('submitting')
    setMessage('')
    try {
      const response = await fetch('/api/product-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'callback',
          phone: String(data.get('phone') || ''),
          quantity: String(data.get('quantity') || ''),
          productUrl: window.location.href,
          website: String(data.get('website') || ''),
          startedAt,
        }),
      })
      const result = await response.json() as { message?: string }
      if (!response.ok) throw new Error(result.message || 'Chưa gửi được yêu cầu.')
      form.reset()
      setState('success')
      setMessage('Đã gửi yêu cầu. Đội ngũ tư vấn sẽ liên hệ lại với bạn.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được yêu cầu.')
    }
  }

  if (state === 'success') return <div className={styles.success} role="status"><Check /><div><strong>Đã ghi nhận yêu cầu</strong><p>{message}</p></div><button onClick={() => setState('idle')} type="button">Gửi yêu cầu khác</button></div>

  return <form className={styles.quoteForm} onSubmit={submit}>
    <div><label htmlFor="mdp-phone">Số điện thoại <b>*</b></label><input autoComplete="tel" id="mdp-phone" inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" placeholder="09xx xxx xxx" required type="tel" /></div>
    <div><label htmlFor="mdp-quantity">Số lượng dự kiến <b>*</b></label><select defaultValue="15-30 bộ" id="mdp-quantity" name="quantity" required><option>5-15 bộ</option><option>15-30 bộ</option><option>Trên 30 bộ</option></select></div>
    <label aria-hidden="true" hidden><span>Website</span><input autoComplete="off" name="website" tabIndex={-1} /></label>
    <button disabled={state === 'submitting'} type="submit">{state === 'submitting' ? 'Đang gửi...' : 'Yêu cầu gọi lại'} <ArrowRight /></button>
    <p aria-live="polite" className={styles.formNote} role="status">{state === 'error' ? message : 'Thông tin chỉ được dùng để tư vấn yêu cầu đồng phục.'}</p>
  </form>
}
