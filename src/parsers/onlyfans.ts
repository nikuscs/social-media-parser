import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const RESERVED = new Set([
  'about', 'action', 'api', 'blog', 'contact', 'cookie', 'dmca',
  'faq', 'features', 'help', 'home', 'login', 'logout', 'my',
  'notifications', 'privacy', 'search', 'settings', 'signup',
  'terms', 'tos',
])

export const onlyfans: SocialLinksPlatformParser = {
  platform: 'onlyfans',

  domains(hostname) {
    return hostname === 'onlyfans.com'
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    if (segments.length === 0) return null

    const username = segments[0]
    if (RESERVED.has(username.toLowerCase())) return null

    // Post: /{username}/{post_id}
    if (segments.length === 2 && segments[1]) {
      return {
        type: 'post',
        entities: { username, post_id: segments[1] },
        url: `https://onlyfans.com/${username}/${segments[1]}`,
      }
    }

    // Profile: /{username}
    if (segments.length === 1) {
      return {
        type: 'profile',
        entities: { username },
        url: `https://onlyfans.com/${username}`,
      }
    }

    return null
  },
}
