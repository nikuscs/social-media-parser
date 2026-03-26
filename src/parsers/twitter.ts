import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'status', 'messages', 'grok', 'community-notes', 'settings', 'explore',
  'notifications', 'search', 'home', 'i', 'hashtag', 'about', 'privacy',
  'terms', 'help', 'ads', 'login', 'signup', 'logout', 'account', 'support',
  'jobs', 'developers', 'analytics', 'media', 'safety', 'security', 'legal',
  'cookies', 'accessibility', 'compose', 'intent', 'share', 'lists', 'topics',
  'communities', 'premium', 'verified', 'tos',
])

const USERNAME_RE = /^[a-zA-Z0-9_]{1,15}$/

export const twitter: SocialLinksPlatformParser = {
  platform: 'twitter',

  domains(hostname) {
    return (
      hostname === 'twitter.com' ||
      hostname === 'x.com' ||
      hostname.endsWith('.twitter.com') ||
      hostname.endsWith('.x.com') ||
      hostname === 't.co'
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // t.co/{code} → short redirect link (wraps any URL shared on X)
    if (url.hostname === 't.co') {
      if (segments.length > 0) {
        return {
          type: 'short',
          entities: {},
          url: url.toString(),
        }
      }
      return null
    }

    // Post: /i/status/{id}
    if (segments.length >= 3 && segments[0] === 'i' && segments[1] === 'status' && /^\d+$/.test(segments[2])) {
      return {
        type: 'post',
        entities: { post_id: segments[2] },
        url: `https://x.com/i/status/${segments[2]}`,
      }
    }

    // Post: /{user}/status/{id} or /i/web/status/{id}
    if (segments.length >= 3) {
      if (segments[1] === 'status' && /^\d+$/.test(segments[2])) {
        return {
          type: 'post',
          entities: { username: segments[0], post_id: segments[2] },
          url: `https://x.com/i/status/${segments[2]}`,
        }
      }
      if (segments[0] === 'i' && segments[1] === 'web' && segments[2] === 'status' && segments[3] && /^\d+$/.test(segments[3])) {
        return {
          type: 'post',
          entities: { post_id: segments[3] },
          url: `https://x.com/i/status/${segments[3]}`,
        }
      }
    }

    // Profile: /{username}
    if (segments.length === 1) {
      const username = segments[0]
      if (!RESERVED.has(username.toLowerCase()) && USERNAME_RE.test(username)) {
        return {
          type: 'profile',
          entities: { username },
          url: `https://x.com/${username}`,
        }
      }
    }

    return null
  },
}
