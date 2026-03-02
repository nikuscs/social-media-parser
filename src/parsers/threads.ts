import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const threads: SocialLinksPlatformParser = {
  platform: 'threads',

  domains(hostname) {
    return hostname === 'threads.net' || hostname.endsWith('.threads.net')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    if (!segments[0] || !segments[0].startsWith('@')) return null
    const username = segments[0].slice(1)
    if (!username) return null

    // Post: /@{username}/post/{id}
    if (segments.length === 3 && segments[1] === 'post' && segments[2]) {
      return {
        type: 'post',
        entities: { username, post_id: segments[2] },
        url: `https://threads.net/@${username}/post/${segments[2]}`,
      }
    }

    // Profile: /@{username}
    if (segments.length === 1) {
      return {
        type: 'profile',
        entities: { username },
        url: `https://threads.net/@${username}`,
      }
    }

    return null
  },
}
