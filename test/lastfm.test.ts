import { describe, expect, it } from 'vitest'
import { lastfm } from '../src/parsers/lastfm'

function parse(urlStr: string) {
  return lastfm.parse(new URL(urlStr))
}

describe('lastfm', () => {
  it('matches domains', () => {
    expect(lastfm.domains('last.fm')).toBe(true)
    expect(lastfm.domains('www.last.fm')).toBe(true)
    expect(lastfm.domains('notlast.fm')).toBe(false)
  })

  it('parses profile URLs', () => {
    expect(parse('https://last.fm/user/someuser')).toEqual({
      type: 'profile',
      entities: { username: 'someuser' },
      url: 'https://last.fm/user/someuser',
    })
  })

  it('parses track URLs', () => {
    expect(parse('https://last.fm/music/Daft+Punk/_/One+More+Time')).toEqual({
      type: 'track',
      entities: { artist: 'Daft+Punk', track: 'One+More+Time' },
      url: 'https://last.fm/music/Daft+Punk/_/One+More+Time',
    })
  })

  it('parses album URLs', () => {
    expect(parse('https://last.fm/music/Daft+Punk/+albums/Discovery')).toEqual({
      type: 'album',
      entities: { artist: 'Daft+Punk', album: 'Discovery' },
      url: 'https://last.fm/music/Daft+Punk/+albums/Discovery',
    })
  })

  it('returns null for invalid paths', () => {
    expect(parse('https://last.fm/')).toBeNull()
    expect(parse('https://last.fm/music/Daft+Punk')).toBeNull()
    expect(parse('https://last.fm/user')).toBeNull()
  })
})
