import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const VIDEO_ID_RE = /^[a-zA-Z0-9]+$/
const RESERVED = new Set([
  'about',
  'c',
  'embed',
  'help',
  'login',
  'privacy',
  'search',
  'terms',
])

export const rumble: SocialLinksPlatformParser = {
  platform: 'rumble',

  domains(hostname) {
    return hostname === 'rumble.com' || hostname.endsWith('.rumble.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // /v{video_id}-slug
    if (segments.length === 1) {
      if (RESERVED.has(segments[0].toLowerCase())) return null

      const videoMatch = segments[0].match(/^v([a-zA-Z0-9]+)(?:-.*)?$/)
      if (videoMatch) {
        return {
          type: 'video',
          entities: { video_id: videoMatch[1] },
          url: `https://rumble.com/v${videoMatch[1]}`,
        }
      }

      // /c/{channel} is separate, so single path can be channel/profile
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://rumble.com/${segments[0]}`,
      }
    }

    // /c/{channel}
    if (segments.length === 2 && segments[0] === 'c' && segments[1]) {
      return {
        type: 'channel',
        entities: { channel: segments[1] },
        url: `https://rumble.com/c/${segments[1]}`,
      }
    }

    // /embed/{video_id}
    if (segments.length === 2 && segments[0] === 'embed' && VIDEO_ID_RE.test(segments[1])) {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://rumble.com/v${segments[1]}`,
      }
    }

    return null
  },
}
