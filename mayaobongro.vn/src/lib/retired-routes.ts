const RETIRED_PATHS = new Set(['/ao-bong-ro-nguoi-lon/', '/ao-bong-ro-training/'])

export function isRetiredPath(path?: string | null) {
  return !!path && RETIRED_PATHS.has(path)
}

