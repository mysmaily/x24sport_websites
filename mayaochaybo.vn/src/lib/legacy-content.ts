import mediaMap from '@/data/legacy-media-map.json'

const targets = mediaMap as Record<string, string>

export function legacyMediaTarget(path: string) {
  return targets[path] || null
}

function decodeCloudflareEmail(encoded: string) {
  if (!/^[0-9a-f]+$/i.test(encoded) || encoded.length < 4 || encoded.length % 2) return null
  const key = Number.parseInt(encoded.slice(0, 2), 16)
  let value = ''
  for (let index = 2; index < encoded.length; index += 2) value += String.fromCharCode(Number.parseInt(encoded.slice(index, index + 2), 16) ^ key)
  return value
}

export function rewriteLegacyHtml(html?: string | null) {
  if (!html) return ''
  let rewritten = html.replace(/https?:\/\/(?:www\.|cdn\.)?mayaochaybo\.vn(\/wp-content\/uploads\/[^\s"'<>?#]+)(?:\?[^\s"'<>#]*)?/gi, (url, path: string) => targets[path] || url)
  rewritten = rewritten.replace(/<a\b([^>]*?)data-cfemail=["']([0-9a-f]+)["']([^>]*)>[\s\S]*?<\/a>/gi, (anchor, before: string, encoded: string, after: string) => {
    const email = decodeCloudflareEmail(encoded)
    return email ? `<a${before}${after} href="mailto:${email}">${email}</a>` : anchor
  })
  return rewritten
}
