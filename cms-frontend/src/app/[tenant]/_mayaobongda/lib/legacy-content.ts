function decodeCloudflareEmail(encoded: string) {
  if (!/^[0-9a-f]+$/i.test(encoded) || encoded.length < 4 || encoded.length % 2) return null
  const key = Number.parseInt(encoded.slice(0, 2), 16)
  let value = ''
  for (let index = 2; index < encoded.length; index += 2) value += String.fromCharCode(Number.parseInt(encoded.slice(index, index + 2), 16) ^ key)
  return value
}

export function rewriteLegacyHtml(html?: string | null) {
  if (!html) return ''
  return html.replace(/<a\b([^>]*?)data-cfemail=["']([0-9a-f]+)["']([^>]*)>[\s\S]*?<\/a>/gi, (anchor, before: string, encoded: string, after: string) => {
    const email = decodeCloudflareEmail(encoded)
    return email ? `<a${before}${after} href="mailto:${email}">${email}</a>` : anchor
  })
}
