import { describe, expect, it } from 'vitest'
import { radiojavan } from '../src/parsers/radiojavan'

function parse(urlStr: string) {
  return radiojavan.parse(new URL(urlStr))
}

describe('radiojavan', () => {
  it('matches domains', () => {
    expect(radiojavan.domains('radiojavan.com')).toBe(true)
    expect(radiojavan.domains('www.radiojavan.com')).toBe(true)
    expect(radiojavan.domains('notradiojavan.com')).toBe(false)
  })

  it('parses video URLs', () => {
    expect(parse('https://radiojavan.com/videos/video/artist-song')).toEqual({
      type: 'video',
      entities: { video_slug: 'artist-song' },
      url: 'https://radiojavan.com/videos/video/artist-song',
    })
  })

  it('parses mp3 URLs', () => {
    expect(parse('https://radiojavan.com/mp3s/mp3/artist-song')).toEqual({
      type: 'track',
      entities: { track_slug: 'artist-song' },
      url: 'https://radiojavan.com/mp3s/mp3/artist-song',
    })
  })

  it('parses playlist URLs', () => {
    expect(parse('https://radiojavan.com/playlists/playlist/chill-mix')).toEqual({
      type: 'playlist',
      entities: { playlist_slug: 'chill-mix' },
      url: 'https://radiojavan.com/playlists/playlist/chill-mix',
    })
  })

  it('parses podcast URLs', () => {
    expect(parse('https://radiojavan.com/podcasts/podcast/episode-1')).toEqual({
      type: 'post',
      entities: { podcast_slug: 'episode-1' },
      url: 'https://radiojavan.com/podcasts/podcast/episode-1',
    })
  })

  it('parses artist profile URLs', () => {
    expect(parse('https://radiojavan.com/artist/siavash-ghomayshi')).toEqual({
      type: 'profile',
      entities: { username: 'siavash-ghomayshi' },
      url: 'https://radiojavan.com/artist/siavash-ghomayshi',
    })
  })

  it('parses direct profile-like URLs', () => {
    expect(parse('https://radiojavan.com/radiojavan')).toEqual({
      type: 'profile',
      entities: { username: 'radiojavan' },
      url: 'https://radiojavan.com/radiojavan',
    })
  })

  it('returns null for reserved/invalid routes', () => {
    expect(parse('https://radiojavan.com/')).toBeNull()
    expect(parse('https://radiojavan.com/search')).toBeNull()
    expect(parse('https://radiojavan.com/videos/video')).toBeNull()
    expect(parse('https://radiojavan.com/playlists/playlist')).toBeNull()
  })
})
