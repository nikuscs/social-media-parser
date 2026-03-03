import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const lastfm: SocialLinksPlatformParser = {
  platform: 'lastfm',

  domains(hostname) {
    return hostname === 'last.fm' || hostname.endsWith('.last.fm')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    // /user/{name}
    if (segments.length === 2 && segments[0] === 'user' && segments[1]) {
      return {
        type: 'profile',
        entities: { username: segments[1] },
        url: `https://last.fm/user/${segments[1]}`,
      }
    }

    // /music/{artist}/_/{track}
    if (segments.length === 4 && segments[0] === 'music' && segments[1] && segments[2] === '_' && segments[3]) {
      return {
        type: 'track',
        entities: { artist: segments[1], track: segments[3] },
        url: `https://last.fm/music/${segments[1]}/_/${segments[3]}`,
      }
    }

    // /music/{artist}/+albums/{album}
    if (segments.length === 4 && segments[0] === 'music' && segments[1] && segments[2] === '+albums' && segments[3]) {
      return {
        type: 'album',
        entities: { artist: segments[1], album: segments[3] },
        url: `https://last.fm/music/${segments[1]}/+albums/${segments[3]}`,
      }
    }

    return null
  },
}
