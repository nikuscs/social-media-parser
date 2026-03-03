import { describe, expect, it } from 'vitest'
import { spotify } from '../src/parsers/spotify'

function parse(urlStr: string) {
  return spotify.parse(new URL(urlStr))
}

describe('spotify', () => {
  describe('domains', () => {
    it('matches open.spotify.com', () => expect(spotify.domains('open.spotify.com')).toBe(true))
    it('matches spotify.com', () => expect(spotify.domains('spotify.com')).toBe(true))
    it('matches subdomains under spotify.com', () => expect(spotify.domains('play.spotify.com')).toBe(true))
    it('rejects unrelated domains', () => expect(spotify.domains('notspotify.com')).toBe(false))
  })

  describe('resources', () => {
    it('parses track URLs', () => {
      expect(parse('https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P')).toEqual({
        type: 'track',
        entities: { track_id: '7ouMYWpwJ422jRcDASZB7P' },
        url: 'https://open.spotify.com/track/7ouMYWpwJ422jRcDASZB7P',
      })
    })

    it('parses album URLs', () => {
      expect(parse('https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc')).toEqual({
        type: 'album',
        entities: { album_id: '2noRn2Aes5aoNVsU6iWThc' },
        url: 'https://open.spotify.com/album/2noRn2Aes5aoNVsU6iWThc',
      })
    })

    it('parses artist URLs', () => {
      expect(parse('https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF')).toEqual({
        type: 'profile',
        entities: { artist_id: '0OdUWJ0sBjDrqHygGUXeCF' },
        url: 'https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF',
      })
    })

    it('parses playlist URLs', () => {
      expect(parse('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')).toEqual({
        type: 'playlist',
        entities: { playlist_id: '37i9dQZF1DXcBWIGoYBM5M' },
        url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
      })
    })

    it('parses user profile URLs', () => {
      expect(parse('https://open.spotify.com/user/wizzler')).toEqual({
        type: 'profile',
        entities: { username: 'wizzler' },
        url: 'https://open.spotify.com/user/wizzler',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://open.spotify.com/')).toBeNull()
    })

    it('rejects invalid IDs', () => {
      expect(parse('https://open.spotify.com/track/short')).toBeNull()
      expect(parse('https://open.spotify.com/album/too-long-12345678901234567890')).toBeNull()
    })

    it('returns null for unsupported paths', () => {
      expect(parse('https://open.spotify.com/collection/tracks')).toBeNull()
      expect(parse('https://open.spotify.com/genre/pop')).toBeNull()
    })

    it('returns null for unsupported resource with valid id shape', () => {
      expect(parse('https://open.spotify.com/show/7ouMYWpwJ422jRcDASZB7P')).toBeNull()
    })
  })
})
