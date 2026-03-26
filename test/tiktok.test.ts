import { describe, expect, it } from 'vitest'
import { tiktok } from '../src/parsers/tiktok'

function parse(urlStr: string) {
  return tiktok.parse(new URL(urlStr))
}

describe('tiktok', () => {
  describe('domains', () => {
    it('matches tiktok.com', () => expect(tiktok.domains('tiktok.com')).toBe(true))
    it('matches www.tiktok.com', () => expect(tiktok.domains('www.tiktok.com')).toBe(true))
    it('matches vm.tiktok.com', () => expect(tiktok.domains('vm.tiktok.com')).toBe(true))
    it('matches vt.tiktok.com', () => expect(tiktok.domains('vt.tiktok.com')).toBe(true))
    it('rejects unrelated domains', () => expect(tiktok.domains('nottiktok.com')).toBe(false))
  })

  describe('video', () => {
    it('parses /@{user}/video/{id}', () => {
      expect(parse('https://tiktok.com/@username/video/123456789012345678')).toEqual({
        type: 'video',
        entities: { username: 'username', video_id: '123456789012345678' },
        url: 'https://tiktok.com/@username/video/123456789012345678',
      })
    })

    it('accepts 20-digit video IDs', () => {
      const result = parse('https://tiktok.com/@user/video/12345678901234567890')
      expect(result).not.toBeNull()
      expect(result!.entities.video_id).toBe('12345678901234567890')
    })

    it('rejects video IDs shorter than 18 digits', () => {
      expect(parse('https://tiktok.com/@user/video/12345678901234567')).toBeNull()
    })

    it('rejects video IDs longer than 20 digits', () => {
      expect(parse('https://tiktok.com/@user/video/123456789012345678901')).toBeNull()
    })

    it('rejects non-numeric video IDs', () => {
      expect(parse('https://tiktok.com/@user/video/abc456789012345678')).toBeNull()
    })

    it('parses /video/{id}', () => {
      expect(parse('https://www.tiktok.com/video/123456789012345678')).toEqual({
        type: 'video',
        entities: { video_id: '123456789012345678' },
        url: 'https://tiktok.com/video/123456789012345678',
      })
    })

    it('parses vm.tiktok.com links with share_item_id', () => {
      expect(parse('https://vm.tiktok.com/ZSabc/?share_item_id=123456789012345678')).toEqual({
        type: 'video',
        entities: { video_id: '123456789012345678' },
        url: 'https://tiktok.com/video/123456789012345678',
      })
    })

    it('parses vt.tiktok.com links with item_id', () => {
      expect(parse('https://vt.tiktok.com/ZSabc/?item_id=12345678901234567890')).toEqual({
        type: 'video',
        entities: { video_id: '12345678901234567890' },
        url: 'https://tiktok.com/video/12345678901234567890',
      })
    })

    it('parses vm.tiktok.com links without item ids as short links', () => {
      expect(parse('https://vm.tiktok.com/ZSabc/')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://vm.tiktok.com/ZSabc/',
      })
    })

    it('parses vm.tiktok.com links with invalid item ids as short links', () => {
      expect(parse('https://vm.tiktok.com/ZSabc/?share_item_id=not-numeric')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://vm.tiktok.com/ZSabc/?share_item_id=not-numeric',
      })
    })
  })

  describe('short links', () => {
    it('parses tiktok.com/t/{code} short links', () => {
      expect(parse('https://tiktok.com/t/ZS2abc123')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://tiktok.com/t/ZS2abc123',
      })
    })

    it('parses www.tiktok.com/t/{code} short links', () => {
      expect(parse('https://www.tiktok.com/t/ZS2abc123')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://tiktok.com/t/ZS2abc123',
      })
    })

    it('parses bare vt.tiktok.com short links', () => {
      expect(parse('https://vt.tiktok.com/ZSabc/')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://vt.tiktok.com/ZSabc/',
      })
    })

    it('returns null for vm.tiktok.com root with no path', () => {
      expect(parse('https://vm.tiktok.com/')).toBeNull()
    })
  })

  describe('profile', () => {
    it('parses /@{username}', () => {
      expect(parse('https://tiktok.com/@johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://tiktok.com/@johndoe',
      })
    })

    it('allows dots in username', () => {
      const result = parse('https://tiktok.com/@john.doe')
      expect(result).not.toBeNull()
      expect(result!.entities.username).toBe('john.doe')
    })

    it('rejects username starting with dot', () => {
      expect(parse('https://tiktok.com/@.johndoe')).toBeNull()
    })

    it('rejects username ending with dot', () => {
      expect(parse('https://tiktok.com/@johndoe.')).toBeNull()
    })

    it('rejects reserved paths (without @)', () => {
      // Reserved paths don't start with @ so they won't match anyway
      expect(parse('https://tiktok.com/explore')).toBeNull()
    })

    it('rejects paths without @', () => {
      expect(parse('https://tiktok.com/username')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://tiktok.com/')).toBeNull()
    })

    it('returns null for multi-segment non-video paths', () => {
      expect(parse('https://tiktok.com/@user/likes')).toBeNull()
    })
  })
})
