import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'home',
  'explore',
  'gallery',
  'shop',
  'commissions',
  'about',
  'login',
  'signup',
  'account',
  'settings',
])

const SUPPORT_ID_RE = /^[a-zA-Z0-9]{6,}$/

export const kofi: SocialLinksPlatformParser = {
  platform: 'kofi',

  domains(hostname) {
    return hostname === 'ko-fi.com' || hostname.endsWith('.ko-fi.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    // /s/{support_id}
    if (segments.length === 2 && segments[0] === 's' && SUPPORT_ID_RE.test(segments[1])) {
      return {
        type: 'post',
        entities: { support_id: segments[1] },
        url: `https://ko-fi.com/s/${segments[1]}`,
      }
    }

    // /{username}
    if (segments.length === 1 && !RESERVED.has(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://ko-fi.com/${segments[0]}`,
      }
    }

    return null
  },
}
