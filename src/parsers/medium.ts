import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'about',
  'topics',
  'tag',
  'search',
  'me',
  'membership',
  'm',
  'policy',
  'help',
])

const HEX_POST_ID_RE = /^[a-f0-9]{10,13}$/i

export const medium: SocialLinksPlatformParser = {
  platform: 'medium',

  domains(hostname) {
    return hostname === 'medium.com' || hostname.endsWith('.medium.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    // /@{user}
    if (segments.length === 1 && segments[0].startsWith('@')) {
      const username = segments[0].slice(1)
      if (!username) return null
      return {
        type: 'profile',
        entities: { username },
        url: `https://medium.com/@${username}`,
      }
    }

    // /@{user}/{slug}-{id}
    if (segments.length >= 2 && segments[0].startsWith('@')) {
      const username = segments[0].slice(1)
      const postSegment = segments[1]
      const dash = postSegment.lastIndexOf('-')
      if (username && dash > 0) {
        const postId = postSegment.slice(dash + 1)
        if (HEX_POST_ID_RE.test(postId)) {
          return {
            type: 'post',
            entities: { username, post_id: postId },
            url: `https://medium.com/@${username}/${postSegment}`,
          }
        }
      }
    }

    // /{publication}
    if (
      segments.length === 1 &&
      !segments[0].startsWith('@') &&
      !RESERVED.has(segments[0].toLowerCase())
    ) {
      return {
        type: 'profile',
        entities: { publication: segments[0] },
        url: `https://medium.com/${segments[0]}`,
      }
    }

    // /{publication}/{slug}-{id}
    if (
      segments.length >= 2 &&
      !segments[0].startsWith('@') &&
      !RESERVED.has(segments[0].toLowerCase())
    ) {
      const postSegment = segments[1]
      const dash = postSegment.lastIndexOf('-')
      if (dash > 0) {
        const postId = postSegment.slice(dash + 1)
        if (HEX_POST_ID_RE.test(postId)) {
          return {
            type: 'post',
            entities: { publication: segments[0], post_id: postId },
            url: `https://medium.com/${segments[0]}/${postSegment}`,
          }
        }
      }
    }

    return null
  },
}
