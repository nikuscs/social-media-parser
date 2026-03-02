import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'upload', 'messages', 'inbox', 'foryou', 'following', 'friends', 'explore',
  'live', 'search', 'tag', 'music', 'effect', 'template', 'settings', 'download',
  'about', 'careers', 'newsroom', 'contact', 'help', 'safety', 'terms', 'privacy',
  'creator', 'business', 'developer', 'legal', 'support', 'security', 'api',
  'brand', 'advertise', 'embed', 'share', 'comment', 'video',
  'en', 'es', 'fr', 'de', 'ja', 'ko', 'ru', 'pt', 'ar', 'id',
])

const VIDEO_ID_RE = /^\d{18,20}$/
const USERNAME_RE = /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]*[a-zA-Z0-9_])?$/

export const tiktok: SocialLinksPlatformParser = {
  platform: 'tiktok',

  domains(hostname) {
    return hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    const hostname = url.hostname

    // Short redirect variants often carry video IDs in query params.
    if (hostname === 'vm.tiktok.com' || hostname === 'vt.tiktok.com') {
      const shortVideoId = url.searchParams.get('share_item_id') ?? url.searchParams.get('item_id')
      if (shortVideoId && VIDEO_ID_RE.test(shortVideoId)) {
        return {
          type: 'video',
          entities: { video_id: shortVideoId },
          url: `https://tiktok.com/video/${shortVideoId}`,
        }
      }
    }

    // Video: /@{user}/video/{id}
    if (
      segments.length === 3 &&
      segments[0].startsWith('@') &&
      segments[1] === 'video' &&
      VIDEO_ID_RE.test(segments[2])
    ) {
      const username = segments[0].slice(1)
      return {
        type: 'video',
        entities: { video_id: segments[2], username },
        url: `https://tiktok.com/@${username}/video/${segments[2]}`,
      }
    }

    // Video: /video/{id}
    if (segments.length === 2 && segments[0] === 'video' && VIDEO_ID_RE.test(segments[1])) {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://tiktok.com/video/${segments[1]}`,
      }
    }

    // Profile: /@{username}
    if (segments.length === 1 && segments[0].startsWith('@')) {
      const username = segments[0].slice(1)
      if (!RESERVED.has(username.toLowerCase()) && USERNAME_RE.test(username)) {
        return {
          type: 'profile',
          entities: { username },
          url: `https://tiktok.com/@${username}`,
        }
      }
    }

    return null
  },
}
