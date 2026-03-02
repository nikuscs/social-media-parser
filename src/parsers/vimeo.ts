import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const vimeo: SocialLinksPlatformParser = {
  platform: 'vimeo',

  domains(hostname) {
    return hostname === 'vimeo.com' || hostname.endsWith('.vimeo.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Vimeo player: /video/{id}
    if (segments.length === 2 && segments[0] === 'video' && /^\d+$/.test(segments[1])) {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://vimeo.com/${segments[1]}`,
      }
    }

    // Channel video: /channels/{channel}/{id}
    if (
      segments.length === 3 &&
      segments[0] === 'channels' &&
      segments[1] &&
      /^\d+$/.test(segments[2])
    ) {
      return {
        type: 'video',
        entities: { channel: segments[1], video_id: segments[2] },
        url: `https://vimeo.com/${segments[2]}`,
      }
    }

    // Vimeo direct: /{id}
    if (segments.length === 1 && /^\d+$/.test(segments[0])) {
      return {
        type: 'video',
        entities: { video_id: segments[0] },
        url: `https://vimeo.com/${segments[0]}`,
      }
    }

    return null
  },
}
