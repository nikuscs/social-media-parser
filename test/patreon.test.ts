import { describe, expect, it } from 'vitest'
import { patreon } from '../src/parsers/patreon'

function parse(urlStr: string) {
  return patreon.parse(new URL(urlStr))
}

describe('patreon', () => {
  it('matches domains', () => {
    expect(patreon.domains('patreon.com')).toBe(true)
    expect(patreon.domains('www.patreon.com')).toBe(true)
    expect(patreon.domains('notpatreon.com')).toBe(false)
  })

  it('parses creator profiles', () => {
    expect(parse('https://patreon.com/c/creator')).toEqual({
      type: 'profile',
      entities: { username: 'creator' },
      url: 'https://patreon.com/c/creator',
    })
    expect(parse('https://patreon.com/creator')).toEqual({
      type: 'profile',
      entities: { username: 'creator' },
      url: 'https://patreon.com/creator',
    })
  })

  it('parses post URLs', () => {
    expect(parse('https://patreon.com/posts/123456')).toEqual({
      type: 'post',
      entities: { post_id: '123456' },
      url: 'https://patreon.com/posts/123456',
    })
    expect(parse('https://patreon.com/c/creator/posts/123456')).toEqual({
      type: 'post',
      entities: { username: 'creator', post_id: '123456' },
      url: 'https://patreon.com/c/creator/posts/123456',
    })
    expect(parse('https://patreon.com/c/creator/posts/post-title-123456')).toEqual({
      type: 'post',
      entities: { username: 'creator', post_id: '123456' },
      url: 'https://patreon.com/c/creator/posts/post-title-123456',
    })
  })

  it('returns null for invalid/reserved paths', () => {
    expect(parse('https://patreon.com/')).toBeNull()
    expect(parse('https://patreon.com/home')).toBeNull()
    expect(parse('https://patreon.com/posts/not-a-number')).toBeNull()
    expect(parse('https://patreon.com/c/creator/posts/not-a-number')).toBeNull()
  })
})
