import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const POST_ID_RE = /^[a-zA-Z0-9_-]{6,}$/

export const line: SocialLinksPlatformParser = {
  platform: 'line',

  domains(hostname) {
    return (
      hostname === 'line.me' ||
      hostname.endsWith('.line.me') ||
      hostname === 'lin.ee'
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // lin.ee/{short_code}
    if (url.hostname === 'lin.ee' && segments.length === 1 && segments[0]) {
      return {
        type: 'group',
        entities: { short_code: segments[0] },
        url: `https://lin.ee/${segments[0]}`,
      }
    }

    // /ti/p/{id}
    if (segments.length === 3 && segments[0] === 'ti' && segments[1] === 'p' && segments[2]) {
      return {
        type: 'profile',
        entities: { line_id: segments[2] },
        url: `https://line.me/ti/p/${segments[2]}`,
      }
    }

    // /R/home/public/post?id={post_id}
    if (segments.length === 4 && segments[0] === 'R' && segments[1] === 'home' && segments[2] === 'public' && segments[3] === 'post') {
      const id = url.searchParams.get('id')
      if (id && POST_ID_RE.test(id)) {
        return {
          type: 'post',
          entities: { post_id: id },
          url: `https://line.me/R/home/public/post?id=${id}`,
        }
      }
      return null
    }

    return null
  },
}
