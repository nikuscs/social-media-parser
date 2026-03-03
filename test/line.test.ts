import { describe, expect, it } from 'vitest'
import { line } from '../src/parsers/line'

function parse(urlStr: string) {
  return line.parse(new URL(urlStr))
}

describe('line', () => {
  it('matches domains', () => {
    expect(line.domains('line.me')).toBe(true)
    expect(line.domains('www.line.me')).toBe(true)
    expect(line.domains('lin.ee')).toBe(true)
    expect(line.domains('notline.me')).toBe(false)
  })

  it('parses short invite URLs', () => {
    expect(parse('https://lin.ee/abcDEF12')).toEqual({
      type: 'group',
      entities: { short_code: 'abcDEF12' },
      url: 'https://lin.ee/abcDEF12',
    })
  })

  it('parses profile URLs', () => {
    expect(parse('https://line.me/ti/p/~mylineid')).toEqual({
      type: 'profile',
      entities: { line_id: '~mylineid' },
      url: 'https://line.me/ti/p/~mylineid',
    })
  })

  it('parses post URLs', () => {
    expect(parse('https://line.me/R/home/public/post?id=abc123_DEF')).toEqual({
      type: 'post',
      entities: { post_id: 'abc123_DEF' },
      url: 'https://line.me/R/home/public/post?id=abc123_DEF',
    })
  })

  it('returns null for invalid paths', () => {
    expect(parse('https://line.me/')).toBeNull()
    expect(parse('https://line.me/R/home/public/post')).toBeNull()
    expect(parse('https://line.me/ti/p')).toBeNull()
  })
})
