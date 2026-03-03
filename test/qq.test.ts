import { describe, expect, it } from 'vitest'
import { qq } from '../src/parsers/qq'

function parse(urlStr: string) {
  return qq.parse(new URL(urlStr))
}

describe('qq', () => {
  it('matches qzone domains only', () => {
    expect(qq.domains('user.qzone.qq.com')).toBe(true)
    expect(qq.domains('qzone.qq.com')).toBe(true)
    expect(qq.domains('m.qzone.qq.com')).toBe(true)
    expect(qq.domains('qq.com')).toBe(false)
  })

  it('parses profile URLs', () => {
    expect(parse('https://user.qzone.qq.com/123456789')).toEqual({
      type: 'profile',
      entities: { uin: '123456789' },
      url: 'https://user.qzone.qq.com/123456789',
    })
  })

  it('parses mood post URLs', () => {
    expect(parse('https://user.qzone.qq.com/123456789/mood/abcxyz')).toEqual({
      type: 'post',
      entities: { uin: '123456789', post_id: 'abcxyz' },
      url: 'https://user.qzone.qq.com/123456789/mood/abcxyz',
    })
  })

  it('returns null for invalid paths', () => {
    expect(parse('https://user.qzone.qq.com/')).toBeNull()
    expect(parse('https://user.qzone.qq.com/notuin')).toBeNull()
    expect(parse('https://user.qzone.qq.com/123456789/photo/abc')).toBeNull()
  })
})
