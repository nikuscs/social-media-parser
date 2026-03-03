import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const UIN_RE = /^\d{5,12}$/

export const qq: SocialLinksPlatformParser = {
  platform: 'qq',

  domains(hostname) {
    return (
      hostname === 'qzone.qq.com' ||
      hostname === 'user.qzone.qq.com' ||
      hostname.endsWith('.qzone.qq.com')
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)

    // user.qzone.qq.com/{uin}
    if (segments.length === 1 && UIN_RE.test(segments[0])) {
      return {
        type: 'profile',
        entities: { uin: segments[0] },
        url: `https://user.qzone.qq.com/${segments[0]}`,
      }
    }

    // user.qzone.qq.com/{uin}/mood/{post_id}
    if (segments.length === 3 && UIN_RE.test(segments[0]) && segments[1] === 'mood' && segments[2]) {
      return {
        type: 'post',
        entities: { uin: segments[0], post_id: segments[2] },
        url: `https://user.qzone.qq.com/${segments[0]}/mood/${segments[2]}`,
      }
    }

    return null
  },
}
