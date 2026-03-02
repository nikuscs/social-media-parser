import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'explore', 'accounts', 'direct', 'stories', 'guides', 'saved', 'p', 'reels',
  'reel', 'tv', 'emailsignup', 'contact', 'legal', 'privacy', 'terms', 'about',
  'developer', 'blog', 'press', 'api', 'help', 'settings', 'admin', 'login',
  'logout', 'search', 'directory', 'download', 'shop', 'business', 'creators',
  'music', 'videos', 'igtv', 'live',
])

const POST_TYPES = new Set(['p', 'reel', 'reels', 'tv'])
const USERNAME_RE = /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]*[a-zA-Z0-9_])?$/

export const instagram: SocialLinksPlatformParser = {
  platform: 'instagram',

  domains(hostname) {
    return hostname === 'instagram.com' || hostname.endsWith('.instagram.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Post: /(p|reel|reels|tv)/{shortcode}
    if (segments.length === 2 && POST_TYPES.has(segments[0])) {
      return {
        type: 'post',
        entities: { post_id: segments[1] },
        url: `https://instagram.com/p/${segments[1]}`,
      }
    }

    // Post with username prefix: /{user}/(p|reel|reels|tv)/{shortcode}
    if (segments.length === 3 && POST_TYPES.has(segments[1])) {
      return {
        type: 'post',
        entities: { post_id: segments[2], username: segments[0] },
        url: `https://instagram.com/p/${segments[2]}`,
      }
    }

    // Story: /stories/{username}/{id} (exclude /stories/highlights/)
    if (segments.length === 3 && segments[0] === 'stories') {
      if (segments[1] === 'highlights') return null
      if (/^\d+$/.test(segments[2])) {
        return {
          type: 'story',
          entities: { username: segments[1], story_id: segments[2] },
          url: `https://instagram.com/stories/${segments[1]}/${segments[2]}`,
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
          url: `https://instagram.com/${username}`,
        }
      }
    }

    return null
  },
}
