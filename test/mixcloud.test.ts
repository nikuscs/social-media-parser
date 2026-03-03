import { describe, expect, it } from 'vitest'
import { mixcloud } from '../src/parsers/mixcloud'

function parse(urlStr: string) {
  return mixcloud.parse(new URL(urlStr))
}

describe('mixcloud', () => {
  describe('domains', () => {
    it('matches mixcloud.com', () => expect(mixcloud.domains('mixcloud.com')).toBe(true))
    it('matches subdomains', () => expect(mixcloud.domains('www.mixcloud.com')).toBe(true))
    it('rejects unrelated domains', () => expect(mixcloud.domains('notmixcloud.com')).toBe(false))
  })

  describe('resources', () => {
    it('parses profile URLs', () => {
      expect(parse('https://mixcloud.com/nts')).toEqual({
        type: 'profile',
        entities: { username: 'nts' },
        url: 'https://mixcloud.com/nts',
      })
    })

    it('parses show URLs', () => {
      expect(parse('https://mixcloud.com/nts/morning-show-001')).toEqual({
        type: 'post',
        entities: { username: 'nts', show: 'morning-show-001' },
        url: 'https://mixcloud.com/nts/morning-show-001',
      })
    })
  })

  describe('null cases', () => {
    it('returns null for root path', () => {
      expect(parse('https://mixcloud.com/')).toBeNull()
    })

    it('returns null for reserved namespaces', () => {
      expect(parse('https://mixcloud.com/discover')).toBeNull()
      expect(parse('https://mixcloud.com/live')).toBeNull()
    })

    it('returns null for deep routes', () => {
      expect(parse('https://mixcloud.com/nts/show/extra')).toBeNull()
    })
  })
})
