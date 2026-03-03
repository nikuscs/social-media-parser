import { describe, expect, it } from 'vitest'
import { tryParseUrl, cleanUrl } from '../src/url'

describe('tryParseUrl', () => {
  it('parses a full https URL', () => {
    const url = tryParseUrl('https://example.com/path')
    expect(url).not.toBeNull()
    expect(url!.hostname).toBe('example.com')
    expect(url!.pathname).toBe('/path')
  })

  it('parses a full http URL', () => {
    const url = tryParseUrl('http://example.com')
    expect(url).not.toBeNull()
    expect(url!.protocol).toBe('http:')
  })

  it('recovers malformed http absolute URL missing slashes', () => {
    const url = tryParseUrl('http:example.com/path')
    expect(url).not.toBeNull()
    expect(url!.protocol).toBe('http:')
    expect(url!.hostname).toBe('example.com')
    expect(url!.pathname).toBe('/path')
  })

  it('recovers malformed https absolute URL with single slash', () => {
    const url = tryParseUrl('https:/example.com/path')
    expect(url).not.toBeNull()
    expect(url!.protocol).toBe('https:')
    expect(url!.hostname).toBe('example.com')
    expect(url!.pathname).toBe('/path')
  })

  it('prepends https:// to bare domains', () => {
    const url = tryParseUrl('example.com/path')
    expect(url).not.toBeNull()
    expect(url!.protocol).toBe('https:')
    expect(url!.hostname).toBe('example.com')
  })

  it('handles protocol-relative URLs', () => {
    const url = tryParseUrl('//example.com/path')
    expect(url).not.toBeNull()
    expect(url!.protocol).toBe('https:')
    expect(url!.hostname).toBe('example.com')
    expect(url!.pathname).toBe('/path')
  })

  it('returns null for empty string', () => {
    expect(tryParseUrl('')).toBeNull()
  })

  it('returns null for whitespace-only string', () => {
    expect(tryParseUrl('   ')).toBeNull()
  })

  it('returns null for invalid URLs', () => {
    expect(tryParseUrl('not a url at all ::: ////')).toBeNull()
  })

  it('trims whitespace', () => {
    const url = tryParseUrl('  https://example.com  ')
    expect(url).not.toBeNull()
    expect(url!.hostname).toBe('example.com')
  })
})

describe('cleanUrl', () => {
  it('forces https protocol', () => {
    const url = new URL('http://example.com')
    const cleaned = cleanUrl(url)
    expect(cleaned.protocol).toBe('https:')
  })

  it('lowercases hostname', () => {
    const url = new URL('https://EXAMPLE.COM')
    const cleaned = cleanUrl(url)
    expect(cleaned.hostname).toBe('example.com')
  })

  it('removes fragments', () => {
    const url = new URL('https://example.com/path#section')
    const cleaned = cleanUrl(url)
    expect(cleaned.hash).toBe('')
  })

  it('removes trailing slashes', () => {
    const url = new URL('https://example.com/path/')
    const cleaned = cleanUrl(url)
    expect(cleaned.pathname).toBe('/path')
  })

  it('keeps root slash', () => {
    const url = new URL('https://example.com/')
    const cleaned = cleanUrl(url)
    expect(cleaned.pathname).toBe('/')
  })

  it('removes tracking params', () => {
    const url = new URL(
      'https://example.com/path?utm_source=test&utm_medium=web&utm_campaign=camp&utm_term=t&utm_content=c&fbclid=abc&gclid=def&ref=ghi&si=jkl&s=mno&t=pqr&igshid=stu&keep=yes'
    )
    const cleaned = cleanUrl(url)
    expect(cleaned.searchParams.has('utm_source')).toBe(false)
    expect(cleaned.searchParams.has('utm_medium')).toBe(false)
    expect(cleaned.searchParams.has('utm_campaign')).toBe(false)
    expect(cleaned.searchParams.has('utm_term')).toBe(false)
    expect(cleaned.searchParams.has('utm_content')).toBe(false)
    expect(cleaned.searchParams.has('fbclid')).toBe(false)
    expect(cleaned.searchParams.has('gclid')).toBe(false)
    expect(cleaned.searchParams.has('ref')).toBe(false)
    expect(cleaned.searchParams.has('si')).toBe(false)
    expect(cleaned.searchParams.has('igshid')).toBe(false)
    expect(cleaned.searchParams.get('s')).toBe('mno')
    expect(cleaned.searchParams.get('t')).toBe('pqr')
    expect(cleaned.searchParams.get('keep')).toBe('yes')
  })

  it('does not mutate the original URL', () => {
    const url = new URL('http://EXAMPLE.COM/path/?utm_source=x#frag')
    const original = url.href
    cleanUrl(url)
    expect(url.href).toBe(original)
  })
})
