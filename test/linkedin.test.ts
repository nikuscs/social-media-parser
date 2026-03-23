import { describe, expect, it } from 'vitest'
import { linkedin } from '../src/parsers/linkedin'

function parse(urlStr: string) {
  return linkedin.parse(new URL(urlStr))
}

describe('linkedin', () => {
  describe('domains', () => {
    it('matches linkedin.com', () => expect(linkedin.domains('linkedin.com')).toBe(true))
    it('matches www.linkedin.com', () => expect(linkedin.domains('www.linkedin.com')).toBe(true))
    it('matches lnkd.in', () => expect(linkedin.domains('lnkd.in')).toBe(true))
    it('rejects unrelated domains', () => expect(linkedin.domains('notlinkedin.com')).toBe(false))
  })

  describe('profile', () => {
    it('parses /in/{username}', () => {
      expect(parse('https://linkedin.com/in/jane-doe')).toEqual({
        type: 'profile',
        entities: { username: 'jane-doe' },
        url: 'https://linkedin.com/in/jane-doe',
      })
    })

    it('parses /company/{company}', () => {
      expect(parse('https://linkedin.com/company/openai')).toEqual({
        type: 'profile',
        entities: { company: 'openai' },
        url: 'https://linkedin.com/company/openai',
      })
    })
  })

  describe('post', () => {
    it('parses /posts/{id}', () => {
      expect(parse('https://linkedin.com/posts/acme_abc123')).toEqual({
        type: 'post',
        entities: { post_id: 'acme_abc123' },
        url: 'https://linkedin.com/posts/acme_abc123',
      })
    })

    it('parses /feed/update/{urn}', () => {
      expect(parse('https://linkedin.com/feed/update/urn:li:activity:123')).toEqual({
        type: 'post',
        entities: { post_id: 'urn:li:activity:123' },
        url: 'https://linkedin.com/feed/update/urn:li:activity:123',
      })
    })

    it('parses /feed/update?updateEntityUrn={urn}', () => {
      expect(parse('https://linkedin.com/feed/update?updateEntityUrn=urn:li:activity:456')).toEqual({
        type: 'post',
        entities: { post_id: 'urn:li:activity:456' },
        url: 'https://linkedin.com/feed/update/urn:li:activity:456',
      })
    })

    it('returns null for /feed/update without urn', () => {
      expect(parse('https://linkedin.com/feed/update')).toBeNull()
    })
  })

  describe('short links', () => {
    it('parses lnkd.in/{code} as short link', () => {
      expect(parse('https://lnkd.in/abc123xyz')).toEqual({
        type: 'short',
        entities: {},
        url: 'https://lnkd.in/abc123xyz',
      })
    })

    it('returns null for lnkd.in root with no path', () => {
      expect(parse('https://lnkd.in/')).toBeNull()
    })
  })

  describe('null cases', () => {
    it('returns null for unrecognized paths', () => {
      expect(parse('https://linkedin.com/jobs/view/123')).toBeNull()
    })
  })
})
