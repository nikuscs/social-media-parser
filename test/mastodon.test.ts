import { describe, expect, it } from 'vitest'
import { mastodon } from '../src/parsers/mastodon'

function parse(urlStr: string) {
  return mastodon.parse(new URL(urlStr))
}

describe('mastodon', () => {
  describe('domains', () => {
    it('matches known mastodon instances', () => {
      expect(mastodon.domains('mastodon.social')).toBe(true)
      expect(mastodon.domains('fosstodon.org')).toBe(true)
      expect(mastodon.domains('hachyderm.io')).toBe(true)
    })

    it('rejects unrelated domains', () => {
      expect(mastodon.domains('example.com')).toBe(false)
      expect(mastodon.domains('social.example')).toBe(false)
    })
  })

  describe('profile', () => {
    it('parses /@{handle}', () => {
      expect(parse('https://mastodon.social/@gargron')).toEqual({
        type: 'profile',
        entities: { username: 'gargron' },
        url: 'https://mastodon.social/@gargron',
      })
    })

    it('parses /users/{name}', () => {
      expect(parse('https://mastodon.social/users/gargron')).toEqual({
        type: 'profile',
        entities: { username: 'gargron' },
        url: 'https://mastodon.social/@gargron',
      })
    })
  })

  describe('post', () => {
    it('parses /@{handle}/{status_id}', () => {
      expect(parse('https://mastodon.social/@gargron/112233445566778899')).toEqual({
        type: 'post',
        entities: { username: 'gargron', post_id: '112233445566778899' },
        url: 'https://mastodon.social/@gargron/112233445566778899',
      })
    })

    it('parses /users/{name}/statuses/{status_id}', () => {
      expect(parse('https://mastodon.social/users/gargron/statuses/112233445566778899')).toEqual({
        type: 'post',
        entities: { username: 'gargron', post_id: '112233445566778899' },
        url: 'https://mastodon.social/@gargron/112233445566778899',
      })
    })
  })

  describe('null cases', () => {
    it('rejects bare @ with no handle', () => {
      expect(parse('https://mastodon.social/@')).toBeNull()
    })

    it('rejects non-numeric status ids', () => {
      expect(parse('https://mastodon.social/@gargron/notanid')).toBeNull()
      expect(parse('https://mastodon.social/users/gargron/statuses/notanid')).toBeNull()
    })

    it('returns null for unrecognized paths', () => {
      expect(parse('https://mastodon.social/about')).toBeNull()
      expect(parse('https://mastodon.social/')).toBeNull()
    })
  })
})
