import { NextRequest, NextResponse } from 'next/server'

const telegramContactChatId = '-5434989353'
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const rateLimitWindowMs = 10 * 60 * 1000
const maxRequestsPerWindow = 5

type ContactPayload = {
  name?: unknown
  phone?: unknown
  email?: unknown
  message?: unknown
  website?: unknown
  startedAt?: unknown
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength) : ''
}

function vietnamTime() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day} ${value.hour}:${value.minute}:${value.second}`
}

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const current = rateLimit.get(ip)

  if (!current || current.resetAt <= now) {
    rateLimit.set(ip, { count: 1, resetAt: now + rateLimitWindowMs })
    return false
  }

  current.count += 1
  return current.count > maxRequestsPerWindow
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json({ message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.' }, { status: 429 })
  }

  let payload: ContactPayload
  try {
    payload = (await request.json()) as ContactPayload
  } catch {
    return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 })
  }

  if (cleanText(payload.website, 100)) {
    return NextResponse.json({ ok: true })
  }

  const startedAt = Number(payload.startedAt)
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2000 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ message: 'Phiên gửi liên hệ không hợp lệ. Vui lòng tải lại trang.' }, { status: 400 })
  }

  const name = cleanText(payload.name, 80)
  const phone = cleanText(payload.phone, 20)
  const normalizedPhone = phone.replace(/[ .-]/g, '')
  const email = cleanText(payload.email, 120)
  const messageText = cleanText(payload.message, 1200)

  if (!name || !/^(?:\+84|0)\d{8,10}$/.test(normalizedPhone)) {
    return NextResponse.json({ message: 'Vui lòng nhập tên và số điện thoại hợp lệ.' }, { status: 400 })
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Email chưa đúng định dạng.' }, { status: 400 })
  }

  if (messageText.length < 10) {
    return NextResponse.json({ message: 'Vui lòng nhập nội dung liên hệ ít nhất 10 ký tự.' }, { status: 400 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('Contact Telegram configuration is missing')
    return NextResponse.json({ message: 'Chưa gửi được liên hệ. Vui lòng gọi hotline 0989.353.247.' }, { status: 503 })
  }

  const message = [
    'Liên hệ mới từ X24Sport.vn',
    '',
    `Tên: ${name}`,
    `Số điện thoại: ${phone}`,
    email ? `Email: ${email}` : 'Email: Không cung cấp',
    '',
    `Nội dung: ${messageText}`,
    '',
    'Nguồn: /lien-he',
    `Thời gian: ${vietnamTime()}`,
  ].join('\n')

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      body: JSON.stringify({ chat_id: telegramContactChatId, disable_web_page_preview: true, text: message }),
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const result = (await telegramResponse.json()) as { ok?: boolean }

    if (!telegramResponse.ok || !result.ok) throw new Error(`Telegram returned ${telegramResponse.status}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Contact Telegram send failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ message: 'Chưa gửi được liên hệ. Vui lòng thử lại hoặc gọi hotline 0989.353.247.' }, { status: 502 })
  }
}
