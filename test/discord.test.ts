import { describe, expect, it } from 'vitest'
import { discord } from '../src/parsers/discord'

function parse(urlStr: string) {
  return discord.parse(new URL(urlStr))
}

describe('discord', () => {
  describe('domains', () => {
    it('matches discord.gg', () => expect(discord.domains('discord.gg')).toBe(true))
    it('matches discord.com', () => expect(discord.domains('discord.com')).toBe(true))
    it('matches subdomains of discord.com', () => expect(discord.domains('ptb.discord.com')).toBe(true))
    it('matches discordapp.com', () => expect(discord.domains('discordapp.com')).toBe(true))
    it('matches subdomains of discordapp.com', () => expect(discord.domains('ptb.discordapp.com')).toBe(true))
    it('matches dis.gd', () => expect(discord.domains('dis.gd')).toBe(true))
    it('rejects unrelated domains', () => expect(discord.domains('notdiscord.com')).toBe(false))
  })

  describe('invite', () => {
    it('parses discord.gg invite', () => {
      expect(parse('https://discord.gg/openai')).toEqual({
        type: 'group',
        entities: { invite_code: 'openai' },
        url: 'https://discord.gg/openai',
      })
    })

    it('parses discord.com/invite invite', () => {
      expect(parse('https://discord.com/invite/openai')).toEqual({
        type: 'group',
        entities: { invite_code: 'openai' },
        url: 'https://discord.gg/openai',
      })
    })

    it('parses discordapp.com/invite invite (legacy domain)', () => {
      expect(parse('https://discordapp.com/invite/openai')).toEqual({
        type: 'group',
        entities: { invite_code: 'openai' },
        url: 'https://discord.gg/openai',
      })
    })
  })

  describe('channels', () => {
    it('parses channel URL', () => {
      expect(parse('https://discord.com/channels/123456789012345678/223456789012345678')).toEqual({
        type: 'channel',
        entities: {
          guild_id: '123456789012345678',
          channel_id: '223456789012345678',
        },
        url: 'https://discord.com/channels/123456789012345678/223456789012345678',
      })
    })

    it('parses message URL', () => {
      expect(parse('https://discord.com/channels/123456789012345678/223456789012345678/323456789012345678')).toEqual({
        type: 'post',
        entities: {
          guild_id: '123456789012345678',
          channel_id: '223456789012345678',
          message_id: '323456789012345678',
        },
        url: 'https://discord.com/channels/123456789012345678/223456789012345678/323456789012345678',
      })
    })
  })

  describe('short links', () => {
    it('parses dis.gd/{code} as short link', () => {
      expect(parse('https://dis.gd/abc123')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://dis.gd/abc123',
      })
    })

    it('returns null for dis.gd root with no path', () => {
      expect(parse('https://dis.gd/')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('rejects invalid invite codes', () => {
      expect(parse('https://discord.gg/a')).toBeNull()
    })

    it('rejects invalid channel IDs', () => {
      expect(parse('https://discord.com/channels/123/223456789012345678')).toBeNull()
      expect(parse('https://discord.com/channels/123456789012345678/223')).toBeNull()
    })

    it('rejects invalid message IDs', () => {
      expect(parse('https://discord.com/channels/123456789012345678/223456789012345678/notanid')).toBeNull()
    })

    it('returns null for unrecognized paths', () => {
      expect(parse('https://discord.com/channels')).toBeNull()
      expect(parse('https://discord.com/store')).toBeNull()
    })
  })
})
