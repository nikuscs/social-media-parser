import { describe, expect, it } from 'vitest'
import { soundcloud } from '../src/parsers/soundcloud'

function parse(urlStr: string) {
  return soundcloud.parse(new URL(urlStr))
}

describe('soundcloud', () => {
  describe('domains', () => {
    it('matches soundcloud.com', () => expect(soundcloud.domains('soundcloud.com')).toBe(true))
    it('matches subdomains under soundcloud.com', () => expect(soundcloud.domains('m.soundcloud.com')).toBe(true))
    it('rejects unrelated domains', () => expect(soundcloud.domains('notsoundcloud.com')).toBe(false))
  })

  describe('resources', () => {
    it('parses profile URLs', () => {
      expect(parse('https://soundcloud.com/porter-robinson')).toEqual({
        type: 'profile',
        entities: { username: 'porter-robinson' },
        url: 'https://soundcloud.com/porter-robinson',
      })
    })

    it('parses track URLs', () => {
      expect(parse('https://soundcloud.com/porter-robinson/language')).toEqual({
        type: 'track',
        entities: { username: 'porter-robinson', track: 'language' },
        url: 'https://soundcloud.com/porter-robinson/language',
      })
    })

    it('parses playlist URLs', () => {
      expect(parse('https://soundcloud.com/porter-robinson/sets/worlds')).toEqual({
        type: 'playlist',
        entities: { username: 'porter-robinson', playlist: 'worlds' },
        url: 'https://soundcloud.com/porter-robinson/sets/worlds',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://soundcloud.com/')).toBeNull()
    })

    it('returns null for reserved namespaces', () => {
      expect(parse('https://soundcloud.com/discover')).toBeNull()
      expect(parse('https://soundcloud.com/charts')).toBeNull()
    })

    it('returns null for unsupported nested routes', () => {
      expect(parse('https://soundcloud.com/porter-robinson/tracks/popular')).toBeNull()
    })
  })
})
