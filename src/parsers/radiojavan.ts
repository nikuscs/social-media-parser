import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'browse',
  'search',
  'signin',
  'signup',
  'help',
  'about',
  'privacy',
  'terms',
])

export const radiojavan: SocialLinksPlatformParser = {
  platform: 'radiojavan',

  domains(hostname) {
    return (
      hostname === 'radiojavan.com' ||
      hostname.endsWith('.radiojavan.com')
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // /videos/video/{slug}
    if (segments.length === 3 && segments[0] === 'videos' && segments[1] === 'video' && segments[2]) {
      return {
        type: 'video',
        entities: { video_slug: segments[2] },
        url: `https://radiojavan.com/videos/video/${segments[2]}`,
      }
    }

    // /mp3s/mp3/{slug}
    if (segments.length === 3 && segments[0] === 'mp3s' && segments[1] === 'mp3' && segments[2]) {
      return {
        type: 'track',
        entities: { track_slug: segments[2] },
        url: `https://radiojavan.com/mp3s/mp3/${segments[2]}`,
      }
    }

    // /playlists/playlist/{slug}
    if (segments.length === 3 && segments[0] === 'playlists' && segments[1] === 'playlist' && segments[2]) {
      return {
        type: 'playlist',
        entities: { playlist_slug: segments[2] },
        url: `https://radiojavan.com/playlists/playlist/${segments[2]}`,
      }
    }

    // /podcasts/podcast/{slug}
    if (segments.length === 3 && segments[0] === 'podcasts' && segments[1] === 'podcast' && segments[2]) {
      return {
        type: 'post',
        entities: { podcast_slug: segments[2] },
        url: `https://radiojavan.com/podcasts/podcast/${segments[2]}`,
      }
    }

    // /artist/{name}
    if (segments.length === 2 && segments[0] === 'artist' && segments[1]) {
      return {
        type: 'profile',
        entities: { username: segments[1] },
        url: `https://radiojavan.com/artist/${segments[1]}`,
      }
    }

    // /{username}
    if (segments.length === 1 && !RESERVED.has(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://radiojavan.com/${segments[0]}`,
      }
    }

    return null
  },
}
