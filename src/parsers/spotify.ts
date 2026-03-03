import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const SPOTIFY_ID_RE = /^[a-zA-Z0-9]{22}$/

export const spotify: SocialLinksPlatformParser = {
  platform: 'spotify',

  domains(hostname) {
    return (
      hostname === 'spotify.com' ||
      hostname === 'open.spotify.com' ||
      hostname.endsWith('.spotify.com')
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    if (segments.length === 2 && segments[0] === 'user') {
      return {
        type: 'profile',
        entities: { username: segments[1] },
        url: `https://open.spotify.com/user/${segments[1]}`,
      }
    }

    if (segments.length === 2) {
      const [resource, id] = segments
      if (!SPOTIFY_ID_RE.test(id)) return null

      if (resource === 'track') {
        return {
          type: 'track',
          entities: { track_id: id },
          url: `https://open.spotify.com/track/${id}`,
        }
      }

      if (resource === 'album') {
        return {
          type: 'album',
          entities: { album_id: id },
          url: `https://open.spotify.com/album/${id}`,
        }
      }

      if (resource === 'artist') {
        return {
          type: 'profile',
          entities: { artist_id: id },
          url: `https://open.spotify.com/artist/${id}`,
        }
      }

      if (resource === 'playlist') {
        return {
          type: 'playlist',
          entities: { playlist_id: id },
          url: `https://open.spotify.com/playlist/${id}`,
        }
      }
    }

    return null
  },
}
