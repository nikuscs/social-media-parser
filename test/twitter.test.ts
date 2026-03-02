import { describe, expect, it } from 'vitest'
import { twitter } from '../src/parsers/twitter'

function parse(urlStr: string) {
  const url = new URL(urlStr)
  return twitter.parse(url)
}

describe('twitter', () => {
  describe('domains', () => {
    it('matches twitter.com', () => expect(twitter.domains('twitter.com')).toBe(true))
    it('matches x.com', () => expect(twitter.domains('x.com')).toBe(true))
    it('matches subdomain of twitter.com', () => expect(twitter.domains('mobile.twitter.com')).toBe(true))
    it('matches subdomain of x.com', () => expect(twitter.domains('mobile.x.com')).toBe(true))
    it('rejects unrelated domains', () => expect(twitter.domains('notwitter.com')).toBe(false))
    it('rejects partial match', () => expect(twitter.domains('fakex.com')).toBe(false))
  })

  describe('post', () => {
    it('parses /i/status/{id} without treating i as username', () => {
      const result = parse('https://x.com/i/status/1234567890')
      expect(result).toEqual({
        type: 'post',
        entities: { post_id: '1234567890' },
        url: 'https://x.com/i/status/1234567890',
      })
    })

    it('parses /{user}/status/{id}', () => {
      const result = parse('https://twitter.com/elonmusk/status/1234567890')
      expect(result).toEqual({
        type: 'post',
        entities: { post_id: '1234567890', username: 'elonmusk' },
        url: 'https://x.com/i/status/1234567890',
      })
    })

    it('parses /i/web/status/{id}', () => {
      const result = parse('https://x.com/i/web/status/1234567890')
      expect(result).toEqual({
        type: 'post',
        entities: { post_id: '1234567890' },
        url: 'https://x.com/i/status/1234567890',
      })
    })

    it('parses posts with extra path segments', () => {
      const result = parse('https://twitter.com/user/status/123456/photo/1')
      expect(result).toEqual({
        type: 'post',
        entities: { post_id: '123456', username: 'user' },
        url: 'https://x.com/i/status/123456',
      })
    })

    it('rejects non-numeric post IDs', () => {
      expect(parse('https://twitter.com/user/status/abc')).toBeNull()
    })
  })

  describe('profile', () => {
    it('parses /{username}', () => {
      const result = parse('https://x.com/elonmusk')
      expect(result).toEqual({
        type: 'profile',
        entities: { username: 'elonmusk' },
        url: 'https://x.com/elonmusk',
      })
    })

    it('allows underscores in username', () => {
      const result = parse('https://x.com/elon_musk')
      expect(result).not.toBeNull()
      expect(result!.entities.username).toBe('elon_musk')
    })

    it('rejects usernames longer than 15 chars', () => {
      expect(parse('https://x.com/abcdefghijklmnop')).toBeNull()
    })

    it('rejects reserved paths', () => {
      expect(parse('https://x.com/home')).toBeNull()
      expect(parse('https://x.com/explore')).toBeNull()
      expect(parse('https://x.com/settings')).toBeNull()
      expect(parse('https://x.com/search')).toBeNull()
      expect(parse('https://x.com/login')).toBeNull()
      expect(parse('https://x.com/messages')).toBeNull()
    })

    it('rejects usernames with invalid chars', () => {
      expect(parse('https://x.com/user-name')).toBeNull()
      expect(parse('https://x.com/user.name')).toBeNull()
    })

    it('rejects multi-segment paths as profiles', () => {
      expect(parse('https://x.com/user/following')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://x.com/')).toBeNull()
    })

    it('returns null for empty username', () => {
      expect(parse('https://x.com')).toBeNull()
    })
  })
})
