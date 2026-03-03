import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'categories',
  'following',
  'browse',
  'download',
  'help',
  'settings',
  'search',
])

const ID_RE = /^\d+$/

export const kick: SocialLinksPlatformParser = {
  platform: 'kick',

  domains(hostname) {
    return hostname === 'kick.com' || hostname.endsWith('.kick.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    // /video/{id}
    if (segments.length === 2 && segments[0] === 'video' && ID_RE.test(segments[1])) {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://kick.com/video/${segments[1]}`,
      }
    }

    // /{username}
    if (segments.length === 1 && !RESERVED.has(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://kick.com/${segments[0]}`,
      }
    }

    return null
  },
}
