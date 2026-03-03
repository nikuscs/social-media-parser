import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'login',
  'signup',
  'home',
  'explore',
  'about',
  'pricing',
  'policy',
  'privacy',
  'press',
  'media-kit',
  'product',
  'podcasters',
  'music',
  'video',
  'app',
  'posts',
  'collections',
])

const POST_ID_RE = /^\d+$/

export const patreon: SocialLinksPlatformParser = {
  platform: 'patreon',

  domains(hostname) {
    return hostname === 'patreon.com' || hostname.endsWith('.patreon.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    // /c/{creator}
    if (segments.length === 2 && segments[0] === 'c' && segments[1]) {
      return {
        type: 'profile',
        entities: { username: segments[1] },
        url: `https://patreon.com/c/${segments[1]}`,
      }
    }

    // /c/{creator}/posts/{id_or_slug-id}
    if (segments.length >= 4 && segments[0] === 'c' && segments[2] === 'posts') {
      const creator = segments[1]
      const postSegment = segments[3]

      const lastDash = postSegment.lastIndexOf('-')
      const postId = lastDash >= 0 ? postSegment.slice(lastDash + 1) : postSegment
      if (POST_ID_RE.test(postId)) {
        return {
          type: 'post',
          entities: { username: creator, post_id: postId },
          url: `https://patreon.com/c/${creator}/posts/${postSegment}`,
        }
      }
      return null
    }

    // /posts/{id_or_slug-id}
    if (segments.length >= 2 && segments[0] === 'posts') {
      const postSegment = segments[1]
      const lastDash = postSegment.lastIndexOf('-')
      const postId = lastDash >= 0 ? postSegment.slice(lastDash + 1) : postSegment
      if (POST_ID_RE.test(postId)) {
        return {
          type: 'post',
          entities: { post_id: postId },
          url: `https://patreon.com/posts/${postSegment}`,
        }
      }
      return null
    }

    // /{creator}
    if (segments.length === 1 && !RESERVED.has(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://patreon.com/${segments[0]}`,
      }
    }

    return null
  },
}
