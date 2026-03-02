import { describe, expect, it } from 'vitest'
import { search } from '../src/parsers/search'

function parse(urlStr: string) {
  return search.parse(new URL(urlStr))
}

describe('search', () => {
  describe('domains', () => {
    it('matches google.com', () => expect(search.domains('google.com')).toBe(true))
    it('matches www.google.com', () => expect(search.domains('www.google.com')).toBe(true))
    it('matches bing.com', () => expect(search.domains('bing.com')).toBe(true))
    it('matches duckduckgo.com', () => expect(search.domains('duckduckgo.com')).toBe(true))
    it('matches yahoo.com', () => expect(search.domains('yahoo.com')).toBe(true))
    it('matches yandex.com', () => expect(search.domains('yandex.com')).toBe(true))
    it('matches baidu.com', () => expect(search.domains('baidu.com')).toBe(true))
    it('matches brave.com', () => expect(search.domains('brave.com')).toBe(true))
    it('matches search.brave.com', () => expect(search.domains('search.brave.com')).toBe(true))
    it('matches ecosia.org', () => expect(search.domains('ecosia.org')).toBe(true))
    it('matches qwant.com', () => expect(search.domains('qwant.com')).toBe(true))
    it('matches startpage.com', () => expect(search.domains('startpage.com')).toBe(true))
    it('matches regional google domains', () => {
      expect(search.domains('google.co.uk')).toBe(true)
      expect(search.domains('google.de')).toBe(true)
      expect(search.domains('google.co.jp')).toBe(true)
    })
    it('matches subdomains of search engines', () => {
      expect(search.domains('www.bing.com')).toBe(true)
      expect(search.domains('www.baidu.com')).toBe(true)
    })
    it('rejects unrelated domains', () => expect(search.domains('example.com')).toBe(false))
  })

  describe('search query', () => {
    it('extracts q param from Google', () => {
      expect(parse('https://google.com/search?q=hello+world')).toEqual({
        type: 'search',
        entities: { query: 'hello world' },
        url: 'https://google.com/search?q=hello+world',
      })
    })

    it('extracts q param from Bing', () => {
      const result = parse('https://bing.com/search?q=test')
      expect(result).not.toBeNull()
      expect(result!.entities.query).toBe('test')
    })

    it('extracts q param from DuckDuckGo', () => {
      const result = parse('https://duckduckgo.com/?q=test')
      expect(result).not.toBeNull()
      expect(result!.entities.query).toBe('test')
    })

    it('extracts p param from Yahoo', () => {
      expect(parse('https://search.yahoo.com/search?p=hello')).toEqual({
        type: 'search',
        entities: { query: 'hello' },
        url: 'https://search.yahoo.com/search?p=hello',
      })
    })

    it('extracts text param from Yandex', () => {
      expect(parse('https://yandex.com/search/?text=hello+world')).toEqual({
        type: 'search',
        entities: { query: 'hello world' },
        url: 'https://yandex.com/search/?text=hello+world',
      })
    })

    it('extracts wd param from Baidu', () => {
      expect(parse('https://baidu.com/s?wd=hello')).toEqual({
        type: 'search',
        entities: { query: 'hello' },
        url: 'https://baidu.com/s?wd=hello',
      })
    })

    it('extracts wd param from Baidu subdomain', () => {
      const result = parse('https://www.baidu.com/s?wd=test')
      expect(result).not.toBeNull()
      expect(result!.entities.query).toBe('test')
    })

    it('returns null when no query param present', () => {
      expect(parse('https://google.com/')).toBeNull()
    })

    it('returns null for Baidu without wd param', () => {
      expect(parse('https://baidu.com/s?q=test')).toBeNull()
    })

    it('falls back to q for Yahoo when p is missing', () => {
      expect(parse('https://search.yahoo.com/search?q=test')).toEqual({
        type: 'search',
        entities: { query: 'test' },
        url: 'https://search.yahoo.com/search?q=test',
      })
    })

    it('falls back to q for Yandex when text is missing', () => {
      expect(parse('https://yandex.com/search/?q=test')).toEqual({
        type: 'search',
        entities: { query: 'test' },
        url: 'https://yandex.com/search/?q=test',
      })
    })
  })
})
