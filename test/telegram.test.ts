import { describe, expect, it } from 'vitest'
import { telegram } from '../src/parsers/telegram'

function parse(urlStr: string) {
  return telegram.parse(new URL(urlStr))
}

describe('telegram', () => {
  describe('domains', () => {
    it('matches t.me', () => expect(telegram.domains('t.me')).toBe(true))
    it('matches telegram.me', () => expect(telegram.domains('telegram.me')).toBe(true))
    it('rejects unrelated domains', () => expect(telegram.domains('example.com')).toBe(false))
  })

  describe('group invite', () => {
    it('parses /+{invite_code}', () => {
      expect(parse('https://t.me/+abcdef123')).toEqual({
        type: 'group',
        entities: { invite_code: 'abcdef123' },
        url: 'https://t.me/+abcdef123',
      })
    })

    it('parses /joinchat/{invite_code}', () => {
      expect(parse('https://t.me/joinchat/abcdef123')).toEqual({
        type: 'group',
        entities: { invite_code: 'abcdef123' },
        url: 'https://t.me/joinchat/abcdef123',
      })
    })
  })

  describe('post', () => {
    it('parses /{channel}/{post_id}', () => {
      expect(parse('https://t.me/openai/123')).toEqual({
        type: 'post',
        entities: { channel: 'openai', post_id: '123' },
        url: 'https://t.me/openai/123',
      })
    })

    it('parses /s/{channel}/{post_id}', () => {
      expect(parse('https://t.me/s/openai/123')).toEqual({
        type: 'post',
        entities: { channel: 'openai', post_id: '123' },
        url: 'https://t.me/openai/123',
      })
    })
  })

  describe('profile', () => {
    it('parses /{channel}', () => {
      expect(parse('https://t.me/openai')).toEqual({
        type: 'profile',
        entities: { username: 'openai' },
        url: 'https://t.me/openai',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for invalid /s path', () => {
      expect(parse('https://t.me/s/openai/not-a-number')).toBeNull()
    })

    it('returns null for incomplete joinchat path', () => {
      expect(parse('https://t.me/joinchat')).toBeNull()
    })
  })
})
