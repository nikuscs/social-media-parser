import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const bluesky: SocialLinksPlatformParser = {
  platform: 'bluesky',

  domains(hostname) {
    return hostname === 'bsky.app' || hostname.endsWith('.bsky.app')
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    if (segments[0] !== 'profile' || !segments[1]) return null
    const handleOrDid = segments[1]

    // Post: /profile/{did_or_handle}/post/{id}
    if (segments.length === 4 && segments[2] === 'post' && segments[3]) {
      return {
        type: 'post',
        entities: { handle_or_did: handleOrDid, post_id: segments[3] },
        url: `https://bsky.app/profile/${handleOrDid}/post/${segments[3]}`,
      }
    }

    // Profile: /profile/{did_or_handle}
    if (segments.length === 2) {
      return {
        type: 'profile',
        entities: { handle_or_did: handleOrDid },
        url: `https://bsky.app/profile/${handleOrDid}`,
      }
    }

    return null
  },
}
