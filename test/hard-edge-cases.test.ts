import { describe, expect, it } from 'vitest'
import { identify, normalize, parse } from '../src/index'
import { tryParseUrl } from '../src/url'

describe('hard edge cases', () => {
  describe('scheme and protocol handling', () => {
    it('rejects non-http schemes', () => {
      expect(parse('ftp://instagram.com/nikuscs')).toBeNull()
      expect(parse('mailto:test@example.com')).toBeNull()
      expect(parse('javascript:alert(1)')).toBeNull()
    })

    it('recovers malformed scheme slash counts', () => {
      expect(parse('https:////instagram.com/nikuscs')?.platform).toBe('instagram')
      expect(parse('http:/instagram.com/nikuscs')?.platform).toBe('instagram')
      expect(parse('https:/instagram.com/nikuscs')?.platform).toBe('instagram')
    })

    it('handles protocol-relative URLs consistently', () => {
      expect(parse('//instagram.com/nikuscs')?.platform).toBe('instagram')
      expect(normalize('//instagram.com/nikuscs')).toBe('https://instagram.com/nikuscs')
    })
  })

  describe('hostname and domain oddities', () => {
    it('accepts uppercase hostnames', () => {
      const result = parse('HTTPS://INSTAGRAM.COM/nikuscs')
      expect(result?.platform).toBe('instagram')
      expect(result?.url).toBe('https://instagram.com/nikuscs')
    })

    it('rejects lookalike or off-domain hosts', () => {
      expect(parse('https://instagram.com.evil.com/nikuscs')).toBeNull()
      expect(parse('https://evilinstagram.com/nikuscs')).toBeNull()
      expect(parse('https://x.com.evil.com/elonmusk')).toBeNull()
    })

    it('handles trailing-dot hostnames as unknown', () => {
      expect(parse('https://instagram.com./nikuscs')).toBeNull()
    })
  })

  describe('path normalization and segment oddities', () => {
    it('handles duplicate slashes in path', () => {
      expect(parse('https://instagram.com//nikuscs')?.platform).toBe('instagram')
      expect(parse('https://threads.net//%40johndoe')?.platform).toBe('threads')
    })

    it('normalizes dot-segment path traversal forms via URL parser', () => {
      expect(parse('https://instagram.com/a/../nikuscs')?.platform).toBe('instagram')
      expect(parse('https://x.com/a/../elonmusk')?.platform).toBe('twitter')
    })

    it('treats encoded slash in segment as invalid for user routes', () => {
      expect(parse('https://instagram.com/nikuscs%2Fextra')).toBeNull()
      expect(parse('https://x.com/elonmusk%2Fstatus')).toBeNull()
    })
  })

  describe('query parameter oddities', () => {
    it('handles duplicate params by URLSearchParams first-value behavior', () => {
      const yt = parse('https://youtube.com/watch?v=dQw4w9WgXcQ&v=ignored')
      expect(yt?.platform).toBe('youtube')
      expect(yt?.url).toBe('https://youtube.com/watch?v=dQw4w9WgXcQ')
    })

    it('rejects required empty params', () => {
      expect(parse('https://youtube.com/watch?v=')).toBeNull()
      expect(parse('https://line.me/R/home/public/post?id=')).toBeNull()
    })
  })

  describe('encoding and unicode', () => {
    it('parses encoded handles where supported', () => {
      expect(parse('https://youtube.com/%40mkbhd')?.platform).toBe('youtube')
      expect(parse('https://threads.net/%40johndoe')?.platform).toBe('threads')
    })

    it('rejects malformed encoding safely', () => {
      expect(parse('https://youtube.com/%E0%A4%A')).toBeNull()
      expect(parse('https://threads.net/%E0%A4%A')).toBeNull()
    })

    it('is explicit about unicode usernames on strict-ascii parsers', () => {
      expect(parse('https://instagram.com/用户')).toBeNull()
      expect(parse('https://x.com/ユーザー')).toBeNull()
    })
  })

  describe('input sanitation extremes', () => {
    it('trims leading/trailing whitespace and newlines', () => {
      expect(parse('\n  https://instagram.com/nikuscs \t')?.platform).toBe('instagram')
    })

    it('rejects embedded whitespace in host/path', () => {
      expect(parse('https://insta gram.com/nikuscs')).toBeNull()
      expect(parse('https://instagram.com/niku scs')).toBeNull()
    })

    it('handles very long garbage input without throwing', () => {
      const huge = 'x'.repeat(20000)
      expect(() => parse(huge)).not.toThrow()
      expect(parse(huge)).toBeNull()
    })
  })

  describe('parser precedence lock-in', () => {
    it('prefers social parser over search parser for twitter domain', () => {
      const url = 'https://x.com/i/status/1234567890?q=hello'
      expect(parse(url)?.platform).toBe('twitter')
      expect(identify(url)).toBe('twitter')
    })

    it('keeps canonical normalize output parseable', () => {
      const canonical = normalize('http:instagram.com/nikuscs')
      expect(canonical).toBe('https://instagram.com/nikuscs')
      expect(parse(canonical!)?.platform).toBe('instagram')
    })
  })

  describe('tryParseUrl direct hard cases', () => {
    it('returns null for obvious garbage forms', () => {
      expect(tryParseUrl('://')).toBeNull()
      expect(tryParseUrl('http://')).toBeNull()
      expect(tryParseUrl('https://')).toBeNull()
    })
  })
})
