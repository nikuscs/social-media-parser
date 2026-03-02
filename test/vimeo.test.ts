import { describe, expect, it } from 'vitest'
import { vimeo } from '../src/parsers/vimeo'

function parse(urlStr: string) {
  return vimeo.parse(new URL(urlStr))
}

describe('vimeo', () => {
  describe('domains', () => {
    it('matches vimeo.com', () => expect(vimeo.domains('vimeo.com')).toBe(true))
    it('matches subdomains of vimeo.com', () => expect(vimeo.domains('player.vimeo.com')).toBe(true))
    it('rejects unrelated domains', () => expect(vimeo.domains('example.com')).toBe(false))
  })

  describe('video', () => {
    it('parses direct /{id}', () => {
      expect(parse('https://vimeo.com/123456789')).toEqual({
        type: 'video',
        entities: { video_id: '123456789' },
        url: 'https://vimeo.com/123456789',
      })
    })

    it('parses /video/{id}', () => {
      expect(parse('https://player.vimeo.com/video/123456789')).toEqual({
        type: 'video',
        entities: { video_id: '123456789' },
        url: 'https://vimeo.com/123456789',
      })
    })

    it('parses /channels/{channel}/{id}', () => {
      expect(parse('https://vimeo.com/channels/staffpicks/123456789')).toEqual({
        type: 'video',
        entities: { channel: 'staffpicks', video_id: '123456789' },
        url: 'https://vimeo.com/123456789',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for unsupported paths', () => {
      expect(parse('https://vimeo.com/channels/staffpicks')).toBeNull()
      expect(parse('https://vimeo.com/not-a-video-id')).toBeNull()
    })
  })
})
