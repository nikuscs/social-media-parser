import { describe, expect, it } from 'vitest'
import { instagram } from '../src/parsers/instagram'

function parse(urlStr: string) {
  return instagram.parse(new URL(urlStr))
}

describe('instagram', () => {
  describe('domains', () => {
    it('matches instagram.com', () => expect(instagram.domains('instagram.com')).toBe(true))
    it('matches www.instagram.com', () => expect(instagram.domains('www.instagram.com')).toBe(true))
    it('matches instagr.am', () => expect(instagram.domains('instagr.am')).toBe(true))
    it('matches ig.me', () => expect(instagram.domains('ig.me')).toBe(true))
    it('rejects unrelated domains', () => expect(instagram.domains('notinstagram.com')).toBe(false))
  })

  describe('post', () => {
    it('parses /p/{shortcode}', () => {
      expect(parse('https://instagram.com/p/ABC123')).toEqual({
        type: 'post',
        entities: { post_id: 'ABC123' },
        url: 'https://instagram.com/p/ABC123',
      })
    })

    it('parses /reel/{shortcode}', () => {
      expect(parse('https://instagram.com/reel/ABC123')).toEqual({
        type: 'post',
        entities: { post_id: 'ABC123' },
        url: 'https://instagram.com/p/ABC123',
      })
    })

    it('parses /reels/{shortcode}', () => {
      expect(parse('https://instagram.com/reels/ABC123')).toEqual({
        type: 'post',
        entities: { post_id: 'ABC123' },
        url: 'https://instagram.com/p/ABC123',
      })
    })

    it('parses /tv/{shortcode}', () => {
      expect(parse('https://instagram.com/tv/ABC123')).toEqual({
        type: 'post',
        entities: { post_id: 'ABC123' },
        url: 'https://instagram.com/p/ABC123',
      })
    })

    it('parses /{user}/p/{shortcode}', () => {
      expect(parse('https://instagram.com/johndoe/p/ABC123')).toEqual({
        type: 'post',
        entities: { username: 'johndoe', post_id: 'ABC123' },
        url: 'https://instagram.com/p/ABC123',
      })
    })

    it('parses /{user}/reel/{shortcode}', () => {
      const result = parse('https://instagram.com/johndoe/reel/XYZ789')
      expect(result!.type).toBe('post')
      expect(result!.entities.post_id).toBe('XYZ789')
      expect(result!.entities.username).toBe('johndoe')
    })
  })

  describe('story', () => {
    it('parses /stories/{username}/{id}', () => {
      expect(parse('https://instagram.com/stories/johndoe/1234567890')).toEqual({
        type: 'story',
        entities: { username: 'johndoe', story_id: '1234567890' },
        url: 'https://instagram.com/stories/johndoe/1234567890',
      })
    })

    it('rejects /stories/highlights/', () => {
      expect(parse('https://instagram.com/stories/highlights/12345')).toBeNull()
    })

    it('rejects non-numeric story IDs', () => {
      expect(parse('https://instagram.com/stories/user/abc')).toBeNull()
    })
  })

  describe('profile', () => {
    it('parses /{username}', () => {
      expect(parse('https://instagram.com/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://instagram.com/johndoe',
      })
    })

    it('allows dots in username', () => {
      const result = parse('https://instagram.com/john.doe')
      expect(result).not.toBeNull()
      expect(result!.entities.username).toBe('john.doe')
    })

    it('rejects username starting with dot', () => {
      expect(parse('https://instagram.com/.johndoe')).toBeNull()
    })

    it('rejects username ending with dot', () => {
      expect(parse('https://instagram.com/johndoe.')).toBeNull()
    })

    it('rejects reserved paths', () => {
      expect(parse('https://instagram.com/explore')).toBeNull()
      expect(parse('https://instagram.com/accounts')).toBeNull()
      expect(parse('https://instagram.com/direct')).toBeNull()
      expect(parse('https://instagram.com/settings')).toBeNull()
    })

    it('rejects multi-segment paths as profiles', () => {
      expect(parse('https://instagram.com/user/followers')).toBeNull()
    })

    it('does not misidentify a post URL as a profile', () => {
      const result = parse('https://instagram.com/nikuscs/p/ABC123')
      expect(result!.type).toBe('post')
      expect(result!.entities.post_id).toBe('ABC123')
      expect(result!.entities.username).toBe('nikuscs')
    })
  })

  describe('short links', () => {
    it('parses instagr.am/{code} as short link', () => {
      expect(parse('https://instagr.am/p/ABC123')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://instagr.am/p/ABC123',
      })
    })

    it('parses instagr.am single-segment path as short link', () => {
      expect(parse('https://instagr.am/abc123')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://instagr.am/abc123',
      })
    })

    it('returns null for instagr.am root with no path', () => {
      expect(parse('https://instagr.am/')).toBeNull()
    })

    it('parses ig.me/{code} as short link', () => {
      expect(parse('https://ig.me/m/johndoe')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://ig.me/m/johndoe',
      })
    })

    it('returns null for ig.me root with no path', () => {
      expect(parse('https://ig.me/')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://instagram.com/')).toBeNull()
    })

    it('returns null for /stories alone', () => {
      expect(parse('https://instagram.com/stories')).toBeNull()
    })

    it('returns null for post URLs with extra trailing segments', () => {
      expect(parse('https://instagram.com/nikuscs/p/ABC123/extra')).toBeNull()
    })
  })
})
