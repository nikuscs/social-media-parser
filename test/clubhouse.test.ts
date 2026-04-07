import { describe, expect, it } from 'vitest'
import { clubhouse } from '../src/parsers/clubhouse'

function parse(urlStr: string) {
  return clubhouse.parse(new URL(urlStr))
}

describe('clubhouse', () => {
  describe('domains', () => {
    it('matches clubhouse.com', () => expect(clubhouse.domains('clubhouse.com')).toBe(true))
    it('matches joinclubhouse.com', () => expect(clubhouse.domains('joinclubhouse.com')).toBe(true))
    it('rejects unrelated domains', () => expect(clubhouse.domains('example.com')).toBe(false))
  })

  describe('profile', () => {
    it('parses /@{username}', () => {
      expect(parse('https://clubhouse.com/@johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://clubhouse.com/@johndoe',
      })
    })

    it('parses joinclubhouse.com/@{username}', () => {
      expect(parse('https://joinclubhouse.com/@johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://clubhouse.com/@johndoe',
      })
    })
  })

  describe('club', () => {
    it('parses /club/{clubname}', () => {
      expect(parse('https://clubhouse.com/club/tech-talks')).toEqual({
        type: 'profile',
        entities: { club: 'tech-talks' },
        url: 'https://clubhouse.com/club/tech-talks',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for reserved paths', () => {
      expect(parse('https://clubhouse.com/@about')).toBeNull()
    })

    it('returns null for root path', () => {
      expect(parse('https://clubhouse.com/')).toBeNull()
    })

    it('returns null for unsupported paths', () => {
      expect(parse('https://clubhouse.com/room/abc123')).toBeNull()
    })
  })
})
