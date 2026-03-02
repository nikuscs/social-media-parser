import { describe, expect, it } from 'vitest'
import { threads } from '../src/parsers/threads'

function parse(urlStr: string) {
  return threads.parse(new URL(urlStr))
}

describe('threads', () => {
  describe('domains', () => {
    it('matches threads.net', () => expect(threads.domains('threads.net')).toBe(true))
    it('matches www.threads.net', () => expect(threads.domains('www.threads.net')).toBe(true))
    it('rejects unrelated domains', () => expect(threads.domains('example.com')).toBe(false))
  })

  describe('post', () => {
    it('parses /@{username}/post/{id}', () => {
      expect(parse('https://threads.net/@johndoe/post/abc123')).toEqual({
        type: 'post',
        entities: { username: 'johndoe', post_id: 'abc123' },
        url: 'https://threads.net/@johndoe/post/abc123',
      })
    })
  })

  describe('profile', () => {
    it('parses /@{username}', () => {
      expect(parse('https://threads.net/@johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://threads.net/@johndoe',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for empty @ handle', () => {
      expect(parse('https://threads.net/@')).toBeNull()
    })

    it('returns null for unsupported paths', () => {
      expect(parse('https://threads.net/trending')).toBeNull()
      expect(parse('https://threads.net/@johndoe/replies')).toBeNull()
    })
  })
})
