import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const snapchat: SocialLinksPlatformParser = {
  platform: 'snapchat',

  domains(hostname) {
    return hostname === 'snapchat.com' || hostname.endsWith('.snapchat.com')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Public profile: /add/{username}
    if (segments.length === 2 && segments[0] === 'add' && segments[1]) {
      return {
        type: 'profile',
        entities: { username: segments[1] },
        url: `https://snapchat.com/add/${segments[1]}`,
      }
    }

    // Spotlight: /spotlight/{id}
    if (segments.length === 2 && segments[0] === 'spotlight' && segments[1]) {
      return {
        type: 'short',
        entities: { video_id: segments[1] },
        url: `https://snapchat.com/spotlight/${segments[1]}`,
      }
    }

    return null
  },
}
