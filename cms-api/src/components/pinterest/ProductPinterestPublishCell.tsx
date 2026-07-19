'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useMemo, useState } from 'react'

type PublishResponse =
  | {
      boardId?: string
      boardName?: string
      pinId: string
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

  const productId = useMemo(() => {
    if (!rowData || typeof rowData !== 'object') return null
    return 'id' in rowData ? rowData.id : null
  }, [rowData])

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!productId || isPosting) return

    setIsPosting(true)
    setMessage('')

    try {
      const response = await fetch('/api/pinterest/publish-product', {
        body: JSON.stringify({
          productId,
          returnTo: window.location.href,
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

      setMessage(`Đã đăng pin ${result.pinId}`)
    } catch (error) {
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
        {isPosting ? 'Đang đăng...' : 'Đăng Pinterest'}
      </button>
      {message ? (
        <span style={{ color: '#475569', fontSize: '0.72rem', lineHeight: 1.35 }}>{message}</span>
      ) : null}
    </div>
  )
}
