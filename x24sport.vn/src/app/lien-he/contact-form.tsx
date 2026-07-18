'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Send } from 'lucide-react'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [message, setMessage] = useState('')
  const startedAt = useMemo(() => Date.now(), [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setState('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify({
          email: formData.get('email'),
          message: formData.get('message'),
          name: formData.get('name'),
          phone: formData.get('phone'),
          startedAt,
          website: formData.get('website'),
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) throw new Error(result.message || 'Chưa gửi được liên hệ.')
      form.reset()
      setState('success')
      setMessage('X24Sport đã nhận thông tin. Đội ngũ tư vấn sẽ liên hệ lại sớm.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được liên hệ. Vui lòng thử lại.')
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field">
        <label htmlFor="contact-name">Họ và tên</label>
        <input id="contact-name" name="name" autoComplete="name" required />
      </div>
      <div className="contact-field">
        <label htmlFor="contact-phone">Số điện thoại</label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" required />
      </div>
      <div className="contact-field">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" />
      </div>
      <div className="contact-field contact-field-full">
        <label htmlFor="contact-message">Nội dung cần tư vấn</label>
        <textarea id="contact-message" name="message" rows={6} required />
      </div>
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="contact-submit" type="submit" disabled={state === 'submitting'}>
        <Send size={18} />
        {state === 'submitting' ? 'Đang gửi...' : 'Gửi liên hệ'}
      </button>
      {message ? <p className={`contact-form-status ${state === 'error' ? 'error' : 'success'}`} role="status">{message}</p> : null}
    </form>
  )
}
