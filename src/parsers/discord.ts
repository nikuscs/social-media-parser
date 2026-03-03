import type { SocialLinksParseResult, SocialLinksPlatformParser } from '../types'

const INVITE_RE = /^[a-zA-Z0-9-]{2,}$/
const ID_RE = /^\d{17,20}$/

export const discord: SocialLinksPlatformParser = {
  platform: 'discord',

  domains(hostname) {
    return (
      hostname === 'discord.gg' ||
      hostname === 'discord.com' ||
      hostname.endsWith('.discord.com')
    )
  },

  parse(url): SocialLinksParseResult {
    const segments = url.pathname.split('/').filter(Boolean)
    const hostname = url.hostname

    // discord.gg/{invite}
    if (hostname === 'discord.gg' && segments.length === 1 && INVITE_RE.test(segments[0])) {
      return {
        type: 'group',
        entities: { invite_code: segments[0] },
        url: `https://discord.gg/${segments[0]}`,
      }
    }

    // discord.com/invite/{code}
    if (segments.length === 2 && segments[0] === 'invite' && INVITE_RE.test(segments[1])) {
      return {
        type: 'group',
        entities: { invite_code: segments[1] },
        url: `https://discord.gg/${segments[1]}`,
      }
    }

    // discord.com/channels/{guild_id}/{channel_id}[/{message_id}]
    if (segments.length >= 3 && segments[0] === 'channels') {
      const guildId = segments[1]
      const channelId = segments[2]
      if (!ID_RE.test(guildId) || !ID_RE.test(channelId)) return null

      if (segments.length === 3) {
        return {
          type: 'channel',
          entities: { guild_id: guildId, channel_id: channelId },
          url: `https://discord.com/channels/${guildId}/${channelId}`,
        }
      }

      if (segments.length === 4 && ID_RE.test(segments[3])) {
        return {
          type: 'post',
          entities: {
            guild_id: guildId,
            channel_id: channelId,
            message_id: segments[3],
          },
          url: `https://discord.com/channels/${guildId}/${channelId}/${segments[3]}`,
        }
      }
    }

    return null
  },
}
