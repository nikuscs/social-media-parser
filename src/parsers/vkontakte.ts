import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'feed',
  'im',
  'albums',
  'videos',
  'music',
  'groups',
  'apps',
  'settings',
  'about',
  'search',
])

export const vkontakte: SocialLinksPlatformParser = {
  platform: 'vkontakte',

  domains(hostname) {
    return hostname === 'vk.com' || hostname.endsWith('.vk.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    // /wall{owner}_{post}
    if (segments.length === 1) {
      const wallMatch = segments[0].match(/^wall(-?\d+)_(\d+)$/i)
      if (wallMatch) {
        return {
          type: 'post',
          entities: { owner_id: wallMatch[1], post_id: wallMatch[2] },
          url: `https://vk.com/wall${wallMatch[1]}_${wallMatch[2]}`,
        }
      }
    }

    // /{screen_name}
    if (segments.length === 1 && !RESERVED.has(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://vk.com/${segments[0]}`,
      }
    }

    return null
  },
}
