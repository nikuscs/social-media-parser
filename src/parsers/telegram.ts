import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

export const telegram: SocialLinksPlatformParser = {
  platform: 'telegram',

  domains(hostname) {
    return hostname === 't.me' || hostname === 'telegram.me'
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // Invite: /+{invite_code}
    if (segments.length === 1 && segments[0].startsWith('+') && segments[0].length > 1) {
      const inviteCode = segments[0].slice(1)
      return {
        type: 'group',
        entities: { invite_code: inviteCode },
        url: `https://t.me/+${inviteCode}`,
      }
    }

    // Invite: /joinchat/{invite_code}
    if (segments.length === 2 && segments[0] === 'joinchat' && segments[1]) {
      return {
        type: 'group',
        entities: { invite_code: segments[1] },
        url: `https://t.me/joinchat/${segments[1]}`,
      }
    }

    // Channel preview post: /s/{channel}/{post_id}
    if (segments.length === 3 && segments[0] === 's' && /^\d+$/.test(segments[2])) {
      return {
        type: 'post',
        entities: { channel: segments[1], post_id: segments[2] },
        url: `https://t.me/${segments[1]}/${segments[2]}`,
      }
    }

    // Channel post: /{channel}/{post_id}
    if (segments.length === 2 && /^\d+$/.test(segments[1])) {
      return {
        type: 'post',
        entities: { channel: segments[0], post_id: segments[1] },
        url: `https://t.me/${segments[0]}/${segments[1]}`,
      }
    }

    // Channel/profile: /{channel}
    if (segments.length === 1 && segments[0] && segments[0] !== 's' && segments[0] !== 'joinchat') {
      return {
        type: 'profile',
        entities: { username: segments[0] },
        url: `https://t.me/${segments[0]}`,
      }
    }

    return null
  },
}
