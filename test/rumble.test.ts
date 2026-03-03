import { describe, expect, it } from 'vitest'
import { rumble } from '../src/parsers/rumble'

function parse(urlStr: string) {
  return rumble.parse(new URL(urlStr))
}

describe('rumble', () => {
  it('matches domains', () => {
    expect(rumble.domains('rumble.com')).toBe(true)
    expect(rumble.domains('www.rumble.com')).toBe(true)
    expect(rumble.domains('notrumble.com')).toBe(false)
  })

  it('parses video URLs', () => {
    expect(parse('https://rumble.com/v5abcde-example-title.html')).toEqual({
      type: 'video',
      entities: { video_id: '5abcde' },
      url: 'https://rumble.com/v5abcde',
    })
  })

  it('parses embed URLs', () => {
    expect(parse('https://rumble.com/embed/5abcde')).toEqual({
      type: 'video',
      entities: { video_id: '5abcde' },
      url: 'https://rumble.com/v5abcde',
    })
  })

  it('parses channel URLs', () => {
    expect(parse('https://rumble.com/c/SomeChannel')).toEqual({
      type: 'channel',
      entities: { channel: 'SomeChannel' },
      url: 'https://rumble.com/c/SomeChannel',
    })
  })

  it('parses profile-like URLs', () => {
    expect(parse('https://rumble.com/somecreator')).toEqual({
      type: 'profile',
      entities: { username: 'somecreator' },
      url: 'https://rumble.com/somecreator',
    })
  })

  it('returns null for invalid paths', () => {
    expect(parse('https://rumble.com/')).toBeNull()
    expect(parse('https://rumble.com/search')).toBeNull()
    expect(parse('https://rumble.com/embed/not-valid%%%')).toBeNull()
  })
})
