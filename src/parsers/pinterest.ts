import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'pin',
  'search',
  'ideas',
  'explore',
  'business',
  'today',
  'topics',
  'settings',
  'login',
  'signup',
  'about',
  'help',
])

export const pinterest: SocialLinksPlatformParser = {
  platform: 'pinterest',

  domains(hostname) {
    return hostname === 'pinterest.com' || hostname.endsWith('.pinterest.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Pin: /pin/{id}
    if (segments.length >= 2 && segments[0] === 'pin' && /^\d+$/.test(segments[1])) {
      return {
        type: 'photo',
        entities: { pin_id: segments[1] },
        url: `https://pinterest.com/pin/${segments[1]}`,
      }
    }

    // Board: /{username}/{board}
    if (
      segments.length === 2 &&
      !RESERVED.has(segments[0].toLowerCase()) &&
      segments[1]
    ) {
      return {
        type: 'board',
        entities: { username: segments[0], board: segments[1] },
        url: `https://pinterest.com/${segments[0]}/${segments[1]}`,
      }
    }

    // Profile: /{username}
    if (segments.length === 1 && !RESERVED.has(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://pinterest.com/${segments[0]}`,
      }
    }

    return null
  },
}
