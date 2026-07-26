import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.PAYLOAD_API_URL || 'http://10.10.0.28:3001'
const TENANT_SLUG = process.env.TENANT_SLUG || 'mayaochaybo'
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const rateLimitWindowMs = 10 * 60 * 1000
const maxRequestsPerWindow = 5

type InterestPayload = {
  phone?: unknown
  quantity?: unknown
  productName?: unknown
  productUrl?: unknown
  website?: unknown
  startedAt?: unknown
}

type StoreSettings = { telegramChatId?: string | null }
type ApiList<T> = { docs?: T[] }

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

async function getTelegramChatId() {
  const params = new URLSearchParams({
    'where[tenant.slug][equals]': TENANT_SLUG,
    limit: '1',
    depth: '0',
  })
  const response = await fetch(`${API_URL}/api/store-settings?${params.toString()}`, { cache: 'no-store' })
  if (!response.ok) return ''
  const data = (await response.json()) as ApiList<StoreSettings>
  return data.docs?.[0]?.telegramChatId?.trim() || ''
}

function requestHostCandidates(request: NextRequest) {
  const hosts = [
    request.headers.get('x-forwarded-host'),
    request.headers.get('host'),
    request.nextUrl.hostname,
  ].flatMap((value) => (value || '').split(','))

  return new Set(
    hosts
      .map((host) => host.trim().toLowerCase().replace(/:\d+$/, '').replace(/^www\./, ''))
      .filter(Boolean),
  )
}

function safeProductUrl(value: string, request: NextRequest) {
  try {
    const parsed = new URL(value)
    const parsedHost = parsed.hostname.toLowerCase().replace(/^www\./, '')
    if (requestHostCandidates(request).has(parsedHost)) return parsed.toString()
  } catch {
    return ''
  }
  return ''
}

function productUrlFromRequest(value: string, request: NextRequest) {
  return safeProductUrl(value, request) || safeProductUrl(request.headers.get('referer') || '', request)
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json({ message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.' }, { status: 429 })
  }

  let payload: InterestPayload
  try {
    payload = (await request.json()) as InterestPayload
  } catch {
    return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 })
  }

  if (cleanText(payload.website, 100)) return NextResponse.json({ ok: true })

  const startedAt = Number(payload.startedAt)
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1500 || Date.now() - startedAt > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ message: 'Phiên gửi yêu cầu không hợp lệ. Vui lòng tải lại trang.' }, { status: 400 })
  }

  const phone = cleanText(payload.phone, 20)
  const normalizedPhone = phone.replace(/[ .-]/g, '')
  const quantity = Number.parseInt(cleanText(payload.quantity, 10), 10)
  const productName = cleanText(payload.productName, 180)
  const productUrl = productUrlFromRequest(cleanText(payload.productUrl, 500), request)

  if (!/^(?:\+84|0)\d{8,10}$/.test(normalizedPhone)) {
    return NextResponse.json({ message: 'Vui lòng nhập số điện thoại hợp lệ.' }, { status: 400 })
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
    return NextResponse.json({ message: 'Vui lòng nhập số lượng cần đặt hợp lệ.' }, { status: 400 })
  }
  if (!productName || !productUrl) {
    return NextResponse.json({ message: 'Không xác định được sản phẩm. Vui lòng tải lại trang.' }, { status: 400 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = await getTelegramChatId()
  if (!token || !chatId) {
    return NextResponse.json({ message: 'Form tư vấn chưa được cấu hình. Vui lòng gọi hotline để được hỗ trợ.' }, { status: 503 })
  }

  const message = [
    `Yêu cầu tư vấn sản phẩm từ ${TENANT_SLUG}`,
    '',
    `Số điện thoại: ${phone}`,
    `Số lượng cần đặt: ${quantity}`,
    '',
    `Sản phẩm: ${productName}`,
    `Link sản phẩm: ${productUrl}`,
    '',
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
    console.error('Product interest Telegram send failed', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ message: 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi hotline.' }, { status: 502 })
  }
}
