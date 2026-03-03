const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  'si',
  'igshid',
])

export function tryParseUrl(input: string): URL | null {
  let trimmed = input.trim()
  if (!trimmed) return null

  // Recover malformed absolute URLs like "http:example.com/x" or "https:/example.com/x".
  if (/^https?:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    trimmed = trimmed.replace(/^([a-z]+):\/*/i, '$1://')
  } else if (trimmed.startsWith('//')) {
    // Protocol-relative input -> default to https.
    trimmed = 'https:' + trimmed
  } else if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed
  }

  try {
    return new URL(trimmed)
  } catch {
    return null
  }
}

export function cleanUrl(url: URL): URL {
  const cleaned = new URL(url.href)
  cleaned.protocol = 'https:'
  cleaned.hostname = cleaned.hostname.toLowerCase()
  cleaned.hash = ''

  for (const key of Array.from(cleaned.searchParams.keys())) {
    if (TRACKING_PARAMS.has(key)) {
      cleaned.searchParams.delete(key)
    }
  }

  // Remove trailing slash from pathname (keep "/" for root)
  if (cleaned.pathname.length > 1 && cleaned.pathname.endsWith('/')) {
    cleaned.pathname = cleaned.pathname.replace(/\/+$/, '')
  }

  return cleaned
}
