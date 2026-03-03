import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'discover',
  'live',
  'upload',
  'developers',
  'categories',
  'search',
  'select',
  'premium',
  'pro',
  'about',
  'terms',
  'privacy',
])

export const mixcloud: SocialLinksPlatformParser = {
  platform: 'mixcloud',

  domains(hostname) {
    return (
      hostname === 'mixcloud.com' ||
      hostname.endsWith('.mixcloud.com')
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    const username = segments[0]
    if (RESERVED.has(username.toLowerCase())) return null

    // /{username}
    if (segments.length === 1) {
      return {
        type: 'profile',
        entities: { username },
        url: `https://mixcloud.com/${username}`,
      }
    }

    // /{username}/{show_slug}
    if (segments.length === 2 && segments[1]) {
      return {
        type: 'post',
        entities: { username, show: segments[1] },
        url: `https://mixcloud.com/${username}/${segments[1]}`,
      }
    }

    return null
  },
}
