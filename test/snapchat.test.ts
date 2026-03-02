import { describe, expect, it } from 'vitest'
import { snapchat } from '../src/parsers/snapchat'

function parse(urlStr: string) {
  return snapchat.parse(new URL(urlStr))
}

describe('snapchat', () => {
  describe('domains', () => {
    it('matches snapchat.com', () => expect(snapchat.domains('snapchat.com')).toBe(true))
    it('matches subdomains of snapchat.com', () => expect(snapchat.domains('story.snapchat.com')).toBe(true))
    it('rejects unrelated domains', () => expect(snapchat.domains('example.com')).toBe(false))
  })

  describe('profile', () => {
    it('parses /add/{username}', () => {
      expect(parse('https://snapchat.com/add/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://snapchat.com/add/johndoe',
      })
    })
  })

  describe('spotlight', () => {
    it('parses /spotlight/{id}', () => {
      expect(parse('https://snapchat.com/spotlight/abc123')).toEqual({
        type: 'short',
        entities: { video_id: 'abc123' },
        url: 'https://snapchat.com/spotlight/abc123',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for unsupported paths', () => {
      expect(parse('https://snapchat.com/discover')).toBeNull()
    })
  })
})
