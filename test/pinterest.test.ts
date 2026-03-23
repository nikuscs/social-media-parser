import { describe, expect, it } from 'vitest'
import { pinterest } from '../src/parsers/pinterest'

function parse(urlStr: string) {
  return pinterest.parse(new URL(urlStr))
}

describe('pinterest', () => {
  describe('domains', () => {
    it('matches pinterest.com', () => expect(pinterest.domains('pinterest.com')).toBe(true))
    it('matches www.pinterest.com', () => expect(pinterest.domains('www.pinterest.com')).toBe(true))
    it('matches pin.it', () => expect(pinterest.domains('pin.it')).toBe(true))
    it('rejects unrelated domains', () => expect(pinterest.domains('example.com')).toBe(false))
  })

  describe('pin', () => {
    it('parses /pin/{id}', () => {
      expect(parse('https://pinterest.com/pin/123456789')).toEqual({
        type: 'photo',
        entities: { pin_id: '123456789' },
        url: 'https://pinterest.com/pin/123456789',
      })
    })

    it('rejects non-numeric pin ids', () => {
      expect(parse('https://pinterest.com/pin/abc')).toBeNull()
    })
  })

  describe('board', () => {
    it('parses /{username}/{board}', () => {
      expect(parse('https://pinterest.com/johndoe/home-decor')).toEqual({
        type: 'board',
        entities: { username: 'johndoe', board: 'home-decor' },
        url: 'https://pinterest.com/johndoe/home-decor',
      })
    })
  })

  describe('profile', () => {
    it('parses /{username}', () => {
      expect(parse('https://pinterest.com/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://pinterest.com/johndoe',
      })
    })

    it('rejects reserved paths', () => {
      expect(parse('https://pinterest.com/search')).toBeNull()
    })
  })

  describe('short links', () => {
    it('parses pin.it/{code} as short link', () => {
      expect(parse('https://pin.it/abc123xyz')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://pin.it/abc123xyz',
      })
    })

    it('returns null for pin.it root with no path', () => {
      expect(parse('https://pin.it/')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for unknown paths', () => {
      expect(parse('https://pinterest.com/johndoe/home-decor/extra')).toBeNull()
    })
  })
})
