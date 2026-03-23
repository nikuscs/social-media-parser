import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'discover',
  'charts',
  'stream',
  'you',
  'upload',
  'search',
  'settings',
  'terms-of-use',
  'privacy',
  'pages',
  'jobs',
  'blog',
  'download',
  'mobile',
  'artists',
  'playlists',
  'tracks',
])

export const soundcloud: SocialLinksPlatformParser = {
  platform: 'soundcloud',

  domains(hostname) {
    return (
      hostname === 'soundcloud.com' ||
      hostname.endsWith('.soundcloud.com') ||
      hostname === 'snd.sc'
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null

    // snd.sc/{code} → short redirect link
    if (url.hostname === 'snd.sc') {
      return {
        type: 'short',
        entities: {},
        url: url.toString(),
      }
    }

    const username = segments[0]
    if (RESERVED.has(username.toLowerCase())) return null

    // /{user}/sets/{playlist}
    if (segments.length === 3 && segments[1] === 'sets' && segments[2]) {
      return {
        type: 'playlist',
        entities: { username, playlist: segments[2] },
        url: `https://soundcloud.com/${username}/sets/${segments[2]}`,
      }
    }

    // /{user}/{track}
    if (segments.length === 2 && segments[1]) {
      return {
        type: 'track',
        entities: { username, track: segments[1] },
        url: `https://soundcloud.com/${username}/${segments[1]}`,
      }
    }

    // /{user}
    if (segments.length === 1) {
      return {
        type: 'profile',
        entities: { username },
        url: `https://soundcloud.com/${username}`,
      }
    }

    return null
  },
}
