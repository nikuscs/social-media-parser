import { describe, expect, it } from 'vitest'
import { twitch } from '../src/parsers/twitch'

function parse(urlStr: string) {
  return twitch.parse(new URL(urlStr))
}

describe('twitch', () => {
  describe('domains', () => {
    it('matches twitch.tv', () => expect(twitch.domains('twitch.tv')).toBe(true))
    it('matches subdomains of twitch.tv', () => expect(twitch.domains('www.twitch.tv')).toBe(true))
    it('matches clips.twitch.tv', () => expect(twitch.domains('clips.twitch.tv')).toBe(true))
    it('rejects unrelated domains', () => expect(twitch.domains('example.com')).toBe(false))
  })

  describe('video', () => {
    it('parses /videos/{id}', () => {
      expect(parse('https://twitch.tv/videos/123456789')).toEqual({
        type: 'video',
        entities: { video_id: '123456789' },
        url: 'https://twitch.tv/videos/123456789',
      })
    })

    it('rejects non-numeric video ids', () => {
      expect(parse('https://twitch.tv/videos/not-a-number')).toBeNull()
    })
  })

  describe('clip', () => {
    it('parses clips.twitch.tv/{slug}', () => {
      expect(parse('https://clips.twitch.tv/AmazingClipSlug')).toEqual({
        type: 'clip',
        entities: { clip_id: 'AmazingClipSlug' },
        url: 'https://clips.twitch.tv/AmazingClipSlug',
      })
    })

    it('parses /{channel}/clip/{slug}', () => {
      expect(parse('https://twitch.tv/johndoe/clip/AmazingClipSlug')).toEqual({
        type: 'clip',
        entities: { username: 'johndoe', clip_id: 'AmazingClipSlug' },
        url: 'https://twitch.tv/johndoe/clip/AmazingClipSlug',
      })
    })
  })

  describe('profile', () => {
    it('parses /{channel}', () => {
      expect(parse('https://twitch.tv/johndoe')).toEqual({
        type: 'profile',
        entities: { username: 'johndoe' },
        url: 'https://twitch.tv/johndoe',
      })
    })

    it('rejects reserved routes', () => {
      expect(parse('https://twitch.tv/directory')).toBeNull()
      expect(parse('https://twitch.tv/videos')).toBeNull()
    })
  })
})
