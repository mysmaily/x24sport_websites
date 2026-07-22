'use client'

import { useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import type { ArrayFieldClientProps } from 'payload'
import { useEffect, useMemo, useState } from 'react'

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

const formStateToText = (
  fields: Record<string, { rows?: { id?: string }[]; value?: unknown }>,
  path: string,
) => {
  const rows = fields[path]?.rows
  if (!Array.isArray(rows) || !rows.length) return ''

  return rows
    .map((_, index) => {
      const field = fields[`${path}.${index}.value`]
      return typeof field?.value === 'string' ? field.value.trim() : ''
    })
    .filter(Boolean)
    .join('\n')
}

export function MediaSearchTagsField({ path }: ArrayFieldClientProps) {
  const { id } = useDocumentInfo()
  const { disabled, errorMessage, setValue, showError, value } = useField<SearchTagValue[]>({
    path,
  })
  const formTextValue = useFormFields(([fields]) =>
    formStateToText(fields as Record<string, { rows?: { id?: string }[]; value?: unknown }>, path),
  )
  const fieldTextValue = useMemo(() => tagsToText(value), [value])
  const sourceTextValue = fieldTextValue || formTextValue
  const [textValue, setTextValue] = useState(sourceTextValue)
  const [hasEdited, setHasEdited] = useState(false)
  const tags = useMemo(() => normalizeTags(textValue), [textValue])

  useEffect(() => {
    if (hasEdited || !sourceTextValue) return

    setTextValue(sourceTextValue)
    setValue(normalizeTags(sourceTextValue).map((tag) => ({ value: tag })), true)
  }, [hasEdited, setValue, sourceTextValue])

  useEffect(() => {
    if (hasEdited || sourceTextValue || !id) return

    const controller = new AbortController()

    void fetch(`/api/media/${encodeURIComponent(String(id))}?depth=0`, {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Media request failed with ${response.status}`)
        return (await response.json()) as { searchTags?: SearchTag[] | null }
      })
      .then((doc) => {
        const nextTextValue = tagsToText(doc.searchTags)
        if (!nextTextValue) return

        setTextValue(nextTextValue)
        setValue(normalizeTags(nextTextValue).map((tag) => ({ value: tag })), true)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
      })

    return () => controller.abort()
  }, [hasEdited, id, setValue, sourceTextValue])

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
          const nextTextValue = event.target.value
          const nextTags = normalizeTags(nextTextValue).map((tag) => ({ value: tag }))
          setHasEdited(true)
          setTextValue(nextTextValue)
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
