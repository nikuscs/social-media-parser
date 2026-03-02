import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'directory',
  'downloads',
  'jobs',
  'settings',
  'turbo',
  'subscriptions',
  'wallet',
  'inventory',
  'drops',
  'friends',
  'messages',
  'search',
  'p',
  'videos',
])

export const twitch: SocialLinksPlatformParser = {
  platform: 'twitch',

  domains(hostname) {
    return (
      hostname === 'twitch.tv' ||
      hostname.endsWith('.twitch.tv') ||
      hostname === 'clips.twitch.tv'
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Clip: clips.twitch.tv/{slug}
    if (url.hostname === 'clips.twitch.tv' && segments.length === 1 && segments[0]) {
      return {
        type: 'clip',
        entities: { clip_id: segments[0] },
        url: `https://clips.twitch.tv/${segments[0]}`,
      }
    }

    // VOD: /videos/{id}
    if (segments.length === 2 && segments[0] === 'videos' && /^\d+$/.test(segments[1])) {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://twitch.tv/videos/${segments[1]}`,
      }
    }

    // Clip: /{channel}/clip/{slug}
    if (segments.length === 3 && segments[1] === 'clip' && segments[2]) {
      return {
        type: 'clip',
        entities: { username: segments[0], clip_id: segments[2] },
        url: `https://twitch.tv/${segments[0]}/clip/${segments[2]}`,
      }
    }

    // Channel: /{channel}
    if (segments.length === 1 && !RESERVED.has(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://twitch.tv/${segments[0]}`,
      }
    }

    return null
  },
}
