import { describe, expect, it } from 'vitest'
import { kick } from '../src/parsers/kick'

function parse(urlStr: string) {
  return kick.parse(new URL(urlStr))
}

describe('kick', () => {
  it('matches domains', () => {
    expect(kick.domains('kick.com')).toBe(true)
    expect(kick.domains('www.kick.com')).toBe(true)
    expect(kick.domains('notkick.com')).toBe(false)
  })

  it('parses profile URLs', () => {
    expect(parse('https://kick.com/trainwreckstv')).toEqual({
      type: 'profile',
      entities: { username: 'trainwreckstv' },
      url: 'https://kick.com/trainwreckstv',
    })
  })

  it('parses video URLs', () => {
    expect(parse('https://kick.com/video/1234567890')).toEqual({
      type: 'video',
      entities: { video_id: '1234567890' },
      url: 'https://kick.com/video/1234567890',
    })
  })

  it('returns null for invalid/reserved paths', () => {
    expect(parse('https://kick.com/')).toBeNull()
    expect(parse('https://kick.com/categories')).toBeNull()
    expect(parse('https://kick.com/video/not-a-number')).toBeNull()
    expect(parse('https://kick.com/trainwreckstv/videos')).toBeNull()
  })
})
