import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'about', 'blog', 'careers', 'contact', 'download', 'faq', 'help',
  'invite', 'jobs', 'legal', 'login', 'press', 'privacy', 'room',
  'search', 'settings', 'support', 'terms', 'topic',
])

export const clubhouse: SocialLinksPlatformParser = {
  platform: 'clubhouse',

  domains(hostname) {
    return hostname === 'clubhouse.com' || hostname === 'joinclubhouse.com'
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Profile: /@{username}
    if (segments.length === 1 && segments[0].startsWith('@')) {
      const username = segments[0].slice(1)
      if (username && !RESERVED.has(username.toLowerCase())) {
        return {
          type: 'profile',
          entities: { username },
          url: `https://clubhouse.com/@${username}`,
        }
      }
    }

    // Club: /club/{clubname}
    if (segments.length === 2 && segments[0] === 'club' && segments[1]) {
      return {
        type: 'profile',
        entities: { club: segments[1] },
        url: `https://clubhouse.com/club/${segments[1]}`,
      }
    }

    return null
  },
}
