import { describe, expect, it } from 'vitest'
import { app_store } from '../src/parsers/app_store'

function parse(urlStr: string) {
  return app_store.parse(new URL(urlStr))
}

describe('app_store', () => {
  describe('domains', () => {
    it('matches play.google.com', () => expect(app_store.domains('play.google.com')).toBe(true))
    it('matches apps.apple.com', () => expect(app_store.domains('apps.apple.com')).toBe(true))
    it('matches itunes.apple.com', () => expect(app_store.domains('itunes.apple.com')).toBe(true))
    it('matches appsto.re', () => expect(app_store.domains('appsto.re')).toBe(true))
    it('rejects unrelated domains', () => expect(app_store.domains('example.com')).toBe(false))
  })

  describe('google play app', () => {
    it('parses /store/apps/details?id=com.example.app', () => {
      expect(parse('https://play.google.com/store/apps/details?id=com.spotify.music')).toEqual({
        type: 'profile',
        entities: { app_id: 'com.spotify.music' },
        url: 'https://play.google.com/store/apps/details?id=com.spotify.music',
      })
    })

    it('strips extra query params', () => {
      expect(parse('https://play.google.com/store/apps/details?id=com.example.app&hl=en&gl=us')).toEqual({
        type: 'profile',
        entities: { app_id: 'com.example.app' },
        url: 'https://play.google.com/store/apps/details?id=com.example.app',
      })
    })

    it('returns null without id param', () => {
      expect(parse('https://play.google.com/store/apps/details')).toBeNull()
    })
  })

  describe('google play developer', () => {
    it('parses /store/apps/developer?id=...', () => {
      expect(parse('https://play.google.com/store/apps/developer?id=Google+LLC')).toEqual({
        type: 'profile',
        entities: { developer_id: 'Google LLC' },
        url: 'https://play.google.com/store/apps/developer?id=Google%20LLC',
      })
    })

    it('parses /store/apps/dev?id=... (numeric)', () => {
      expect(parse('https://play.google.com/store/apps/dev?id=5700313618786177705')).toEqual({
        type: 'profile',
        entities: { developer_id: '5700313618786177705' },
        url: 'https://play.google.com/store/apps/dev?id=5700313618786177705',
      })
    })

    it('returns null without id param', () => {
      expect(parse('https://play.google.com/store/apps/developer')).toBeNull()
    })
  })

  describe('google play null cases', () => {
    it('returns null for root', () => {
      expect(parse('https://play.google.com/')).toBeNull()
    })

    it('returns null for unrecognized paths', () => {
      expect(parse('https://play.google.com/store/apps/collection/featured')).toBeNull()
    })
  })

  describe('apple app store app', () => {
    it('parses /us/app/slug/id123', () => {
      expect(parse('https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580')).toEqual({
        type: 'profile',
        entities: { app_id: '324684580' },
        url: 'https://apps.apple.com/app/id324684580',
      })
    })

    it('parses /app/id123 (minimal)', () => {
      expect(parse('https://apps.apple.com/app/id324684580')).toEqual({
        type: 'profile',
        entities: { app_id: '324684580' },
        url: 'https://apps.apple.com/app/id324684580',
      })
    })

    it('parses itunes.apple.com legacy URLs', () => {
      expect(parse('https://itunes.apple.com/app/id324684580')).toEqual({
        type: 'profile',
        entities: { app_id: '324684580' },
        url: 'https://apps.apple.com/app/id324684580',
      })
    })
  })

  describe('apple developer', () => {
    it('parses /us/developer/slug/id123', () => {
      expect(parse('https://apps.apple.com/us/developer/apple/id284417353')).toEqual({
        type: 'profile',
        entities: { developer_id: '284417353' },
        url: 'https://apps.apple.com/app/developer/id284417353',
      })
    })
  })

  describe('apple null cases', () => {
    it('returns null for root', () => {
      expect(parse('https://apps.apple.com/')).toBeNull()
    })

    it('returns null for appsto.re short links', () => {
      expect(parse('https://appsto.re/us/abc123.i')).toBeNull()
    })

    it('returns null for /app without id segment', () => {
      expect(parse('https://apps.apple.com/app/some-slug')).toBeNull()
    })

    it('returns null for /developer without id segment', () => {
      expect(parse('https://apps.apple.com/developer/some-name')).toBeNull()
    })
  })
})
