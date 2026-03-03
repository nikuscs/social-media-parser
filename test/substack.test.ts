import { describe, expect, it } from 'vitest'
import { substack } from '../src/parsers/substack'

function parse(urlStr: string) {
  return substack.parse(new URL(urlStr))
}

describe('substack', () => {
  describe('domains', () => {
    it('matches substack.com', () => expect(substack.domains('substack.com')).toBe(true))
    it('matches publication subdomains', () => expect(substack.domains('newsletter.substack.com')).toBe(true))
    it('rejects unrelated domains', () => expect(substack.domains('notsubstack.com')).toBe(false))
  })

  describe('resources', () => {
    it('parses publication homepage', () => {
      expect(parse('https://platformer.newsletter.substack.com/')).toEqual({
        type: 'profile',
        entities: { publication: 'platformer.newsletter' },
        url: 'https://platformer.newsletter.substack.com',
      })
    })

    it('parses publication post', () => {
      expect(parse('https://platformer.substack.com/p/example-post')).toEqual({
        type: 'post',
        entities: { publication: 'platformer', slug: 'example-post' },
        url: 'https://platformer.substack.com/p/example-post',
      })
    })

    it('parses author profile', () => {
      expect(parse('https://substack.com/@hamishmckenzie')).toEqual({
        type: 'profile',
        entities: { username: 'hamishmckenzie' },
        url: 'https://substack.com/@hamishmckenzie',
      })
    })
  })

  describe('null cases', () => {
    it('rejects bare @ on root domain', () => {
      expect(parse('https://substack.com/@')).toBeNull()
    })

    it('returns null for unrecognized substack.com routes', () => {
      expect(parse('https://substack.com/home')).toBeNull()
    })

    it('returns null for unrecognized publication routes', () => {
      expect(parse('https://platformer.substack.com/archive')).toBeNull()
    })
  })
})
