import { describe, expect, it } from 'vitest'
import { dailymotion } from '../src/parsers/dailymotion'

function parse(urlStr: string) {
  return dailymotion.parse(new URL(urlStr))
}

describe('dailymotion', () => {
  describe('domains', () => {
    it('matches dailymotion.com', () => expect(dailymotion.domains('dailymotion.com')).toBe(true))
    it('matches subdomains of dailymotion.com', () => expect(dailymotion.domains('www.dailymotion.com')).toBe(true))
    it('matches dai.ly', () => expect(dailymotion.domains('dai.ly')).toBe(true))
    it('rejects unrelated domains', () => expect(dailymotion.domains('example.com')).toBe(false))
  })

  describe('video', () => {
    it('parses dai.ly/{id}', () => {
      expect(parse('https://dai.ly/x9abcde')).toEqual({
        type: 'video',
        entities: { video_id: 'x9abcde' },
        url: 'https://dailymotion.com/video/x9abcde',
      })
    })

    it('parses /video/{id}', () => {
      expect(parse('https://dailymotion.com/video/x9abcde')).toEqual({
        type: 'video',
        entities: { video_id: 'x9abcde' },
        url: 'https://dailymotion.com/video/x9abcde',
      })
    })

    it('parses /embed/video/{id}', () => {
      expect(parse('https://dailymotion.com/embed/video/x9abcde')).toEqual({
        type: 'video',
        entities: { video_id: 'x9abcde' },
        url: 'https://dailymotion.com/video/x9abcde',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for unsupported paths', () => {
      expect(parse('https://dailymotion.com/playlist/x123')).toBeNull()
    })
  })
})
