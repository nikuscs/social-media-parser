import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/
const decodeSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export const youtube: SocialLinksPlatformParser = {
  platform: 'youtube',

  domains(hostname) {
    return (
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtu.be' ||
      hostname === 'youtube-nocookie.com' ||
      hostname.endsWith('.youtube-nocookie.com')
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean).map(decodeSegment)

    // youtu.be/{id} → video
    if (
      (url.hostname === 'youtu.be') &&
      segments.length === 1 &&
      VIDEO_ID_RE.test(segments[0])
    ) {
      return {
        type: 'video',
        entities: { video_id: segments[0] },
        url: `https://youtube.com/watch?v=${segments[0]}`,
      }
    }

    // /watch?v={id}
    if (segments.length === 1 && segments[0] === 'watch') {
      const v = url.searchParams.get('v')
      if (v && VIDEO_ID_RE.test(v)) {
        return {
          type: 'video',
          entities: { video_id: v },
          url: `https://youtube.com/watch?v=${v}`,
        }
      }
    }

    // /embed/{id}
    if (segments.length === 2 && segments[0] === 'embed' && VIDEO_ID_RE.test(segments[1])) {
      return {
        type: 'video',
        entities: { video_id: segments[1] },
        url: `https://youtube.com/watch?v=${segments[1]}`,
      }
    }

    // /shorts/{id}
    if (segments.length === 2 && segments[0] === 'shorts' && VIDEO_ID_RE.test(segments[1])) {
      return {
        type: 'short',
        entities: { video_id: segments[1] },
        url: `https://youtube.com/shorts/${segments[1]}`,
      }
    }

    // /playlist?list={id}
    if (segments.length === 1 && segments[0] === 'playlist') {
      const list = url.searchParams.get('list')
      if (list) {
        return {
          type: 'playlist',
          entities: { playlist_id: list },
          url: `https://youtube.com/playlist?list=${list}`,
        }
      }
    }

    // Channel: /@{handle}
    if (segments.length === 1 && segments[0].startsWith('@')) {
      const handle = segments[0].slice(1)
      if (handle.length > 0) {
        return {
          type: 'channel',
          entities: { username: handle },
          url: `https://youtube.com/@${handle}`,
        }
      }
    }

    // Channel: /channel/{id}
    if (segments.length === 2 && segments[0] === 'channel') {
      return {
        type: 'channel',
        entities: { channel_id: segments[1] },
        url: `https://youtube.com/channel/${segments[1]}`,
      }
    }

    // Channel: /c/{name} or /user/{name}
    if (segments.length === 2 && (segments[0] === 'c' || segments[0] === 'user')) {
      return {
        type: 'channel',
        entities: { username: segments[1] },
        url: `https://youtube.com/@${segments[1]}`,
      }
    }

    return null
  },
}
