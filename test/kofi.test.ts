import { describe, expect, it } from 'vitest'
import { kofi } from '../src/parsers/kofi'

function parse(urlStr: string) {
  return kofi.parse(new URL(urlStr))
}

describe('kofi', () => {
  it('matches domains', () => {
    expect(kofi.domains('ko-fi.com')).toBe(true)
    expect(kofi.domains('www.ko-fi.com')).toBe(true)
    expect(kofi.domains('notko-fi.com')).toBe(false)
  })

  it('parses profile URLs', () => {
    expect(parse('https://ko-fi.com/somecreator')).toEqual({
      type: 'profile',
      entities: { username: 'somecreator' },
      url: 'https://ko-fi.com/somecreator',
    })
  })

  it('parses support post URLs', () => {
    expect(parse('https://ko-fi.com/s/ABC123XYZ')).toEqual({
      type: 'post',
      entities: { support_id: 'ABC123XYZ' },
      url: 'https://ko-fi.com/s/ABC123XYZ',
    })
  })

  it('returns null for invalid/reserved paths', () => {
    expect(parse('https://ko-fi.com/')).toBeNull()
    expect(parse('https://ko-fi.com/home')).toBeNull()
    expect(parse('https://ko-fi.com/s/abc')).toBeNull()
  })
})
