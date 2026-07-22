'use client'

import { useField } from '@payloadcms/ui'
import type { ArrayFieldClientProps } from 'payload'
import { useMemo } from 'react'

import styles from './MediaSearchTagsField.module.scss'

type SearchTag = {
  id?: string | null
  value?: unknown
}

type SearchTagValue = {
  value: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const normalizeTags = (value: string) => {
  const seen = new Set<string>()

  return value
    .split(/[\n,]+/)
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
    .join('\n')
}

export function MediaSearchTagsField({ path }: ArrayFieldClientProps) {
  const { disabled, errorMessage, setValue, showError, value } = useField<SearchTagValue[]>({
    path,
  })
  const textValue = useMemo(() => tagsToText(value), [value])
  const tags = useMemo(() => normalizeTags(textValue), [textValue])

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={`${path}-tag-composer`}>
          Search tags
        </label>
        <span className={styles.count}>{tags.length} tag</span>
      </div>
      <textarea
        className={styles.textarea}
        disabled={disabled}
        id={`${path}-tag-composer`}
        onChange={(event) => {
          const nextTags = normalizeTags(event.target.value).map((tag) => ({ value: tag }))
          setValue(nextTags)
        }}
        placeholder={'áo cầu lông\nxanh dương\ngradient\nkhông tay'}
        rows={8}
        value={textValue}
      />
      <div className={styles.description}>
        Mỗi dòng là một tag. Có thể dán một chuỗi tag phân tách bằng dấu phẩy.
      </div>
      {tags.length ? (
        <div aria-label="Search tag preview" className={styles.chips}>
          {tags.map((tag) => (
            <span className={styles.chip} key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {showError && errorMessage ? <div className={styles.error}>{errorMessage}</div> : null}
    </div>
  )
}
