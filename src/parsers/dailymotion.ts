import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const dailymotion: SocialLinksPlatformParser = {
  platform: 'dailymotion',

  domains(hostname) {
    return (
      hostname === 'dailymotion.com' ||
      hostname.endsWith('.dailymotion.com') ||
      hostname === 'dai.ly'
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Short URL: dai.ly/{id}
    if (url.hostname === 'dai.ly' && segments.length === 1 && segments[0]) {
      return {
        type: 'video',
        entities: { video_id: segments[0] },
        url: `https://dailymotion.com/video/${segments[0]}`,
      }
    }

    // Standard URL: /video/{id}
    if (segments.length === 2 && segments[0] === 'video' && segments[1]) {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://dailymotion.com/video/${segments[1]}`,
      }
    }

    // Embed URL: /embed/video/{id}
    if (segments.length === 3 && segments[0] === 'embed' && segments[1] === 'video' && segments[2]) {
      return {
        type: 'video',
        entities: { video_id: segments[2] },
        url: `https://dailymotion.com/video/${segments[2]}`,
      }
    }

    return null
  },
}
