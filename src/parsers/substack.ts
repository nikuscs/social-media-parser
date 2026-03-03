import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const substack: SocialLinksPlatformParser = {
  platform: 'substack',

  domains(hostname) {
    return (
      hostname === 'substack.com' ||
      hostname.endsWith('.substack.com')
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    const hostname = url.hostname

    // {publication}.substack.com
    if (hostname.endsWith('.substack.com') && hostname !== 'substack.com') {
      const publication = hostname.slice(0, -'.substack.com'.length)

      // Home page of publication
      if (segments.length === 0) {
        return {
          type: 'profile',
          entities: { publication },
          url: `https://${publication}.substack.com`,
        }
      }

      // /p/{slug}
      if (segments.length === 2 && segments[0] === 'p' && segments[1]) {
        return {
          type: 'post',
          entities: { publication, slug: segments[1] },
          url: `https://${publication}.substack.com/p/${segments[1]}`,
        }
      }
    }

    // substack.com/@{author}
    if (hostname === 'substack.com' && segments.length === 1 && segments[0].startsWith('@')) {
      const username = segments[0].slice(1)
      if (!username) return null
      return {
        type: 'profile',
        entities: { username },
        url: `https://substack.com/@${username}`,
      }
    }

    return null
  },
}
