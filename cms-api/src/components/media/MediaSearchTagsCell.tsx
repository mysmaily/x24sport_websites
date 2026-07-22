'use client'

import type { DefaultCellComponentProps } from 'payload'
import { useMemo, useState } from 'react'

import styles from './MediaSearchTagsCell.module.scss'

type SearchTag = {
  id?: string | null
  value?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normalizeTags = (value: string) => {
  const seen = new Set<string>()

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = tag.toLocaleLowerCase('vi-VN')
      if (!tag || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

const tagsToText = (value: unknown) => {
  if (!Array.isArray(value)) return ''

  return value
    .filter(isRecord)
    .map((tag: SearchTag) => (typeof tag.value === 'string' ? tag.value.trim() : ''))
    .filter(Boolean)
    .join(', ')
}

export function MediaSearchTagsCell({ cellData, rowData }: DefaultCellComponentProps) {
  const initialValue = useMemo(() => tagsToText(cellData), [cellData])
  const [value, setValue] = useState(initialValue)
  const [savedValue, setSavedValue] = useState(initialValue)
  const [status, setStatus] = useState<'error' | 'idle' | 'saving' | 'success'>('idle')
  const [message, setMessage] = useState('')
  const mediaID = rowData?.id
  const isDirty = value !== savedValue
  const canSave = isDirty && status !== 'saving' && (typeof mediaID === 'number' || typeof mediaID === 'string')

  const save = async () => {
    if (!canSave) return

    setStatus('saving')
    setMessage('Đang lưu')

    try {
      const tags = normalizeTags(value).map((tag) => ({ value: tag }))
      const response = await fetch(`/api/media/${encodeURIComponent(String(mediaID))}`, {
        body: JSON.stringify({ searchTags: tags }),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      })

      if (!response.ok) throw new Error(`Save failed with ${response.status}`)

      const nextValue = tags.map((tag) => tag.value).join(', ')
      setValue(nextValue)
      setSavedValue(nextValue)
      setStatus('success')
      setMessage('Đã lưu')
      window.setTimeout(() => {
        setStatus((current) => (current === 'success' ? 'idle' : current))
        setMessage('')
      }, 1800)
    } catch {
      setStatus('error')
      setMessage('Lỗi lưu')
    }
  }

  return (
    <form
      className={styles.form}
      onClick={(event) => event.stopPropagation()}
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <textarea
        aria-label="Search tags"
        className={styles.input}
        disabled={status === 'saving'}
        onChange={(event) => {
          setValue(event.target.value)
          if (status !== 'idle') {
            setStatus('idle')
            setMessage('')
          }
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault()
            void save()
          }
        }}
        placeholder="tag 1, tag 2"
        rows={2}
        value={value}
      />
      <button className={styles.button} disabled={!canSave} type="submit">
        Lưu
      </button>
      {message ? (
        <span
          className={[
            styles.status,
            status === 'error' ? styles.statusError : '',
            status === 'success' ? styles.statusSuccess : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="status"
        >
          {message}
        </span>
      ) : null}
    </form>
  )
}
