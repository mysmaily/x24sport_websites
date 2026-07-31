import { permanentRedirect } from 'next/navigation'

export default async function LegacyShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const preserved = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => preserved.append(key, item))
    else if (value !== undefined) preserved.set(key, value)
  })
  permanentRedirect(`/san-pham/${preserved.size ? `?${preserved}` : ''}`)
}
