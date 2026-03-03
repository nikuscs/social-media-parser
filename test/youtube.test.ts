import { describe, expect, it } from 'vitest'
import { youtube } from '../src/parsers/youtube'

function parse(urlStr: string) {
  return youtube.parse(new URL(urlStr))
}

describe('youtube', () => {
  describe('domains', () => {
    it('matches youtube.com', () => expect(youtube.domains('youtube.com')).toBe(true))
    it('matches www.youtube.com', () => expect(youtube.domains('www.youtube.com')).toBe(true))
    it('matches m.youtube.com', () => expect(youtube.domains('m.youtube.com')).toBe(true))
    it('matches music.youtube.com', () => expect(youtube.domains('music.youtube.com')).toBe(true))
    it('matches youtu.be', () => expect(youtube.domains('youtu.be')).toBe(true))
    it('matches youtube-nocookie.com', () => expect(youtube.domains('youtube-nocookie.com')).toBe(true))
    it('matches www.youtube-nocookie.com', () => expect(youtube.domains('www.youtube-nocookie.com')).toBe(true))
    it('rejects unrelated domains', () => expect(youtube.domains('notyoutube.com')).toBe(false))
  })

  describe('video', () => {
    it('parses /watch?v={id}', () => {
      expect(parse('https://youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
        type: 'video',
        entities: { video_id: 'dQw4w9WgXcQ' },
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      })
    })

    it('parses youtu.be/{id}', () => {
      expect(parse('https://youtu.be/dQw4w9WgXcQ')).toEqual({
        type: 'video',
        entities: { video_id: 'dQw4w9WgXcQ' },
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      })
    })

    it('parses /embed/{id}', () => {
      expect(parse('https://youtube.com/embed/dQw4w9WgXcQ')).toEqual({
        type: 'video',
        entities: { video_id: 'dQw4w9WgXcQ' },
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      })
    })

    it('parses youtube-nocookie embed URLs', () => {
      expect(parse('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toEqual({
        type: 'video',
        entities: { video_id: 'dQw4w9WgXcQ' },
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      })
    })

    it('rejects invalid video IDs (wrong length)', () => {
      expect(parse('https://youtube.com/watch?v=short')).toBeNull()
      expect(parse('https://youtube.com/watch?v=toolong12345678')).toBeNull()
    })

    it('rejects /watch without v param', () => {
      expect(parse('https://youtube.com/watch')).toBeNull()
    })

    it('rejects youtu.be with invalid ID', () => {
      expect(parse('https://youtu.be/short')).toBeNull()
    })

    it('rejects /embed with invalid ID', () => {
      expect(parse('https://youtube.com/embed/short')).toBeNull()
    })
  })

  describe('short', () => {
    it('parses /shorts/{id}', () => {
      expect(parse('https://youtube.com/shorts/dQw4w9WgXcQ')).toEqual({
        type: 'short',
        entities: { video_id: 'dQw4w9WgXcQ' },
        url: 'https://youtube.com/shorts/dQw4w9WgXcQ',
      })
    })

    it('rejects shorts with invalid ID', () => {
      expect(parse('https://youtube.com/shorts/short')).toBeNull()
    })
  })

  describe('playlist', () => {
    it('parses /playlist?list={id}', () => {
      expect(parse('https://youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf')).toEqual({
        type: 'playlist',
        entities: { playlist_id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf' },
        url: 'https://youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
      })
    })

    it('returns null for /playlist without list param', () => {
      expect(parse('https://youtube.com/playlist')).toBeNull()
    })
  })

  describe('channel', () => {
    it('parses /@{handle}', () => {
      expect(parse('https://youtube.com/@mkbhd')).toEqual({
        type: 'channel',
        entities: { username: 'mkbhd' },
        url: 'https://youtube.com/@mkbhd',
      })
    })

    it('parses encoded /%40{handle}', () => {
      expect(parse('https://youtube.com/%40mkbhd')).toEqual({
        type: 'channel',
        entities: { username: 'mkbhd' },
        url: 'https://youtube.com/@mkbhd',
      })
    })

    it('parses /channel/{id}', () => {
      expect(parse('https://youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw')).toEqual({
        type: 'channel',
        entities: { channel_id: 'UCXuqSBlHAE6Xw-yeJA0Tunw' },
        url: 'https://youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw',
      })
    })

    it('parses /c/{name}', () => {
      expect(parse('https://youtube.com/c/mkbhd')).toEqual({
        type: 'channel',
        entities: { username: 'mkbhd' },
        url: 'https://youtube.com/@mkbhd',
      })
    })

    it('parses /user/{name}', () => {
      expect(parse('https://youtube.com/user/mkbhd')).toEqual({
        type: 'channel',
        entities: { username: 'mkbhd' },
        url: 'https://youtube.com/@mkbhd',
      })
    })

    it('rejects bare @ with no handle', () => {
      expect(parse('https://youtube.com/@')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://youtube.com/')).toBeNull()
    })

    it('returns null for unrecognized paths', () => {
      expect(parse('https://youtube.com/feed/subscriptions')).toBeNull()
    })

    it('returns null for youtu.be with multiple segments', () => {
      expect(parse('https://youtu.be/abc/def')).toBeNull()
    })

    it('returns null for malformed encoded path segments', () => {
      expect(parse('https://youtube.com/%E0%A4%A')).toBeNull()
    })
  })
})
