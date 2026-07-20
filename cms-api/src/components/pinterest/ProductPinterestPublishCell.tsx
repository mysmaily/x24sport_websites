'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useMemo, useState } from 'react'

type PublishResponse =
  | {
      boardId?: string
      boardName?: string
      pinId: string
      pinURL?: string
      productId?: string
      productLink: string
      success: true
    }
  | {
      connectUrl: string
      error?: string
      needsConnection: true
      success: false
    }
  | {
      error: string
      success: false
    }

export function ProductPinterestPublishCell({ rowData }: DefaultCellComponentProps) {
  const [isPosting, setIsPosting] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('success')

  const productId = useMemo(() => {
    if (!rowData || typeof rowData !== 'object') return null
    return 'id' in rowData ? rowData.id : null
  }, [rowData])

  const persistedPinterestState = useMemo(() => {
    if (!rowData || typeof rowData !== 'object') return null

    const data = rowData as Record<string, unknown>
    const pinId = typeof data.pinterestPinId === 'string' ? data.pinterestPinId : ''
    const pinURL = typeof data.pinterestPinUrl === 'string' ? data.pinterestPinUrl : ''
    const boardName = typeof data.pinterestBoardName === 'string' ? data.pinterestBoardName : ''
    const environment =
      typeof data.pinterestPublishEnvironment === 'string' ? data.pinterestPublishEnvironment : ''

    if (!pinId) return null

    return {
      boardName,
      environment,
      pinId,
      pinURL,
    }
  }, [rowData])

  const showGlobalBanner = (tone: 'error' | 'success', text: string) => {
    if (typeof document === 'undefined') return

    let banner = document.getElementById('pinterest-result-banner')

    if (!banner) {
      banner = document.createElement('div')
      banner.id = 'pinterest-result-banner'
      document.body.appendChild(banner)
    }

    banner.textContent = text
    banner.setAttribute('data-tone', tone)
    banner.setAttribute(
      'style',
      [
        'position:fixed',
        'top:16px',
        'right:16px',
        'z-index:9999',
        'max-width:420px',
        'padding:12px 14px',
        'border-radius:12px',
        'box-shadow:0 10px 30px rgba(15,23,42,0.18)',
        'font-size:13px',
        'font-weight:600',
        'line-height:1.45',
        tone === 'success'
          ? 'background:#dcfce7;color:#166534;border:1px solid #86efac'
          : 'background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5',
      ].join(';'),
    )
  }

  useEffect(() => {
    if (!productId || typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const redirectedProductId = params.get('productId')
    const pinterestStatus = params.get('pinterest')

    if (redirectedProductId !== String(productId)) return

    if (pinterestStatus === 'sandbox-connected') {
      const pinId = params.get('pinId')
      const pinURL = params.get('pinURL')
      const boardName = params.get('boardName')
      const parts = ['Sandbox thành công']

      if (pinId) parts.push(`Pin ID: ${pinId}`)
      if (boardName) parts.push(`Board: ${boardName}`)

      const successMessage = parts.join(' | ')
      setMessage(successMessage)
      setMessageTone('success')
      showGlobalBanner('success', successMessage)

      if (pinURL && typeof window !== 'undefined') {
        window.setTimeout(() => {
          const params = new URLSearchParams(window.location.search)
          ;['pinterest', 'reason', 'pinId', 'pinURL', 'productId', 'boardId', 'boardName'].forEach(
            (key) => params.delete(key),
          )
          const nextURL = `${window.location.pathname}?${params.toString()}`
          window.history.replaceState({}, '', nextURL)
        }, 0)
      }
      return
    }

    if (pinterestStatus === 'error') {
      const reason = params.get('reason')
      if (reason) {
        setMessage(reason)
        setMessageTone('error')
        showGlobalBanner('error', reason)
      }
    }
  }, [productId])

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!productId || isPosting) return

    setIsPosting(true)
    setMessage('')

    try {
      const currentURL = new URL(window.location.href)
      ;['pinterest', 'reason', 'pinId', 'pinURL', 'productId', 'boardId', 'boardName'].forEach(
        (key) => currentURL.searchParams.delete(key),
      )

      const response = await fetch('/api/pinterest/publish-product', {
        body: JSON.stringify({
          environment: 'sandbox',
          productId,
          returnTo: currentURL.toString(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const result = (await response.json()) as PublishResponse

      if (response.status === 409 && 'needsConnection' in result && result.needsConnection) {
        window.location.assign(result.connectUrl)
        return
      }

      if (!response.ok || !('success' in result) || !result.success) {
        throw new Error('error' in result ? result.error : 'Không thể đăng Pinterest.')
      }

      setMessageTone('success')
      setMessage([
        'Sandbox thành công',
        `Pin ID: ${result.pinId}`,
        result.boardName ? `Board: ${result.boardName}` : null,
      ].filter(Boolean).join(' | '))
    } catch (error) {
      setMessageTone('error')
      setMessage(error instanceof Error ? error.message : 'Có lỗi khi đăng Pinterest.')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      style={{ alignItems: 'flex-start', display: 'grid', gap: '0.35rem' }}
    >
      <button
        disabled={!productId || isPosting}
        onClick={handleClick}
        style={{
          background: isPosting ? '#c2410c' : '#b91c1c',
          border: 'none',
          borderRadius: '999px',
          color: '#fff',
          cursor: isPosting ? 'progress' : 'pointer',
          fontSize: '0.75rem',
          fontWeight: 700,
          lineHeight: 1,
          minWidth: '7.5rem',
          padding: '0.55rem 0.9rem',
        }}
        type="button"
      >
        {isPosting ? 'Đang đăng...' : 'Đăng Pinterest Sandbox'}
      </button>
      {message ? (
        <span
          style={{
            color: messageTone === 'success' ? '#166534' : '#b91c1c',
            fontSize: '0.72rem',
            fontWeight: messageTone === 'success' ? 600 : 500,
            lineHeight: 1.35,
            maxWidth: '18rem',
          }}
        >
          {message}
        </span>
      ) : null}
      {!message && persistedPinterestState ? (
        <div style={{ display: 'grid', gap: '0.2rem', maxWidth: '18rem' }}>
          <span
            style={{
              color: '#166534',
              fontSize: '0.72rem',
              fontWeight: 600,
              lineHeight: 1.35,
            }}
          >
            {`Da dang ${persistedPinterestState.environment || 'pinterest'} | Pin ID: ${persistedPinterestState.pinId}${persistedPinterestState.boardName ? ` | Board: ${persistedPinterestState.boardName}` : ''}`}
          </span>
          {persistedPinterestState.pinURL ? (
            <a
              href={persistedPinterestState.pinURL}
              onClick={(event) => event.stopPropagation()}
              rel="noreferrer"
              style={{ color: '#0369a1', fontSize: '0.72rem', textDecoration: 'underline' }}
              target="_blank"
            >
              Mo pin Pinterest
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
