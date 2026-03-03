import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const MASTODON_HOSTS = new Set([
  'mastodon.social',
  'mstdn.social',
  'fosstodon.org',
  'hachyderm.io',
  'infosec.exchange',
  'techhub.social',
  'mas.to',
  'pawoo.net',
  'journa.host',
  'universeodon.com',
])

const STATUS_ID_RE = /^\d+$/

export const mastodon: SocialLinksPlatformParser = {
  platform: 'mastodon',

  domains(hostname) {
    return MASTODON_HOSTS.has(hostname)
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // /@{handle} or /@{handle}/{status_id}
    if (segments.length >= 1 && segments[0].startsWith('@')) {
      const handle = segments[0].slice(1)
      if (!handle) return null

      if (segments.length === 1) {
        return {
          type: 'profile',
          entities: { username: handle },
          url: `https://${url.hostname}/@${handle}`,
        }
      }

      if (segments.length === 2 && STATUS_ID_RE.test(segments[1])) {
        return {
          type: 'post',
          entities: { username: handle, post_id: segments[1] },
          url: `https://${url.hostname}/@${handle}/${segments[1]}`,
        }
      }
    }

    // /users/{name} or /users/{name}/statuses/{status_id}
    if (segments.length >= 2 && segments[0] === 'users' && segments[1]) {
      const username = segments[1]

      if (segments.length === 2) {
        return {
          type: 'profile',
          entities: { username },
          url: `https://${url.hostname}/@${username}`,
        }
      }

      if (
        segments.length === 4 &&
        segments[2] === 'statuses' &&
        STATUS_ID_RE.test(segments[3])
      ) {
        return {
          type: 'post',
          entities: { username, post_id: segments[3] },
          url: `https://${url.hostname}/@${username}/${segments[3]}`,
        }
      }
    }

    return null
  },
}
