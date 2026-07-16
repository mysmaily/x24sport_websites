import { NextRequest, NextResponse } from 'next/server'

const validNeededDates = new Set(['4 ngày nữa', '5 ngày nữa', '1 tuần', 'Trên 1 tuần'])
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const rateLimitWindowMs = 10 * 60 * 1000
const maxRequestsPerWindow = 5

type QuickOrderPayload = {
  name?: unknown
  phone?: unknown
  quantity?: unknown
  neededDate?: unknown
  website?: unknown
  startedAt?: unknown
  productName?: unknown
  productUrl?: unknown
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

  let payload: QuickOrderPayload
  try {
    payload = (await request.json()) as QuickOrderPayload
  } catch {
    return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 })
  }

  if (cleanText(payload.website, 100)) {
    return NextResponse.json({ ok: true })
  }

  const startedAt = Number(payload.startedAt)
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2000 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ message: 'Phiên gửi yêu cầu không hợp lệ. Vui lòng tải lại trang.' }, { status: 400 })
  }

  const name = cleanText(payload.name, 80)
  const phone = cleanText(payload.phone, 20)
  const normalizedPhone = phone.replace(/[ .-]/g, '')
  const quantityText = cleanText(payload.quantity, 10)
  const quantity = Number.parseInt(quantityText, 10)
  const neededDate = cleanText(payload.neededDate, 30)
  const productName = cleanText(payload.productName, 180)
  const productUrl = cleanText(payload.productUrl, 500)

  if (!name || !/^(?:\+84|0)\d{8,10}$/.test(normalizedPhone)) {
    return NextResponse.json({ message: 'Vui lòng nhập tên và số điện thoại hợp lệ.' }, { status: 400 })
  }

  if (!Number.isInteger(quantity) || quantity < 5 || quantity > 10000 || !validNeededDates.has(neededDate)) {
    return NextResponse.json({ message: 'Vui lòng nhập số lượng từ 5 áo và chọn ngày cần áo.' }, { status: 400 })
  }

  let safeProductUrl = ''
  try {
    const parsedUrl = new URL(productUrl)
    if (parsedUrl.hostname === 'mayaopickleball.vn' || parsedUrl.hostname === 'www.mayaopickleball.vn') {
      safeProductUrl = parsedUrl.toString()
    }
  } catch {
    safeProductUrl = ''
  }

  if (!productName || !safeProductUrl) {
    return NextResponse.json({ message: 'Không xác định được sản phẩm. Vui lòng tải lại trang.' }, { status: 400 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.error('Quick order Telegram configuration is missing')
    return NextResponse.json({ message: 'Chưa gửi được yêu cầu. Vui lòng gọi hotline 0989.353.247.' }, { status: 503 })
  }

  const message = [
    'Yêu cầu đặt áo nhanh từ Mayaopickleball.vn',
    '',
    `Tên: ${name}`,
    `Số điện thoại: ${phone}`,
    `Số áo cần đặt: ${quantity}`,
    `Ngày cần áo: ${neededDate}`,
    '',
    `Sản phẩm: ${productName}`,
    `Link sản phẩm: ${safeProductUrl}`,
    '',
    `Nguồn: ${safeProductUrl}`,
    `Thời gian: ${vietnamTime()}`,
  ].join('\n')

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      body: JSON.stringify({ chat_id: chatId, disable_web_page_preview: true, text: message }),
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const result = (await telegramResponse.json()) as { ok?: boolean }

    if (!telegramResponse.ok || !result.ok) throw new Error(`Telegram returned ${telegramResponse.status}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Quick order Telegram send failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ message: 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi hotline 0989.353.247.' }, { status: 502 })
  }
}
