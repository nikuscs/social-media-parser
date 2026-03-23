import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const linkedin: SocialLinksPlatformParser = {
  platform: 'linkedin',

  domains(hostname) {
    return hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com') || hostname === 'lnkd.in'
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // lnkd.in/{code} → short redirect link
    if (url.hostname === 'lnkd.in') {
      if (segments.length > 0) {
        return {
          type: 'short',
          entities: {},
          url: url.toString(),
        }
      }
      return null
    }

    // Profile: /in/{username}
    if (segments.length >= 2 && segments[0] === 'in' && segments[1]) {
      return {
        type: 'profile',
        entities: { username: segments[1] },
        url: `https://linkedin.com/in/${segments[1]}`,
      }
    }

    // Company: /company/{company}
    if (segments.length >= 2 && segments[0] === 'company' && segments[1]) {
      return {
        type: 'profile',
        entities: { company: segments[1] },
        url: `https://linkedin.com/company/${segments[1]}`,
      }
    }

    // Post: /posts/{id}
    if (segments.length >= 2 && segments[0] === 'posts' && segments[1]) {
      return {
        type: 'post',
        entities: { post_id: segments[1] },
        url: `https://linkedin.com/posts/${segments[1]}`,
      }
    }

    // Post: /feed/update/{urn} or /feed/update?updateEntityUrn={urn}
    if (segments.length >= 2 && segments[0] === 'feed' && segments[1] === 'update') {
      const urn = segments[2] ?? url.searchParams.get('updateEntityUrn')
      if (!urn) return null
      return {
        type: 'post',
        entities: { post_id: urn },
        url: `https://linkedin.com/feed/update/${urn}`,
      }
    }

    return null
  },
}
