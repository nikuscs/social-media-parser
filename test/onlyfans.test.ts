import { describe, expect, it } from 'vitest'
import { onlyfans } from '../src/parsers/onlyfans'

function parse(urlStr: string) {
  return onlyfans.parse(new URL(urlStr))
}

describe('onlyfans', () => {
  describe('domains', () => {
    it('matches onlyfans.com', () => expect(onlyfans.domains('onlyfans.com')).toBe(true))
    it('rejects unrelated domains', () => expect(onlyfans.domains('example.com')).toBe(false))
  })

  describe('profile', () => {
    it('parses /{username}', () => {
      expect(parse('https://onlyfans.com/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://onlyfans.com/johndoe',
      })
    })
  })

  describe('post', () => {
    it('parses /{username}/{post_id}', () => {
      expect(parse('https://onlyfans.com/johndoe/123456')).toEqual({
        type: 'post',
        entities: { username: 'johndoe', post_id: '123456' },
        url: 'https://onlyfans.com/johndoe/123456',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for reserved paths', () => {
      expect(parse('https://onlyfans.com/login')).toBeNull()
    })

    it('returns null for root path', () => {
      expect(parse('https://onlyfans.com/')).toBeNull()
    })

    it('returns null for deep paths', () => {
      expect(parse('https://onlyfans.com/a/b/c')).toBeNull()
    })
  })
})
